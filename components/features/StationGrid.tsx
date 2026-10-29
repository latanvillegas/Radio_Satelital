"use client"
import React, { useEffect, useMemo, useState } from 'react'
import type { Station } from '@/types/station'
import { SearchX, ArrowDown } from 'lucide-react'
import StationCard from './StationCard'
import { getAudio, getCurrentPlayingStation, subscribePlaybackStatus, togglePlay, type PlaybackStatus } from '@/lib/services/player'
import { stationKey } from '@/lib/services/station-normalizer'

interface Props {
  stations: Station[]
  title?: string
  playStation: (s: Station) => void
  toggleFavorite: (s: Station) => void
}
const LIMIT = 24
export default function StationGrid({ stations, title = 'Todas las emisoras', playStation, toggleFavorite }: Props) {
  const [limit, setLimit] = useState(LIMIT)
  const [playback, setPlayback] = useState<{station: Station | null; status: PlaybackStatus; playing: boolean}>({
    station: null, status: 'idle', playing: false
  })
  useEffect(() => {
    const refresh = (status: PlaybackStatus) => setPlayback({
      station: getCurrentPlayingStation(),
      status,
      playing: status === 'playing' || (status !== 'paused' && status !== 'error' && !!getAudio() && !getAudio()!.paused)
    })
    const audio = getAudio()
    refresh(audio && !audio.paused ? 'playing' : 'idle')
    return subscribePlaybackStatus(refresh)
  }, [])
  const selected = playback.station ? stationKey(playback.station) : ''
  const page = useMemo(() => stations.slice(0, limit), [stations, limit])
  const remaining = stations.length - page.length
  return (
    <section id="station-list" className="scroll-mt-28" aria-label="Catálogo de emisoras">
      <div className="flex justify-between items-end gap-3 mb-4">
        <div><h2 className="observatory-section-title text-xl sm:text-2xl font-extrabold text-white">{title}</h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">Explora el catálogo, sintoniza y guarda tus favoritas.</p></div>
        <span className="shrink-0 text-xs text-zinc-400 font-semibold" aria-live="polite">{stations.length} emisoras</span>
      </div>
      {stations.length === 0 ?
        <div role="status" className="rounded-2xl border border-white/10 bg-white/[.025] text-center p-12">
          <SearchX className="mx-auto mb-2 text-zinc-500"/>
          <p className="text-white font-bold">No encontramos emisoras</p>
          <p className="text-zinc-400 text-sm">Prueba otra búsqueda o cambia los filtros.</p>
        </div> :
        <><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {page.map(s => <StationCard key={stationKey(s)} station={s} isActive={selected===stationKey(s)}
            isPlaying={playback.playing} playbackStatus={playback.status} onPlay={playStation}
            onPause={togglePlay} onToggleFav={toggleFavorite}/>)}
        </div>{remaining > 0 && <div className="flex flex-col items-center gap-2 mt-7">
          <button type="button" onClick={() => setLimit(n => n + LIMIT)}
            className="flex items-center gap-2 rounded-xl px-6 py-3 bg-white/[.08] text-sm font-bold border border-white/15 hover:bg-white/[.12]">
            <ArrowDown size={16}/> Mostrar más emisoras
          </button><span className="text-xs text-zinc-500">Mostrando {page.length} de {stations.length}</span>
        </div>}</>}
    </section>
  )
}
