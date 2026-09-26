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

  return <motion.article layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} onClick={() => onPlay?.(station)}
    className="group relative rounded-2xl border bg-zinc-950/70 hover:bg-zinc-900/70 p-3 cursor-pointer transition-all overflow-hidden"
    style={active ? { borderColor: 'var(--accent)', backgroundColor: 'var(--accent-subtle)', boxShadow: '0 0 0 1px var(--accent-glow)' } : { borderColor: 'rgba(255,255,255,.08)' }} role="button" tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay?.(station) } }} aria-label={`Escuchar ${station.name}`}>
    {active && <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />}
    <div className="flex gap-3 items-center">
      <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.08]">
        {station.logoUrl && !imgError ? <img src={station.logoUrl} alt={`Logo de ${station.name}`} className="w-full h-full object-contain bg-white/[0.03]" loading="lazy" onError={() => setImgError(true)} /> : <div className="w-full h-full grid place-items-center text-sm font-black" style={{ color: 'var(--accent)' }}>{initials(station.name)}</div>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-bold text-white truncate">{station.name}</h3>
        <p className="text-xs text-zinc-400 truncate mt-0.5">{location}</p>
        <p className="text-[11px] text-zinc-600 truncate mt-1">{genre || station.country || 'Radio en vivo'}</p>
      </div>
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFav?.(station) }} className="w-8 h-8 rounded-full grid place-items-center text-zinc-500 hover:text-white hover:bg-white/[0.08]" aria-label={station.isFavorite ? 'Quitar de favoritas' : 'Agregar a favoritas'}><Heart size={15} fill={station.isFavorite ? 'currentColor' : 'none'} style={station.isFavorite ? { color: 'var(--accent)' } : undefined}/></button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onPlay?.(station) }} className="w-9 h-9 rounded-full grid place-items-center text-black shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: active ? 'var(--accent)' : '#f4f4f5' }} aria-label={playing ? `Pausar ${station.name}` : `Escuchar ${station.name}`}>
          {loading ? <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"/> : playing ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
        </button>
      </div>
    </div>
    {active && <div className="mt-2 pl-[68px] flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider" style={{ color:'var(--accent)' }}><span className="flex items-end gap-[2px] h-3"><i className="w-[2px] h-2 bg-current animate-pulse"/><i className="w-[2px] h-3 bg-current animate-pulse"/><i className="w-[2px] h-1.5 bg-current animate-pulse"/></span>{loading ? 'Conectando' : 'En vivo'}</div>}
  </motion.article>
}
