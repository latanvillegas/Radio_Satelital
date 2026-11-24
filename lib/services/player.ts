import type HlsType from 'hls.js'
import type { Station } from '../../types/station'
import { getOptimalUrl } from './proxy'
import { addRecentStation } from '../storage/recents'
import { stationKey } from './station-normalizer'
import { initAudioDsp, releaseAudioDsp, suspendAudioDsp, resumeAudioDsp } from './audio-dsp'
import { recordStreamFailure, recordStreamSuccess } from './telemetry'

const AUDIO_ID = 'radioPlayer'
const MAX_RETRIES = 3
const STALL_MS = 6500
const RETRY_DELAYS_MS = [2000, 4000, 8000]

let sleepTimerId: ReturnType<typeof setTimeout> | null = null
let sleepTimerEndsAt: number | null = null
let currentPlayingStation: Station | null = null
let currentStreamMeta: { url: string; isProxied: boolean; isHls: boolean } | null = null
let activeHls: HlsType | null = null
let retryCount = 0
let isReconnecting = false
let playbackRequested = false
let plainMode = false
let runId = 0
let streamRequestedAt = 0
let lastTtfaMs: number | null = null
let retryTimer: ReturnType<typeof setTimeout> | null = null
let stallTimer: ReturnType<typeof setTimeout> | null = null
let networkListenersInstalled = false

export type PlaybackStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error'
  | 'reconnecting'
  | 'offline'

export interface StreamTelemetry {
  codec: string
  bitrate: number
  isProxied: boolean
  isHls: boolean
  url: string
  bufferedSeconds: number
  ttfaMs: number | null
}

type StatusListener = (
  status: PlaybackStatus,
  meta?: { error?: string; reconnecting?: boolean }
) => void

const statusListeners = new Set<StatusListener>()

export function isHlsStreamUrl(url: string): boolean {
  const clean = url.trim().toLowerCase()
  return clean.includes('.m3u8') || clean.includes('application/vnd.apple.mpegurl')
}

function destroyHls() {
  const hls = activeHls
  activeHls = null
  if (hls) {
    try { hls.destroy() } catch {}
  }
}

function notifyStatus(
  status: PlaybackStatus,
  meta?: { error?: string; reconnecting?: boolean }
) {
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState =
        status === 'playing' ? 'playing' : status === 'paused' ? 'paused' : 'none'
    } catch {}
  }
  statusListeners.forEach((listener) => {
    try {
      listener(status, meta)
    } catch (e) {
      console.error('[Player] Error in status listener:', e)
    }
  })
}

export function subscribePlaybackStatus(listener: StatusListener): () => void {
  statusListeners.add(listener)
  return () => {
    statusListeners.delete(listener)
  }
}

function clearTimers() {
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
  if (stallTimer) {
    clearTimeout(stallTimer)
    stallTimer = null
  }
}

// Invalidate asynchronous work before stopping transport.
function cancelTransport(): number {
  const token = ++runId
  clearTimers()
  const audio = typeof document === 'undefined' ? null :
    document.getElementById(AUDIO_ID) as HTMLAudioElement | null
  if (audio) {
    audio.onerror = audio.onwaiting = audio.onstalled = audio.onplaying = audio.onpause = null
  }
  destroyHls()
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }
  return token
}

function installNetworkListeners() {
  if (networkListenersInstalled || typeof window === 'undefined') return
  networkListenersInstalled = true
  window.addEventListener('offline', () => {
    if (!playbackRequested) return
    cancelTransport()
    suspendAudioDsp()
    notifyStatus('offline')
  })
  window.addEventListener('online', () => {
    if (!playbackRequested || !currentPlayingStation) return
    retryCount = 0
    startStream(currentPlayingStation, true)
  })
}

export function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  let audio = document.getElementById(AUDIO_ID) as HTMLAudioElement | null
  if (!audio) {
    audio = document.createElement('audio')
    audio.id = AUDIO_ID
    audio.crossOrigin = 'anonymous'
    audio.preload = 'none'
    document.body.appendChild(audio)
  }
  installNetworkListeners()
  return audio
}

function replaceAudio(withCors: boolean): HTMLAudioElement | null {
  destroyHls()
  const oldAudio = getAudio()
  if (!oldAudio) return null
  const volume = oldAudio.volume
  oldAudio.onerror = null
  oldAudio.onwaiting = null
  oldAudio.onstalled = null
  oldAudio.onplaying = null
  oldAudio.onpause = null
  oldAudio.pause()
  oldAudio.removeAttribute('src')
  oldAudio.load()
  oldAudio.remove()

  const audio = document.createElement('audio')
  audio.id = AUDIO_ID
  audio.preload = 'none'
  audio.volume = volume
  if (withCors) audio.crossOrigin = 'anonymous'
  document.body.appendChild(audio)
  return audio
}

export function getCurrentPlayingStation(): Station | null {
  return currentPlayingStation
}

export function getCurrentStreamTelemetry(): StreamTelemetry {
  const audio = getAudio()
  const station = currentPlayingStation
  const rawUrl = currentStreamMeta?.url || station?.streamUrl || station?.url || ''
  const isHls = currentStreamMeta?.isHls ?? isHlsStreamUrl(rawUrl)

  let codec = station?.codec || 'MP3 (MPEG Audio)'
  if (isHls) codec = 'HLS / AAC Live'
  else if (rawUrl.includes('aac') || rawUrl.includes('.aac') || rawUrl.includes('audio/aac')) {
    codec = 'AAC+ High Efficiency'
  } else if (rawUrl.includes('ogg') || rawUrl.includes('opus')) {
    codec = 'Ogg Opus'
  } else if (rawUrl.includes('flac')) {
    codec = 'FLAC Lossless'
  }

  const bitrate =
    station?.bitrate ||
    (rawUrl.includes('320')
      ? 320
      : rawUrl.includes('256')
      ? 256
      : rawUrl.includes('192')
      ? 192
      : 128)

  const bufferedSeconds =
    audio && audio.buffered.length > 0
      ? Math.max(0, audio.buffered.end(audio.buffered.length - 1) - audio.currentTime)
      : 0

  return {
    codec,
    bitrate,
    isProxied: currentStreamMeta?.isProxied ?? false,
    isHls,
    url: rawUrl,
    bufferedSeconds,
    ttfaMs: lastTtfaMs,
  }
}

export function resyncStream() {
  if (currentPlayingStation) playStation(currentPlayingStation, false)
}

function updateMediaSession(station: Station) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: station.name,
      artist: station.country
        ? `${station.country}${station.region ? ` · ${station.region}` : ''}`
        : 'Radio Satelital En Vivo',
      album: 'Radio Satelital',
      artwork: station.logoUrl
        ? [
            { src: station.logoUrl, sizes: '96x96', type: 'image/png' },
            { src: station.logoUrl, sizes: '128x128', type: 'image/png' },
            { src: station.logoUrl, sizes: '256x256', type: 'image/png' },
          ]
        : [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
    })
  } catch (e) {
    console.warn('[Player] MediaSession error:', e)
  }
}

export function prepareStation(s: Station): void {
  if (playbackRequested || currentPlayingStation) return
  currentPlayingStation = s
  updateMediaSession(s)
  notifyStatus('paused')
}

export function bindMediaNavigation(next: () => void, previous: () => void): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  const actions: Array<[MediaSessionAction, () => void]> = [
    ['play', () => setPlayingState(true)],
    ['pause', () => setPlayingState(false)],
    ['nexttrack', next],
    ['previoustrack', previous],
  ]
  for (const [action, handler] of actions) {
    try {
      navigator.mediaSession.setActionHandler(action, handler)
    } catch {}
  }
}

function scheduleReconnect(station: Station, token: number, error?: string) {
  if (token !== runId || !playbackRequested || retryTimer !== null) return
  const retryToken = cancelTransport()
  suspendAudioDsp()

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    notifyStatus('offline')
    return
  }

  if (retryCount >= MAX_RETRIES) {
    isReconnecting = false
    playbackRequested = false
    const isHttpOnHttps =
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      (station.streamUrl || station.url || '').startsWith('http://') &&
      !currentStreamMeta?.isProxied

    const fallbackMsg = isHttpOnHttps
      ? 'Esta emisora transmite por HTTP sin cifrar y requiere proxy HTTPS.'
      : 'Transmisión no disponible. Prueba otra emisora.'

    const finalError = error || fallbackMsg
    recordStreamFailure(stationKey(station), station.name, finalError)
    notifyStatus('error', { error: finalError })
    return
  }

  const delay = RETRY_DELAYS_MS[retryCount] ?? 8000
  retryCount++
  isReconnecting = true
  notifyStatus('reconnecting')
  retryTimer = setTimeout(() => {
    retryTimer = null
    if (
      retryToken === runId &&
      playbackRequested &&
      currentPlayingStation &&
      stationKey(currentPlayingStation) === stationKey(station)
    ) {
      startStream(station, true)
    }
  }, delay)
}

async function attachHlsIfNeeded(
  audio: HTMLAudioElement,
  streamUrl: string,
  token: number,
  onFatalError: () => void,
  isHls: boolean
): Promise<boolean> {
  if (!isHls) return false

  // Safari / iOS reproduce HLS nativamente en el elemento <audio>
  if (audio.canPlayType('application/vnd.apple.mpegurl') !== '') {
    return false
  }

  try {
    const HlsModule = await import('hls.js')
    const Hls = HlsModule.default
    if (token !== runId || !playbackRequested) return true
    if (!Hls.isSupported()) return false

    destroyHls()
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 15,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
    })
    activeHls = hls
    let mediaRecoveryAttempted = false

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (token !== runId || !playbackRequested || activeHls !== hls) return
      audio.play().catch((err: unknown) => {
        const domErr = err as { name?: string } | null
        if (token !== runId || !playbackRequested || domErr?.name === 'AbortError') return
        if (domErr?.name === 'NotAllowedError') {
          playbackRequested = false
          isReconnecting = false
          cancelTransport()
          suspendAudioDsp()
          notifyStatus('paused')
        } else {
          onFatalError()
        }
      })
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (token !== runId || !playbackRequested || activeHls !== hls) return
      if (!data.fatal) return
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecoveryAttempted) {
        mediaRecoveryAttempted = true
        hls.recoverMediaError()
      } else {
        onFatalError()
      }
    })

    hls.loadSource(streamUrl)
    hls.attachMedia(audio)
    return true
  } catch {
    if (token !== runId || !playbackRequested) return true
    destroyHls()
    return false
  }
}

function startStream(station: Station, isRetry: boolean) {
  if (!playbackRequested) return
  const token = cancelTransport()
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    suspendAudioDsp()
    notifyStatus('offline')
    return
  }
  const optimal = getOptimalUrl(station)
  const hlsCandidate = isHlsStreamUrl(optimal.url) || isHlsStreamUrl(station.streamUrl || station.url || '')
  currentStreamMeta = { ...optimal, isHls: hlsCandidate }

  if (!isRetry) {
    streamRequestedAt = performance.now()
    lastTtfaMs = null
  }

  let audio = getAudio()
  if (!audio) return
  if (!plainMode && audio.crossOrigin !== 'anonymous') audio = replaceAudio(true)
  if (!audio) return

  const activeAudio = audio
  isReconnecting = isRetry
  notifyStatus(isRetry ? 'reconnecting' : 'loading')

  const onError = () => {
    if (token !== runId || !playbackRequested || retryTimer !== null) return
    if (!plainMode) {
      plainMode = true
      isReconnecting = true
      cancelTransport()
      releaseAudioDsp()
      replaceAudio(false)
      startStream(station, true)
      return
    }
    scheduleReconnect(station, token)
  }

  activeAudio.onerror = onError
  activeAudio.onwaiting = activeAudio.onstalled = () => {
    if (token !== runId || !playbackRequested || stallTimer || retryTimer !== null) return
    stallTimer = setTimeout(() => {
      stallTimer = null
      if (token === runId && playbackRequested) scheduleReconnect(station, token)
    }, STALL_MS)
  }
  activeAudio.onplaying = () => {
    if (token !== runId || !playbackRequested) return
    clearTimers()
    retryCount = 0
    isReconnecting = false
    if (streamRequestedAt > 0 && lastTtfaMs === null) {
      lastTtfaMs = Math.round(performance.now() - streamRequestedAt)
    }
    recordStreamSuccess(stationKey(station), station.name, lastTtfaMs)
    notifyStatus('playing')
    if (!plainMode) {
      try {
        initAudioDsp(activeAudio)
      } catch {}
    }
  }
  activeAudio.onpause = () => {
    if (token === runId && !isReconnecting && !playbackRequested) notifyStatus('paused')
  }

  // Bound startup time even if no waiting/error event arrives.
  stallTimer = setTimeout(() => {
    stallTimer = null
    if (token === runId && playbackRequested) onError()
  }, 15000)

  void (async () => {
    const handledByHlsJs = await attachHlsIfNeeded(activeAudio, optimal.url, token, onError, hlsCandidate)
    if (handledByHlsJs || token !== runId || !playbackRequested) return

    activeAudio.src = optimal.url
    activeAudio.load()
    activeAudio.play().catch((error: unknown) => {
      const domErr = error as { name?: string } | null
      if (token !== runId || !playbackRequested || domErr?.name === 'AbortError') return
      if (domErr?.name === 'NotAllowedError') {
        playbackRequested = false
        isReconnecting = false
        cancelTransport()
        suspendAudioDsp()
        notifyStatus('paused')
      } else {
        onError()
      }
    })
  })()
}

export function playStation(s: Station, isAutoRetry = false) {
  if (!s.streamUrl && !s.url) {
    notifyStatus('error', { error: 'URL de emisora no disponible' })
    return
  }
  if (!isAutoRetry) {
    clearTimers()
    retryCount = 0
    plainMode = false
    addRecentStation(stationKey(s))
  }
  currentPlayingStation = s
  playbackRequested = true
  updateMediaSession(s)
  resumeAudioDsp()
  startStream(s, isAutoRetry)
}

export function togglePlay() {
  setPlayingState(!playbackRequested)
}

export function setPlayingState(state: boolean) {
  if (state) {
    if (playbackRequested || !currentPlayingStation) return
    playStation(currentPlayingStation)
    return
  }
  playbackRequested = false
  isReconnecting = false
  cancelTransport()
  suspendAudioDsp()
  notifyStatus('paused')
}

export type SleepTimerListener = (remainingMinutes: number | null) => void
const sleepTimerListeners = new Set<SleepTimerListener>()

function notifySleepTimer(remaining: number | null) {
  sleepTimerListeners.forEach((l) => l(remaining))
}

export function subscribeSleepTimer(listener: SleepTimerListener): () => void {
  sleepTimerListeners.add(listener)
  return () => {
    sleepTimerListeners.delete(listener)
  }
}

export function setSleepTimer(minutes: number | null) {
  if (sleepTimerId) {
    clearTimeout(sleepTimerId)
    sleepTimerId = null
    sleepTimerEndsAt = null
  }
  if (minutes === null || minutes <= 0) {
    notifySleepTimer(null)
    return
  }
  sleepTimerEndsAt = Date.now() + minutes * 60 * 1000
  notifySleepTimer(minutes)
  sleepTimerId = setTimeout(() => {
    setPlayingState(false)
    sleepTimerId = null
    sleepTimerEndsAt = null
    notifySleepTimer(null)
  }, minutes * 60 * 1000)
}

export function getSleepTimerMinutesLeft(): number | null {
  if (!sleepTimerEndsAt) return null
  const msLeft = sleepTimerEndsAt - Date.now()
  return msLeft <= 0 ? null : Math.ceil(msLeft / 60000)
}
