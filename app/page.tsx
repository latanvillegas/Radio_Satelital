"use client"
import React, { useState } from 'react'
import ThemeInitializer from '@/components/common/ThemeInitializer'
import Player from '@/components/layout/Player'
import StationGrid from '@/components/features/StationGrid'
import SideMenu from '@/components/layout/SideMenu'
import BottomNav from '@/components/layout/BottomNav'
import { useStations } from '@/hooks/stations'
import { Menu } from 'lucide-react'

export default function Page() {
  const { stations, currentStation, playStation, nextStation, prevStation, toggleFavorite, setQuery, filters, toggleOnlyFavs, onlyFavs, loading, error } = useStations()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen(open => !open)
  const focusSearch = () => {
    setMenuOpen(true)
    document.getElementById('filters-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => document.getElementById('station-search')?.focus(), 150)
  }
  const toggleFavorites = () => toggleOnlyFavs(!onlyFavs)
  const scrollToPlayer = () => window.scrollTo({ behavior: 'smooth', top: 0 })
  const scrollToStations = () => document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const showAllStations = () => {
    setQuery('')
    filters.setCountry('')
    filters.setRegion('')
    toggleOnlyFavs(false)
    scrollToStations()
  }

  return (
    <>
      <ThemeInitializer />
      <div className="container">
        <header className="site-header">
          <div className="header-inner">
            <h1 className="site-title">Radio Satelital</h1>
            <div className="header-actions">
              <button className="sec-btn header-icon-btn" onClick={toggleMenu} aria-label="Abrir ajustes">
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
            {loading && (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Cargando emisoras...</p>
              </div>
            )}
            {error && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#ff6b6b' }}>
                <p><strong>{error}</strong></p>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                  Verifica tu conexión a internet e intenta recargar la página.
                </p>
              </div>
            )}
            {!loading && !error && stations.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>No hay emisoras disponibles</p>
              </div>
            )}
            {!loading && !error && (
              <StationGrid stations={stations} playStation={playStation} toggleFavorite={toggleFavorite} />
            )}
          </main>
          <aside className="player-panel">
            <Player currentStation={currentStation} onNextStation={nextStation} onPrevStation={prevStation} />
          </aside>
        </div>
        <SideMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          loading={loading}
          error={error}
          stationsCount={stations.length}
          setQuery={setQuery}
          filters={filters}
          toggleOnlyFavs={toggleOnlyFavs}
          onResetFilters={showAllStations}
        />
      </div>
    </>
  )
}
