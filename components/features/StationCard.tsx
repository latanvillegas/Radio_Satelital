"use client"
import React, { useMemo, useState } from 'react'
import { Station } from '../../types/station'
import { Heart, Play, Radio } from 'lucide-react'
import { usePlayer } from '../../hooks/player'
import { motion } from 'framer-motion'

const countryClassMap: Record<string, string> = {
  'perú': 'badge-peru',
  'venezuela': 'badge-venezuela',
  'argentina': 'badge-argentina',
  'chile': 'badge-chile',
  'colombia': 'badge-colombia',
  'méxico': 'badge-mexico',
  'mexico': 'badge-mexico',
  'españa': 'badge-espana',
  'francia': 'badge-francia',
  'alemania': 'badge-alemania',
  'ecuador': 'badge-ecuador',
  'bolivia': 'badge-bolivia',
  'honduras': 'badge-honduras',
  'nicaragua': 'badge-nicaragua',
  'puerto rico': 'badge-puerto-rico',
  'ee.uu': 'badge-eeuu',
  'eeuu': 'badge-eeuu',
  'usa': 'badge-eeuu'
}

type Props = {
  station: Station
  onPlay?: (s: Station)=>void
  onToggleFav?: (s: Station)=>void
}

export default function StationCard({ station, onPlay, onToggleFav }: Props){
  const badgeClass = countryClassMap[(station.country || '').toLowerCase()] || 'badge-default'
  const [imgError, setImgError] = useState(false)

  const { currentStation, isPlaying } = usePlayer()
  const playing = !!(isPlaying && currentStation && currentStation.url === station.url)

  const swipeState = useMemo(() => ({ touchStartX: null as number | null }), [])
  const handleTouchStart = (e: React.TouchEvent) => { swipeState.touchStartX = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if(swipeState.touchStartX === null) return
    const dx = e.changedTouches[0].clientX - swipeState.touchStartX
    if(dx > 60) onPlay?.(station) // swipe right -> play
    if(dx < -60) onToggleFav?.(station) // swipe left -> toggle fav
    swipeState.touchStartX = null
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="station-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      role="button"
      tabIndex={0}
      aria-label={`Estación ${station.name}`}
      onKeyDown={(e)=>{
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPlay?.(station)
        }
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault()
          onToggleFav?.(station)
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="st-info">
        <div className={`st-icon ${badgeClass}`} aria-hidden="true">
          {station.logoUrl && !imgError ? (
            <img
              src={station.logoUrl}
              alt={`${station.name} logo`}
              loading="lazy"
              onError={()=>setImgError(true)}
              className="st-artwork-img"
            />
          ) : (
            <div className="st-artwork-fallback" aria-hidden="true">
              <span>{(station.name || '').slice(0,2).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="st-meta-wrap">
          <span className="st-name">{station.name}</span>
          <span className="st-meta">{station.region || station.country}</span>
          {playing && (
            <div className="eq-inline" aria-hidden="true">
              <span className="eq-bar eq-inline-1" />
              <span className="eq-bar eq-inline-2" />
              <span className="eq-bar eq-inline-3" />
            </div>
          )}
        </div>
      </div>

      <div className="station-actions">
        <button className="sec-btn" onClick={()=>onPlay?.(station)} aria-label={`Reproducir ${station.name}`}>
          <Play size={18} strokeWidth={2.4} />
        </button>
        <button className="fav-btn" onClick={()=>onToggleFav?.(station)} aria-pressed={!!station.isFavorite} aria-label={`Favorito ${station.name}`}>
          <Heart
            size={18}
            strokeWidth={2.2}
            color={station.isFavorite ? '#6200EE' : '#9aa7b7'}
            fill={station.isFavorite ? '#6200EE' : 'none'}
          />
        </button>
      </div>
    </motion.div>
  )
}
