"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import StationCard from './StationCard'
import SkeletonCard from './SkeletonCard'
import { FixedSizeGrid as Grid } from 'react-window'
import type { Station } from '../../types/station'
import { History } from 'lucide-react'

type Props = {
  stations: Station[]
  recentStations?: Station[]
  playStation: (station: Station) => void
  toggleFavorite: (station: Station) => void
}

export default function StationGrid({ stations, recentStations = [], playStation, toggleFavorite }: Props) {
  const loading = stations.length === 0
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(1200)
  const stationCountLabel = loading ? 'Cargando emisoras' : `${stations.length} radios disponibles`

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
    if (width < 640) return { cardWidth: 260, rowHeight: 124, gap: 12 }
    if (width < 1024) return { cardWidth: 280, rowHeight: 128, gap: 14 }
    if (width < 1440) return { cardWidth: 300, rowHeight: 132, gap: 16 }
    return { cardWidth: 340, rowHeight: 136, gap: 18 }
  }, [width])

  const { cardWidth, rowHeight, gap } = gridMetrics
  const columns = Math.max(1, Math.floor((width + gap) / (cardWidth + gap)))

  return (
    <div
      className="glass-panel station-board rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      id="station-list"
      ref={containerRef}
      aria-label="Lista de frecuencias"
    >
      {/* Escuchadas recientemente */}
      {recentStations.length > 0 && (
        <div className="recent-stations-section mb-6">
          <div className="recent-stations-header">
            <History size={16} className="text-red-400" />
            <h4 className="text-sm font-semibold tracking-wide text-zinc-300">Escuchadas recientemente</h4>
          </div>
          <div className="recent-stations-scroller">
            {recentStations.map((s) => (
              <button
                key={`recent-${s.name}-${s.url}`}
                type="button"
                className="recent-station-chip"
                onClick={() => playStation(s)}
                title={`Sintonizar ${s.name}`}
              >
                <span className="recent-chip-dot" />
                <span className="recent-chip-name">{s.name}</span>
                {s.country && <span className="recent-chip-country">{s.country}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="station-board-head">
        <div>
          <p className="station-board-kicker">Catálogo en vivo</p>
          <h3 className="text-xl font-bold">Frecuencias</h3>
        </div>
        <span className="station-board-pill">{stationCountLabel}</span>
      </div>

      <p className="station-board-copy">
        Explora emisoras de alta fidelidad, filtra por género o país y sintoniza al instante con reproducción continua.
      </p>

      {stations.length <= 200 ? (
        <div className="station-grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
          ) : (
            stations.map((s) => (
              <StationCard
                key={`${s.name}-${s.url}`}
                station={s}
                onPlay={playStation}
                onToggleFav={toggleFavorite}
              />
            ))
          )}
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
              return <div style={{ ...style, padding: '6px' }} aria-hidden="true" />
            }
            const s = stations[idx]
            return (
              <div
                style={{ ...style, padding: '6px' }}
                key={`${s.name}-${s.url}`}
                data-grid-cell="true"
                data-grid-index={idx}
              >
                <StationCard station={s} onPlay={playStation} onToggleFav={toggleFavorite} />
              </div>
            )
          }

          return (
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
          )
        })()
      )}
    </div>
  )
}
