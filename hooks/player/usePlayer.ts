"use client"
import { useEffect, useState } from 'react'
import {
  playStation as libPlay,
  togglePlay as libToggle,
  setPlayingState,
  subscribePlaybackStatus,
  subscribeSleepTimer,
  setSleepTimer as libSetSleepTimer,
  getSleepTimerMinutesLeft,
  getCurrentPlayingStation,
  getAudio,
  type PlaybackStatus,
} from '@/lib/services/player'
import type { Station } from '@/types/station'

export default function usePlayer() {
  const [currentStation, setCurrentStation] = useState<Station | null>(() => getCurrentPlayingStation())
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(getSleepTimerMinutesLeft())

  useEffect(() => {
    let boundAudio: HTMLAudioElement | null = null
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTime = () => { if (boundAudio) setSecondsElapsed(Math.floor(boundAudio.currentTime)) }
    const bindCurrentAudio = () => {
      const audio = getAudio()
      if (boundAudio === audio) return
      if (boundAudio) {
        boundAudio.removeEventListener('play', onPlay)
        boundAudio.removeEventListener('pause', onPause)
        boundAudio.removeEventListener('timeupdate', onTime)
      }
      boundAudio = audio
      if (audio) {
        audio.addEventListener('play', onPlay)
        audio.addEventListener('pause', onPause)
        audio.addEventListener('timeupdate', onTime)
        setIsPlaying(!audio.paused && Boolean(audio.src))
      }
    }
    bindCurrentAudio()
    setCurrentStation(getCurrentPlayingStation())
    const unsubscribeStatus = subscribePlaybackStatus((status, meta) => {
      bindCurrentAudio()
      setCurrentStation(getCurrentPlayingStation())
      setPlaybackStatus(status)
      if (status === 'playing') { setIsPlaying(true); setStatusMessage(null) }
      else if (status === 'paused') { setIsPlaying(false); setStatusMessage(null) }
      else if (status === 'loading') setStatusMessage('Conectando stream...')
      else if (status === 'reconnecting') setStatusMessage('Reconectando señal...')
      else if (status === 'offline') { setIsPlaying(false); setStatusMessage('Sin conexión a Internet') }
      else if (status === 'error') { setIsPlaying(false); setStatusMessage(meta?.error || 'Transmisión no disponible') }
    })
    const unsubscribeSleep = subscribeSleepTimer(setSleepTimerMinutes)
    return () => {
      if (boundAudio) {
        boundAudio.removeEventListener('play', onPlay)
        boundAudio.removeEventListener('pause', onPause)
        boundAudio.removeEventListener('timeupdate', onTime)
      }
      unsubscribeStatus()
      unsubscribeSleep()
    }
  }, [])

  function playStation(s: Station) {
    setCurrentStation(s)
    libPlay(s)
  }

  function togglePlay() { libToggle() }
  function setPlaying(val: boolean) { setPlayingState(val) }
  function setSleepTimer(minutes: number | null) { libSetSleepTimer(minutes) }

  return { currentStation, isPlaying, playbackStatus, statusMessage, secondsElapsed, sleepTimerMinutes, playStation, togglePlay, setPlaying, setSleepTimer }
}
