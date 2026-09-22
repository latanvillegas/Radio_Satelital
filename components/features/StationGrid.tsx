"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import StationCard from './StationCard'
import SkeletonCard from './SkeletonCard'
import { FixedSizeGrid as Grid } from 'react-window'
import type { Station } from '../../types/station'
import { History, Radio, Sparkles, SearchX } from 'lucide-react'

type Props = {
  stations: Station[]
  recentStations?: Station[]
  playStation: (station: Station) => void
  toggleFavorite: (station: Station) => void
}

export default function StationGrid({
  stations,
  recentStations = [],
  playStation,
  toggleFavorite,
}: Props) {
  const loading = stations.length === 0
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(1200)
  const stationCountLabel = `${stations.length} emisoras sintonizables`

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const gridMetrics = useMemo(() => {
    if (width < 640) return { cardWidth: 280, rowHeight: 110, gap: 12 }
    if (width < 1024) return { cardWidth: 320, rowHeight: 114, gap: 14 }
    if (width < 1440) return { cardWidth: 340, rowHeight: 118, gap: 16 }
    return { cardWidth: 360, rowHeight: 120, gap: 16 }
  }, [width])

  const { cardWidth, rowHeight, gap } = gridMetrics
  const columns = Math.max(1, Math.floor((width + gap) / (cardWidth + gap)))

  return (
    <div
      className="bg-zinc-900/40 border border-white/[0.08] rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl"
      id="station-list"
      ref={containerRef}
      aria-label="Lista de frecuencias"
    >
      {/* Escuchadas recientemente */}
      {recentStations.length > 0 && (
        <div className="mb-6 p-3 sm:p-4 rounded-xl bg-zinc-950/40 border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <History size={15} className="text-red-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Escuchadas Recientemente
            </h4>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentStations.map((s) => (
              <button
                key={`recent-${s.name}-${s.url}`}
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] transition-all whitespace-nowrap group flex-shrink-0"
                onClick={() => playStation(s)}
                title={`Sintonizar ${s.name}`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-ping" />
                <span className="font-semibold">{s.name}</span>
                {s.country && <span className="text-zinc-500 text-[11px]">{s.country}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cabecera del catálogo */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio size={16} className="text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Transmisiones Activas
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Catálogo Global de Frecuencias
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Emisoras satelitales en vivo con audio digital continuo y baja latencia.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/[0.05] text-zinc-200 border border-white/[0.08] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{stationCountLabel}</span>
        </div>
      </div>

      {/* Rejilla de Emisoras */}
      {stations.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-500">
            <SearchX size={24} />
          </div>
          <h4 className="text-base font-bold text-zinc-200">No se encontraron emisoras</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Prueba ajustando el término de búsqueda, seleccionando otro país o restableciendo los filtros.
          </p>
        </div>
      ) : stations.length <= 200 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
          {stations.map((s) => (
            <StationCard
              key={`${s.name}-${s.url}`}
              station={s}
              onPlay={playStation}
              onToggleFav={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        (() => {
          const rowCount = Math.ceil(stations.length / columns)
          const columnWidth = Math.floor((width - gap * (columns - 1)) / columns)

          const Cell = ({
            columnIndex,
            rowIndex,
            style,
          }: {
            columnIndex: number
            rowIndex: number
            style: React.CSSProperties
          }) => {
            const idx = rowIndex * columns + columnIndex
            if (idx >= stations.length) {
              return <div style={{ ...style, padding: '4px' }} aria-hidden="true" />
            }
            const s = stations[idx]
            return (
              <div
                style={{ ...style, padding: '4px' }}
                key={`${s.name}-${s.url}`}
                data-grid-cell="true"
                data-grid-index={idx}
              >
                <StationCard station={s} onPlay={playStation} onToggleFav={toggleFavorite} />
              </div>
            )
          }

          return (
            <div className="pt-2">
              <Grid
                role="grid"
                aria-rowcount={rowCount}
                aria-colcount={columns}
                columnCount={columns}
                columnWidth={columnWidth}
                height={Math.min(780, rowCount * rowHeight)}
                rowCount={rowCount}
                rowHeight={rowHeight}
                width={width}
              >
                {Cell}
              </Grid>
            </div>
          )
        })()
      )}
    </div>
  )
}
