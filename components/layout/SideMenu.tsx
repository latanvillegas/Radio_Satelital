"use client"

import React, { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_THEME,
  THEME_TOKENS,
  getAvailableThemes,
  getTheme,
  getAppearance,
  getUiScaleMode,
  setTheme,
  setAppearance,
  setUiScaleMode,
  type ThemeName,
  type AppearanceMode,
  type UiScaleMode,
} from '@/lib/utils/theme'
import { useDialogFocusTrap } from '@/hooks/ui/useDialogFocusTrap'
import { usePWAInstall } from '@/hooks/pwa'
import {
  X,
  Sliders,
  Palette,
  Monitor,
  RotateCcw,
  Wifi,
  Check,
  Sun,
  Moon,
  Laptop,
  Download,
  Share,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  onResetFilters: () => void
}

const SCALES: ReadonlyArray<{ key: UiScaleMode; label: string }> = [
  { key: 'small', label: 'Compacto' },
  { key: 'medium', label: 'Estándar' },
  { key: 'large', label: 'Amplio' },
]

const APPEARANCE_OPTIONS: ReadonlyArray<{
  key: AppearanceMode
  label: string
  desc: string
  icon: typeof Moon
}> = [
  { key: 'dark', label: 'Oscuro Broadcast', desc: 'Alto contraste nocturno', icon: Moon },
  { key: 'light', label: 'Claro Exterior', desc: 'Legibilidad plena al sol', icon: Sun },
  { key: 'system', label: 'Automático', desc: 'Sincronizado con el sistema', icon: Laptop },
]

export default function SideMenu({ open, onClose, onResetFilters }: Props) {
  const themes = getAvailableThemes()
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(DEFAULT_THEME)
  const [appearance, setAppearanceState] = useState<AppearanceMode>('dark')
  const [scale, setScale] = useState<UiScaleMode>('auto')
  const asideRef = useRef<HTMLElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall()

  useDialogFocusTrap({
    open,
    onClose,
    containerRef: asideRef,
    initialFocusRef: closeBtnRef,
  })

  useEffect(() => {
    if (!open) return
    setCurrentTheme(getTheme())
    setAppearanceState(getAppearance())
    setScale(getUiScaleMode())
  }, [open])

  const effectiveScale = scale === 'auto' || scale === 'xlarge' ? 'medium' : scale

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--bg-scrim)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            ref={asideRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-drawer-title"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full sm:w-[400px] h-full bg-elevated border-l border-line shadow-2xl flex flex-col text-ink"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl grid place-items-center bg-accent-subtle border border-accent-glow text-accent">
                  <Sliders size={17} />
                </div>
                <div>
                  <h2 id="settings-drawer-title" className="text-base font-bold text-ink">
                    Ajustes de interfaz
                  </h2>
                  <p className="text-xs text-ink-muted">Apariencia, contraste y escala</p>
                </div>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar ajustes"
                className="min-w-[44px] min-h-[44px] rounded-xl grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
              >
                <X size={19} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Modo de apariencia */}
              <section aria-labelledby="settings-appearance-heading">
                <div className="flex items-center gap-2 mb-3">
                  <Sun size={14} className="text-accent" />
                  <h3
                    id="settings-appearance-heading"
                    className="text-xs font-bold text-ink-secondary"
                  >
                    Modo de apariencia
                  </h3>
                </div>
                <div className="grid gap-2">
                  {APPEARANCE_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const selected = appearance === option.key
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setAppearance(option.key)
                          setAppearanceState(option.key)
                        }}
                        aria-pressed={selected}
                        className={`flex items-center gap-3 p-3 min-h-[52px] rounded-xl border text-left transition-colors ${
                          selected
                            ? 'border-accent bg-accent-subtle text-ink'
                            : 'border-line bg-surface hover:bg-subtle text-ink'
                        }`}
                      >
                        <Icon
                          size={18}
                          className={selected ? 'text-accent shrink-0' : 'text-ink-muted shrink-0'}
                        />
                        <span className="flex-1 min-w-0">
                          <strong className="block text-sm font-semibold">{option.label}</strong>
                          <small className="block text-xs text-ink-muted">{option.desc}</small>
                        </span>
                        {selected && <Check size={16} className="text-accent shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Color de acento */}
              <section aria-labelledby="settings-accent-heading">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={14} className="text-accent" />
                  <h3
                    id="settings-accent-heading"
                    className="text-xs font-bold text-ink-secondary"
                  >
                    Color de acento
                  </h3>
                </div>
                <div className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap gap-3">
                    {themes.map((themeKey) => {
                      const token = THEME_TOKENS[themeKey]
                      const selected = currentTheme === themeKey
                      const isLightSwatch =
                        themeKey === 'white' || themeKey === 'gold' || themeKey === 'wear-mint'
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => {
                            setTheme(themeKey)
                            setCurrentTheme(themeKey)
                          }}
                          title={token.label}
                          aria-label={`Acento ${token.label}`}
                          aria-pressed={selected}
                          className="w-11 h-11 rounded-full grid place-items-center border-2 transition-transform active:scale-95"
                          style={{
                            backgroundColor: token.swatch,
                            borderColor: selected ? 'var(--text-primary)' : 'rgba(128,128,128,0.25)',
                            boxShadow: selected ? `0 0 0 3px ${token.accentGlow}` : 'none',
                          }}
                        >
                          {selected && (
                            <Check
                              size={16}
                              style={{ color: isLightSwatch ? '#09090b' : '#ffffff' }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-xs text-ink-muted">
                    Contraste automático adaptado para modo oscuro y exterior.
                  </p>
                </div>
              </section>

              {/* Escala tipográfica */}
              <section aria-labelledby="settings-scale-heading">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor size={14} className="text-accent" />
                  <h3 id="settings-scale-heading" className="text-xs font-bold text-ink-secondary">
                    Tamaño de interfaz
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-surface border border-line">
                  {SCALES.map((item) => {
                    const active = effectiveScale === item.key
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setUiScaleMode(item.key)
                          setScale(item.key)
                        }}
                        aria-pressed={active}
                        className={`min-h-[42px] rounded-lg text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-accent text-accent-fg shadow-sm'
                            : 'text-ink-secondary hover:text-ink hover:bg-subtle'
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Motor de audio */}
              <section aria-labelledby="settings-engine-heading">
                <div className="flex items-center gap-2 mb-3">
                  <Wifi size={14} className="text-accent" />
                  <h3
                    id="settings-engine-heading"
                    className="text-xs font-bold text-ink-secondary"
                  >
                    Motor de transmisión
                  </h3>
                </div>
                <div className="rounded-2xl border border-line bg-surface divide-y divide-line">
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">Reconexión exponencial</p>
                      <p className="text-xs text-ink-muted">
                        Recupera la señal automáticamente ante microcortes de red.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-accent shrink-0">Activa</span>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">Soporte HLS + DSP</p>
                      <p className="text-xs text-ink-muted">
                        Decodificación adaptativa .m3u8 y ecualización de 5 bandas.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-ink-secondary shrink-0">
                      5-Band
                    </span>
                  </div>
                </div>
              </section>

              {!isInstalled && canInstall && (
                <button
                  type="button"
                  onClick={() => void install()}
                  className="w-full min-h-[44px] rounded-xl flex items-center justify-center gap-2 text-xs font-bold bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
                >
                  <Download size={15} />
                  <span>Instalar aplicación en el dispositivo</span>
                </button>
              )}

              {!isInstalled && !canInstall && isIOS && (
                <div className="rounded-2xl border border-line bg-surface p-4 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setShowIosGuide((v) => !v)}
                    aria-expanded={showIosGuide}
                    className="w-full min-h-[40px] flex items-center justify-between gap-2 text-xs font-bold text-ink"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Share size={15} className="text-accent shrink-0" />
                      <span>Instalar en iPhone o iPad</span>
                    </span>
                    <span className="text-accent font-mono">
                      {showIosGuide ? 'Ocultar' : 'Pasos'}
                    </span>
                  </button>
                  {showIosGuide && (
                    <ol className="text-xs text-ink-secondary space-y-1.5 pl-4 list-decimal leading-relaxed">
                      <li>
                        Toca el botón <strong className="text-ink">Compartir</strong> en la barra de
                        Safari.
                      </li>
                      <li>
                        Elige <strong className="text-ink">Agregar a pantalla de inicio</strong> y
                        confirma.
                      </li>
                    </ol>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onResetFilters()
                  onClose()
                }}
                className="w-full min-h-[44px] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border border-line bg-surface hover:bg-subtle text-ink transition-colors"
              >
                <RotateCcw size={14} />
                <span>Restablecer búsqueda y filtros</span>
              </button>
            </div>

            <div className="sm:hidden p-4 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[48px] rounded-xl text-sm font-bold bg-accent text-accent-fg"
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
