import type { Station } from '../../types/station'
import { getOptimalUrl } from './proxy'
import { addRecentStation } from '../storage/recents'
import { stationKey } from './station-normalizer'

const AUDIO_ID = 'radioPlayer'

let sleepTimerId: ReturnType<typeof setTimeout> | null = null
let sleepTimerEndsAt: number | null = null
let currentPlayingStation: Station | null = null
let retryCount = 0
const MAX_RETRIES = 2
let isReconnecting = false

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'reconnecting'

type StatusListener = (status: PlaybackStatus, meta?: { error?: string; reconnecting?: boolean }) => void
const statusListeners = new Set<StatusListener>()

function notifyStatus(status: PlaybackStatus, meta?: { error?: string; reconnecting?: boolean }) {
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

export function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  return document.getElementById(AUDIO_ID) as HTMLAudioElement | null
}

function updateMediaSession(station: Station) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) return

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: station.name,
      artist: station.country ? `${station.country}${station.region ? ` · ${station.region}` : ''}` : 'Radio Satelital En Vivo',
      album: 'Radio Satelital',
      artwork: station.logoUrl
        ? [
            { src: station.logoUrl, sizes: '96x96', type: 'image/png' },
            { src: station.logoUrl, sizes: '128x128', type: 'image/png' },
            { src: station.logoUrl, sizes: '256x256', type: 'image/png' },
          ]
        : [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          ],
    })
  } catch (e) {
    console.warn('[Player] MediaSession error:', e)
  }
}

export function playStation(s: Station, isAutoRetry = false) {
  const audio = getAudio()
  if (!audio) {
    console.error('[Player] Elemento de audio no encontrado')
    return
  }

  if (!s.url && !s.streamUrl) {
    console.error('[Player] URL de estación vacía:', s.name)
    notifyStatus('error', { error: 'URL de emisora no disponible' })
    return
  }

  currentPlayingStation = s
  if (!isAutoRetry) {
    retryCount = 0
    isReconnecting = false
    addRecentStation(stationKey(s))
  }

  const { url, isProxied } = getOptimalUrl(s)
  notifyStatus(isAutoRetry ? 'reconnecting' : 'loading')

  audio.src = url
  updateMediaSession(s)

  audio.onerror = () => {
    console.error('[Player] Error de red o stream:', audio.error?.message, 'URL:', url)

    if (retryCount < MAX_RETRIES && currentPlayingStation?.name === s.name) {
      retryCount++
      isReconnecting = true
      notifyStatus('reconnecting')
      console.log(`[Player] Reintentando conexión (${retryCount}/${MAX_RETRIES})...`)
      setTimeout(() => {
        if (currentPlayingStation?.name === s.name) {
          playStation(s, true)
        }
      }, 2000)
    } else {
      isReconnecting = false
      notifyStatus('error', { error: 'Transmisión fuera de servicio o inaccesible temporalmente' })
    }
  }

  audio.onwaiting = () => {
    notifyStatus('loading')
  }

  audio.onplaying = () => {
    retryCount = 0
    isReconnecting = false
    notifyStatus('playing')
  }

  audio.onpause = () => {
    if (!isReconnecting) {
      notifyStatus('paused')
    }
  }

  audio.play().catch((err) => {
    console.warn('[Player] Excepción en audio.play():', err?.name)
    if (err?.name === 'NotAllowedError') {
      notifyStatus('paused')
    } else {
      notifyStatus('error', { error: 'No se pudo reproducir la transmisión' })
    }
  })
}

export function togglePlay() {
  const audio = getAudio()
  if (!audio) return

  if (audio.paused || !audio.src) {
    if (currentPlayingStation && (!audio.src || audio.src === '')) {
      playStation(currentPlayingStation)
    } else {
      audio.play().catch((err) => {
        console.error('[Player] Error al reanudar:', err)
        notifyStatus('error', { error: 'Error al reanudar audio' })
      })
    }
  } else {
    audio.pause()
    notifyStatus('paused')
  }
}

export function skipStation(nextUrl: string) {
  const audio = getAudio()
  if (!audio) return
  audio.src = nextUrl
  audio.play().catch(() => {})
}

export function setPlayingState(state: boolean) {
  const audio = getAudio()
  if (!audio) return
  if (state) {
    audio.play().catch(() => {})
  } else {
    audio.pause()
  }
}

// ==========================================
// Temporizador de Apagado (Sleep Timer)
// ==========================================
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
    const audio = getAudio()
    if (audio) {
      audio.pause()
      notifyStatus('paused')
    }
    sleepTimerId = null
    sleepTimerEndsAt = null
    notifySleepTimer(null)
    console.log('[Player] Temporizador de apagado activado: audio pausado')
  }, minutes * 60 * 1000)
}

export function getSleepTimerMinutesLeft(): number | null {
  if (!sleepTimerEndsAt) return null
  const msLeft = sleepTimerEndsAt - Date.now()
  if (msLeft <= 0) return null
  return Math.ceil(msLeft / 60000)
}
