"use client"

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, Globe2, Heart, MapPin, RadioTower, Settings2, Shuffle } from 'lucide-react'
import ThemeInitializer from '@/components/common/ThemeInitializer'
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration'
import Player from '@/components/layout/Player'
import SideMenu from '@/components/layout/SideMenu'
import StationGrid from '@/components/features/StationGrid'
import LiveStage from '@/components/features/LiveStage'
import Filters from '@/components/features/Filters'
import { buildDiscovery } from '@/lib/services/discovery'
import { useStations } from '@/hooks/stations'

export default function Page() {
  const {
    stations, rawStations, recentStations, currentStation,
    playStation, nextStation, prevStation, playRandomStation,
    toggleFavorite, setQuery, searchQuery, filters,
    toggleOnlyFavs, onlyFavs, loading, error,
  } = useStations()
  const [menuOpen, setMenuOpen] = useState(false)

  const resetAllFilters = () => {
    setQuery('')
    filters.setCountry('')
    filters.setRegion('')
    filters.setGenre('')
    toggleOnlyFavs(false)
  }

  // La misma selección utiliza el filtro existente: no crea catálogos paralelos.
  const selectScope = (scope: 'jaen' | 'cajamarca' | 'peru' | 'world' | 'favorites') => {
    setQuery('')
    filters.setCountry(scope === 'world' || scope === 'favorites' ? '' : 'Perú')
    filters.setRegion(scope === 'jaen' ? 'Jaén' : scope === 'cajamarca' ? 'Cajamarca' : '')
    filters.setGenre('')
    toggleOnlyFavs(scope === 'favorites')
    document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const discovery = useMemo(
    () => buildDiscovery(rawStations, recentStations, currentStation),
    [rawStations, recentStations, currentStation],
  )
  const countriesCount = useMemo(
    () => new Set(rawStations.map(s => s.country).filter(Boolean)).size,
    [rawStations],
  )
  const scopeActive = (scope: string) => {
    if (scope === 'favorites') return onlyFavs
    if (onlyFavs) return false
    if (scope === 'jaen') return filters.activeCountry === 'Perú' && filters.activeRegion === 'Jaén'
    if (scope === 'cajamarca') return filters.activeCountry === 'Perú' && filters.activeRegion === 'Cajamarca'
    if (scope === 'peru') return filters.activeCountry === 'Perú' && !filters.activeRegion
    return !filters.activeCountry && !filters.activeRegion
  }

  return <>
    <ThemeInitializer />
    <ServiceWorkerRegistration />
    <div className="dial-page live-universe observatory-shell min-h-screen bg-black text-zinc-100">
      <a href="#explorar" className="dial-skip">Ir al buscador de emisoras</a>
      <header className="dial-header observatory-header sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-3">
          <a href="#inicio" className="dial-brand flex items-center gap-3 min-w-0" aria-label="Radio Satelital, volver al inicio">
            <span className="dial-brand-icon relative w-11 h-11 shrink-0 overflow-hidden rounded-xl">
              <Image src="/icon-192.png" alt="" fill sizes="44px" className="object-cover" priority />
            </span>
            <span className="min-w-0">
              <strong className="block text-sm sm:text-base tracking-tight truncate">Radio Satelital</strong>
              <span className="block text-[10px] sm:text-xs text-zinc-400 truncate">Jaén · Cajamarca · Mundo</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400" aria-label="Navegación principal">
            <a href="#explorar" className="dial-nav-link">Explorar</a>
            <a href="#station-list" className="dial-nav-link">Emisoras</a>
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={playRandomStation} className="dial-header-action hidden sm:inline-flex" aria-label="Escuchar una emisora aleatoria">
              <Shuffle size={17} /> <span>Aleatoria</span>
            </button>
            <button type="button" onClick={() => selectScope('favorites')} aria-label="Mostrar favoritas" aria-pressed={onlyFavs} className="dial-header-action">
              <Heart size={17} fill={onlyFavs ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">Favoritas</span>
            </button>
            <button type="button" onClick={() => setMenuOpen(true)} className="dial-header-action dial-settings" aria-label="Abrir ajustes">
              <Settings2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <main id="inicio" className="dial-main max-w-7xl mx-auto px-4 sm:px-6 pt-7 sm:pt-10 pb-48 sm:pb-40">
        <section id="explorar" className="dial-discover scroll-mt-28" aria-labelledby="dial-discover-title">
          <div className="dial-intro">
            <div>
              <p className="dial-eyebrow"><RadioTower size={15} /> EL OBSERVATORIO DEL DIAL</p>
              <h2 id="dial-discover-title" className="dial-heading">Encuentra tu próxima <span>emisora.</span></h2>
              <p className="dial-subtitle">Radios de Jaén, Cajamarca, Perú y el mundo. Elige y escucha en directo.</p>
            </div>
            <div className="dial-catalog-meta hidden lg:flex">
              <span className="dial-meta-number">{rawStations.length}</span>
              <span>emisoras para explorar</span>
              <span className="dial-meta-separator" />
              <span className="dial-meta-number">{countriesCount}</span>
              <span>países</span>
            </div>
          </div>
          <Filters
            setQuery={setQuery}
            searchQuery={searchQuery}
            filters={filters}
            toggleOnlyFavs={toggleOnlyFavs}
            onlyFavs={onlyFavs}
          />
          <div className="dial-scope-wrap">
            <div className="dial-scopes" role="group" aria-label="Explorar radios por zona">
              <button type="button" onClick={() => selectScope('jaen')} aria-pressed={scopeActive('jaen')} className="dial-scope"><MapPin size={15} /> Jaén</button>
              <button type="button" onClick={() => selectScope('cajamarca')} aria-pressed={scopeActive('cajamarca')} className="dial-scope"><MapPin size={15} /> Cajamarca</button>
              <button type="button" onClick={() => selectScope('peru')} aria-pressed={scopeActive('peru')} className="dial-scope">Perú</button>
              <button type="button" onClick={() => selectScope('world')} aria-pressed={scopeActive('world')} className="dial-scope"><Globe2 size={15} /> Mundo</button>
              <button type="button" onClick={() => selectScope('favorites')} aria-pressed={scopeActive('favorites')} className="dial-scope"><Heart size={15} /> Favoritas</button>
            </div>
            {(searchQuery || onlyFavs || filters.activeCountry || filters.activeRegion || filters.activeGenre) && (
              <button type="button" onClick={resetAllFilters} className="dial-clear">Limpiar filtros</button>
            )}
          </div>
        </section>

        {!searchQuery && !onlyFavs && !filters.activeCountry && !filters.activeGenre && !filters.activeRegion && (
          <LiveStage featured={discovery.featured} stationCount={rawStations.length}
            countryCount={countriesCount} onTune={playStation} />
        )}

        {error && <div role="alert" className="my-5 p-4 rounded-2xl border border-red-900/60 bg-red-950/30 flex gap-3 text-red-200">
          <AlertCircle size={19} className="shrink-0 mt-0.5" />
          <span className="text-sm">No se pudo cargar el catálogo. Actualiza la página e inténtalo de nuevo.</span>
        </div>}

        <StationGrid stations={stations} recentStations={recentStations}
          playStation={playStation} toggleFavorite={toggleFavorite} />
      </main>

      <Player currentStation={currentStation} onNextStation={nextStation}
        onPrevStation={prevStation} stations={stations}
        onPlayStation={playStation} visible />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)}
        loading={loading} error={error} stationsCount={stations.length}
        setQuery={setQuery} filters={filters} toggleOnlyFavs={toggleOnlyFavs}
        onResetFilters={resetAllFilters} />
    </div>
  </>
}
