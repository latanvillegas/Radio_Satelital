"use client"

import React, { memo } from 'react'
import { Heart, LoaderCircle, Pause, Play } from 'lucide-react'
import type { Station } from '@/types/station'
import type { PlaybackStatus } from '@/lib/services/player'
import StationArtwork from './StationArtwork'

interface Props {
  station: Station
  isActive: boolean
  isPlaying: boolean
  playbackStatus: PlaybackStatus
  onPlay: (station: Station) => void
  onPause: () => void
  onToggleFav: (station: Station) => void
}

function StationCard({ station, isActive, isPlaying, playbackStatus, onPlay, onPause, onToggleFav }: Props) {
  const playing = isActive && isPlaying
  const loading = isActive && (playbackStatus === 'loading' || playbackStatus === 'reconnecting')
  const error = isActive && (playbackStatus === 'error' || playbackStatus === 'offline')
  const playOrPause = () => playing ? onPause() : onPlay(station)
  const place = [station.region, station.country].filter(Boolean).join(' · ') || 'Radio en directo'

  return <article className={['dial-card', isActive ? 'is-active' : ''].join(' ')}>
    <button type="button" onClick={playOrPause} className="dial-card-main"
      aria-label={(playing ? 'Pausar ' : 'Escuchar ') + station.name}>
      <StationArtwork station={station} variant="card" />
      <span className="dial-card-content">
        <strong className="dial-card-name">{station.name}</strong>
        <span className="dial-card-place">{place}</span>
        <span className={['dial-card-genre', error ? 'is-error' : ''].join(' ')}>
          {error ? 'Sin señal' : loading ? 'Conectando…' : playing ? 'En vivo' : station.tags?.[0] || 'En directo'}
        </span>
      </span>
    </button>
    <div className="dial-card-controls">
      <button type="button" onClick={() => onToggleFav(station)}
        aria-label={(station.isFavorite ? 'Quitar de favoritas: ' : 'Añadir a favoritas: ') + station.name}
        aria-pressed={Boolean(station.isFavorite)}
        className="dial-card-fav">
        <Heart size={18} fill={station.isFavorite ? 'currentColor' : 'none'} />
      </button>
      <button type="button" onClick={playOrPause}
        aria-label={(playing ? 'Pausar: ' : 'Reproducir: ') + station.name}
        className="dial-card-play">
        {loading ? <LoaderCircle size={19} className="animate-spin" />
          : playing ? <Pause size={19} fill="currentColor" />
          : <Play size={19} fill="currentColor" />}
      </button>
    </div>
  </article>
}
export default memo(StationCard)
