"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Circle,
  Square,
  Download,
  RotateCw,
  Clock,
  Activity,
  Wifi,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import type { Station } from '@/types/station'
import AudioVisualizer from '@/components/features/AudioVisualizer'
import {
  startRecording,
  stopRecording,
  downloadRecording,
  subscribeRecorder,
  type RecorderState,
  getRecorderState,
} from '@/lib/services/recorder'
import {
  getCurrentStreamTelemetry,
  resyncStream,
} from '@/lib/services/player'
import { getAnalyserData } from '@/lib/services/audio-dsp'

type Props = {
  isOpen: boolean
  onClose: () => void
  currentStation: Station | null
  isPlaying: boolean
  togglePlay: () => void
  onNextStation: () => void
  onPrevStation: () => void
  onOpenEq: () => void
}

export default function StudioDisplayModal({
  isOpen,
  onClose,
  currentStation,
  isPlaying,
  togglePlay,
  onNextStation,
  onPrevStation,
  onOpenEq,
}: Props) {
  const [localTime, setLocalTime] = useState('')
  const [utcTime, setUtcTime] = useState('')
  const [recorderState, setRecorderState] = useState<RecorderState>(getRecorderState())
  const [vuL, setVuL] = useState(0)
  const [vuR, setVuR] = useState(0)
  const [telemetry, setTelemetry] = useState(getCurrentStreamTelemetry())
  const [isResyncing, setIsResyncing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Reloj de estudio en tiempo real (Local y UTC)
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date()
      setLocalTime(now.toLocaleTimeString('es-ES', { hour12: false }))
      setUtcTime(
        now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }) + ' UTC'
      )
    }
    updateClocks()
    const timer = setInterval(updateClocks, 1000)
    return () => clearInterval(timer)
  }, [])

  // Suscripción al estado de la grabadora
  useEffect(() => {
    return subscribeRecorder((state) => {
      setRecorderState({ ...state })
    })
  }, [])

  // Actualización periódica de telemetría del stream
  useEffect(() => {
    if (!isOpen) return
    const update = () => setTelemetry(getCurrentStreamTelemetry())
    update()
    const interval = setInterval(update, 2000)
    return () => clearInterval(interval)
  }, [isOpen, currentStation, isPlaying])

  // Simulación y cálculo de Vúmetros estéreo L / R
  useEffect(() => {
    if (!isOpen) return
    let animId: number

    const updateVu = () => {
      if (isPlaying) {
        const realData = getAnalyserData()
        let avg = 0
        if (realData && realData.length > 0) {
          let sum = 0
          for (let i = 0; i < Math.min(32, realData.length); i++) {
            sum += realData[i]
          }
          avg = (sum / 32) / 255
        } else {
          // Movimiento armónico cuando el stream no expone FFT por CORS
          avg = 0.4 + Math.sin(Date.now() / 180) * 0.25 + Math.cos(Date.now() / 290) * 0.15
        }

        // Variación sutil estéreo entre canal izquierdo y derecho
        const l = Math.min(1, Math.max(0.05, avg * (0.9 + Math.sin(Date.now() / 220) * 0.15)))
        const r = Math.min(1, Math.max(0.05, avg * (0.9 + Math.cos(Date.now() / 250) * 0.15)))

        setVuL((prev) => prev + (l - prev) * 0.3)
        setVuR((prev) => prev + (r - prev) * 0.3)
      } else {
        setVuL((prev) => prev * 0.8)
        setVuR((prev) => prev * 0.8)
      }
      animId = requestAnimationFrame(updateVu)
    }

    animId = requestAnimationFrame(updateVu)
    return () => cancelAnimationFrame(animId)
  }, [isOpen, isPlaying])

  const handleStartRec = () => {
    startRecording(currentStation?.name || 'Radio_Satelital')
  }

  const handleStopRec = () => {
    stopRecording()
  }

  const handleResync = () => {
    setIsResyncing(true)
    resyncStream()
    setTimeout(() => setIsResyncing(false), 1500)
  }

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  if (!isOpen) return null

  const stationTitle = currentStation?.name || 'Radio Satelital'
  const stationLocation = currentStation?.country
    ? `${currentStation.country}${currentStation.region ? ` · ${currentStation.region}` : ''}`
    : 'Transmisión Global en Vivo'

  // Formato del contador de grabación 00:00
  const recMinutes = Math.floor(recorderState.durationSeconds / 60)
    .toString()
    .padStart(2, '0')
  const recSeconds = (recorderState.durationSeconds % 60).toString().padStart(2, '0')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-5xl bg-black border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col text-zinc-100 max-h-[95vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Cabina de Estudio Broadcast On-Air"
        >
          {/* BARRA SUPERIOR DE CABINA: Letrero On-Air, Relojes y Acciones */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            {/* Letrero Luminoso ON AIR */}
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-1.5 rounded-xl border font-mono font-black text-sm tracking-widest flex items-center gap-2 shadow-lg transition-all ${
                  isPlaying
                    ? 'shadow-lg'
                    : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                }`}
                style={
                  isPlaying
                    ? {
                        backgroundColor: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                        borderColor: 'var(--accent-glow)',
                      }
                    : undefined
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={
                    isPlaying
                      ? {
                          backgroundColor: 'var(--accent)',
                          boxShadow: '0 0 8px var(--accent)',
                        }
                      : { backgroundColor: '#3f3f46' }
                  }
                />
                <span>ON AIR</span>
              </div>

              {recorderState.isRecording && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>REC {recMinutes}:{recSeconds}</span>
                </div>
              )}
            </div>

            {/* Relojes de Estudio: Local y UTC */}
            <div className="flex items-center gap-4 bg-zinc-950/90 px-4 py-2 rounded-2xl border border-white/[0.06] font-mono">
              <div className="text-right">
                <span className="text-[10px] uppercase text-zinc-500 block font-sans font-bold">Local</span>
                <span className="text-sm sm:text-base font-bold text-white tracking-wide">{localTime}</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block font-sans font-bold">Universal</span>
                <span className="text-sm sm:text-base font-bold text-amber-400 tracking-wide">{utcTime}</span>
              </div>
            </div>

            {/* Controles de Ventana */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleFullscreenMode}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa de estudio'}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                aria-label="Cerrar consola"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ÁREA CENTRAL: Emisora Activa, Espectrograma y Vúmetros Estéreo L/R */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
            {/* Tarjeta de Información de la Emisora y Espectro (Col 8) */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-950/80 border border-white/[0.06] rounded-2xl p-5 sm:p-6">
              <div className="flex items-start gap-4">
                {currentStation?.logoUrl ? (
                  <img
                    src={currentStation.logoUrl}
                    alt={stationTitle}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/10 shadow-lg"
                  />
                ) : (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center"
                    style={{ color: 'var(--accent)' }}
                  >
                    <Radio size={32} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
                      Master Monitor
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      ID: #{currentStation?.id || 'SAT-01'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 truncate">
                    {stationTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 truncate mt-0.5">
                    {stationLocation}
                  </p>
                </div>
              </div>

              {/* Espectrograma Visualizador de Espectro */}
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={13} style={{ color: 'var(--accent)' }} />
                    <span>Espectrograma de Frecuencias (20 Hz - 20 kHz)</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">FFT 128 Bins</span>
                </div>
                <div className="w-full flex justify-center py-2 bg-black/80 rounded-xl border border-white/[0.04]">
                  <AudioVisualizer isPlaying={isPlaying} variant="studio" />
                </div>
              </div>

              {/* Botonera de Herramientas de Estudio */}
              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                {/* Botón Iniciar / Detener Grabación */}
                {!recorderState.isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRec}
                    disabled={!isPlaying}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      borderColor: 'var(--accent-glow)',
                    }}
                    title="Grabar emisión de audio en vivo"
                  >
                    <Circle size={14} style={{ fill: 'var(--accent)', color: 'var(--accent)' }} className="animate-pulse" />
                    <span>Grabar Emisión (REC)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRec}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black shadow-lg shadow-amber-500/30 transition-all active:scale-95 animate-pulse"
                    title="Detener y guardar grabación"
                  >
                    <Square size={14} className="fill-black" />
                    <span>Detener Grabación ({recMinutes}:{recSeconds})</span>
                  </button>
                )}

                {/* Botón Descargar si hay captura lista */}
                {recorderState.recordedBlob && !recorderState.isRecording && (
                  <button
                    type="button"
                    onClick={() => downloadRecording()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
                  >
                    <Download size={14} />
                    <span>Descargar Audio</span>
                  </button>
                )}

                {/* Botón Ecualizador de Estudio */}
                <button
                  type="button"
                  onClick={onOpenEq}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] transition-all"
                >
                  <Sliders size={14} className="text-amber-400" />
                  <span>Calibrar Ecualizador (E)</span>
                </button>

                {/* Botón Reconexión Forzada (Resync) */}
                <button
                  type="button"
                  onClick={handleResync}
                  disabled={isResyncing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] transition-all"
                  title="Forzar re-sincronización con el origen"
                >
                  <RotateCw size={14} className={isResyncing ? 'animate-spin' : ''} style={isResyncing ? { color: 'var(--accent)' } : undefined} />
                  <span>Re-sync Señal</span>
                </button>
              </div>
            </div>

            {/* Vúmetro Estéreo Profesional L / R y Telemetría (Col 4) */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-zinc-950/80 border border-white/[0.06] rounded-2xl p-5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    Vúmetros Estéreo L / R
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">dBFS Peak</span>
                </div>

                {/* Vúmetro Canal Izquierdo (L) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>CH-L</span>
                    <span>{isPlaying ? `${Math.round((vuL - 1) * 30)} dB` : '-∞ dB'}</span>
                  </div>
                  <div className="h-4 bg-zinc-900 rounded-lg p-0.5 overflow-hidden flex items-center border border-white/[0.08]">
                    <div
                      className="h-full rounded-md transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500"
                      style={{ width: `${vuL * 100}%` }}
                    />
                  </div>
                </div>

                {/* Vúmetro Canal Derecho (R) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>CH-R</span>
                    <span>{isPlaying ? `${Math.round((vuR - 1) * 30)} dB` : '-∞ dB'}</span>
                  </div>
                  <div className="h-4 bg-zinc-900 rounded-lg p-0.5 overflow-hidden flex items-center border border-white/[0.08]">
                    <div
                      className="h-full rounded-md transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500"
                      style={{ width: `${vuR * 100}%` }}
                    />
                  </div>
                </div>

                {/* Escala de Graduación */}
                <div className="flex justify-between text-[9px] font-mono text-zinc-600 px-1 select-none">
                  <span>-40</span>
                  <span>-20</span>
                  <span>-10</span>
                  <span>-3</span>
                  <span className="text-amber-500 font-bold">0</span>
                  <span className="text-red-500 font-bold">+3 Clip</span>
                </div>
              </div>

              {/* Ficha de Telemetría Técnica de Transmisión */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-zinc-500">Códec:</span>
                  <span className="text-zinc-200 font-bold">{telemetry.codec}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-zinc-500">Bitrate:</span>
                  <span className="text-zinc-200 font-bold">{telemetry.bitrate} kbps</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-zinc-500">Buffer Dinámico:</span>
                  <span className="text-emerald-400 font-bold">
                    {telemetry.bufferedSeconds.toFixed(1)}s OK
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-zinc-500">Enrutamiento:</span>
                  <span className={telemetry.isProxied ? 'text-amber-400 font-bold' : 'text-zinc-300'}>
                    {telemetry.isProxied ? 'Satelital Proxy SSL' : 'Direct Edge Stream'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BARRA INFERIOR: Controles de Transporte Broadcast */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrevStation}
                className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 flex items-center justify-center transition-colors"
                title="Emisora Anterior"
              >
                <SkipBack size={18} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-12 h-12 rounded-xl active:scale-95 text-white flex items-center justify-center shadow-lg transition-all"
                style={{
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 4px 20px var(--accent-glow)',
                }}
                title={isPlaying ? 'Pausar transmisión' : 'Iniciar transmisión'}
              >
                {isPlaying ? <Pause size={22} className="fill-white" /> : <Play size={22} className="fill-white ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={onNextStation}
                className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 flex items-center justify-center transition-colors"
                title="Siguiente Emisora"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="text-xs font-mono text-zinc-500 hidden sm:block">
              Presiona <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">?</kbd> para ver todos los atajos de teclado de estudio
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
