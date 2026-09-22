"use client"
import React, { useEffect, useState } from 'react'
import {
  getAvailableThemes,
  getTheme,
  getUiScaleMode,
  setTheme,
  setUiScaleMode,
  type ThemeName,
  type UiScaleMode,
} from '@/lib/utils/theme'
import { X, Sliders, Palette, Monitor, Radio, RotateCcw, ShieldCheck, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  open: boolean
  onClose: () => void
  loading: boolean
  error: string | null
  stationsCount: number
  setQuery: (value: string) => void
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
  onResetFilters: () => void
}

const scaleOptions: Array<{ key: UiScaleMode; label: string; hint: string }> = [
  { key: 'auto', label: 'Automático', hint: 'Adaptable al dispositivo' },
  { key: 'small', label: 'Compacto', hint: 'Móviles y pantallas pequeñas' },
  { key: 'medium', label: 'Estándar', hint: 'Equilibrado (Recomendado)' },
  { key: 'large', label: 'Amplio', hint: 'Tablets y Laptops' },
  { key: 'xlarge', label: 'Grande', hint: 'Monitores de alta resolución' },
]

const themeLabels: Record<ThemeName, { label: string; color: string; desc: string }> = {
  amoled: { label: 'AMOLED Carmesí', color: '#ef4444', desc: 'Negro puro con acento carmesí de estudio' },
  gold: { label: 'AMOLED Gold Luxury', color: '#d4af37', desc: 'Negro puro con acento dorado y ámbar' },
  purple: { label: 'AMOLED Neon Purple', color: '#a855f7', desc: 'Negro puro con acento violeta neón' },
  white: { label: 'AMOLED Platinum Silver', color: '#ffffff', desc: 'Negro puro con acento plata y platino' },
  'wear-ocean': { label: 'AMOLED Deep Ocean', color: '#06b6d4', desc: 'Negro puro con acento cian turquesa' },
  'wear-sunset': { label: 'AMOLED Sunset Glow', color: '#f97316', desc: 'Negro puro con acento naranja atardecer' },
  'wear-galaxy': { label: 'AMOLED Galaxy Blue', color: '#3b82f6', desc: 'Negro puro con acento azul cósmico' },
  'wear-mint': { label: 'AMOLED Emerald Mint', color: '#10b981', desc: 'Negro puro con acento verde esmeralda' },
  'wear-cherry': { label: 'AMOLED Ruby Cherry', color: '#f43f5e', desc: 'Negro puro con acento rubí cereza' },
}

export default function SideMenu({
  open,
  onClose,
  loading,
  error,
  stationsCount,
  onResetFilters,
}: Props) {
  const themes = getAvailableThemes()
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('amoled')
  const [currentScaleMode, setCurrentScaleMode] = useState<UiScaleMode>('auto')

  useEffect(() => {
    setCurrentTheme(getTheme())
    setCurrentScaleMode(getUiScaleMode())
  }, [])

  const onSelectTheme = (name: ThemeName) => {
    setTheme(name)
    setCurrentTheme(name)
  }

  const onSelectScaleMode = (mode: UiScaleMode) => {
    setUiScaleMode(mode)
    setCurrentScaleMode(mode)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Fondo oscuro con desenfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel deslizante lateral */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="relative z-10 w-full max-w-md h-full bg-black border-l border-white/10 shadow-2xl flex flex-col text-zinc-100 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Panel de Ajustes"
          >
            {/* Cabecera del panel */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-zinc-950/80">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--accent-glow)',
                    color: 'var(--accent)',
                    borderWidth: 1,
                  }}
                >
                  <Sliders size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Ajustes del Sistema</h2>
                  <p className="text-xs text-zinc-400">Base AMOLED puro con acentos de color</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar ajustes"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
              {/* Telemetría y estado de red */}
              <section className="bg-zinc-950/90 rounded-xl border border-white/[0.08] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    <Radio size={14} className="text-red-400" />
                    <span>Transmisión Satelital</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En Vivo
                  </span>
                </div>

                <div className="text-sm text-zinc-300 mb-3">
                  {loading ? (
                    <span className="text-zinc-400 animate-pulse">Sintonizando frecuencias disponibles...</span>
                  ) : error ? (
                    <span className="text-red-400 font-medium">{error}</span>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="text-zinc-400">Catálogo global:</span>
                      <span className="font-bold text-white text-base">{stationsCount} emisoras listas</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onResetFilters}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 bg-white/[0.05] hover:bg-white/[0.1] hover:text-white border border-white/[0.08] transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Restablecer todos los filtros</span>
                </button>
              </section>

              {/* Selector de temas */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <Palette size={14} className="text-red-400" />
                  <span>Temas Visuales</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {themes.map((theme) => {
                    const info = themeLabels[theme] || { label: theme, color: '#fff', desc: '' }
                    const isSelected = currentTheme === theme

                    return (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => onSelectTheme(theme)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-white/[0.08] shadow-md ring-1'
                            : 'bg-zinc-950/80 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: info.color,
                                boxShadow: `0 4px 14px ${info.color}33`,
                              }
                            : undefined
                        }
                        aria-pressed={isSelected}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 border border-white/20 shadow-sm"
                          style={{ backgroundColor: info.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white font-bold' : 'text-zinc-300'}`}>
                            {info.label}
                          </p>
                        </div>
                        {isSelected && (
                          <span
                            className="w-2 h-2 rounded-full shadow-sm"
                            style={{ backgroundColor: info.color }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Escala de Interfaz */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <Monitor size={14} style={{ color: 'var(--accent)' }} />
                  <span>Escala de Interfaz</span>
                </div>

                <div className="space-y-1.5">
                  {scaleOptions.map((opt) => {
                    const isSelected = currentScaleMode === opt.key
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => onSelectScaleMode(opt.key)}
                        className={`w-full flex items-center justify-between p-2.5 px-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'text-white'
                            : 'bg-zinc-950/80 border-white/[0.06] text-zinc-300 hover:bg-white/[0.04]'
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: 'var(--accent-subtle)',
                                borderColor: 'var(--accent)',
                              }
                            : undefined
                        }
                        aria-pressed={isSelected}
                      >
                        <div>
                          <p className="text-xs font-semibold">{opt.label}</p>
                          <p className="text-[11px] text-zinc-400">{opt.hint}</p>
                        </div>
                        {isSelected && (
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: 'var(--accent-subtle)',
                              color: 'var(--accent)',
                              border: '1px solid var(--accent-glow)',
                            }}
                          >
                            Activo
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Audio & Rendimiento */}
              <section className="bg-zinc-900/40 rounded-xl border border-white/[0.06] p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <Zap size={14} className="text-red-400" />
                  <span>Optimizaciones de Streaming</span>
                </div>
                <div className="text-xs text-zinc-400 space-y-1.5">
                  <p className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Reconexión automática con mitigación de cortes.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Compresión de audio de baja latencia en tiempo real.</span>
                  </p>
                </div>
              </section>

              {/* Acerca de */}
              <div className="pt-2 text-center text-xs text-zinc-400">
                <p className="font-semibold text-zinc-300">Radio Satelital v2.5 Pro</p>
                <p className="mt-0.5">Sintonizador Web Global en Tiempo Real</p>
              </div>
            </div>

            {/* Pie del modal */}
            <div className="p-4 border-t border-white/[0.08] bg-zinc-900/60">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-red-600/20"
              >
                Listo
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
