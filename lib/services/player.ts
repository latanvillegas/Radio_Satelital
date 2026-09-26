import type { Station } from '../../types/station'
import { getOptimalUrl } from './proxy'
import { addRecentStation } from '../storage/recents'
import { stationKey } from './station-normalizer'
import { initAudioDsp } from './audio-dsp'

const AUDIO_ID = 'radioPlayer'
let sleepTimerId: ReturnType<typeof setTimeout> | null = null
let sleepTimerEndsAt: number | null = null
let currentPlayingStation: Station | null = null
let currentStreamMeta: { url: string; isProxied: boolean } | null = null
let retryCount = 0
const MAX_RETRIES = 2
let isReconnecting = false

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'reconnecting'
type StatusListener = (status: PlaybackStatus, meta?: { error?: string; reconnecting?: boolean }) => void
const statusListeners = new Set<StatusListener>()

function notifyStatus(status: PlaybackStatus, meta?: { error?: string; reconnecting?: boolean }) { statusListeners.forEach(listener => { try { listener(status, meta) } catch (e) { console.error('[Player] Error in status listener:', e) } }) }
export function subscribePlaybackStatus(listener: StatusListener): () => void { statusListeners.add(listener); return () => { statusListeners.delete(listener) } }

export function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  let audio = document.getElementById(AUDIO_ID) as HTMLAudioElement | null
  if (!audio) { audio = document.createElement('audio'); audio.id = AUDIO_ID; audio.crossOrigin = 'anonymous'; audio.preload = 'none'; document.body.appendChild(audio) }
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
    navigator.mediaSession.metadata = new MediaMetadata({
      title: station.name,
      artist: station.country ? `${station.country}${station.region ? ` · ${station.region}` : ''}` : 'Radio Satelital En Vivo',
      album: 'Radio Satelital',
      artwork: station.logoUrl ? [{ src: station.logoUrl, sizes: '96x96', type: 'image/png' }, { src: station.logoUrl, sizes: '128x128', type: 'image/png' }, { src: station.logoUrl, sizes: '256x256', type: 'image/png' }] : [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
    })
  } catch (e) { console.warn('[Player] MediaSession error:', e) }
}

export function playStation(s: Station, isAutoRetry = false) {
  const audio = getAudio(); if (!audio) return
  if (!s.url && !s.streamUrl) { notifyStatus('error', { error: 'URL de emisora no disponible' }); return }
  currentPlayingStation = s
  if (!isAutoRetry) { retryCount = 0; isReconnecting = false; addRecentStation(stationKey(s)) }
  const { url, isProxied } = getOptimalUrl(s); currentStreamMeta = { url, isProxied }; notifyStatus(isAutoRetry ? 'reconnecting' : 'loading')
  audio.src = url; updateMediaSession(s)
  audio.onerror = () => { if (retryCount < MAX_RETRIES && currentPlayingStation?.name === s.name) { retryCount++; isReconnecting = true; notifyStatus('reconnecting'); setTimeout(() => { if (currentPlayingStation?.name === s.name) playStation(s, true) }, 2000) } else { isReconnecting = false; notifyStatus('error', { error: 'Transmisión fuera de servicio o inaccesible temporalmente' }) } }
  audio.onwaiting = () => notifyStatus('loading')
  audio.onplaying = () => { retryCount = 0; isReconnecting = false; notifyStatus('playing'); try { initAudioDsp(audio) } catch {} }
  audio.onpause = () => { if (!isReconnecting) notifyStatus('paused') }
  audio.play().catch(err => { if (err?.name === 'NotAllowedError') notifyStatus('paused'); else notifyStatus('error', { error: 'No se pudo reproducir la transmisión' }) })
}

export function togglePlay() {
  const audio = getAudio(); if (!audio) return
  if (audio.paused || !audio.src) { if (currentPlayingStation && !audio.src) playStation(currentPlayingStation); else audio.play().catch(() => notifyStatus('error', { error: 'Error al reanudar audio' })) }
  else { audio.pause(); notifyStatus('paused') }
}
export function skipStation(nextUrl: string) { const audio = getAudio(); if (!audio) return; audio.src = nextUrl; audio.play().catch(() => {}) }
export function setPlayingState(state: boolean) { const audio = getAudio(); if (!audio) return; if (state) audio.play().catch(() => {}); else audio.pause() }

export type SleepTimerListener = (remainingMinutes: number | null) => void
const sleepTimerListeners = new Set<SleepTimerListener>()
function notifySleepTimer(remaining: number | null) { sleepTimerListeners.forEach(l => l(remaining)) }
export function subscribeSleepTimer(listener: SleepTimerListener): () => void { sleepTimerListeners.add(listener); return () => { sleepTimerListeners.delete(listener) } }
export function setSleepTimer(minutes: number | null) {
  if (sleepTimerId) { clearTimeout(sleepTimerId); sleepTimerId = null; sleepTimerEndsAt = null }
  if (minutes === null || minutes <= 0) { notifySleepTimer(null); return }
  sleepTimerEndsAt = Date.now() + minutes * 60 * 1000; notifySleepTimer(minutes)
  sleepTimerId = setTimeout(() => { const audio = getAudio(); if (audio) { audio.pause(); notifyStatus('paused') }; sleepTimerId = null; sleepTimerEndsAt = null; notifySleepTimer(null) }, minutes * 60 * 1000)
}
export function getSleepTimerMinutesLeft(): number | null { if (!sleepTimerEndsAt) return null; const msLeft = sleepTimerEndsAt - Date.now(); return msLeft <= 0 ? null : Math.ceil(msLeft / 60000) }
