"use client"
import React, { useState } from 'react'
import ThemeInitializer from '@/components/common/ThemeInitializer'
import Player from '@/components/layout/Player'
import StationGrid from '@/components/features/StationGrid'
import SideMenu from '@/components/layout/SideMenu'
import BottomNav from '@/components/layout/BottomNav'
import Filters from '@/components/features/Filters'
import { useStations } from '@/hooks/stations'
import { Menu, Radio } from 'lucide-react'

export default function Page() {
  const {
    stations,
    recentStations,
    currentStation,
    playStation,
    nextStation,
    prevStation,
    playRandomStation,
    toggleFavorite,
    setQuery,
    searchQuery,
    filters,
    toggleOnlyFavs,
    onlyFavs,
    loading,
    error,
  } = useStations()

  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen((open) => !open)
  const focusSearch = () => {
    document.getElementById('station-search')?.focus()
    document.getElementById('filters-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const toggleFavorites = () => toggleOnlyFavs(!onlyFavs)
  const scrollToPlayer = () => window.scrollTo({ behavior: 'smooth', top: 0 })
  const scrollToStations = () =>
    document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const resetAllFilters = () => {
    setQuery('')
    filters.setCountry('')
    filters.setRegion('')
    filters.setGenre('')
    toggleOnlyFavs(false)
  }

  return (
    <>
      <ThemeInitializer />
      <div className="container">
        <header className="site-header">
          <div className="header-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-md shadow-red-950/40 border border-red-500/20">
                <Radio className="text-white" size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h1 className="site-title">Radio Satelital</h1>
                <p className="text-xs text-zinc-400 font-medium hidden sm:block">
                  Sintonizador web global en tiempo real
                </p>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="sec-btn header-icon-btn"
                onClick={toggleMenu}
                aria-label="Abrir ajustes y temas"
              >
                <Menu size={20} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <BottomNav
            placement="top"
            onHome={scrollToPlayer}
            onRadio={scrollToStations}
            onFavorites={toggleFavorites}
            onSearch={focusSearch}
            favoritesActive={onlyFavs}
          />
        </header>

        <div className="layout">
          <main className="right-col">
            {/* Panel de filtros y búsqueda profesional integrado directamente en la vista principal */}
            <Filters
              setQuery={setQuery}
              searchQuery={searchQuery}
              filters={filters}
              toggleOnlyFavs={toggleOnlyFavs}
              onlyFavs={onlyFavs}
              onPlayRandom={playRandomStation}
            />

            {error && (
              <div className="p-4 mb-4 rounded-xl bg-red-950/40 border border-red-800/50 text-center text-red-200">
                <p>
                  <strong>{error}</strong>
                </p>
                <p className="text-sm mt-1 text-red-300">
                  Verifica tu conexión a internet o intenta sintonizar otra emisora.
                </p>
              </div>
            )}

            <StationGrid
              stations={stations}
              recentStations={recentStations}
              playStation={playStation}
              toggleFavorite={toggleFavorite}
            />
          </main>
        </div>

        <Player
          currentStation={currentStation}
          onNextStation={nextStation}
          onPrevStation={prevStation}
        />

        <SideMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          loading={loading}
          error={error}
          stationsCount={stations.length}
          setQuery={setQuery}
          filters={filters}
          toggleOnlyFavs={toggleOnlyFavs}
          onResetFilters={resetAllFilters}
        />
      </div>
    </>
  )
}
