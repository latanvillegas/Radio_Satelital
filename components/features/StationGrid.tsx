"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import StationCard from './StationCard'
import SkeletonCard from './SkeletonCard'
import { FixedSizeGrid as Grid } from 'react-window'
import type { Station } from '../../types/station'

type Props = {
  stations: Station[]
  playStation: (station: Station) => void
  toggleFavorite: (station: Station) => void
}

export default function StationGrid({ stations, playStation, toggleFavorite }: Props){
  const loading = stations.length === 0
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(1200)
  const stationCountLabel = loading ? 'Cargando emisoras' : `${stations.length} radios disponibles`

  useEffect(()=>{
    if(!containerRef.current) return
    const ro = new ResizeObserver(entries=>{
      for(const entry of entries){
        setWidth(entry.contentRect.width)
      }
    })
    ro.observe(containerRef.current)
    return ()=> ro.disconnect()
  },[])

  const gridMetrics = useMemo(() => {
    if (width < 640) return { cardWidth: 260, rowHeight: 132, gap: 12 }
    if (width < 1024) return { cardWidth: 280, rowHeight: 136, gap: 14 }
    if (width < 1440) return { cardWidth: 300, rowHeight: 140, gap: 16 }
    return { cardWidth: 340, rowHeight: 144, gap: 18 }
  }, [width])

  const { cardWidth, rowHeight, gap } = gridMetrics
  const columns = Math.max(1, Math.floor((width + gap) / (cardWidth + gap)))

  // si pocos items, mostrar grid normal con skeleton o tarjetas
  if(stations.length <= 200){
    return (
      <div className="glass-panel station-board rounded-xl shadow-sm hover:shadow-md transition-all duration-200" id="station-list" ref={containerRef}>
        <div className="station-board-head">
          <div>
            <p className="station-board-kicker">Catálogo en vivo</p>
            <h3>Frecuencias</h3>
          </div>
          <span className="station-board-pill">{stationCountLabel}</span>
        </div>
        <p className="station-board-copy">
          Explora emisoras de forma rápida, marca favoritas y cambia de estación sin perder contexto.
        </p>
        <div className="panel-head station-panel-head">
          <h3>Lista de radios</h3>
        </div>
        <div className="station-grid">
          {loading ? (
            Array.from({length:8}).map((_,i)=>(<SkeletonCard key={`sk-${i}`} />))
          ) : (
            stations.map(s=> (
              <StationCard key={`${s.name}-${s.url}`} station={s} onPlay={playStation} onToggleFav={toggleFavorite} />
            ))
          )}
        </div>
      </div>
    )
  }

  // Virtualized grid -> usar FixedSizeGrid por columnas
  const rowCount = Math.ceil(stations.length / columns)

  // columnWidth se calcula dinámicamente según ancho disponible
  const columnWidth = Math.floor((width - gap * (columns - 1)) / columns)

  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const idx = rowIndex * columns + columnIndex
    if (idx >= stations.length) {
      return <div style={{ ...style, padding: '8px' }} aria-hidden="true" />
    }
    const s = stations[idx]
    return (
      <div style={{ ...style, padding: '8px' }} key={`${s.name}-${s.url}`} data-grid-cell="true" data-grid-index={idx}>
        <StationCard station={s} onPlay={playStation} onToggleFav={toggleFavorite} />
      </div>
    )
  }

  return (
    <div className="glass-panel station-board rounded-xl shadow-sm hover:shadow-md transition-all duration-200" id="station-list" ref={containerRef} aria-label="Lista de frecuencias">
      <div className="station-board-head">
        <div>
          <p className="station-board-kicker">Catálogo en vivo</p>
          <h3>Frecuencias</h3>
        </div>
        <span className="station-board-pill">{stationCountLabel}</span>
      </div>
      <p className="station-board-copy">
        Explora emisoras de forma rápida, marca favoritas y cambia de estación sin perder contexto.
      </p>
      <div className="panel-head station-panel-head">
        <h3>Lista de radios</h3>
      </div>
      <Grid
        role="grid"
        aria-rowcount={rowCount}
        aria-colcount={columns}
        columnCount={columns}
        columnWidth={columnWidth}
        height={Math.min(800, rowCount * rowHeight)}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={width}
      >
        {Cell}
      </Grid>
    </div>
  )
}
