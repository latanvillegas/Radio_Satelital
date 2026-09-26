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
    const audio = document.getElementById('radioPlayer') as HTMLAudioElement | null
    if (!audio) return

    setCurrentStation(getCurrentPlayingStation())
    setIsPlaying(!audio.paused && Boolean(audio.src))

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTime = () => setSecondsElapsed(Math.floor(audio.currentTime))

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTime)

    const unsubscribeStatus = subscribePlaybackStatus((status, meta) => {
      setCurrentStation(getCurrentPlayingStation())
      setPlaybackStatus(status)
      if (status === 'playing') {
        setIsPlaying(true)
        setStatusMessage(null)
      } else if (status === 'paused') {
        setIsPlaying(false)
        setStatusMessage(null)
      } else if (status === 'loading') {
        setStatusMessage('Conectando stream...')
      } else if (status === 'reconnecting') {
        setStatusMessage('Reconectando señal...')
      } else if (status === 'error') {
        setIsPlaying(false)
        setStatusMessage(meta?.error || 'Transmisión no disponible')
      }
    })

    const unsubscribeSleep = subscribeSleepTimer((mins) => setSleepTimerMinutes(mins))

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTime)
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
