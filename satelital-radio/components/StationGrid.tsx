"use client"
import React, { useEffect, useRef, useState } from 'react'
import StationCard from './StationCard'
import SkeletonCard from './SkeletonCard'
import { FixedSizeGrid as Grid } from 'react-window'
import type { Station } from '../types/station'

type Props = {
  stations: Station[]
  playStation: (station: Station) => void
  toggleFavorite: (station: Station) => void
}

export default function StationGrid({ stations, playStation, toggleFavorite }: Props){
  const loading = stations.length === 0
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(1200)

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

  // definir columnas según ancho (mismo breakpoints que CSS)
  const cardWidth = 320 // aprox
  const gap = 16
  const columns = Math.max(1, Math.floor((width + gap) / (cardWidth + gap)))

  // si pocos items, mostrar grid normal con skeleton o tarjetas
  if(stations.length <= 200){
    return (
      <div className="glass-panel rounded-xl shadow-sm hover:shadow-md transition-all duration-200" id="station-list" ref={containerRef}>
        <div className="panel-head station-panel-head">
          <h3>Frecuencias</h3>
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
  const rowHeight = 120 // altura por fila (ajustada para tarjetas)

  // columnWidth se calcula dinámicamente según ancho disponible
  const columnWidth = Math.floor((width - gap * (columns - 1)) / columns)

  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: any }) => {
    const idx = rowIndex * columns + columnIndex
    if (idx >= stations.length) return null
    const s = stations[idx]
    return (
      <div style={{ ...style, padding: '8px' }} key={`${s.name}-${s.url}`}>
        <StationCard station={s} onPlay={playStation} onToggleFav={toggleFavorite} />
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-xl shadow-sm hover:shadow-md transition-all duration-200" id="station-list" ref={containerRef}>
      <div className="panel-head station-panel-head">
        <h3>Frecuencias</h3>
      </div>
      <Grid
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
