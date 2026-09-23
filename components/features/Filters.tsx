"use client"
import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  X,
  Globe,
  MapPin,
  Music,
  Circle,
  BookmarkPlus,
} from 'lucide-react'
import type { Station } from '@/types/station'
import {
  subscribeRecorder,
  type RecorderState,
  getRecorderState,
  startRecording,
  stopRecording,
  downloadRecording,
} from '@/lib/services/recorder'
import {
  setQuickPreset,
  clearQuickPreset,
  subscribeQuickPresets,
  initQuickPresets,
} from '@/lib/services/quick-presets'

type Props = {
  setQuery: (value: string) => void
  searchQuery?: string
  filters: {
    countries: string[]
    regions: string[]
    genres: string[]
    setCountry: (value: string) => void
    setRegion: (value: string) => void
    setGenre: (value: string) => void
    activeCountry?: string
    activeRegion?: string
    activeGenre?: string
  }
  toggleOnlyFavs: (value: boolean) => void
  onlyFavs?: boolean
  onPlayRandom?: () => void
  currentStation?: Station | null
  onPlayStation?: (station: Station) => void
  stations?: Station[]
}

export default function Filters({
  setQuery,
  searchQuery = '',
  filters,
  toggleOnlyFavs,
  onlyFavs = false,
  onPlayRandom,
  currentStation = null,
  onPlayStation,
  stations = [],
}: Props) {
  const [q, setQ] = useState(searchQuery)
  const [recorderState, setRecorderState] = useState<RecorderState>(getRecorderState())
  const [presets, setPresets] = useState<(Station | null)[]>([])
  const [isPresetsOpen, setIsPresetsOpen] = useState(false)
  const [statusNotification, setStatusNotification] = useState<string | null>(null)
  const presetsRef = useRef<HTMLDivElement>(null)

  const showNotification = (msg: string) => {
    setStatusNotification(msg)
    setTimeout(() => {
      setStatusNotification((curr) => (curr === msg ? null : curr))
    }, 2800)
  }

  // Suscripción a la grabadora de audio
  useEffect(() => {
    return subscribeRecorder((state) => {
      setRecorderState({ ...state })
    })
  }, [])

  // Inicializar y suscribirse a Presets 1 a 6
  useEffect(() => {
    if (stations.length > 0) {
      initQuickPresets(stations.slice(0, 6))
    }
    return subscribeQuickPresets((updated) => {
      setPresets([...updated])
    })
  }, [stations])

  // Cerrar popover de presets al hacer clic fuera
  useEffect(() => {
    if (!isPresetsOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPresetsOpen])

  useEffect(() => {
    setQ(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        document.getElementById('station-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleQueryChange = (val: string) => {
    setQ(val)
    setQuery(val)
  }

  const clearSearch = () => {
    setQ('')
    setQuery('')
  }

  const handleToggleRecord = () => {
    if (recorderState.isRecording) {
      const blob = stopRecording()
      if (blob) {
        downloadRecording(blob)
        showNotification('Grabación guardada y descargada')
      }
    } else {
      if (!currentStation) {
        showNotification('Sintoniza una emisora para iniciar la grabación')
        return
      }
      const success = startRecording(currentStation.name)
      if (success) {
        showNotification(`Grabando en vivo: ${currentStation.name}`)
      } else {
        showNotification(recorderState.error || 'Error al iniciar la grabación')
      }
    }
  }

  const recMins = Math.floor(recorderState.durationSeconds / 60)
    .toString()
    .padStart(2, '0')
  const recSecs = (recorderState.durationSeconds % 60).toString().padStart(2, '0')

  return (
    <div
      className="bg-black border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl mb-6 space-y-4 relative"
      id="filters-panel"
    >
      {/* Toast informativo local si hay acción de preset o grabación */}
      {statusNotification && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/20 text-white text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Fila superior: Título de sección y Botones reubicados: Grabar (lime) y Presets 1-6 (cyan) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            Explorar Frecuencias
          </h3>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md">
            Atajo: <kbd className="font-mono text-zinc-200 font-bold bg-white/10 px-1 rounded">/</kbd>
          </span>
        </div>

        {/* Acciones reubicadas: [Grabar] (círculo verde) y [Presets 1-6] (círculo cian) */}
        <div className="flex items-center gap-2">
          {/* Botón Grabar / REC en vivo (Reubicado desde el reproductor inferior) */}
          {recorderState.isRecording ? (
            <button
              type="button"
              onClick={handleToggleRecord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold animate-pulse shadow-sm cursor-pointer transition-all"
              title="Grabación activa - Haz clic para detener y descargar audio"
            >
              <Circle size={10} className="fill-red-500 text-red-500" />
              <span>REC {recMins}:{recSecs}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleRecord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-zinc-200 border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Grabar audio en vivo de la emisora activa"
            >
              <Circle size={10} className="fill-red-500 text-red-500" />
              <span>Grabar</span>
            </button>
          )}

          {/* Botón Presets Dial Rápido (1 a 6) con Popover (Reubicado desde el reproductor inferior) */}
          <div className="relative" ref={presetsRef}>
            <button
              type="button"
              onClick={() => setIsPresetsOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isPresetsOpen
                  ? 'bg-white/10 text-white border-white/20 shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border-white/[0.08] hover:scale-[1.02]'
              }`}
              title="Presets de Dial Rápido (Teclas 1 al 6)"
              aria-label="Presets rápidos"
            >
              <BookmarkPlus size={13} className="text-amber-400" />
              <span>Presets</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/[0.08] text-zinc-400">1-6</span>
            </button>

            {/* Popover desplegable hacia abajo anclado al botón */}
            {isPresetsOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-zinc-950/95 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                      Dial Presets (1 - 6)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Teclas 1-6</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 6 }).map((_, index) => {
                    const slotStation = presets[index]
                    const isCurrent = currentStation && slotStation && currentStation.name === slotStation.name

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (slotStation && onPlayStation) {
                            onPlayStation(slotStation)
                            setIsPresetsOpen(false)
                          } else if (currentStation) {
                            setQuickPreset(index, currentStation)
                            showNotification(`Preset ${index + 1} guardado: ${currentStation.name}`)
                          }
                        }}
                        className={`relative group rounded-xl p-2 border text-left cursor-pointer transition-all select-none flex flex-col justify-between min-h-[54px] ${
                          isCurrent
                            ? 'shadow-md'
                            : slotStation
                            ? 'bg-zinc-900/80 border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20'
                            : 'bg-zinc-900/40 border-dashed border-white/[0.08] hover:bg-white/[0.04]'
                        }`}
                        style={
                          isCurrent
                            ? {
                                backgroundColor: 'var(--accent-subtle)',
                                borderColor: 'var(--accent-glow)',
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                            style={
                              isCurrent
                                ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                                : { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#a1a1aa' }
                            }
                          >
                            {index + 1}
                          </span>
                          {slotStation ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                clearQuickPreset(index)
                                showNotification(`Preset ${index + 1} eliminado`)
                              }}
                              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-0.5 transition-opacity"
                              title="Borrar preset"
                            >
                              <X size={12} />
                            </button>
                          ) : currentStation ? (
                            <BookmarkPlus size={12} className="text-zinc-500 group-hover:text-amber-400" />
                          ) : null}
                        </div>

                        {slotStation ? (
                          <div className="mt-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-100 truncate leading-tight">
                              {slotStation.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                              {slotStation.country || 'En vivo'}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <p className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300">
                              + Asignar
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila intermedia: Buscador y Selectores de País y Región */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Campo de búsqueda */}
        <div className="md:col-span-6 relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            id="station-search"
            type="text"
            className="w-full bg-zinc-950/80 border border-white/[0.1] rounded-xl pl-10 pr-9 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
            placeholder="Buscar por emisora, país, ciudad o género..."
            value={q}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
          {q && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filtro de País */}
        <div className="md:col-span-3 relative">
          <Globe
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <select
            id="country-filter"
            className="w-full appearance-none bg-zinc-950/80 border border-white/[0.1] rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 cursor-pointer transition-colors"
            value={filters.activeCountry || ''}
            onChange={(e) => filters.setCountry(e.target.value)}
          >
            <option value="" className="bg-zinc-950 text-zinc-100">
              Todos los países ({filters.countries.length})
            </option>
            {filters.countries.map((c) => (
              <option key={c} value={c} className="bg-zinc-950 text-zinc-100">
                {c}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs">
            ▼
          </div>
        </div>

        {/* Filtro de Región */}
        <div className="md:col-span-3 relative">
          <MapPin
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <select
            id="region-filter"
            className="w-full appearance-none bg-zinc-950/80 border border-white/[0.1] rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 cursor-pointer transition-colors"
            value={filters.activeRegion || ''}
            onChange={(e) => filters.setRegion(e.target.value)}
          >
            <option value="" className="bg-zinc-950 text-zinc-100">
              Todas las regiones
            </option>
            {filters.regions.map((r) => (
              <option key={r} value={r} className="bg-zinc-950 text-zinc-100">
                {r}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Píldoras de Género Musical con carrusel horizontal suave */}
      {filters.genres.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pr-2 flex-shrink-0">
              <Music size={12} style={{ color: 'var(--accent)' }} />
              <span>Género:</span>
            </div>

            <button
              type="button"
              onClick={() => filters.setGenre('')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                !filters.activeGenre
                  ? 'text-white font-semibold'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
              style={
                !filters.activeGenre
                  ? {
                      backgroundColor: 'var(--accent)',
                      boxShadow: '0 2px 10px var(--accent-glow)',
                    }
                  : undefined
              }
            >
              Todos
            </button>

            {filters.genres.map((g) => {
              const isActive = filters.activeGenre === g
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => filters.setGenre(isActive ? '' : g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--accent)',
                          boxShadow: '0 2px 10px var(--accent-glow)',
                        }
                      : undefined
                  }
                >
                  {g}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
