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

function StationCard({
  station,
  isActive,
  isPlaying,
  playbackStatus,
  onPlay,
  onPause,
  onToggleFav,
}: Props) {
  const playing = isActive && isPlaying
  const loading =
    isActive && (playbackStatus === 'loading' || playbackStatus === 'reconnecting')
  const hasError =
    isActive && (playbackStatus === 'error' || playbackStatus === 'offline')

  const handlePlayOrPause = () => {
    if (playing || loading || (isActive && playbackStatus === 'offline')) onPause()
    else onPlay(station)
  }

  const place = [station.region, station.country].filter(Boolean).join(', ')
  const primaryGenre = station.tags?.[0]

  const statusLabel = hasError
    ? 'Sin señal'
    : loading
    ? 'Conectando…'
    : playing
    ? 'En vivo'
    : primaryGenre
    ? primaryGenre.charAt(0).toUpperCase() + primaryGenre.slice(1)
    : 'En directo'

  return (
    <article className={`station-tile ${isActive ? 'is-active' : ''}`}>
      <button
        type="button"
        onClick={handlePlayOrPause}
        className="flex flex-1 items-center gap-3.5 min-w-0 text-left rounded-xl py-0.5"
      >
        <span aria-hidden="true"><StationArtwork station={station} variant="card" /></span>
        <span className="min-w-0 flex-1 flex flex-col gap-0.5">
          <strong className="block truncate text-sm font-bold text-ink">
            {station.name}
          </strong>
          <span className="flex items-center gap-1.5 text-xs text-ink-secondary truncate">
            {place && <span className="truncate">{place}</span>}
            {place && <span aria-hidden="true">·</span>}
            <span
              className={
                hasError
                  ? 'text-red-500 font-semibold shrink-0'
                  : playing || loading
                  ? 'text-accent font-semibold shrink-0'
                  : 'text-ink-muted shrink-0'
              }
            >
              {statusLabel}
            </span>
          </span>
        </span>
        <span className="sr-only">{playing || loading || (isActive && playbackStatus === 'offline') ? 'Pausar emisora' : 'Escuchar emisora'}</span>
      </button>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onToggleFav(station)}
          aria-label={`${
            station.isFavorite ? 'Quitar de favoritas:' : 'Guardar en favoritas:'
          } ${station.name}`}
          aria-pressed={Boolean(station.isFavorite)}
          className={`min-w-[44px] min-h-[44px] rounded-xl grid place-items-center transition-colors ${
            station.isFavorite
              ? 'text-accent bg-accent-subtle'
              : 'text-ink-muted hover:text-ink hover:bg-subtle'
          }`}
        >
          <Heart size={18} fill={station.isFavorite ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          onClick={handlePlayOrPause}
          aria-label={`${playing || loading || (isActive && playbackStatus === 'offline') ? 'Pausar:' : 'Reproducir:'} ${station.name}`}
          className="min-w-[44px] min-h-[44px] rounded-full grid place-items-center bg-accent text-accent-fg hover:bg-accent-hover transition-colors shadow-sm"
        >
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : playing ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>
    </article>
  )
}

export default memo(StationCard)
