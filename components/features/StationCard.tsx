"use client"
import React, { useMemo, useState } from 'react'
import { Station } from '@/types/station'
import { Heart, Play, Pause, Share2, Check, Radio, Wifi, Volume2 } from 'lucide-react'
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

function getFrequencyLabel(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const fms = [88.5, 91.3, 94.7, 98.1, 101.5, 104.9, 107.3, 93.9, 97.7, 102.3, 106.1]
  const idx = Math.abs(hash) % fms.length
  return `${fms[idx]} FM`
}

function getStationTheme(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return {
    badgeBg: `hsl(${hue}, 45%, 15%)`,
    badgeBorder: `hsl(${hue}, 50%, 30%)`,
    accentColor: `hsl(${hue}, 80%, 65%)`,
  }
}

function getInitials(name: string) {
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
  const isThisStation = Boolean(
    currentStation && (currentStation.url === station.url || currentStation.name === station.name)
  )
  const playing = Boolean(isPlaying && isThisStation)
  const isBuffering = Boolean(
    isThisStation && (playbackStatus === 'loading' || playbackStatus === 'reconnecting')
  )

  const freq = useMemo(() => getFrequencyLabel(station.name), [station.name])
  const theme = useMemo(() => getStationTheme(station.name), [station.name])

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
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={`station-card group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 select-none ${
        playing
          ? 'shadow-xl'
          : 'border-white/[0.08] bg-zinc-950/80 hover:border-white/20 hover:bg-zinc-900/60 hover:shadow-xl'
      }`}
      style={
        playing
          ? {
              borderColor: 'var(--accent)',
              background: 'radial-gradient(circle at top, var(--accent-subtle), #000000 85%)',
              boxShadow: '0 8px 30px var(--accent-glow)',
              outline: '1px solid var(--accent)',
            }
          : undefined
      }
      role="button"
      tabIndex={0}
      onClick={() => onPlay?.(station)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPlay?.(station)
        }
      }}
      aria-label={`Sintonizar ${station.name}`}
    >
      {/* Luz ambiental en la parte superior al reproducir */}
      {playing && (
        <div
          className="absolute top-0 inset-x-0 h-1 shadow-sm"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--accent), var(--accent-hover), transparent)',
            boxShadow: '0 0 10px var(--accent)',
          }}
        />
      )}

      <div className="p-4 flex flex-col justify-between h-full">
        {/* FILA SUPERIOR: Frecuencia simulada, País y Acciones rápidas */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-white/[0.08]">
              {freq}
            </span>
            {station.country && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                <span>{flag}</span>
                <span className="truncate max-w-[80px]">{station.country}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors"
              onClick={handleShare}
              title={copied ? '¡Copiado!' : 'Compartir'}
              aria-label="Compartir"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
            </button>

            <button
              type="button"
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                station.isFavorite
                  ? 'bg-white/[0.08]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/10'
              }`}
              style={station.isFavorite ? { color: 'var(--accent)' } : undefined}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFav?.(station)
              }}
              title={station.isFavorite ? 'Quitar favorita' : 'Guardar favorita'}
              aria-label="Favorito"
            >
              <Heart size={14} fill={station.isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* FILA CENTRAL: Carátula de estudio y Título */}
        <div className="flex items-center gap-3.5 my-1">
          {/* Carátula / Disco de Vinilo de Estudio */}
          <div className="relative w-13 h-13 sm:w-14 sm:h-14 flex-shrink-0">
            {station.logoUrl && !imgError ? (
              <img
                src={station.logoUrl}
                alt=""
                className="w-full h-full object-cover rounded-xl border border-white/10 shadow-md"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-full h-full rounded-xl flex items-center justify-center font-black text-sm tracking-wider shadow-md border"
                style={{
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.badgeBorder,
                  color: theme.accentColor,
                }}
                aria-hidden="true"
              >
                {getInitials(station.name)}
              </div>
            )}

            {/* Overlay interactivo Play/Pause o ecualizador */}
            {playing ? (
              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                <div className="flex items-end gap-1 h-4">
                  <span
                    className="w-1 rounded-full animate-[equalizerPulse_0.8s_ease-in-out_infinite]"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                  <span
                    className="w-1 rounded-full animate-[equalizerPulse_0.8s_ease-in-out_infinite_0.2s]"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                  <span
                    className="w-1 rounded-full animate-[equalizerPulse_0.8s_ease-in-out_infinite_0.4s]"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity duration-150 backdrop-blur-[1px]">
                <Play size={18} className="text-white fill-white ml-0.5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className={`font-bold text-sm sm:text-base leading-tight truncate transition-colors ${
                playing ? '' : 'text-zinc-100 group-hover:text-white'
              }`}
              style={playing ? { color: 'var(--accent)' } : undefined}
              title={station.name}
            >
              {station.name}
            </h4>

            <p className="text-xs text-zinc-400 truncate mt-1">
              {station.region || station.country || 'Transmisión Global'}
            </p>

            {isBuffering && (
              <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-mono animate-pulse">
                ● Conectando satélite...
              </span>
            )}
          </div>
        </div>

        {/* FILA INFERIOR: Género y Estado de Señal */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span className="truncate max-w-[140px] text-zinc-400">
            {station.tags && station.tags.length > 0 ? `#${station.tags[0]}` : 'LIVE RADIO'}
          </span>

          {playing ? (
            <span className="font-bold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              <span
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              EN AIRE
            </span>
          ) : (
            <span className="group-hover:text-zinc-300 transition-colors">
              HQ STREAM
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
