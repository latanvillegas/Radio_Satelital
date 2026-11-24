"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sliders, Volume2, ShieldCheck, RotateCcw } from 'lucide-react'
import {
  DSP_PRESETS,
  type DspState,
  getDspState,
  subscribeDsp,
  setBandGain,
  setPreAmpGain,
  setCompressorEnabled,
  applyPreset,
  setDspEnabled,
} from '@/lib/services/audio-dsp'
import { activateCurrentAudioDsp } from '@/lib/services/player'
import { useDialogFocusTrap } from '@/hooks/ui/useDialogFocusTrap'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const BAND_LABELS = [
  { name: '60 Hz', role: 'Sub-graves' },
  { name: '250 Hz', role: 'Graves' },
  { name: '1 kHz', role: 'Medios' },
  { name: '4 kHz', role: 'Presencia' },
  { name: '14 kHz', role: 'Brillo' },
] as const

export default function EqualizerModal({ isOpen, onClose }: Props) {
  const [dspState, setDspState] = useState<DspState>(() => getDspState())
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  useDialogFocusTrap({
    open: isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeBtnRef,
  })

  useEffect(() => {
    if (!isOpen) return
    return subscribeDsp((state) => {
      setDspState({ ...state })
    })
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 cursor-pointer"
            style={{ backgroundColor: 'var(--bg-scrim)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl bg-elevated border border-line rounded-2xl shadow-2xl p-5 sm:p-7 flex flex-col text-ink max-h-[90dvh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="eq-dialog-title"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-line">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent text-accent-fg shadow-sm">
                  <Sliders size={20} />
                </div>
                <div className="min-w-0">
                  <h2 id="eq-dialog-title" className="text-base sm:text-lg font-bold text-ink truncate">
                    Ecualizador paramétrico de 5 bandas
                  </h2>
                  <p className="text-xs text-ink-secondary truncate">
                    {dspState.isWebAudioActive
                      ? 'Procesamiento DSP en tiempo real activo'
                      : 'Listo — se activa automáticamente en streams compatibles con CORS'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setDspEnabled(!dspState.enabled)}
                  aria-pressed={dspState.enabled}
                  className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold border transition-colors ${
                    dspState.enabled
                      ? 'bg-accent-subtle text-accent border-accent'
                      : 'bg-surface text-ink-muted border-line'
                  }`}
                >
                  {dspState.enabled ? 'DSP Activo' : 'Bypass'}
                </button>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] rounded-xl grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
                  aria-label="Cerrar ecualizador"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {!dspState.isWebAudioActive && (
              <button
                type="button"
                onClick={() => { activateCurrentAudioDsp() }}
                className="mt-3 min-h-[44px] rounded-xl border border-line text-sm font-semibold text-ink hover:bg-subtle"
              >
                Activar procesamiento DSP
              </button>
            )}
            {/* Selector de Presets */}
            <div className="my-5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-ink-secondary">
                  Curvas de referencia
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset('flat')}
                  className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-ink-secondary hover:text-ink hover:bg-subtle inline-flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Plano (0 dB)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DSP_PRESETS.map((preset) => {
                  const isActive = dspState.activePresetId === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      aria-pressed={isActive}
                      className={`text-left p-3 rounded-xl border transition-colors ${
                        isActive
                          ? 'bg-accent-subtle border-accent text-ink'
                          : 'bg-surface border-line text-ink hover:bg-subtle'
                      }`}
                    >
                      <span className="block font-bold text-xs text-ink">{preset.name}</span>
                      <span className="block text-[11px] text-ink-muted mt-0.5 line-clamp-1">
                        {preset.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Faders de 5 Bandas */}
            <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5 mb-5">
              <div className="grid grid-cols-5 gap-2 sm:gap-5 text-center">
                {BAND_LABELS.map((band, i) => {
                  const gain = dspState.bands[i] ?? 0
                  return (
                    <div key={band.name} className="flex flex-col items-center">
                      <span className="text-xs font-mono font-bold tabular-nums text-accent mb-2">
                        {gain > 0 ? `+${gain}` : gain} dB
                      </span>

                      <div className="h-44 sm:h-48 w-9 bg-input rounded-full p-1.5 flex flex-col items-center justify-between relative border border-line">
                        <span className="text-[9px] font-mono text-ink-muted select-none">+12</span>
                        <div className="w-full h-px bg-line" />
                        <span className="text-[9px] font-mono text-ink-muted select-none">0</span>
                        <div className="w-full h-px bg-line" />
                        <span className="text-[9px] font-mono text-ink-muted select-none">-12</span>

                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="1"
                          value={gain}
                          disabled={!dspState.enabled}
                          onChange={(e) => setBandGain(i, parseInt(e.target.value, 10))}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                          aria-label={`Ganancia en ${band.name} (${band.role})`}
                        />

                        <div
                          className="absolute w-6 h-6 rounded-full bg-accent border-2 border-elevated shadow-md pointer-events-none transition-all duration-75"
                          style={{
                            bottom: `${((gain + 12) / 24) * 76 + 12}%`,
                            transform: 'translateY(50%)',
                          }}
                        />
                      </div>

                      <span className="text-xs font-bold text-ink mt-3 whitespace-nowrap">
                        {band.name}
                      </span>
                      <span className="text-[11px] text-ink-muted whitespace-nowrap">
                        {band.role}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pre-Amp y Compresor Dinámico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Volume2 size={16} className="text-accent" />
                    <span className="text-xs font-bold text-ink">Pre-amplificador</span>
                  </div>
                  <span className="text-xs font-mono font-bold tabular-nums text-accent">
                    +{dspState.preAmp} dB
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mb-3">
                  Compensa emisoras con nivel de entrada bajo.
                </p>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={dspState.preAmp}
                  disabled={!dspState.enabled}
                  onChange={(e) => setPreAmpGain(parseInt(e.target.value, 10))}
                  aria-label="Ganancia del pre-amplificador en decibelios"
                  className="w-full h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-accent" />
                    <span className="text-xs font-bold text-ink">Compresor dinámico</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompressorEnabled(!dspState.compressor)}
                    disabled={!dspState.enabled}
                    aria-pressed={dspState.compressor}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40 ${
                      dspState.compressor && dspState.enabled
                        ? 'bg-accent text-accent-fg border-accent'
                        : 'bg-subtle text-ink-secondary border-line hover:text-ink'
                    }`}
                  >
                    {dspState.compressor ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
                <p className="text-xs text-ink-secondary">
                  Normaliza picos bruscos en locución y anuncios en directo (relación 4:1).
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
