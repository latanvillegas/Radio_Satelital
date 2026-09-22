"use client"
import React, { useState, useEffect } from 'react'
import { Heart, Search, Shuffle, X, Globe, MapPin, Music } from 'lucide-react'

type Props = {
  setQuery: (value: string) => void
  searchQuery?: string
  filters: {
    countries: string[]
    regions: string[]
    genres: string[]
    setCountry: (value: string) => void
    setRegion: (value: string) => void
    setGenre: (value: string) => void
    activeCountry?: string
    activeRegion?: string
    activeGenre?: string
  }
  toggleOnlyFavs: (value: boolean) => void
  onlyFavs?: boolean
  onPlayRandom?: () => void
}

export default function Filters({
  setQuery,
  searchQuery = '',
  filters,
  toggleOnlyFavs,
  onlyFavs = false,
  onPlayRandom,
}: Props) {
  const [q, setQ] = useState(searchQuery)

  useEffect(() => {
    setQ(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        document.getElementById('station-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleQueryChange = (val: string) => {
    setQ(val)
    setQuery(val)
  }

  const clearSearch = () => {
    setQ('')
    setQuery('')
  }

  return (
    <div
      className="bg-black border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl mb-6 space-y-4"
      id="filters-panel"
    >
      {/* Fila superior: Título de sección y botón Sorpréndeme */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            Explorar Frecuencias
          </h3>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md">
            Atajo: <kbd className="font-mono text-zinc-200 font-bold bg-white/10 px-1 rounded">/</kbd>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPlayRandom && (
            <button
              type="button"
              onClick={onPlayRandom}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent)',
                borderColor: 'var(--accent-glow)',
              }}
              title="Sintonizar una emisora al azar"
            >
              <Shuffle size={13} strokeWidth={2.4} />
              <span>Sorpréndeme</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleOnlyFavs(!onlyFavs)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              onlyFavs
                ? 'shadow-sm'
                : 'bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:bg-white/[0.08]'
            }`}
            style={
              onlyFavs
                ? {
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                    borderColor: 'var(--accent-glow)',
                  }
                : undefined
            }
          >
            <Heart size={13} fill={onlyFavs ? 'currentColor' : 'none'} strokeWidth={2.4} />
            <span>Favoritas</span>
          </button>
        </div>
      </div>

      {/* Fila intermedia: Buscador y Selectores de País y Región */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Campo de búsqueda */}
        <div className="md:col-span-6 relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            id="station-search"
            type="text"
            className="w-full bg-zinc-950/80 border border-white/[0.1] rounded-xl pl-10 pr-9 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
            placeholder="Buscar por emisora, país, ciudad o género..."
            value={q}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
          {q && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filtro de País */}
        <div className="md:col-span-3 relative">
          <Globe
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <select
            id="country-filter"
            className="w-full appearance-none bg-zinc-950/80 border border-white/[0.1] rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 cursor-pointer transition-colors"
            value={filters.activeCountry || ''}
            onChange={(e) => filters.setCountry(e.target.value)}
          >
            <option value="" className="bg-zinc-950 text-zinc-100">
              Todos los países ({filters.countries.length})
            </option>
            {filters.countries.map((c) => (
              <option key={c} value={c} className="bg-zinc-950 text-zinc-100">
                {c}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs">
            ▼
          </div>
        </div>

        {/* Filtro de Región */}
        <div className="md:col-span-3 relative">
          <MapPin
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <select
            id="region-filter"
            className="w-full appearance-none bg-zinc-950/80 border border-white/[0.1] rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 cursor-pointer transition-colors"
            value={filters.activeRegion || ''}
            onChange={(e) => filters.setRegion(e.target.value)}
          >
            <option value="" className="bg-zinc-950 text-zinc-100">
              Todas las regiones
            </option>
            {filters.regions.map((r) => (
              <option key={r} value={r} className="bg-zinc-950 text-zinc-100">
                {r}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Píldoras de Género Musical con carrusel horizontal suave */}
      {filters.genres.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pr-2 flex-shrink-0">
              <Music size={12} style={{ color: 'var(--accent)' }} />
              <span>Género:</span>
            </div>

            <button
              type="button"
              onClick={() => filters.setGenre('')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                !filters.activeGenre
                  ? 'text-white font-semibold'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
              style={
                !filters.activeGenre
                  ? {
                      backgroundColor: 'var(--accent)',
                      boxShadow: '0 2px 10px var(--accent-glow)',
                    }
                  : undefined
              }
            >
              Todos
            </button>

            {filters.genres.map((g) => {
              const isActive = filters.activeGenre === g
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => filters.setGenre(isActive ? '' : g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--accent)',
                          boxShadow: '0 2px 10px var(--accent-glow)',
                        }
                      : undefined
                  }
                >
                  {g}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
