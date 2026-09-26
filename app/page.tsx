"use client"
import React, { useState } from 'react'
import ThemeInitializer from '@/components/common/ThemeInitializer'
import Player from '@/components/layout/Player'
import StationGrid from '@/components/features/StationGrid'
import SideMenu from '@/components/layout/SideMenu'
import Filters from '@/components/features/Filters'
import { useStations } from '@/hooks/stations'
import { Radio, Sliders, Shuffle, Heart, AlertCircle, MapPin, Music2, Newspaper } from 'lucide-react'

export default function Page() {
  const {
    stations, recentStations, currentStation, playStation, nextStation, prevStation,
    playRandomStation, toggleFavorite, setQuery, searchQuery, filters,
    toggleOnlyFavs, onlyFavs, loading, error,
  } = useStations()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleFavorites = () => toggleOnlyFavs(!onlyFavs)
  const resetAllFilters = () => {
    setQuery('')
    filters.setCountry('')
    filters.setRegion('')
    filters.setGenre('')
    toggleOnlyFavs(false)
  }
  const scrollToRadios = () => setTimeout(() => document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  const chooseCountry = (country: string) => {
    setQuery(''); filters.setCountry(country); filters.setRegion(''); filters.setGenre(''); toggleOnlyFavs(false); scrollToRadios()
  }
  const chooseRegion = (country: string, region: string) => {
    setQuery(''); filters.setCountry(country); filters.setRegion(region); filters.setGenre(''); toggleOnlyFavs(false); scrollToRadios()
  }
  const chooseGenre = (genre: string) => {
    setQuery(''); filters.setCountry(''); filters.setRegion(''); filters.setGenre(genre); toggleOnlyFavs(false); scrollToRadios()
  }

  return (
    <>
      <ThemeInitializer />
      <div className="min-h-screen bg-black text-zinc-100 selection:bg-[var(--accent)] selection:text-black">
        <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 min-w-0 text-left">
              <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                <Radio size={21} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold tracking-tight text-white truncate">Radio Satelital</h1>
                <p className="hidden sm:block text-[11px] text-zinc-500">Emisoras en vivo de Perú y el mundo</p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button type="button" onClick={playRandomStation} className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08]" title="Escuchar una radio al azar">
                <Shuffle size={14} /> Aleatoria
              </button>
              <button type="button" onClick={toggleFavorites} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.05]" style={onlyFavs ? { color: 'var(--accent)', borderColor: 'var(--accent-glow)', backgroundColor: 'var(--accent-subtle)' } : undefined}>
                <Heart size={15} fill={onlyFavs ? 'currentColor' : 'none'} /><span className="hidden sm:inline">Favoritas</span>
              </button>
              <button type="button" onClick={() => setMenuOpen(true)} className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08]" aria-label="Abrir herramientas y ajustes">
                <Sliders size={15} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-36">
          <section className="mb-5 sm:mb-6">
            <div className="max-w-3xl mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>Radio en directo</p>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">Encuentra una emisora y empieza a escuchar.</h2>
              <p className="mt-2 text-sm text-zinc-400">Busca por nombre, ciudad, país o género. La reproducción continúa mientras exploras.</p>
            </div>

            <Filters setQuery={setQuery} searchQuery={searchQuery} filters={filters} toggleOnlyFavs={toggleOnlyFavs} onlyFavs={onlyFavs} onPlayRandom={playRandomStation} currentStation={currentStation} onPlayStation={playStation} stations={stations} />
          </section>

          <section className="mb-5" aria-label="Categorías rápidas">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold text-zinc-200">Explorar rápido</h3>
              <button type="button" onClick={resetAllFilters} className="text-xs font-medium text-zinc-500 hover:text-white">Mostrar todas</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button onClick={() => chooseCountry('Perú')} className="shrink-0 px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold">🇵🇪 Perú</button>
              <button onClick={() => chooseRegion('Perú', 'Cajamarca')} className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold"><MapPin size={13}/> Cajamarca</button>
              <button onClick={() => chooseGenre('cumbia')} className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold"><Music2 size={13}/> Cumbia</button>
              <button onClick={() => chooseGenre('noticias')} className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold"><Newspaper size={13}/> Noticias</button>
              <button onClick={() => chooseGenre('rock')} className="shrink-0 px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold">Rock</button>
            </div>
          </section>

          {error && (
            <div className="p-3.5 mb-5 rounded-xl bg-red-950/30 border border-red-900/60 text-red-200 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div><p className="font-semibold text-sm">No se pudo reproducir la transmisión.</p><p className="text-xs text-red-300/80 mt-0.5">Prueba de nuevo o elige otra emisora.</p></div>
            </div>
          )}

          <StationGrid stations={stations} recentStations={recentStations} playStation={playStation} toggleFavorite={toggleFavorite} />
        </main>

        <Player currentStation={currentStation} onNextStation={nextStation} onPrevStation={prevStation} stations={stations} onPlayStation={playStation} visible={true} />
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} loading={loading} error={error} stationsCount={stations.length} setQuery={setQuery} filters={filters} toggleOnlyFavs={toggleOnlyFavs} onResetFilters={resetAllFilters} />
      </div>
    </>
  )
}
