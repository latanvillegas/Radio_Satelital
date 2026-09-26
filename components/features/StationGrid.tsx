"use client"
import React from 'react'
import StationCard from './StationCard'
import type { Station } from '../../types/station'
import { SearchX } from 'lucide-react'

type Props = { stations: Station[]; recentStations?: Station[]; playStation: (station: Station) => void; toggleFavorite: (station: Station) => void }

export default function StationGrid({ stations, recentStations = [], playStation, toggleFavorite }: Props) {
  return (
    <section id="station-list" aria-label="Emisoras en vivo" className="scroll-mt-24">
      {recentStations.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-bold text-zinc-200">Escuchadas recientemente</h2>
            <span className="text-[11px] text-zinc-600">Toca para volver a escuchar</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentStations.slice(0, 8).map((s) => (
              <button key={`recent-${s.name}-${s.url}`} type="button" onClick={() => playStation(s)} className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-xs text-zinc-300 max-w-[220px]">
                <span className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                <span className="font-semibold truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Emisoras en vivo</h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Elige una radio para empezar a escuchar.</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-zinc-500">{stations.length} emisoras</span>
      </div>

      {stations.length === 0 ? (
        <div className="py-16 rounded-2xl border border-white/[0.07] bg-white/[0.02] text-center">
          <SearchX size={24} className="mx-auto text-zinc-600 mb-3" />
          <h3 className="font-bold text-zinc-200">No encontramos emisoras</h3>
          <p className="text-xs text-zinc-500 mt-1">Prueba otra búsqueda o cambia los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
          {stations.map((s) => <StationCard key={`${s.name}-${s.url}`} station={s} onPlay={playStation} onToggleFav={toggleFavorite} />)}
        </div>
      )}
    </section>
  )
}
