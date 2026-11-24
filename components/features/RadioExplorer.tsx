"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Clock3, Globe2, Heart, MapPin, Play, RadioTower, Settings2 } from 'lucide-react'
import type { Station, StationScope } from '@/types/station'
import ThemeInitializer from '@/components/common/ThemeInitializer'
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration'
import Player from '@/components/layout/Player'
import SideMenu from '@/components/layout/SideMenu'
import StationArtwork from '@/components/features/StationArtwork'
import StationGrid from '@/components/features/StationGrid'
import Filters from '@/components/features/Filters'
import { useStations } from '@/hooks/stations'

interface Props {
  initialStations: Station[]
  countriesCount: number
  featuredStation?: Station | null
}

const NAV_SCOPES: ReadonlyArray<{ key: StationScope; label: string }> = [
  { key: 'jaen', label: 'Jaén' },
  { key: 'cajamarca', label: 'Cajamarca' },
  { key: 'peru', label: 'Perú' },
  { key: 'world', label: 'Mundo' },
  { key: 'favorites', label: 'Favoritas' },
]

export default function RadioExplorer({
  initialStations,
  countriesCount,
  featuredStation = null,
}: Props) {
  const {
    stations,
    rawStations,
    recentStations,
    currentStation,
    scope,
    selectScope,
    resetAllFilters,
    onlyFavs,
    playStation,
    nextStation,
    prevStation,
    playRandomStation,
    toggleFavorite,
    setQuery,
    searchQuery,
    filters,
    error,
  } = useStations(initialStations, featuredStation)

  const [menuOpen, setMenuOpen] = useState(false)

  const handleScopeSelect = (nextScope: StationScope) => {
    selectScope(nextScope)
    document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const hasActiveFilters = Boolean(
    searchQuery ||
      scope !== 'all' ||
      onlyFavs ||
      filters.activeCountry ||
      filters.activeRegion ||
      filters.activeGenre
  )

  const sectionTitle =
    scope === 'recent'
      ? 'Escuchadas recientemente'
      : scope === 'favorites'
      ? 'Tus emisoras favoritas'
      : scope === 'jaen'
      ? 'Emisoras de Jaén'
      : scope === 'cajamarca'
      ? 'Emisoras de Cajamarca'
      : scope === 'peru'
      ? 'Emisoras del Perú'
      : scope === 'world'
      ? 'Emisoras internacionales'
      : 'Todas las emisoras'

  return (
    <>
      <ThemeInitializer />
      <ServiceWorkerRegistration />

      <div className="min-h-screen flex flex-col">
        <a href="#explorar" className="dial-skip">
          Ir al buscador de emisoras
        </a>

        {/* Top Bar Contract: 3 zonas limpias (Marca · Navegación de regiones · Acción principal) */}
        <header className="surface-header sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-6">
            <Link
              href={featuredStation ? '/' : '#inicio'}
              onClick={(e) => {
                if (!featuredStation && hasActiveFilters) {
                  e.preventDefault()
                  resetAllFilters()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className="broadcast-brand"
            >
              <span className="broadcast-brand-mark" aria-hidden="true"><RadioTower size={20} strokeWidth={1.8} /></span>
              <span className="broadcast-wordmark">Radio <span>Satelital</span></span>
            </Link>

            <nav
              aria-label="Navegación rápida por regiones"
              className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink-secondary"
            >
              {NAV_SCOPES.map((item) => {
                const active = scope === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleScopeSelect(item.key)}
                    aria-pressed={active}
                    className={`min-h-[44px] inline-flex items-center whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                      active
                        ? 'border-accent text-ink font-semibold'
                        : 'border-transparent hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir ajustes de apariencia y audio"
                className="min-h-[44px] px-3.5 rounded-xl border border-line bg-surface hover:bg-subtle text-ink text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Settings2 size={16} />
                <span>Ajustes</span>
              </button>
            </div>
          </div>
        </header>

        <main
          id="inicio"
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:pb-32"
        >
          {featuredStation && (
            <section
              aria-labelledby="featured-station-heading"
              className="mb-8 rounded-2xl border border-line bg-surface p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                  <StationArtwork station={featuredStation} variant="card" />
                  <div className="min-w-0">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline underline-offset-4 mb-1"
                    >
                      <ArrowLeft size={13} />
                      <span>Explorar todas las emisoras</span>
                    </Link>
                    <h1
                      id="featured-station-heading"
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink truncate"
                    >
                      {featuredStation.name}
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-ink-secondary truncate">
                      {[
                        featuredStation.region,
                        featuredStation.country,
                        featuredStation.tags?.slice(0, 3).join(', '),
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Transmisión radial en directo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => playStation(featuredStation)}
                    className="min-h-[44px] px-5 rounded-xl bg-accent text-accent-fg hover:bg-accent-hover text-sm font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Escuchar en directo</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          <section
            id="explorar"
            className="scroll-mt-24 mb-4 sm:mb-5"
            aria-labelledby="discover-heading"
          >
            <div className="broadcast-explorer-heading">
              {featuredStation ? (
                <h2 id="discover-heading" className="broadcast-explorer-title">Explorar más emisoras</h2>
              ) : (
                <h1 id="discover-heading" className="broadcast-explorer-title">Explorar emisoras</h1>
              )}
              <p className="broadcast-catalog-meta">
                <span><strong>{rawStations.length}</strong> emisoras en el catálogo</span>
                <span className="broadcast-meta-divider" aria-hidden="true" />
                <span><strong>{countriesCount}</strong> países</span>
              </p>
            </div>

            <Filters
              setQuery={setQuery}
              searchQuery={searchQuery}
              filters={filters}
              onPlayRandom={playRandomStation}
            />

            {/* Controles segmentados rápidos */}
            <div className="broadcast-scope-row flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full"
                role="group"
                aria-label="Filtrar catálogo por alcance"
              >
                <button
                  type="button"
                  onClick={() => handleScopeSelect('all')}
                  aria-pressed={scope === 'all' && !hasActiveFilters}
                  className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors ${
                    scope === 'all' && !hasActiveFilters
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-surface hover:bg-subtle text-ink-secondary hover:text-ink border-line'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeSelect('jaen')}
                  aria-pressed={scope === 'jaen'}
                  className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors ${
                    scope === 'jaen'
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-surface hover:bg-subtle text-ink-secondary hover:text-ink border-line'
                  }`}
                >
                  <MapPin size={14} />
                  <span>Jaén</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeSelect('cajamarca')}
                  aria-pressed={scope === 'cajamarca'}
                  className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors ${
                    scope === 'cajamarca'
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-surface hover:bg-subtle text-ink-secondary hover:text-ink border-line'
                  }`}
                >
                  <MapPin size={14} />
                  <span>Cajamarca</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeSelect('peru')}
                  aria-pressed={scope === 'peru'}
                  className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors ${
                    scope === 'peru'
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-surface hover:bg-subtle text-ink-secondary hover:text-ink border-line'
                  }`}
                >
                  <span>Perú</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeSelect('world')}
                  aria-pressed={scope === 'world'}
                  className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors ${
                    scope === 'world'
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-surface hover:bg-subtle text-ink-secondary hover:text-ink border-line'
                  }`}
                >
                  <Globe2 size={14} />
                  <span>Mundo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeSelect('favorites')}
                  aria-pressed={scope === 'favorites'}
                  className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors ${
                    scope === 'favorites'
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-surface hover:bg-subtle text-ink-secondary hover:text-ink border-line'
                  }`}
                >
                  <Heart size={14} />
                  <span>Favoritas</span>
                </button>
                {recentStations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleScopeSelect('recent')}
                    aria-pressed={scope === 'recent'}
                    className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors ${
                      scope === 'recent'
                        ? 'bg-accent text-accent-fg border-accent'
                        : 'bg-surface hover:bg-subtle text-ink-secondary hover:text-ink border-line'
                    }`}
                  >
                    <Clock3 size={14} />
                    <span>Recientes</span>
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="min-h-[44px] px-2 text-xs font-semibold text-accent hover:underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="my-5 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-start gap-3 text-red-500"
            >
              <AlertCircle size={19} className="shrink-0 mt-0.5" />
              <span className="text-sm font-medium">
                No se pudo actualizar el catálogo de emisoras. Recarga la página e inténtalo de nuevo.
              </span>
            </div>
          )}

          <StationGrid
            stations={stations}
            title={sectionTitle}
            subtitle=""
            playStation={playStation}
            toggleFavorite={toggleFavorite}
            onResetFilters={hasActiveFilters ? resetAllFilters : undefined}
          />
        </main>

        <Player
          currentStation={currentStation}
          onNextStation={nextStation}
          onPrevStation={prevStation}
          visible
        />

        <SideMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onResetFilters={resetAllFilters}
        />
      </div>
    </>
  )
}
