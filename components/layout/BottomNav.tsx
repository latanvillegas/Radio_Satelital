"use client"
import React from 'react'
import { Globe, Heart, Music2, Radio } from 'lucide-react'

type Props = {
  onMusic: () => void
  onFavorites: () => void
  onCountry: () => void
  onMyRadios: () => void
  favoritesActive?: boolean
}

export default function BottomNav({ onMusic, onFavorites, onCountry, onMyRadios, favoritesActive }: Props) {
  return (
    <nav className="bottom-nav rounded-xl shadow-sm hover:shadow-md transition-all duration-200" aria-label="Navegación inferior">
      <button className="bottom-nav-item" onClick={onMusic} aria-label="Música">
        <Music2 size={20} strokeWidth={2.2} />
        <span>Música</span>
      </button>
      <button className={`bottom-nav-item ${favoritesActive ? 'active' : ''}`} onClick={onFavorites} aria-label="Favoritos">
        <Heart size={20} strokeWidth={2.2} fill={favoritesActive ? '#6200EE' : 'none'} />
        <span>Favoritos</span>
      </button>
      <button className="bottom-nav-item" onClick={onCountry} aria-label="País">
        <Globe size={20} strokeWidth={2.2} />
        <span>País</span>
      </button>
      <button className="bottom-nav-item" onClick={onMyRadios} aria-label="Mis radios">
        <Radio size={20} strokeWidth={2.2} />
        <span>Mis radios</span>
      </button>
    </nav>
  )
}