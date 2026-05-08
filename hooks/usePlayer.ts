"use client"
import { useEffect, useState } from 'react'
import { playStation as libPlay, togglePlay as libToggle, setPlayingState } from '../lib/player'
import type { Station } from '../types/station'

export default function usePlayer(){
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  useEffect(()=>{
    const audio = document.getElementById('radioPlayer') as HTMLAudioElement | null
    if(!audio) return
    const onPlay = ()=> setIsPlaying(true)
    const onPause = ()=> setIsPlaying(false)
    const onTime = ()=> setSecondsElapsed(Math.floor(audio.currentTime))
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTime)
    return ()=>{
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTime)
    }
  },[])

  function playStation(s:Station){
    setCurrentStation(s)
    libPlay(s)
  }

  function togglePlay(){
    libToggle()
  }

  function setPlaying(val:boolean){
    setPlayingState(val)
  }

  return { currentStation, isPlaying, secondsElapsed, playStation, togglePlay, setPlaying }
}
