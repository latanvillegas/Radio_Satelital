import type { Station } from '../../types/station'
import { getOptimalUrl } from './proxy'
import { addRecentStation } from '../storage/recents'
import { stationKey } from './station-normalizer'
import { initAudioDsp, releaseAudioDsp } from './audio-dsp'
import { lookupNowPlaying, type NowPlaying, type MetadataMode } from './now-playing'

const AUDIO_ID = 'radioPlayer'
let sleepTimerId: ReturnType<typeof setTimeout> | null = null
let sleepTimerEndsAt: number | null = null
let currentPlayingStation: Station | null = null
let currentStreamMeta: { url: string; isProxied: boolean } | null = null
let retryCount = 0
const MAX_RETRIES = 3
let isReconnecting = false
let playbackRequested = false
let plainMode = false
let runId = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null
let stallTimer: ReturnType<typeof setTimeout> | null = null
let networkListenersInstalled = false
const STALL_MS = 6000
const RETRY_DELAYS_MS = [2000, 4000, 8000]
const METADATA_POLL_MS = 30000
const METADATA_TIMEOUT_MS = 7000

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'reconnecting' | 'offline'
type StatusListener = (status: PlaybackStatus, meta?: { error?: string; reconnecting?: boolean }) => void
const statusListeners = new Set<StatusListener>()

// One cancelable metadata tracker for the active station, not another audio player.
let nowPlaying: NowPlaying | null = null
const nowPlayingListeners = new Set<(track: NowPlaying | null) => void>()
let metadataController: AbortController | null = null
let metadataTimeout: ReturnType<typeof setTimeout> | null = null
let metadataTimer: ReturnType<typeof setTimeout> | null = null
let metadataGeneration = 0
let metadataKey = ''
export function getNowPlaying(): NowPlaying | null { return nowPlaying }
export function subscribeNowPlaying(listener: (track: NowPlaying | null) => void): () => void {
  nowPlayingListeners.add(listener)
  return () => { nowPlayingListeners.delete(listener) }
}
function publishNowPlaying(track: NowPlaying | null) {
  if (nowPlaying?.title === track?.title && nowPlaying?.artist === track?.artist
    && nowPlaying?.album === track?.album && nowPlaying?.artworkUrl === track?.artworkUrl) return
  nowPlaying = track
  nowPlayingListeners.forEach(listener => { try { listener(track) } catch {} })
  if (currentPlayingStation) updateMediaSession(currentPlayingStation)
}
function cancelMetadataTracking(clearTrack = false) {
  metadataGeneration++
  metadataKey = ''
  if (metadataTimer) { clearTimeout(metadataTimer); metadataTimer = null }
  if (metadataTimeout) { clearTimeout(metadataTimeout); metadataTimeout = null }
  if (metadataController) { metadataController.abort(); metadataController = null }
  if (clearTrack) publishNowPlaying(null)
}
function startMetadataTracking(station: Station) {
  const key = stationKey(station)
  if (metadataKey === key) return
  cancelMetadataTracking()
  metadataKey = key
  const generation = metadataGeneration
  const poll = async (mode?: MetadataMode) => {
    if (generation !== metadataGeneration || !playbackRequested || !currentPlayingStation
      || stationKey(currentPlayingStation) !== key) return
    const controller = new AbortController()
    metadataController = controller
    metadataTimeout = setTimeout(() => controller.abort(), METADATA_TIMEOUT_MS)
    let result: Awaited<ReturnType<typeof lookupNowPlaying>> = null
    try { result = await lookupNowPlaying(station, controller.signal, mode) } catch {}
    if (metadataTimeout) { clearTimeout(metadataTimeout); metadataTimeout = null }
    if (metadataController === controller) metadataController = null
    if (controller.signal.aborted || generation !== metadataGeneration || !playbackRequested
      || !currentPlayingStation || stationKey(currentPlayingStation) !== key) return
    // Do not repeatedly probe unsupported or CORS-blocked streams.
    if (!result) return
    publishNowPlaying(result.track)
    metadataTimer = setTimeout(() => { void poll(result.mode) }, METADATA_POLL_MS)
  }
  void poll()
}

function notifyStatus(status: PlaybackStatus, meta?: { error?: string; reconnecting?: boolean }) {
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try { navigator.mediaSession.playbackState = status === 'playing' ? 'playing' : status === 'paused' ? 'paused' : 'none' } catch {}
  }
  statusListeners.forEach(listener => { try { listener(status, meta) } catch (e) { console.error('[Player] Error in status listener:', e) } })
}
export function subscribePlaybackStatus(listener: StatusListener): () => void { statusListeners.add(listener); return () => { statusListeners.delete(listener) } }

function clearTimers() {
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
  if (stallTimer) { clearTimeout(stallTimer); stallTimer = null }
}
function installNetworkListeners() {
  if (networkListenersInstalled || typeof window === 'undefined') return
  networkListenersInstalled = true
  window.addEventListener('offline', () => {
    if (!playbackRequested) return
    clearTimers()
    cancelMetadataTracking()
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
  if (!audio) { audio = document.createElement('audio'); audio.id = AUDIO_ID; audio.crossOrigin = 'anonymous'; audio.preload = 'none'; document.body.appendChild(audio) }
  installNetworkListeners()
  return audio
}

// El elemento procesado por Web Audio no puede convertirse en audio nativo sin CORS.
function replaceAudio(withCors: boolean): HTMLAudioElement | null {
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

export function getCurrentPlayingStation(): Station | null { return currentPlayingStation }
export function getCurrentStreamTelemetry() {
  const audio = getAudio(), station = currentPlayingStation
  const rawUrl = currentStreamMeta?.url || station?.streamUrl || station?.url || ''
  let codec = 'MP3 (MPEG Audio)'
  if (rawUrl.includes('.m3u8') || rawUrl.includes('hls')) codec = 'HLS / AAC Live'
  else if (rawUrl.includes('aac') || rawUrl.includes('.aac') || rawUrl.includes('audio/aac')) codec = 'AAC+ High Efficiency'
  else if (rawUrl.includes('ogg') || rawUrl.includes('opus')) codec = 'Ogg Opus'
  else if (rawUrl.includes('flac')) codec = 'FLAC Lossless'
  const bitrate = station?.bitrate || (rawUrl.includes('320') ? 320 : rawUrl.includes('256') ? 256 : rawUrl.includes('192') ? 192 : 128)
  return { codec, bitrate, isProxied: currentStreamMeta?.isProxied ?? false, url: rawUrl, bufferedSeconds: audio && audio.buffered.length > 0 ? Math.max(0, audio.buffered.end(audio.buffered.length - 1) - audio.currentTime) : 0 }
}
export function resyncStream() { if (currentPlayingStation) playStation(currentPlayingStation, false) }

function updateMediaSession(station: Station) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
  try {
    const track = nowPlaying
    const art = track?.artworkUrl || station.logoUrl
    const place = [station.country, station.region].filter(Boolean).join(' · ')
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track?.title || station.name,
      artist: track?.artist || (track ? station.name : place || 'Radio Satelital En Vivo'),
      album: track?.album || 'Radio Satelital',
      artwork: art ? [{ src: art }] : [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    })
  } catch (e) { console.warn('[Player] MediaSession error:', e) }
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
    try { navigator.mediaSession.setActionHandler(action, handler) } catch {}
  }
}
function scheduleReconnect(station: Station, token: number, error?: string) {
  if (token !== runId || !playbackRequested) return
  clearTimers()
  cancelMetadataTracking()
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    notifyStatus('offline')
    return
  }
  if (retryCount >= MAX_RETRIES) {
    isReconnecting = false
    notifyStatus('error', { error: error || 'Transmisión no disponible. Prueba otra emisora.' })
    return
  }
  const delay = RETRY_DELAYS_MS[retryCount]
  retryCount++
  isReconnecting = true
  notifyStatus('reconnecting')
  retryTimer = setTimeout(() => {
    retryTimer = null
    if (token === runId && playbackRequested && currentPlayingStation && stationKey(currentPlayingStation) === stationKey(station)) {
      startStream(station, true)
    }
  }, delay)
}
function startStream(station: Station, isRetry: boolean) {
  if (!playbackRequested) return
  clearTimers()
  cancelMetadataTracking()
  const token = ++runId
  const optimal = getOptimalUrl(station)
  currentStreamMeta = optimal
  let audio = getAudio()
  if (!audio) return
  if (!plainMode && audio.crossOrigin !== 'anonymous') audio = replaceAudio(true)
  if (!audio) return
  isReconnecting = isRetry
  notifyStatus(isRetry ? 'reconnecting' : 'loading')
  const onError = () => {
    if (token !== runId || !playbackRequested) return
    if (!plainMode) {
      plainMode = true
      isReconnecting = true
      releaseAudioDsp()
      replaceAudio(false)
      startStream(station, true)
      return
    }
    scheduleReconnect(station, token)
  }
  audio.onerror = onError
  audio.onwaiting = audio.onstalled = () => {
    if (token !== runId || !playbackRequested || stallTimer) return
    stallTimer = setTimeout(() => {
      stallTimer = null
      if (token === runId && playbackRequested) scheduleReconnect(station, token)
    }, STALL_MS)
  }
  audio.onplaying = () => {
    if (token !== runId) return
    clearTimers()
    retryCount = 0
    isReconnecting = false
    notifyStatus('playing')
    startMetadataTracking(station)
    if (!plainMode) { try { initAudioDsp(audio) } catch {} }
  }
  audio.onpause = () => { if (token === runId && !isReconnecting && !playbackRequested) notifyStatus('paused') }
  audio.src = optimal.url
  audio.load()
  audio.play().catch(error => {
    if (token !== runId || !playbackRequested || error?.name === 'AbortError') return
    if (error?.name === 'NotAllowedError') {
      playbackRequested = false
      isReconnecting = false
      clearTimers()
      notifyStatus('paused')
    } else onError()
  })
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
  if (!currentPlayingStation || stationKey(currentPlayingStation) !== stationKey(s)) cancelMetadataTracking(true)
  currentPlayingStation = s
  playbackRequested = true
  updateMediaSession(s)
  startStream(s, isAutoRetry)
}
export function togglePlay() {
  const audio = getAudio()
  if (!audio) return
  if (audio.paused || !audio.src) {
    if (!currentPlayingStation) return
    if (!audio.src) { playStation(currentPlayingStation); return }
    playbackRequested = true
    startStream(currentPlayingStation, false)
  } else {
    playbackRequested = false
    isReconnecting = false
    clearTimers()
    cancelMetadataTracking()
    ++runId
    audio.pause()
    notifyStatus('paused')
  }
}
export function skipStation(nextUrl: string) { const audio = getAudio(); if (!audio) return; audio.src = nextUrl; audio.play().catch(() => {}) }
export function setPlayingState(state: boolean) {
  const audio = getAudio()
  if (!audio) return
  if (state) {
    if (!currentPlayingStation) return
    if (!audio.src) { playStation(currentPlayingStation); return }
    playbackRequested = true
    startStream(currentPlayingStation, false)
  } else {
    playbackRequested = false
    isReconnecting = false
    clearTimers()
    cancelMetadataTracking()
    ++runId
    audio.pause()
    notifyStatus('paused')
  }
}

export type SleepTimerListener = (remainingMinutes: number | null) => void
const sleepTimerListeners = new Set<SleepTimerListener>()
function notifySleepTimer(remaining: number | null) { sleepTimerListeners.forEach(l => l(remaining)) }
export function subscribeSleepTimer(listener: SleepTimerListener): () => void { sleepTimerListeners.add(listener); return () => { sleepTimerListeners.delete(listener) } }
export function setSleepTimer(minutes: number | null) {
  if (sleepTimerId) { clearTimeout(sleepTimerId); sleepTimerId = null; sleepTimerEndsAt = null }
  if (minutes === null || minutes <= 0) { notifySleepTimer(null); return }
  sleepTimerEndsAt = Date.now() + minutes * 60 * 1000; notifySleepTimer(minutes)
  sleepTimerId = setTimeout(() => { const audio = getAudio(); playbackRequested = false; cancelMetadataTracking(); if (audio) { audio.pause(); notifyStatus('paused') }; sleepTimerId = null; sleepTimerEndsAt = null; notifySleepTimer(null) }, minutes * 60 * 1000)
}
export function getSleepTimerMinutesLeft(): number | null { if (!sleepTimerEndsAt) return null; const msLeft = sleepTimerEndsAt - Date.now(); return msLeft <= 0 ? null : Math.ceil(msLeft / 60000) }
