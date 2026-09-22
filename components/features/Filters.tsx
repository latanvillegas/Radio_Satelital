"use client"
import React, { useState, useEffect } from 'react'
import { Heart, Search, Shuffle, X } from 'lucide-react'

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

  // Atajo de teclado: presionar '/' para enfocar el buscador instantáneamente
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
    <div className="glass-panel filters rounded-xl shadow-sm hover:shadow-md transition-all duration-200" id="filters-panel">
      <div className="panel-head filter-panel-head">
        <div className="filter-title-group">
          <h3 className="text-lg font-bold">Explorar Emisoras</h3>
          <span className="search-shortcut-hint" title="Atajo de teclado">
            Presiona <kbd>/</kbd> para buscar
          </span>
        </div>

        {onPlayRandom && (
          <button
            type="button"
            className="random-station-btn"
            onClick={onPlayRandom}
            title="Sintonizar una emisora al azar"
            aria-label="Emisora aleatoria"
          >
            <Shuffle size={15} />
            <span>Sorpréndeme</span>
          </button>
        )}
      </div>

      <div className="filter-row">
        <div className="form-group search-form-group">
          <div className="input-icon-wrap">
            <Search size={16} strokeWidth={2.2} className="input-leading-icon" aria-hidden="true" />
            <input
              id="station-search"
              className="input-dark search-input input-with-icon"
              placeholder="Buscar por emisora, país, ciudad o género..."
              value={q}
              onChange={(e) => handleQueryChange(e.target.value)}
            />
            {q && (
              <button
                type="button"
                className="input-clear-btn"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <select
            id="country-filter"
            className="input-dark"
            value={filters.activeCountry || ''}
            onChange={(e) => filters.setCountry(e.target.value)}
          >
            <option value="">Todos los países ({filters.countries.length})</option>
            {filters.countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <select
            id="region-filter"
            className="input-dark"
            value={filters.activeRegion || ''}
            onChange={(e) => filters.setRegion(e.target.value)}
          >
            <option value="">Todas las regiones</option>
            {filters.regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Píldoras de Género Musical / Temática */}
      {filters.genres.length > 0 && (
        <div className="genre-pill-bar">
          <button
            type="button"
            className={`genre-pill ${!filters.activeGenre ? 'active' : ''}`}
            onClick={() => filters.setGenre('')}
          >
            Todos
          </button>
          {filters.genres.map((g) => (
            <button
              key={g}
              type="button"
              className={`genre-pill capitalize ${filters.activeGenre === g ? 'active' : ''}`}
              onClick={() => filters.setGenre(filters.activeGenre === g ? '' : g)}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      <div className="filter-footer-row">
        <label className="switch-label">
          <input
            type="checkbox"
            id="favoritesToggle"
            checked={onlyFavs}
            onChange={(e) => toggleOnlyFavs(e.target.checked)}
          />
          <Heart size={16} strokeWidth={2.2} fill={onlyFavs ? 'currentColor' : 'none'} />
          <span>Solo mis favoritas</span>
        </label>
      </div>
    </div>
  )
}
