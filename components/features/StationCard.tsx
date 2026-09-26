"use client"
import React, { useState } from 'react'
import type { Station } from '@/types/station'
import { Heart, Play, Pause } from 'lucide-react'
import { usePlayer } from '@/hooks/player'
import { motion } from 'framer-motion'

function initials(name: string) {
  const parts = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] || 'R') + (parts[1]?.[0] || parts[0]?.[1] || 'A')).toUpperCase()
}

export default function StationCard({ station, onPlay, onToggleFav }: { station: Station; onPlay?: (s: Station) => void; onToggleFav?: (s: Station) => void }) {
  const [imgError, setImgError] = useState(false)
  const { currentStation, isPlaying, playbackStatus } = usePlayer()
  const active = Boolean(currentStation && (currentStation.url === station.url || currentStation.name === station.name))
  const playing = active && isPlaying
  const loading = active && (playbackStatus === 'loading' || playbackStatus === 'reconnecting')
  const location = station.region || station.country || 'Radio en vivo'
  const genre = station.tags?.[0]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onPlay?.(station)}
      className="group relative rounded-2xl border border-white/[0.08] bg-zinc-950/70 hover:bg-zinc-900/70 hover:border-white/[0.16] p-3.5 cursor-pointer transition-colors overflow-hidden"
      style={active ? { borderColor: 'var(--accent-glow)', backgroundColor: 'var(--accent-subtle)' } : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay?.(station) } }}
      aria-label={`Escuchar ${station.name}`}
    >
      <div className="flex gap-3 items-center">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.08]">
          {station.logoUrl && !imgError ? (
            <img src={station.logoUrl} alt={`Logo de ${station.name}`} className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full grid place-items-center text-sm font-black" style={{ color: 'var(--accent)' }}>{initials(station.name)}</div>
          )}
          <div className={`absolute inset-0 grid place-items-center transition-opacity ${active ? 'opacity-100 bg-black/45' : 'opacity-0 group-hover:opacity-100 bg-black/45'}`}>
            {loading ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : playing ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white ml-0.5" />}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-[15px] font-bold text-white truncate">{station.name}</h3>
              <p className="text-xs text-zinc-500 truncate mt-1">{location}</p>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFav?.(station) }} className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-zinc-500 hover:text-white hover:bg-white/[0.08]" aria-label={station.isFavorite ? 'Quitar de favoritas' : 'Agregar a favoritas'}>
              <Heart size={15} fill={station.isFavorite ? 'currentColor' : 'none'} style={station.isFavorite ? { color: 'var(--accent)' } : undefined} />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-500 truncate">{genre || station.country || 'En vivo'}</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: active ? 'var(--accent)' : '#71717a' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? 'var(--accent)' : '#52525b' }} />
              {loading ? 'Conectando' : active ? 'En vivo' : 'Escuchar'}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
