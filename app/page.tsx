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
  const scrollToPlayer = () => document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
            <div className="brand-mark">
              <div>
                <h1 className="site-title">SATELITAL</h1>
                <p className="site-subtitle">Wave player v9.5</p>
              </div>
            </div>
            <div className="header-actions">
              <span className="header-status-pill">
                {onlyFavs ? 'Favoritos activos' : `${stations.length} radios online`}
              </span>
              <button className="sec-btn header-icon-btn" onClick={toggleMenu} aria-label="Abrir ajustes">
                <Menu size={20} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </header>

        <section className="page-hero glass-panel">
          <div className="page-hero-copy">
            <p className="page-hero-kicker">Interfaz limpia</p>
            <h2>Explora radios con foco, orden y velocidad.</h2>
            <p>
              Reproductor principal arriba, catálogo completo debajo y ajustes en un panel lateral.
            </p>
          </div>
          <div className="page-hero-stats">
            <div className="hero-stat">
              <strong>{stations.length}</strong>
              <span>Radios</span>
            </div>
            <div className="hero-stat">
              <strong>{currentStation ? 'En vivo' : 'Listo'}</strong>
              <span>{currentStation?.name || 'Sin selección'}</span>
            </div>
            <button className="hero-stat hero-stat-action" onClick={showAllStations} type="button">
              Ver catálogo completo
            </button>
          </div>
        </section>

        <div className="layout">
          <aside className="left-col">
            <Player currentStation={currentStation} onNextStation={nextStation} onPrevStation={prevStation} />
          </aside>
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
        </div>

        <BottomNav
          onHome={scrollToPlayer}
          onRadio={scrollToStations}
          onFavorites={toggleFavorites}
          onSearch={focusSearch}
          favoritesActive={onlyFavs}
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
          onResetFilters={showAllStations}
        />
      </div>
    </>
  )
}
