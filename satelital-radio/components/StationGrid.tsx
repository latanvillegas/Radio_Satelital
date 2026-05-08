"use client"
import React, { useEffect, useRef, useState } from 'react'
import StationCard from './StationCard'
import SkeletonCard from './SkeletonCard'
import { FixedSizeList as List } from 'react-window'
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

  // Virtualized grid -> convertimos en filas con 'columns' elementos por fila
  const rowCount = Math.ceil(stations.length / columns)
  const rowHeight = 96 // altura por fila (ajustar si es necesario)

  const Row = ({ index, style }: { index: number; style: any }) => {
    const start = index * columns
    const items = stations.slice(start, start + columns)
    return (
      <div style={{ ...style, display: 'flex', gap: `${gap}px`, padding: '8px 0' }}>
        {items.map((s)=> (
          <div style={{ width: `calc((100% - ${(columns-1)*gap}px)/${columns})` }} key={`${s.name}-${s.url}`}>
            <StationCard station={s} onPlay={playStation} onToggleFav={toggleFavorite} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-xl shadow-sm hover:shadow-md transition-all duration-200" id="station-list" ref={containerRef}>
      <div className="panel-head station-panel-head">
        <h3>Frecuencias</h3>
      </div>
      <List height={Math.min(600, rowCount * rowHeight)} itemCount={rowCount} itemSize={rowHeight} width={'100%'}>
        {Row}
      </List>
    </div>
  )
}
