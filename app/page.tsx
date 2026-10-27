"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import ThemeInitializer from '@/components/common/ThemeInitializer'
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration'
import Player from '@/components/layout/Player'
import StationGrid from '@/components/features/StationGrid'
import SideMenu from '@/components/layout/SideMenu'
import Filters from '@/components/features/Filters'
import { useStations } from '@/hooks/stations'
import { Sliders, Shuffle, Heart, AlertCircle, MapPin, Music2, Newspaper, Globe2, RadioTower, Headphones } from 'lucide-react'

export default function Page() {
  const { stations, recentStations, currentStation, playStation, nextStation, prevStation, playRandomStation, toggleFavorite, setQuery, searchQuery, filters, toggleOnlyFavs, onlyFavs, loading, error } = useStations()
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleFavorites = () => toggleOnlyFavs(!onlyFavs)
  const resetAllFilters = () => { setQuery(''); filters.setCountry(''); filters.setRegion(''); filters.setGenre(''); toggleOnlyFavs(false) }
  const scrollToRadios = () => setTimeout(() => document.getElementById('station-list')?.scrollIntoView({ behavior:'smooth', block:'start' }), 50)
  const chooseCountry = (country:string) => { setQuery(''); filters.setCountry(country); filters.setRegion(''); filters.setGenre(''); toggleOnlyFavs(false); scrollToRadios() }
  const chooseRegion = (country:string, region:string) => { setQuery(''); filters.setCountry(country); filters.setRegion(region); filters.setGenre(''); toggleOnlyFavs(false); scrollToRadios() }
  const chooseGenre = (genre:string) => { setQuery(''); filters.setCountry(''); filters.setRegion(''); filters.setGenre(genre); toggleOnlyFavs(false); scrollToRadios() }
  const chip = 'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold'

  const featured = stations.filter(s => /rpp|cheverisima|moda/i.test(s.name)).slice(0, 3)
  const recommended = featured.length ? featured : stations.slice(0,3)

  return <><ThemeInitializer/><ServiceWorkerRegistration/><div className="min-h-screen bg-black text-zinc-100 selection:bg-[var(--accent)] selection:text-black">
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/[0.08]"><div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
      <button type="button" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} className="flex items-center gap-3 min-w-0 text-left"><div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]"><Image src="/icon-192.png" alt="Radio Satelital" fill sizes="40px" className="object-cover" priority/></div><div className="min-w-0"><span className="block font-extrabold tracking-tight text-white truncate">Radio Satelital</span><p className="hidden sm:block text-[11px] text-zinc-500">Emisoras en vivo de Perú y el mundo</p></div></button>
      <nav className="hidden lg:flex gap-5 text-sm font-semibold text-zinc-400" aria-label="Navegación principal">
        <a href="#inicio" className="hover:text-white">Inicio</a>
        <a href="#explorar" className="hover:text-white">Explorar</a>
        <a href="#station-list" className="hover:text-white">Emisoras</a>
      </nav><div className="flex items-center gap-2"><button onClick={playRandomStation} className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08]"><Shuffle size={14}/> Aleatoria</button><button onClick={toggleFavorites} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.05]" style={onlyFavs?{color:'var(--accent)',borderColor:'var(--accent-glow)',backgroundColor:'var(--accent-subtle)'}:undefined}><Heart size={15} fill={onlyFavs?'currentColor':'none'}/><span className="hidden sm:inline">Favoritas</span></button><button onClick={() => setMenuOpen(true)} className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08]" aria-label="Abrir herramientas y ajustes"><Sliders size={15}/></button></div>
    </div></header>
    <main id="inicio" className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-56 sm:pb-48">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-[#111c20] to-[#063b33] p-5 sm:p-8 lg:p-10 mb-8">
        <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-6 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] mb-3" style={{color:'var(--accent)'}}>Tu señal, tu ritmo</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">La radio que te conecta con el mundo.</h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base text-zinc-300">Emisoras de Perú y el mundo, noticias y música en directo. Elige qué escuchar en segundos.</p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              <a href="#explorar" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-black" style={{background:'var(--accent)'}}><RadioTower size={16}/> Explorar emisoras</a>
              <button type="button" onClick={playRandomStation} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/[.08] text-sm font-bold text-white hover:bg-white/[.15]"><Shuffle size={16}/> Sorpréndeme</button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-300 mb-3"><Headphones size={16} style={{color:'var(--accent)'}}/> Empieza a escuchar</h2>
            {recommended.map(s => <button key={s.name + s.url} type="button" onClick={() => playStation(s)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/[.09] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
              <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0 bg-white/[.09]"><Music2 size={18} style={{color:'var(--accent)'}}/></span>
              <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{s.name}</strong><span className="block truncate text-xs text-zinc-400">{s.region || s.country}</span></span>
              <span className="text-xs font-bold" style={{color:'var(--accent)'}}>PLAY</span>
            </button>)}
          </div>
        </div>
      </section>
      <section id="explorar" className="mb-5 scroll-mt-24"><div className="max-w-3xl mb-4"><p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{color:'var(--accent)'}}>Radio en directo</p><h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Encuentra tu emisora</h2><p className="mt-1 text-sm text-zinc-500">Encuentra tu emisora por nombre, ciudad, país o género.</p></div><Filters setQuery={setQuery} searchQuery={searchQuery} filters={filters} toggleOnlyFavs={toggleOnlyFavs} onlyFavs={onlyFavs} onPlayRandom={playRandomStation} currentStation={currentStation} onPlayStation={playStation} stations={stations}/></section>
      <section className="mb-6" aria-label="Categorías rápidas"><div className="flex items-center justify-between gap-3 mb-2.5"><h3 className="text-sm font-bold text-zinc-200">Explorar</h3><button onClick={resetAllFilters} className="text-xs font-medium text-zinc-600 hover:text-white">Mostrar todas</button></div><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"><button onClick={() => chooseCountry('Perú')} className={chip}><Globe2 size={13}/> Perú</button><button onClick={() => chooseRegion('Perú','Cajamarca')} className={chip}><MapPin size={13}/> Cajamarca</button><button onClick={() => chooseGenre('cumbia')} className={chip}><Music2 size={13}/> Cumbia</button><button onClick={() => chooseGenre('noticias')} className={chip}><Newspaper size={13}/> Noticias</button><button onClick={() => chooseGenre('rock')} className={chip}>Rock</button></div></section>
      {error && <div className="p-3.5 mb-5 rounded-xl bg-red-950/30 border border-red-900/60 text-red-200 flex items-start gap-3"><AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5"/><div><p className="font-semibold text-sm">No se pudo reproducir la transmisión.</p><p className="text-xs text-red-300/80 mt-0.5">Prueba de nuevo o elige otra emisora.</p></div></div>}
      <StationGrid stations={stations} recentStations={recentStations} playStation={playStation} toggleFavorite={toggleFavorite}/>
    </main>
    <Player currentStation={currentStation} onNextStation={nextStation} onPrevStation={prevStation} stations={stations} onPlayStation={playStation} visible={true}/><SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} loading={loading} error={error} stationsCount={stations.length} setQuery={setQuery} filters={filters} toggleOnlyFavs={toggleOnlyFavs} onResetFilters={resetAllFilters}/>
  </div></>
}
