"use client"
import React, { useEffect, useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import type { Station } from '@/types/station'

type Props = {
  setQuery: (value: string) => void
  searchQuery?: string
  filters: { countries: string[]; regions: string[]; genres: string[]; setCountry: (value: string) => void; setRegion: (value: string) => void; setGenre: (value: string) => void; activeCountry?: string; activeRegion?: string; activeGenre?: string }
  toggleOnlyFavs: (value: boolean) => void
  onlyFavs?: boolean
  onPlayRandom?: () => void
  currentStation?: Station | null
  onPlayStation?: (station: Station) => void
  stations?: Station[]
}

export default function Filters({ setQuery, searchQuery = '', filters }: Props) {
  const [q, setQ] = useState(searchQuery)
  const [open, setOpen] = useState(false)
  useEffect(() => setQ(searchQuery), [searchQuery])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        e.preventDefault(); document.getElementById('station-search')?.focus()
      }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key)
  }, [])
  const change = (v: string) => { setQ(v); setQuery(v) }
  const activeCount = [filters.activeCountry, filters.activeRegion, filters.activeGenre].filter(Boolean).length

  return (
    <div id="filters-panel" className="mb-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input id="station-search" value={q} onChange={(e) => change(e.target.value)} placeholder="Buscar emisora, ciudad, país o género..." className="w-full h-12 rounded-2xl bg-zinc-950 border border-white/[0.1] pl-11 pr-10 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10" />
          {q && <button type="button" onClick={() => change('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.07]" aria-label="Limpiar búsqueda"><X size={15}/></button>}
        </div>
        <button type="button" onClick={() => setOpen(v => !v)} className="h-12 shrink-0 inline-flex items-center gap-2 px-4 rounded-2xl bg-zinc-950 border border-white/[0.1] text-sm font-semibold text-zinc-300 hover:text-white hover:border-white/20">
          <SlidersHorizontal size={16}/><span className="hidden sm:inline">Filtros</span>{activeCount > 0 && <span className="w-5 h-5 grid place-items-center rounded-full text-[10px] font-bold text-black" style={{ backgroundColor:'var(--accent)' }}>{activeCount}</span>}<ChevronDown size={14} className={`hidden sm:block transition-transform ${open ? 'rotate-180':''}`}/>
        </button>
      </div>
      {open && <div className="mt-2 p-3 sm:p-4 rounded-2xl bg-zinc-950 border border-white/[0.09] grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select value={filters.activeCountry || ''} onChange={(e) => { filters.setCountry(e.target.value); filters.setRegion('') }} className="h-11 rounded-xl bg-black border border-white/[0.09] px-3 text-sm text-zinc-300 outline-none"><option value="">Todos los países</option>{filters.countries.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select value={filters.activeRegion || ''} onChange={(e) => filters.setRegion(e.target.value)} className="h-11 rounded-xl bg-black border border-white/[0.09] px-3 text-sm text-zinc-300 outline-none"><option value="">Todas las regiones</option>{filters.regions.map(r => <option key={r} value={r}>{r}</option>)}</select>
        <select value={filters.activeGenre || ''} onChange={(e) => filters.setGenre(e.target.value)} className="h-11 rounded-xl bg-black border border-white/[0.09] px-3 text-sm text-zinc-300 outline-none"><option value="">Todos los géneros</option>{filters.genres.map(g => <option key={g} value={g}>{g}</option>)}</select>
      </div>}
    </div>
  )
}
