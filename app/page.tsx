"use client"
import React, { useState } from 'react'
import ThemeInitializer from '@/components/common/ThemeInitializer'
import Player from '@/components/layout/Player'
import StationGrid from '@/components/features/StationGrid'
import SideMenu from '@/components/layout/SideMenu'
import Filters from '@/components/features/Filters'
import QuickPresetsBar from '@/components/features/QuickPresetsBar'
import MasterConsoleRack from '@/components/features/MasterConsoleRack'
import { useStations } from '@/hooks/stations'
import { Radio, Sliders, Shuffle, Heart, Sparkles, AlertCircle, Activity } from 'lucide-react'

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
  const toggleFavorites = () => toggleOnlyFavs(!onlyFavs)

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

      <div className="min-h-screen bg-black text-zinc-100 selection:bg-[var(--accent)] selection:text-black relative">
        {/* Fondo ambiental dinámico adaptado al tema actual sobre base AMOLED puro */}
        <div
          className="fixed inset-0 pointer-events-none opacity-40 transition-all duration-500"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -20%, var(--accent-glow), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Barra superior de navegación profesional (Header) */}
        <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Logotipo y Título de Marca */}
            <div className="flex items-center gap-3.5">
              <div
                className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  borderColor: 'var(--accent)',
                  boxShadow: '0 4px 18px var(--accent-glow)',
                }}
              >
                <Radio className="text-white" size={20} strokeWidth={2.2} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-3 w-3 border-2 border-black"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-none">
                    Radio Satelital
                  </h1>
                  <span
                    className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border transition-colors"
                    style={{
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      borderColor: 'var(--accent-glow)',
                    }}
                  >
                    Pro Live
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium hidden sm:block mt-0.5">
                  Sintonizador web global en tiempo real
                </p>
              </div>
            </div>

            {/* Acciones del encabezado */}
            <div className="flex items-center gap-2">
              {/* Botón Cabina On-Air en el encabezado */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-studio-modal'))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  borderColor: 'var(--accent-glow)',
                }}
                title="Abrir Cabina de Estudio On-Air (O)"
              >
                <Radio size={14} style={{ color: 'var(--accent)' }} className="animate-pulse" />
                <span className="hidden md:inline">Cabina On-Air</span>
              </button>

              {/* Botón Ecualizador DSP */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-eq-modal'))}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] transition-all"
                title="Calibrar Ecualizador Paramétrico (E)"
              >
                <Sliders size={14} />
                <span className="hidden md:inline">Ecualizador</span>
              </button>

              {/* Botón Sorpréndeme rápido */}
              <button
                type="button"
                onClick={playRandomStation}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] transition-all hover:scale-[1.02]"
                title="Sintonizar emisora al azar"
              >
                <Shuffle size={14} style={{ color: 'var(--accent)' }} />
                <span>Sorpréndeme</span>
              </button>

              {/* Botón Favoritas rápido */}
              <button
                type="button"
                onClick={toggleFavorites}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  onlyFavs
                    ? 'shadow-sm'
                    : 'bg-white/[0.05] text-zinc-300 border-white/[0.08] hover:bg-white/[0.1]'
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
                title="Ver solo emisoras favoritas"
              >
                <Heart size={14} fill={onlyFavs ? 'currentColor' : 'none'} style={{ color: 'var(--accent)' }} />
                <span className="hidden sm:inline">Favoritas</span>
              </button>

              {/* Botón Ajustes */}
              <button
                type="button"
                onClick={toggleMenu}
                className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] transition-all"
                aria-label="Abrir panel de ajustes"
                title="Ajustes y temas"
              >
                <Sliders size={15} />
                <span className="hidden sm:inline">Ajustes</span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-36 relative z-10">
          {/* Consola Maestra de Estudio Broadcast (Rack de Audio Central) */}
          <MasterConsoleRack
            currentStation={currentStation}
            onPlayNext={nextStation}
            onPlayPrev={prevStation}
            onToggleFav={toggleFavorite}
            onOpenEq={() => window.dispatchEvent(new CustomEvent('open-eq-modal'))}
            onOpenStudio={() => window.dispatchEvent(new CustomEvent('open-studio-modal'))}
            onPlayRandom={playRandomStation}
          />

          {/* Barra de Presets Rápidos de Estudio (Dial 1 a 6) */}
          <QuickPresetsBar
            currentStation={currentStation}
            onPlayStation={playStation}
            stations={stations}
          />

          {/* Panel de Filtros y Búsqueda */}
          <Filters
            setQuery={setQuery}
            searchQuery={searchQuery}
            filters={filters}
            toggleOnlyFavs={toggleOnlyFavs}
            onlyFavs={onlyFavs}
            onPlayRandom={playRandomStation}
          />

          {/* Banner de error si falla la conexión */}
          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-3 shadow-lg">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-red-100">{error}</p>
                <p className="text-xs text-red-300 mt-0.5">
                  Verifica tu conexión a internet o intenta sintonizar otra emisora del catálogo.
                </p>
              </div>
            </div>
          )}

          {/* Rejilla de Emisoras Satelitales */}
          <StationGrid
            stations={stations}
            recentStations={recentStations}
            playStation={playStation}
            toggleFavorite={toggleFavorite}
          />
        </main>

        {/* Reproductor Fijo en el Pie (Bottom Dock) */}
        <Player
          currentStation={currentStation}
          onNextStation={nextStation}
          onPrevStation={prevStation}
        />

        {/* Panel Deslizante de Ajustes */}
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
