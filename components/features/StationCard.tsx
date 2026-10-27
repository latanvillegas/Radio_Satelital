"use client"
import React, { memo, useState } from 'react'
import type { Station } from '@/types/station'
import type { PlaybackStatus } from '@/lib/services/player'
import { Heart, Play, Pause, LoaderCircle } from 'lucide-react'

interface Props {
  station: Station
  isActive: boolean
  isPlaying: boolean
  playbackStatus: PlaybackStatus
  onPlay: (s: Station) => void
  onPause: () => void
  onToggleFav: (s: Station) => void
}
function initials(name: string) {
  const parts = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/)
  return ((parts[0]?.[0] || 'R') + (parts[1]?.[0] || parts[0]?.[1] || 'A')).toUpperCase()
}
function StationCard({ station, isActive, isPlaying, playbackStatus, onPlay, onPause, onToggleFav }: Props) {
  const [logoBroken, setLogoBroken] = useState(false)
  const playing = isActive && isPlaying
  const loading = isActive && (playbackStatus === 'loading' || playbackStatus === 'reconnecting')
  const playOrPause = () => playing ? onPause() : onPlay(station)
  return (
    <article className={['relative min-w-0 p-3.5 rounded-2xl border transition-colors',
      isActive ? 'border-emerald-500/50 bg-emerald-500/[.08]' : 'border-white/10 bg-zinc-950/75 hover:bg-zinc-900/75'].join(' ')}>
      <div className="flex min-w-0 gap-3 items-center">
        <button type="button" onClick={playOrPause} aria-label={(playing ? 'Pausar ' : 'Escuchar ') + station.name}
          className="flex min-w-0 flex-1 items-center gap-3 text-left rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
          <span className="relative grid place-items-center h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-white/[.05] border border-white/10">
            {station.logoUrl && !logoBroken ? <img src={station.logoUrl} alt="" loading="lazy" decoding="async"
              className="w-full h-full object-contain" onError={() => setLogoBroken(true)}/> :
              <span className="font-black text-sm" style={{color:'var(--accent)'}}>{initials(station.name)}</span>}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm sm:text-[15px] font-bold text-white">{station.name}</span>
            <span className="block truncate mt-1 text-xs text-zinc-400">{[station.region,station.country].filter(Boolean).join(' · ') || 'Radio en vivo'}</span>
            <span className="block truncate mt-1 text-[11px] text-zinc-500">{station.tags?.[0] || 'En directo'}</span>
          </span>
        </button>
        <button type="button" onClick={() => onToggleFav(station)} aria-pressed={Boolean(station.isFavorite)}
          aria-label={(station.isFavorite ? 'Quitar de favoritas: ' : 'Añadir a favoritas: ') + station.name}
          className="grid place-items-center h-10 w-10 shrink-0 rounded-xl hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
          <Heart size={18} fill={station.isFavorite ? 'currentColor':'none'} style={{color:station.isFavorite?'var(--accent)':'#a1a1aa'}}/>
        </button>
        <button type="button" onClick={playOrPause} aria-label={(playing ? 'Pausar: ' : 'Reproducir: ') + station.name}
          className="grid place-items-center h-10 w-10 shrink-0 rounded-full text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          style={{background:'var(--accent)'}}>
          {loading ? <LoaderCircle size={18} className="animate-spin"/> : playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
        </button>
      </div>
      {isActive && <p role="status" className="mt-2 pl-[68px] text-[11px] font-semibold"
        style={{color: playbackStatus === 'error' ? '#fca5a5':'var(--accent)'}}>
        {playbackStatus === 'error' ? 'Sin señal' : loading ? 'Conectando…' : playing ? 'Reproduciendo en vivo' : 'Pausada'}
      </p>}
    </article>
  )
}
export default memo(StationCard)
