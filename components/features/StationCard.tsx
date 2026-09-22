"use client"
import React, { useMemo, useState } from 'react'
import { Station } from '@/types/station'
import { Heart, Play, Share2, Check, Radio } from 'lucide-react'
import { usePlayer } from '@/hooks/player'
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
  'usa': 'badge-eeuu',
  'costa rica': 'badge-costarica',
  'guatemala': 'badge-guatemala',
}

// Genera un color sobrio único para las iniciales cuando no hay logo
function getStationAvatarStyle(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return {
    background: `linear-gradient(135deg, hsl(${hue}, 60%, 25%) 0%, hsl(${(hue + 40) % 360}, 50%, 15%) 100%)`,
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.12)',
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

type Props = {
  station: Station
  onPlay?: (s: Station) => void
  onToggleFav?: (s: Station) => void
}

export default function StationCard({ station, onPlay, onToggleFav }: Props) {
  const badgeClass = countryClassMap[(station.country || '').toLowerCase()] || 'badge-default'
  const [imgError, setImgError] = useState(false)
  const [copied, setCopied] = useState(false)

  const { currentStation, isPlaying, playbackStatus } = usePlayer()
  const isThisStation = Boolean(currentStation && (currentStation.url === station.url || currentStation.name === station.name))
  const playing = Boolean(isPlaying && isThisStation)
  const isBuffering = Boolean(isThisStation && (playbackStatus === 'loading' || playbackStatus === 'reconnecting'))

  const swipeState = useMemo(() => ({ touchStartX: null as number | null }), [])
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeState.touchStartX = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeState.touchStartX === null) return
    const dx = e.changedTouches[0].clientX - swipeState.touchStartX
    if (dx > 60) onPlay?.(station)
    if (dx < -60) onToggleFav?.(station)
    swipeState.touchStartX = null
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareText = `Escucha ${station.name} (${station.country || 'En vivo'}) en Radio Satelital: ${window.location.origin}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: station.name,
          text: shareText,
          url: window.location.href,
        })
        return
      } catch {
        // Fallback a portapapeles
      }
    }

    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignorar si clipboard está restringido
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015 }}
      className={`station-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
        playing ? 'is-active-playing' : ''
      }`}
      role="button"
      tabIndex={0}
      onClick={() => onPlay?.(station)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPlay?.(station)
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={`Reproducir ${station.name}`}
    >
      <div className="station-card-inner">
        <div className="station-avatar-wrapper">
          {station.logoUrl && !imgError ? (
            <img
              src={station.logoUrl}
              alt=""
              className="station-avatar-img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="station-avatar-fallback font-bold"
              style={getStationAvatarStyle(station.name)}
              aria-hidden="true"
            >
              {getInitials(station.name)}
            </div>
          )}

          {playing && (
            <span className="station-live-pulse-badge" title="Reproduciendo en vivo">
              <span className="pulse-dot" />
            </span>
          )}
        </div>

        <div className="station-card-info">
          <div className="station-card-heading">
            <h4 className="station-name-text" title={station.name}>
              {station.name}
            </h4>
          </div>

          <div className="station-card-tags">
            {station.country && (
              <span className={`country-badge ${badgeClass}`}>{station.country}</span>
            )}
            {station.region && (
              <span className="region-text" title={station.region}>
                {station.region}
              </span>
            )}
            {station.tags && station.tags.length > 0 && (
              <span className="genre-pill-card">{station.tags[0]}</span>
            )}
          </div>

          {isBuffering && (
            <span className="station-buffering-hint">Sintonizando señal...</span>
          )}
        </div>

        <div className="station-card-actions">
          <button
            type="button"
            className="station-action-btn share-btn"
            onClick={handleShare}
            title={copied ? '¡Copiado!' : 'Compartir emisora'}
            aria-label="Compartir"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
          </button>

          <button
            type="button"
            className={`station-action-btn fav-btn ${station.isFavorite ? 'is-fav' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFav?.(station)
            }}
            title={station.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-label="Favorito"
          >
            <Heart size={16} fill={station.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
