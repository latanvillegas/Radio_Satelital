"use client"
import React from 'react'
import StationCard from './StationCard'
import SkeletonCard from './SkeletonCard'
import type { Station } from '../types/station'

type Props = {
  stations: Station[]
  playStation: (station: Station) => void
  toggleFavorite: (station: Station) => void
}

export default function StationGrid({ stations, playStation, toggleFavorite }: Props){
  const loading = stations.length === 0

  return (
    <div className="glass-panel rounded-xl shadow-sm hover:shadow-md transition-all duration-200" id="station-list">
      <div className="panel-head station-panel-head">
        <h3>Frecuencias</h3>
      </div>
      <div className="station-grid">
        {loading ? (
          // Mostrar varios skeletons para mejorar percepción de carga
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
