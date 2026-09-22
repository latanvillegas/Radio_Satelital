"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sliders,
  Circle,
  Square,
  Volume2,
  VolumeX,
  RotateCw,
  Heart,
  Share2,
  Sparkles,
  Wifi,
  Activity,
  Maximize2,
  Download,
} from 'lucide-react'
import type { Station } from '@/types/station'
import { usePlayer } from '@/hooks/player'
import AudioVisualizer from './AudioVisualizer'
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
  currentStation: Station | null
  onPlayNext: () => void
  onPlayPrev: () => void
  onToggleFav: (s: Station) => void
  onOpenEq: () => void
  onOpenStudio: () => void
  onPlayRandom: () => void
}

export default function MasterConsoleRack({
  currentStation,
  onPlayNext,
  onPlayPrev,
  onToggleFav,
  onOpenEq,
  onOpenStudio,
  onPlayRandom,
}: Props) {
  const { isPlaying, togglePlay, playbackStatus, statusMessage } = usePlayer()
  const [recorderState, setRecorderState] = useState<RecorderState>(getRecorderState())
  const [telemetry, setTelemetry] = useState(getCurrentStreamTelemetry())
  const [vuL, setVuL] = useState(0.4)
  const [vuR, setVuR] = useState(0.4)
  const [isResyncing, setIsResyncing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Suscribirse a la grabadora
  useEffect(() => {
    return subscribeRecorder((state) => {
      setRecorderState({ ...state })
    })
  }, [])

  // Actualizar telemetría de forma periódica
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(getCurrentStreamTelemetry())
    }, 2000)
    return () => clearInterval(timer)
  }, [currentStation, isPlaying])

  // Simulación de vúmetros del rack en base al audio
  useEffect(() => {
    let animId: number
    const update = () => {
      if (isPlaying) {
        const data = getAnalyserData()
        let val = 0.5
        if (data && data.length > 0) {
          let sum = 0
          for (let i = 0; i < Math.min(24, data.length); i++) sum += data[i]
          val = (sum / 24) / 255
        } else {
          val = 0.45 + Math.sin(Date.now() / 190) * 0.25
        }
        setVuL((prev) => prev + (Math.min(1, Math.max(0.1, val * 1.1)) - prev) * 0.3)
        setVuR((prev) => prev + (Math.min(1, Math.max(0.1, val * 0.95)) - prev) * 0.3)
      } else {
        setVuL((prev) => prev * 0.8)
        setVuR((prev) => prev * 0.8)
      }
      animId = requestAnimationFrame(update)
    }
    animId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying])

  const handleResync = () => {
    setIsResyncing(true)
    resyncStream()
    setTimeout(() => setIsResyncing(false), 1200)
  }

  const handleShare = async () => {
    if (!currentStation) return
    const text = `Escuchando ${currentStation.name} (${currentStation.country || 'En vivo'}) en Radio Satelital: ${window.location.origin}`
    if (navigator.share) {
      try {
        await navigator.share({ title: currentStation.name, text, url: window.location.href })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const recMins = Math.floor(recorderState.durationSeconds / 60)
    .toString()
    .padStart(2, '0')
  const recSecs = (recorderState.durationSeconds % 60).toString().padStart(2, '0')

  const stationName = currentStation?.name || 'Sintonizador Satelital'
  const stationLocation = currentStation?.country
    ? `${currentStation.country}${currentStation.region ? ` · ${currentStation.region}` : ''}`
    : 'Red Global de Transmisiones'

  return (
    <div
      className="relative mb-8 rounded-3xl overflow-hidden border border-white/[0.12] shadow-2xl bg-black p-4 sm:p-6 text-zinc-100"
      id="master-console-rack"
      role="region"
      aria-label="Consola Maestra de Transmisión"
    >
      {/* Tornillos simulados de Rack de Audio en las esquinas */}
      <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-700 shadow-inner border border-zinc-800" />
      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-700 shadow-inner border border-zinc-800" />
      <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-700 shadow-inner border border-zinc-800" />
      <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-700 shadow-inner border border-zinc-800" />

      {/* Línea de estatus superior de la consola */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08] select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-950/80 border border-white/[0.08] shadow-inner">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPlaying ? 'animate-ping' : 'bg-zinc-600'
              }`}
              style={isPlaying ? { backgroundColor: 'var(--accent)' } : undefined}
            />
            <span
              className="text-[11px] font-mono font-black tracking-widest uppercase"
              style={isPlaying ? { color: 'var(--accent)' } : { color: '#a1a1aa' }}
            >
              {isPlaying ? 'ON AIR · MASTER LIVE' : 'STANDBY · LISTO'}
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Activity size={12} className="text-emerald-400" />
            <span>DSP 48kHz / 24-Bit</span>
          </span>
        </div>

        {/* Grabación REC en curso o botón rápido */}
        <div className="flex items-center gap-2">
          {recorderState.isRecording ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold animate-pulse">
              <Circle size={10} className="fill-red-500 text-red-500" />
              <span>REC {recMins}:{recSecs}</span>
              <button
                type="button"
                onClick={() => stopRecording()}
                className="ml-1 text-white hover:text-red-200"
                title="Detener grabación"
              >
                <Square size={12} className="fill-current" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startRecording(stationName)}
              disabled={!isPlaying}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-zinc-300 border border-white/[0.08] transition-all disabled:opacity-40"
              title="Iniciar grabación de audio en vivo"
            >
              <Circle size={10} className="fill-red-500 text-red-500" />
              <span>Grabar</span>
            </button>
          )}

          {recorderState.recordedBlob && !recorderState.isRecording && (
            <button
              type="button"
              onClick={() => downloadRecording()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
              title="Descargar última grabación"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Descargar REC</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenEq}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border border-white/[0.08] transition-all"
            title="Abrir ecualizador paramétrico"
          >
            <Sliders size={13} />
            <span>Ecualizador</span>
          </button>

          <button
            type="button"
            onClick={onOpenStudio}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border shadow-sm transition-all"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent)',
              borderColor: 'var(--accent-glow)',
            }}
            title="Abrir cabina de estudio a pantalla completa"
          >
            <Radio size={13} />
            <span>Modo Cabina</span>
          </button>
        </div>
      </div>

      {/* CUERPO CENTRAL DE LA CONSOLA: Dial de Emisora, Espectrograma y Vúmetros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        {/* LADO IZQUIERDO (Col 4): Carátula de vinilo y metadatos */}
        <div className="lg:col-span-4 flex items-center gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            {currentStation?.logoUrl ? (
              <img
                src={currentStation.logoUrl}
                alt={stationName}
                className="w-full h-full object-cover rounded-2xl border border-white/10 shadow-2xl"
              />
            ) : (
              <div
                className="w-full h-full rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                }}
              >
                <Radio size={36} />
              </div>
            )}

            {/* Aro luminoso cuando está transmitiendo */}
            {isPlaying && (
              <div
                className="absolute -inset-1 rounded-2xl border-2 pointer-events-none animate-pulse"
                style={{ borderColor: 'var(--accent-glow)' }}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  borderColor: 'var(--accent-glow)',
                }}
              >
                SINTONIZADA
              </span>
              <span className="text-[10px] font-mono text-zinc-400 truncate">
                {telemetry.codec}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 truncate">
              {stationName}
            </h2>
            <p className="text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-1.5">
              <span>{stationLocation}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                {telemetry.bitrate} kbps
              </span>
              {currentStation && (
                <button
                  type="button"
                  onClick={() => onToggleFav(currentStation)}
                  className={`p-1 rounded-md transition-colors ${
                    currentStation.isFavorite
                      ? 'bg-white/[0.08]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  style={currentStation.isFavorite ? { color: 'var(--accent)' } : undefined}
                  title={currentStation.isFavorite ? 'Quitar favorita' : 'Guardar favorita'}
                >
                  <Heart size={14} fill={currentStation.isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
              <button
                type="button"
                onClick={handleShare}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Compartir emisora"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* CENTRO (Col 5): Espectrograma y Vúmetro Estéreo */}
        <div className="lg:col-span-5 flex flex-col justify-center bg-black border border-white/[0.06] rounded-2xl p-4 shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
            <span className="flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              <Activity size={12} />
              <span>ESPECTROGRAFÍA EN TIEMPO REAL</span>
            </span>
            <span>20 Hz — 20 kHz</span>
          </div>

          <div className="w-full flex justify-center py-1">
            <AudioVisualizer isPlaying={isPlaying} variant="card" barCount={32} />
          </div>

          {/* Vúmetros Estéreo L/R compactos */}
          <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-white/[0.06]">
            <div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-0.5">
                <span className="text-zinc-500">CH-L</span>
                <span>{isPlaying ? `${Math.round((vuL - 1) * 30)} dB` : '-∞'}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded overflow-hidden p-px">
                <div
                  className="h-full rounded bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                  style={{ width: `${vuL * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-0.5">
                <span className="text-zinc-500">CH-R</span>
                <span>{isPlaying ? `${Math.round((vuR - 1) * 30)} dB` : '-∞'}</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded overflow-hidden p-px">
                <div
                  className="h-full rounded bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-75"
                  style={{ width: `${vuR * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO (Col 3): Botonera de Control de Transporte Principal */}
        <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPlayPrev}
              className="w-11 h-11 rounded-2xl bg-zinc-950 hover:bg-white/[0.08] text-zinc-300 flex items-center justify-center border border-white/[0.08] transition-all hover:scale-105 active:scale-95"
              title="Emisora Anterior"
            >
              <SkipBack size={18} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-16 h-16 rounded-2xl active:scale-95 text-white flex items-center justify-center shadow-xl border border-white/10 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                boxShadow: '0 4px 24px var(--accent-glow)',
              }}
              title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
            >
              {isPlaying ? (
                <Pause size={28} className="fill-white" />
              ) : (
                <Play size={28} className="fill-white ml-1" />
              )}
            </button>

            <button
              type="button"
              onClick={onPlayNext}
              className="w-11 h-11 rounded-2xl bg-zinc-950 hover:bg-white/[0.08] text-zinc-300 flex items-center justify-center border border-white/[0.08] transition-all hover:scale-105 active:scale-95"
              title="Siguiente Emisora"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResync}
              disabled={isResyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition-all"
              title="Re-sincronizar señal en vivo"
            >
              <RotateCw size={13} className={isResyncing ? 'animate-spin text-red-400' : ''} />
              <span>Resync</span>
            </button>

            <button
              type="button"
              onClick={onPlayRandom}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition-all"
              title="Sintonizar emisora al azar"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Azar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
