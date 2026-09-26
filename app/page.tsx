"use client"
import React, { useMemo, useState } from 'react'
import ThemeInitializer from '@/components/common/ThemeInitializer'
import Player from '@/components/layout/Player'
import StationGrid from '@/components/features/StationGrid'
import SideMenu from '@/components/layout/SideMenu'
import Filters from '@/components/features/Filters'
import { useStations } from '@/hooks/stations'
import { Radio, Sliders, Shuffle, Heart, AlertCircle, Headphones, Globe2, MapPin, Music2, Newspaper, Sparkles } from 'lucide-react'

export default function Page() {
  const { stations, recentStations, currentStation, playStation, nextStation, prevStation, playRandomStation, toggleFavorite, setQuery, searchQuery, filters, toggleOnlyFavs, onlyFavs, loading, error } = useStations()
  const [menuOpen, setMenuOpen] = useState(false)

  const countriesCount = useMemo(() => new Set(stations.map(s => s.country).filter(Boolean)).size, [stations])
  const regionsCount = useMemo(() => new Set(stations.map(s => s.region).filter(Boolean)).size, [stations])

  const toggleFavorites = () => toggleOnlyFavs(!onlyFavs)
  const resetAllFilters = () => {
    setQuery(''); filters.setCountry(''); filters.setRegion(''); filters.setGenre(''); toggleOnlyFavs(false)
  }
  const chooseCountry = (country: string) => {
    setQuery(''); filters.setCountry(country); filters.setRegion(''); filters.setGenre(''); toggleOnlyFavs(false)
    setTimeout(() => document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  const chooseGenre = (genre: string) => {
    setQuery(''); filters.setCountry(''); filters.setRegion(''); filters.setGenre(genre); toggleOnlyFavs(false)
    setTimeout(() => document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <>
      <ThemeInitializer />
      <div className="min-h-screen bg-black text-zinc-100 selection:bg-[var(--accent)] selection:text-black relative">
        <div className="fixed inset-0 pointer-events-none opacity-40 transition-all duration-500" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, var(--accent-glow), transparent 70%)' }} aria-hidden="true" />

        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-2xl border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3.5 text-left">
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', borderColor: 'var(--accent)', boxShadow: '0 4px 18px var(--accent-glow)' }}>
                <Radio className="text-white" size={20} />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-black animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              </div>
              <div><div className="flex items-center gap-2"><h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">Radio Satelital</h1><span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase border" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', borderColor: 'var(--accent-glow)' }}>Live</span></div><p className="text-[11px] text-zinc-400 hidden sm:block">Radio mundial, simple y en directo</p></div>
            </button>

            <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1" aria-label="Navegación principal">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-white/[0.07]">Inicio</button>
              <button onClick={() => document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth' })} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-white/[0.07]">Radios</button>
              <button onClick={toggleFavorites} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-white/[0.07]">Favoritos</button>
            </nav>

            <div className="flex items-center gap-2">
              <button type="button" onClick={playRandomStation} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08]"><Shuffle size={14} style={{ color: 'var(--accent)' }} /><span className="hidden md:inline">Sorpréndeme</span></button>
              <button type="button" onClick={toggleFavorites} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border bg-white/[0.05] border-white/[0.08]" style={onlyFavs ? { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', borderColor: 'var(--accent-glow)' } : undefined}><Heart size={14} fill={onlyFavs ? 'currentColor' : 'none'} /><span className="hidden sm:inline">Favoritas</span></button>
              <button type="button" onClick={() => setMenuOpen(true)} className="inline-flex items-center p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08]" aria-label="Abrir ajustes"><Sliders size={15} /><span className="hidden sm:inline ml-1.5">Ajustes</span></button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10 pb-36">
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-6 sm:p-9 mb-6 shadow-2xl">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-20" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--accent)', borderColor: 'var(--accent-glow)', backgroundColor: 'var(--accent-subtle)' }}><span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} /> Transmisiones en vivo</div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">Tu mundo de radio,<br/><span style={{ color: 'var(--accent)' }}>en un solo lugar.</span></h2>
              <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">Descubre emisoras de Perú y del mundo. Busca por radio, ciudad, país o género y sigue escuchando mientras exploras el catálogo.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => document.getElementById('station-list')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black transition-transform hover:scale-[1.02]" style={{ backgroundColor: 'var(--accent)' }}><Headphones size={17}/> Explorar radios</button>
                <button onClick={playRandomStation} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1]"><Sparkles size={17}/> Radio al azar</button>
              </div>
            </div>
            <div className="relative mt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-xl">
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3"><Radio size={15} className="text-zinc-400 mb-2"/><strong className="block text-xl text-white">{stations.length}</strong><span className="text-[11px] text-zinc-500">emisoras</span></div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3"><Globe2 size={15} className="text-zinc-400 mb-2"/><strong className="block text-xl text-white">{countriesCount}</strong><span className="text-[11px] text-zinc-500">países</span></div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3"><MapPin size={15} className="text-zinc-400 mb-2"/><strong className="block text-xl text-white">{regionsCount}</strong><span className="text-[11px] text-zinc-500">regiones</span></div>
            </div>
          </section>

          <section className="mb-6" aria-label="Accesos rápidos">
            <div className="flex items-end justify-between mb-3"><div><p className="text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--accent)' }}>Descubre</p><h3 className="text-xl font-extrabold text-white">Explora a tu manera</h3></div><button onClick={resetAllFilters} className="text-xs text-zinc-500 hover:text-zinc-200">Ver todas</button></div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button onClick={() => chooseCountry('Perú')} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-semibold">🇵🇪 Perú</button>
              <button onClick={() => { filters.setCountry('Perú'); filters.setRegion('Cajamarca'); }} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-semibold"><MapPin size={15}/> Cajamarca</button>
              <button onClick={() => chooseGenre('cumbia')} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-semibold"><Music2 size={15}/> Cumbia</button>
              <button onClick={() => chooseGenre('noticias')} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-semibold"><Newspaper size={15}/> Noticias</button>
              <button onClick={() => chooseGenre('rock')} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-semibold">🎸 Rock</button>
              <button onClick={() => chooseGenre('romántica')} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-sm font-semibold">♥ Romántica</button>
            </div>
          </section>

          <Filters setQuery={setQuery} searchQuery={searchQuery} filters={filters} toggleOnlyFavs={toggleOnlyFavs} onlyFavs={onlyFavs} onPlayRandom={playRandomStation} currentStation={currentStation} onPlayStation={playStation} stations={stations} />

          {error && <div className="p-4 mb-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-3"><AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5"/><div><p className="font-bold text-sm text-red-100">{error}</p><p className="text-xs text-red-300 mt-0.5">La transmisión no respondió. Prueba de nuevo o sintoniza otra emisora.</p></div></div>}

          <StationGrid stations={stations} recentStations={recentStations} playStation={playStation} toggleFavorite={toggleFavorite} />
        </main>

        <Player currentStation={currentStation} onNextStation={nextStation} onPrevStation={prevStation} stations={stations} onPlayStation={playStation} visible={true} />
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} loading={loading} error={error} stationsCount={stations.length} setQuery={setQuery} filters={filters} toggleOnlyFavs={toggleOnlyFavs} onResetFilters={resetAllFilters} />
      </div>
    </>
  )
}
