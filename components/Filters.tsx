"use client"
import React, { useState } from 'react'
import { Heart, Search } from 'lucide-react'

type Props = {
  setQuery: (value: string) => void
  filters: {
    countries: string[]
    regions: string[]
    setCountry: (value: string) => void
    setRegion: (value: string) => void
  }
  toggleOnlyFavs: (value: boolean) => void
}

export default function Filters({ setQuery, filters, toggleOnlyFavs }: Props){
  const [q, setQ] = useState('')

  return (
    <div className="glass-panel filters rounded-xl shadow-sm hover:shadow-md transition-all duration-200" id="filters-panel">
      <div className="panel-head">
        <h3>Filtros</h3>
      </div>
      <div className="filter-row">
        <div className="form-group">
          <div className="input-icon-wrap">
            <Search size={16} strokeWidth={2.2} className="input-leading-icon" aria-hidden="true" />
            <input id="station-search" className="input-dark search-input input-with-icon" placeholder="Buscar emisora" value={q} onChange={(e)=>{setQ(e.target.value); setQuery(e.target.value)}} />
          </div>
        </div>
        <div className="form-group">
          <select id="country-filter" className="input-dark" onChange={(e)=>filters.setCountry(e.target.value)}>
        <option value="">Todos los países</option>
        {filters.countries.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <select id="region-filter" className="input-dark" onChange={(e)=>filters.setRegion(e.target.value)}>
        <option value="">Todas las regiones</option>
        {filters.regions.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <label className="switch-label">
        <input type="checkbox" id="favoritesToggle" onChange={(e)=>toggleOnlyFavs(e.target.checked)} />
        <Heart size={16} strokeWidth={2.2} />
        Prioridad Favoritos
      </label>
    </div>
  )
}
