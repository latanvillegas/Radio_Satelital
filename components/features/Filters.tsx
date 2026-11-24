"use client"

import React, { useEffect, useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, Shuffle } from 'lucide-react'
import type { ExposedFilters } from '@/hooks/stations/useStations'
import { countryName } from '@/lib/services/radio-browser'

let countryOptions: { code: string; name: string }[] | undefined
function remoteCountries() {
  return countryOptions ??= 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ').map(code => ({ code, name: countryName(code) })).sort((a,b) => a.name.localeCompare(b.name, 'es'))
}

interface Props {
  setQuery: (value: string) => void
  searchQuery?: string
  filters: ExposedFilters
  onPlayRandom?: () => void
  remote?: boolean
}

export default function Filters({
  setQuery,
  searchQuery = '',
  filters,
  onPlayRandom,
  remote = false,
}: Props) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || document.querySelector('[role="dialog"][aria-modal="true"]')) return
      const tag = document.activeElement?.tagName || ''
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)
      ) {
        e.preventDefault()
        document.getElementById('station-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleChange = (value: string) => {
    setLocalQuery(value)
    setQuery(value)
  }

  const activeCount = [
    filters.activeCountry,
    filters.activeRegion,
    filters.activeGenre,
  ].filter(Boolean).length

  return (
    <div id="filters-panel" className="broadcast-search mb-4">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        <div className="relative flex-1 min-w-0 basis-[220px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          />
          <input
            id="station-search"
            type="search"
            value={localQuery}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={remote ? 'Buscar por nombre en Radio Browser…' : 'Busca una emisora, ciudad o género…'}
            aria-label="Buscar emisoras por nombre, ciudad, país o género"
            className="w-full h-12 rounded-xl bg-input border border-line pl-11 pr-11 text-base text-ink placeholder:text-ink-muted outline-none focus:border-accent transition-colors"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => handleChange('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] grid place-items-center rounded-lg text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="advanced-filters-drawer"
            className="h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-surface border border-line hover:border-line-strong text-sm font-semibold text-ink transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal size={16} />
            <span>Filtros</span>
            {activeCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 grid place-items-center rounded-md text-[11px] font-mono font-bold tabular-nums bg-accent text-accent-fg">
                {activeCount}
              </span>
            )}
            <ChevronDown
              size={15}
              className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {onPlayRandom && (
            <button
              type="button"
              onClick={onPlayRandom}
              className="h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-surface border border-line hover:border-line-strong text-sm font-semibold text-ink transition-colors whitespace-nowrap shrink-0"
              aria-label="Sintonizar una emisora aleatoria"
            >
              <Shuffle size={16} className="text-accent" />
              <span className="hidden md:inline">Aleatoria</span>
            </button>
          )}
        </div>
      </div>

      {open && remote ? (
        <div id="advanced-filters-drawer" className="mt-2.5 p-3.5 rounded-xl bg-surface border border-line grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1 text-xs text-ink-secondary">País (Radio Browser)
            <select aria-label="País Radio Browser" value={filters.activeCountry || ''} onChange={e => filters.setCountry(e.target.value)} className="h-11 rounded-lg bg-input border border-line px-3 text-sm text-ink">
              <option value="">Todos los países</option>
              {remoteCountries().map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-secondary">Género o etiqueta
            <input aria-label="Género Radio Browser" type="search" value={filters.activeGenre || ''} onChange={e => filters.setGenre(e.target.value)} placeholder="rock, jazz, cumbia…" maxLength={80} className="h-11 rounded-lg bg-input border border-line px-3 text-sm text-ink" />
          </label>
        </div>
      ) : open && (
        <div
          id="advanced-filters-drawer"
          className="mt-2.5 p-3.5 rounded-xl bg-surface border border-line grid grid-cols-1 sm:grid-cols-3 gap-2.5"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-muted px-1">País</span>
            <select
              value={filters.activeCountry || ''}
              onChange={(e) => filters.setCountry(e.target.value)}
              className="h-11 rounded-lg bg-input border border-line px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Todos los países</option>
              {filters.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-muted px-1">Región o ciudad</span>
            <select
              value={filters.activeRegion || ''}
              onChange={(e) => filters.setRegion(e.target.value)}
              className="h-11 rounded-lg bg-input border border-line px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Todas las regiones</option>
              {filters.regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-muted px-1">Género</span>
            <select
              value={filters.activeGenre || ''}
              onChange={(e) => filters.setGenre(e.target.value)}
              className="h-11 rounded-lg bg-input border border-line px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Todos los géneros</option>
              {filters.genres.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  )
}
