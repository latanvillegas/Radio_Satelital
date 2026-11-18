"use client"

import React, { useEffect, useMemo, useState } from 'react'
import type { Station } from '@/types/station'
import { SearchX, ArrowDown } from 'lucide-react'
import StationCard from './StationCard'
import {
  getAudio,
  getCurrentPlayingStation,
  subscribePlaybackStatus,
  togglePlay,
  type PlaybackStatus,
} from '@/lib/services/player'
import { stationKey } from '@/lib/services/station-normalizer'

interface Props {
  stations: Station[]
  title?: string
  subtitle?: string
  playStation: (s: Station) => void
  toggleFavorite: (s: Station) => void
  onResetFilters?: () => void
}

const PAGE_SIZE = 24

export default function StationGrid({
  stations,
  title = 'Todas las emisoras',
  subtitle = 'Explora el catálogo, sintoniza en directo y guarda tus frecuencias favoritas.',
  playStation,
  toggleFavorite,
  onResetFilters,
}: Props) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [playback, setPlayback] = useState<{
    station: Station | null
    status: PlaybackStatus
    playing: boolean
  }>({
    station: null,
    status: 'idle',
    playing: false,
  })

  // Restablecer paginación cuando cambia el conjunto filtrado
  useEffect(() => {
    setLimit(PAGE_SIZE)
  }, [title, stations.length])

  useEffect(() => {
    const refresh = (status: PlaybackStatus) => {
      const audio = getAudio()
      setPlayback({
        station: getCurrentPlayingStation(),
        status,
        playing:
          status === 'playing' ||
          (status !== 'paused' && status !== 'error' && Boolean(audio) && !audio!.paused),
      })
    }
    const audio = getAudio()
    refresh(audio && !audio.paused ? 'playing' : 'idle')
    return subscribePlaybackStatus(refresh)
  }, [])

  const selectedKey = playback.station ? stationKey(playback.station) : ''
  const page = useMemo(() => stations.slice(0, limit), [stations, limit])
  const remaining = stations.length - page.length

  return (
    <section id="station-list" className="scroll-mt-24" aria-label="Catálogo de emisoras">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-ink-secondary">{subtitle}</p>
        </div>
        <span
          className="shrink-0 text-xs font-mono font-medium tabular-nums text-ink-muted"
          aria-live="polite"
        >
          {stations.length} {stations.length === 1 ? 'emisora' : 'emisoras'}
        </span>
      </div>

      {stations.length === 0 ? (
        <div
          role="status"
          className="rounded-2xl border border-line bg-surface text-center px-6 py-14"
        >
          <SearchX className="mx-auto mb-3 text-ink-muted" size={28} />
          <p className="text-base font-bold text-ink">
            No encontramos emisoras con esos criterios
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            Prueba con otro término de búsqueda o restablece los filtros activos.
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-5 inline-flex items-center justify-center min-h-[44px] px-5 py-2 rounded-xl bg-accent text-accent-fg text-xs font-bold hover:bg-accent-hover transition-colors"
            >
              Ver todas las emisoras
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {page.map((station) => (
              <StationCard
                key={stationKey(station)}
                station={station}
                isActive={selectedKey === stationKey(station)}
                isPlaying={playback.playing}
                playbackStatus={playback.status}
                onPlay={playStation}
                onPause={togglePlay}
                onToggleFav={toggleFavorite}
              />
            ))}
          </div>

          {remaining > 0 && (
            <div className="flex flex-col items-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl px-6 py-2.5 bg-surface hover:bg-subtle text-ink text-sm font-semibold border border-line hover:border-line-strong transition-colors whitespace-nowrap"
              >
                <ArrowDown size={16} />
                <span>Mostrar más emisoras</span>
              </button>
              <span className="text-xs font-mono tabular-nums text-ink-muted">
                Mostrando {page.length} de {stations.length}
              </span>
            </div>
          )}
        </>
      )}
    </section>
  )
}
