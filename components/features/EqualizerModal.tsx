"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sliders, Volume2, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react'
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

type Props = {
  isOpen: boolean
  onClose: () => void
}

const BAND_LABELS = [
  { name: '60 Hz', role: 'Sub-Bass' },
  { name: '250 Hz', role: 'Graves' },
  { name: '1 kHz', role: 'Medios' },
  { name: '4 kHz', role: 'Presencia' },
  { name: '14 kHz', role: 'Brillo' },
]

export default function EqualizerModal({ isOpen, onClose }: Props) {
  const [dspState, setDspState] = useState<DspState>(getDspState())

  useEffect(() => {
    return subscribeDsp((state) => {
      setDspState({ ...state })
    })
  }, [])

  if (!isOpen) return null

  const handleReset = () => {
    applyPreset('flat')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col text-zinc-100 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Ecualizador de Estudio Broadcast"
        >
          {/* Cabecera del Ecualizador */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                <Sliders size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Ecualizador Paramétrico de Estudio</span>
                  <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    5-Band DSP
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Calibración de frecuencias y procesamiento de señal broadcast
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDspEnabled(!dspState.enabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dspState.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-white/10'
                }`}
                title={dspState.enabled ? 'DSP Activado' : 'Bypass (DSP Desactivado)'}
              >
                {dspState.enabled ? 'PROCESANDO' : 'BYPASS'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar ecualizador"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Selector de Presets de Estudio */}
          <div className="my-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>Presets de Monitoreo</span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Restablecer</span>
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
                    className={`text-left p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-red-500/15 border-red-500/50 text-white shadow-sm'
                        : 'bg-zinc-900/60 border-white/[0.06] text-zinc-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-zinc-100">{preset.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{preset.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Faders Verticales de las 5 Bandas */}
          <div className="bg-black/50 border border-white/[0.06] rounded-2xl p-5 mb-5">
            <div className="grid grid-cols-5 gap-3 sm:gap-6 text-center">
              {BAND_LABELS.map((band, i) => {
                const gain = dspState.bands[i] || 0
                return (
                  <div key={band.name} className="flex flex-col items-center">
                    <span className="text-xs font-mono font-bold text-red-400 mb-2">
                      {gain > 0 ? `+${gain}` : gain} dB
                    </span>

                    {/* Contenedor Fader Vertical */}
                    <div className="h-44 sm:h-52 w-8 bg-zinc-900 rounded-full p-1.5 flex flex-col items-center justify-between relative shadow-inner border border-white/[0.08]">
                      {/* Marcas de referencia de dB */}
                      <span className="text-[9px] font-mono text-zinc-600 select-none">+12</span>
                      <div className="w-full h-px bg-white/20" />
                      <span className="text-[9px] font-mono text-zinc-500 select-none">0</span>
                      <div className="w-full h-px bg-white/20" />
                      <span className="text-[9px] font-mono text-zinc-600 select-none">-12</span>

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
                        aria-label={`Banda ${band.name}`}
                      />

                      {/* Knob visual interactivo */}
                      <div
                        className="absolute w-6 h-6 rounded-full bg-gradient-to-b from-zinc-200 to-zinc-400 shadow-md border border-zinc-700 pointer-events-none transition-all"
                        style={{
                          bottom: `${((gain + 12) / 24) * (100 - 24) + 12}%`,
                          transform: 'translateY(50%)',
                        }}
                      />
                    </div>

                    <span className="text-xs font-bold text-zinc-200 mt-3">{band.name}</span>
                    <span className="text-[10px] text-zinc-500">{band.role}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Fila de Preamplificador y Compresor Dinámico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pre-amplificador de Ganancia Digital */}
            <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-zinc-200">Pre-Amp de Ganancia</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  +{dspState.preAmp} dB
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Realza transmisiones con volumen original bajo o dispar
              </p>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={dspState.preAmp}
                disabled={!dspState.enabled}
                onChange={(e) => setPreAmpGain(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Compresor Dinámico / Limitador Broadcast */}
            <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-red-400" />
                  <span className="text-xs font-bold text-zinc-200">Compresor Broadcast</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCompressorEnabled(!dspState.compressor)}
                  disabled={!dspState.enabled}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                    dspState.compressor && dspState.enabled
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-white/10'
                  }`}
                >
                  {dspState.compressor ? 'ACTIVO' : 'OFF'}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">
                Atenúa picos bruscos y normaliza la pegada acústica para una escucha pareja y nítida.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
