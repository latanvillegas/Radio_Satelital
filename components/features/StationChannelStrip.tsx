"use client"
import React, { useState } from 'react'
import type { Station } from '@/types/station'
import { Play, Pause, Heart, Share2, Check, Radio, Volume2 } from 'lucide-react'
import { usePlayer } from '@/hooks/player'

type Props = {
  station: Station
  index: number
  onPlay: (s: Station) => void
  onToggleFav: (s: Station) => void
}

export default function StationChannelStrip({ station, index, onPlay, onToggleFav }: Props) {
  const { currentStation, isPlaying } = usePlayer()
  const isThisStation = Boolean(
    currentStation && (currentStation.url === station.url || currentStation.name === station.name)
  )
  const playing = Boolean(isPlaying && isThisStation)
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = `Escucha ${station.name} (${station.country || 'En vivo'}) en Radio Satelital: ${window.location.origin}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div
      onClick={() => onPlay(station)}
      className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${
        playing
          ? 'shadow-md ring-1 text-white'
          : 'bg-zinc-950/60 border-white/[0.06] hover:bg-zinc-900/80 hover:border-white/15 text-zinc-300'
      }`}
      style={
        playing
          ? {
              backgroundColor: 'var(--accent-subtle)',
              borderColor: 'var(--accent)',
              boxShadow: '0 0 12px var(--accent-glow)',
            }
          : undefined
      }
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPlay(station)
        }
      }}
    >
      {/* Indicador de Canal y Botón Play */}
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`font-mono text-xs font-bold w-6 text-center ${
            playing ? 'font-black' : 'text-zinc-500 group-hover:text-zinc-400'
          }`}
          style={playing ? { color: 'var(--accent)' } : undefined}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={
            playing
              ? {
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  boxShadow: '0 2px 10px var(--accent-glow)',
                }
              : {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#d4d4d8',
                }
          }
          title={playing ? 'Pausar' : 'Sintonizar'}
        >
          {playing ? (
            <Pause size={14} className="fill-current" />
          ) : (
            <Play size={14} className="fill-current ml-0.5" />
          )}
        </button>

        {/* Info de Emisora */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                playing ? '' : 'text-zinc-100 group-hover:text-white'
              }`}
              style={playing ? { color: 'var(--accent)' } : undefined}
            >
              {station.name}
            </h4>
            {playing && (
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.2 rounded border"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  borderColor: 'var(--accent-glow)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                ON AIR
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">
            {station.country ? `${station.country} ${station.region ? `· ${station.region}` : ''}` : 'Satelital'}
          </p>
        </div>
      </div>

      {/* Metadatos y Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/[0.05]">
          {station.tags && station.tags[0] ? `#${station.tags[0]}` : 'LIVE'}
        </span>

        <button
          type="button"
          onClick={handleShare}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors"
          title="Compartir"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFav(station)
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-zinc-500 hover:text-red-400"
          style={station.isFavorite ? { color: 'var(--accent)' } : undefined}
          title="Favorito"
        >
          <Heart size={13} fill={station.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}
