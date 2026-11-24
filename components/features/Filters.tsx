"use client"

import React, { useEffect, useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, Shuffle } from 'lucide-react'
import type { ExposedFilters } from '@/hooks/stations/useStations'

interface Props {
  setQuery: (value: string) => void
  searchQuery?: string
  filters: ExposedFilters
  onPlayRandom?: () => void
}

export default function Filters({
  setQuery,
  searchQuery = '',
  filters,
  onPlayRandom,
}: Props) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || document.querySelector('[role="dialog"][aria-modal="true"]')) return
      const tag = document.activeElement?.tagName || ''
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)
      ) {
        e.preventDefault()
        document.getElementById('station-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleChange = (value: string) => {
    setLocalQuery(value)
    setQuery(value)
  }

  const activeCount = [
    filters.activeCountry,
    filters.activeRegion,
    filters.activeGenre,
  ].filter(Boolean).length

  return (
    <div id="filters-panel" className="mb-4">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        <div className="relative flex-1 min-w-0 basis-[220px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          />
          <input
            id="station-search"
            type="search"
            value={localQuery}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Buscar por nombre, ciudad, país o género… (/)"
            aria-label="Buscar emisoras por nombre, ciudad, país o género"
            className="w-full h-12 rounded-xl bg-input border border-line pl-11 pr-11 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent transition-colors"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => handleChange('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] grid place-items-center rounded-lg text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="advanced-filters-drawer"
            className="h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-surface border border-line hover:border-line-strong text-sm font-semibold text-ink transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal size={16} />
            <span>Filtros</span>
            {activeCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 grid place-items-center rounded-md text-[11px] font-mono font-bold tabular-nums bg-accent text-accent-fg">
                {activeCount}
              </span>
            )}
            <ChevronDown
              size={15}
              className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {onPlayRandom && (
            <button
              type="button"
              onClick={onPlayRandom}
              className="h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-surface border border-line hover:border-line-strong text-sm font-semibold text-ink transition-colors whitespace-nowrap shrink-0"
              aria-label="Sintonizar una emisora aleatoria"
            >
              <Shuffle size={16} className="text-accent" />
              <span className="hidden md:inline">Aleatoria</span>
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          id="advanced-filters-drawer"
          className="mt-2.5 p-3.5 rounded-xl bg-surface border border-line grid grid-cols-1 sm:grid-cols-3 gap-2.5"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-muted px-1">País</span>
            <select
              value={filters.activeCountry || ''}
              onChange={(e) => filters.setCountry(e.target.value)}
              className="h-11 rounded-lg bg-input border border-line px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Todos los países</option>
              {filters.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-muted px-1">Región o ciudad</span>
            <select
              value={filters.activeRegion || ''}
              onChange={(e) => filters.setRegion(e.target.value)}
              className="h-11 rounded-lg bg-input border border-line px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Todas las regiones</option>
              {filters.regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-muted px-1">Género</span>
            <select
              value={filters.activeGenre || ''}
              onChange={(e) => filters.setGenre(e.target.value)}
              className="h-11 rounded-lg bg-input border border-line px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Todos los géneros</option>
              {filters.genres.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  )
}
