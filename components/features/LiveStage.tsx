"use client"

import React from 'react'
import { ArrowRight, Headphones, Pause, Play, RadioTower, Signal } from 'lucide-react'
import type { Station } from '@/types/station'
import { usePlayer } from '@/hooks/player'
import { stationKey } from '@/lib/services/station-normalizer'
import StationArtwork from './StationArtwork'

type Props = {
  featured: Station | null
  stationCount: number
  countryCount: number
  onTune: (station: Station) => void
}

export default function LiveStage({ featured, onTune }: Props) {
  const { currentStation, isPlaying, playbackStatus, togglePlay } = usePlayer()
  if (!featured) return null
  const selected = Boolean(currentStation && stationKey(featured) === stationKey(currentStation))
  const playing = selected && isPlaying
  const connecting = selected && (playbackStatus === 'loading' || playbackStatus === 'reconnecting')
  const tune = () => {
    if (selected) togglePlay()
    else onTune(featured)
  }

  return <section className="dial-hero" aria-labelledby="dial-hero-title">
    <div className="dial-hero-art">
      <StationArtwork station={featured} variant="hero" />
      <div className="dial-hero-signal" aria-hidden="true"><Signal size={18} /></div>
    </div>
    <div className="dial-hero-info">
      <p className="dial-hero-kicker"><RadioTower size={14} /> EMISORA DESTACADA</p>
      <h1 id="dial-hero-title">{featured.name}</h1>
      <p className="dial-hero-place">{[featured.region, featured.country].filter(Boolean).join(' · ') || 'Radio en vivo'}</p>
      <p className="dial-hero-status" role="status">
        <span className={playing ? 'dial-status-dot is-playing' : 'dial-status-dot'} aria-hidden="true" />
        {playing ? 'REPRODUCIENDO EN VIVO' : connecting ? 'CONECTANDO SEÑAL…' : 'LISTA PARA ESCUCHAR'}
      </p>
    </div>
    <div className="dial-hero-actions">
      <button type="button" onClick={tune} className="dial-hero-play" aria-label={(playing ? 'Pausar ' : 'Escuchar ') + featured.name}>
        {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        {playing ? 'Pausar' : 'Escuchar ahora'}
      </button>
      <a href="#station-list" className="dial-hero-explore">Ver emisoras <ArrowRight size={16} /></a>
    </div>
    <Headphones className="dial-hero-decoration" size={150} aria-hidden="true" />
  </section>
}
