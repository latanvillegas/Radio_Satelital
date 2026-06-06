"use client"
import React from 'react'
import { Heart, Home, Radio, Search } from 'lucide-react'

type Props = {
  onHome: () => void
  onRadio: () => void
  onFavorites: () => void
  onSearch: () => void
  favoritesActive?: boolean
  placement?: 'top' | 'bottom'
}

export default function BottomNav({ onHome, onRadio, onFavorites, onSearch, favoritesActive, placement = 'bottom' }: Props) {
  const navClassName = placement === 'top' ? 'bottom-nav bottom-nav-top rounded-xl shadow-sm hover:shadow-md transition-all duration-200' : 'bottom-nav rounded-xl shadow-sm hover:shadow-md transition-all duration-200'

  return (
    <nav className={navClassName} aria-label={placement === 'top' ? 'Navegación principal' : 'Navegación inferior'}>
      <button className="bottom-nav-item" onClick={onHome} aria-label="Inicio">
        <Home size={20} strokeWidth={2.2} />
        <span>Inicio</span>
      </button>
      <button className="bottom-nav-item" onClick={onRadio} aria-label="Radio">
        <Radio size={20} strokeWidth={2.2} />
        <span>Radio</span>
      </button>
      <button className={`bottom-nav-item ${favoritesActive ? 'active' : ''}`} onClick={onFavorites} aria-label="Favoritos">
        <Heart size={20} strokeWidth={2.2} fill={favoritesActive ? '#6200EE' : 'none'} />
        <span>Favoritos</span>
      </button>
      <button className="bottom-nav-item" onClick={onSearch} aria-label="Buscar">
        <Search size={20} strokeWidth={2.2} />
        <span>Buscar</span>
      </button>
    </nav>
  )
}