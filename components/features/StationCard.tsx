"use client"
import React, { useMemo, useState } from 'react'
import { Station } from '@/types/station'
import { Heart, Play, Share2, Check, Radio } from 'lucide-react'
import { usePlayer } from '@/hooks/player'
import { motion } from 'framer-motion'

const countryFlagMap: Record<string, string> = {
  'perú': '🇵🇪',
  'peru': '🇵🇪',
  'venezuela': '🇻🇪',
  'argentina': '🇦🇷',
  'chile': '🇨🇱',
  'colombia': '🇨🇴',
  'méxico': '🇲🇽',
  'mexico': '🇲🇽',
  'españa': '🇪🇸',
  'espana': '🇪🇸',
  'francia': '🇫🇷',
  'alemania': '🇩🇪',
  'ecuador': '🇪🇨',
  'bolivia': '🇧🇴',
  'honduras': '🇭🇳',
  'nicaragua': '🇳🇮',
  'puerto rico': '🇵🇷',
  'ee.uu': '🇺🇸',
  'eeuu': '🇺🇸',
  'usa': '🇺🇸',
  'costa rica': '🇨🇷',
  'guatemala': '🇬🇹',
  'uruguay': '🇺🇾',
  'paraguay': '🇵🇾',
  'panamá': '🇵🇦',
  'panama': '🇵🇦',
  'brasil': '🇧🇷',
  'brazil': '🇧🇷',
  'italia': '🇮🇹',
  'reino unido': '🇬🇧',
}

// Genera un color sobrio y elegante para las iniciales cuando no hay logo
function getStationAvatarStyle(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return {
    background: `linear-gradient(135deg, hsl(${hue}, 45%, 20%) 0%, hsl(${(hue + 35) % 360}, 40%, 12%) 100%)`,
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  }
}

function getInitials(name: string) {
  // Limpia signos, paréntesis y caracteres especiales como en 'Activa (Colombia)'
  const clean = name.replace(/[()[\]{}.,\/#!$%\^&\*;:{}=\-_`~?0-9]/g, ' ').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return (clean.slice(0, 2) || 'RA').toUpperCase()
}

type Props = {
  station: Station
  onPlay?: (s: Station) => void
  onToggleFav?: (s: Station) => void
}

export default function StationCard({ station, onPlay, onToggleFav }: Props) {
  const countryKey = (station.country || '').toLowerCase().trim()
  const flag = countryFlagMap[countryKey] || '📻'
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
      // Ignorar
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`station-card group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 ${
        playing
          ? 'border-red-500/50 bg-red-950/20 shadow-lg shadow-red-950/30'
          : 'border-white/[0.08] bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-800/40 hover:shadow-md'
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
      <div className="flex items-center gap-3.5 p-3.5 w-full">
        {/* Carátula / Avatar de la emisora con indicador animado */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {station.logoUrl && !imgError ? (
            <img
              src={station.logoUrl}
              alt=""
              className="w-full h-full object-cover rounded-lg border border-white/10 shadow-inner"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full rounded-lg flex items-center justify-center font-bold text-sm tracking-wider shadow-inner"
              style={getStationAvatarStyle(station.name)}
              aria-hidden="true"
            >
              {getInitials(station.name)}
            </div>
          )}

          {/* Icono de Play en hover o ecualizador si está reproduciendo */}
          {playing ? (
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
              <div className="flex items-end gap-[3px] h-4">
                <span className="w-1 bg-red-400 rounded-full animate-[equalizerPulse_1s_ease-in-out_infinite]" />
                <span className="w-1 bg-red-400 rounded-full animate-[equalizerPulse_1s_ease-in-out_infinite_0.2s]" />
                <span className="w-1 bg-red-400 rounded-full animate-[equalizerPulse_1s_ease-in-out_infinite_0.4s]" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity duration-150 backdrop-blur-[1px]">
              <Play size={18} className="text-white fill-white ml-0.5" />
            </div>
          )}
        </div>

        {/* Metadatos principales */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`font-semibold text-sm truncate leading-tight transition-colors ${
                playing ? 'text-red-400 font-bold' : 'text-zinc-100 group-hover:text-white'
              }`}
              title={station.name}
            >
              {station.name}
            </h4>
            {playing && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Live
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {station.country && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                <span>{flag}</span>
                <span>{station.country}</span>
              </span>
            )}
            {station.region && (
              <span className="text-[11px] text-zinc-400 truncate max-w-[110px]" title={station.region}>
                {station.region}
              </span>
            )}
            {station.tags && station.tags.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-medium tracking-wide bg-zinc-800/80 text-zinc-400 border border-white/[0.04]">
                {station.tags[0]}
              </span>
            )}
          </div>

          {isBuffering && (
            <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 animate-pulse">
              ● Sintonizando señal satelital...
            </span>
          )}
        </div>

        {/* Acciones de la tarjeta */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors"
            onClick={handleShare}
            title={copied ? '¡Copiado!' : 'Compartir emisora'}
            aria-label="Compartir"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          </button>

          <button
            type="button"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              station.isFavorite
                ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                : 'text-zinc-400 hover:text-red-400 hover:bg-white/10'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFav?.(station)
            }}
            title={station.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-label="Favorito"
          >
            <Heart size={15} fill={station.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
