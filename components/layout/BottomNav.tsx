"use client"
import React from 'react'
import { Heart, Home, Radio, Search, Sliders } from 'lucide-react'

type Props = {
  onHome: () => void
  onRadio: () => void
  onFavorites: () => void
  onSearch: () => void
  favoritesActive?: boolean
  placement?: 'top' | 'bottom'
}

export default function BottomNav({
  onHome,
  onRadio,
  onFavorites,
  onSearch,
  favoritesActive,
  placement = 'bottom',
}: Props) {
  if (placement === 'top') {
    // Modo integrado para encabezado
    return (
      <nav className="flex items-center gap-1.5 p-1 bg-zinc-900/60 border border-white/[0.08] rounded-xl backdrop-blur-md" aria-label="Navegación rápida">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          onClick={onHome}
        >
          <Home size={14} />
          <span>Inicio</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          onClick={onRadio}
        >
          <Radio size={14} />
          <span>Frecuencias</span>
        </button>

        <button
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            favoritesActive
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-bold'
              : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
          }`}
          onClick={onFavorites}
        >
          <Heart size={14} fill={favoritesActive ? 'currentColor' : 'none'} />
          <span>Favoritas</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          onClick={onSearch}
        >
          <Search size={14} />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </nav>
    )
  }

  // Modo inferior clásico si se requiere
  return (
    <nav className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 bg-zinc-950/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md" aria-label="Navegación inferior">
      <button
        type="button"
        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        onClick={onHome}
        aria-label="Inicio"
      >
        <Home size={18} />
      </button>
      <button
        type="button"
        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        onClick={onRadio}
        aria-label="Frecuencias"
      >
        <Radio size={18} />
      </button>
      <button
        type="button"
        className={`p-2 rounded-xl transition-colors ${
          favoritesActive ? 'text-red-400 bg-red-500/15' : 'text-zinc-400 hover:text-white hover:bg-white/10'
        }`}
        onClick={onFavorites}
        aria-label="Favoritas"
      >
        <Heart size={18} fill={favoritesActive ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        onClick={onSearch}
        aria-label="Buscar"
      >
        <Search size={18} />
      </button>
    </nav>
  )
}
