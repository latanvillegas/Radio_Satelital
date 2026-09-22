"use client"
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePlayer } from '@/hooks/player'
import type { Station } from '@/types/station'
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Share2,
  Check,
  Disc,
  Sliders,
  Keyboard,
  Circle,
  Activity,
} from 'lucide-react'
import AudioVisualizer from '@/components/features/AudioVisualizer'
import SleepTimerModal from '@/components/features/SleepTimerModal'
import EqualizerModal from '@/components/features/EqualizerModal'
import StudioDisplayModal from '@/components/features/StudioDisplayModal'
import ShortcutsModal from '@/components/features/ShortcutsModal'
import {
  subscribeRecorder,
  type RecorderState,
  getRecorderState,
} from '@/lib/services/recorder'

type Props = {
  currentStation: Station | null
  onNextStation: () => void
  onPrevStation: () => void
}

function StationArtwork({
  station,
  isPlaying,
  size = 'mini',
}: {
  station: Station | null
  isPlaying: boolean
  size?: 'mini' | 'modal'
}) {
  const [imgError, setImgError] = useState(false)
  const hasLogo = Boolean(station?.logoUrl) && !imgError

  const cleanName = (station?.name || 'Radio').replace(/[()[\]{}.,\/#!$%\^&\*;:{}=\-_`~?0-9]/g, ' ').trim()
  const parts = cleanName.split(/\s+/).filter(Boolean)
  const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : (cleanName.slice(0, 2) || 'RA').toUpperCase()

  if (size === 'modal') {
    return (
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
        {hasLogo ? (
          <img
            className="w-full h-full object-cover"
            src={station!.logoUrl}
            alt={station?.name || 'Radio'}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center text-white">
            <Radio size={48} className="text-red-400 mb-2 opacity-80" />
            <span className="font-extrabold text-2xl tracking-wider text-zinc-300">{initials}</span>
          </div>
        )}

        {/* Halo de reproducción en vivo */}
        {isPlaying && (
          <div className="absolute inset-0 border-2 border-red-500/40 rounded-2xl pointer-events-none animate-pulse" />
        )}
      </div>
    )
  }

  // Mini mode artwork
  return (
    <div className="relative w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-zinc-900 shadow-sm">
      {hasLogo ? (
        <img
          className="w-full h-full object-cover"
          src={station!.logoUrl}
          alt={station?.name || 'Radio'}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200">
          {initials}
        </div>
      )}
      {isPlaying && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-ping" />
      )}
    </div>
  )
}

export default function Player({ currentStation, onNextStation, onPrevStation }: Props) {
  const {
    isPlaying,
    togglePlay,
    playbackStatus,
    statusMessage,
    secondsElapsed,
    sleepTimerMinutes,
    setSleepTimer,
  } = usePlayer()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEqOpen, setIsEqOpen] = useState(false)
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [recorderState, setRecorderState] = useState<RecorderState>(getRecorderState())
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radio_player_volume')
      return saved ? Number(saved) : 0.85
    }
    return 0.85
  })
  const [prevVolume, setPrevVolume] = useState(0.85)
  const [copied, setCopied] = useState(false)

  // Suscripción a la grabadora para estado en vivo en el dock
  useEffect(() => {
    return subscribeRecorder((state) => {
      setRecorderState({ ...state })
    })
  }, [])

  // Sincronizar volumen inicial con el elemento audio
  useEffect(() => {
    const audio = document.getElementById('radioPlayer') as HTMLAudioElement | null
    if (audio) {
      audio.volume = volume
    }
  }, [volume])

  // Atajos de teclado para control de audio profesional (Espacio = Play/Pause, M = Mute, E = EQ, O = OnAir, ? = Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        toggleMute()
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        setIsEqOpen((prev) => !prev)
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault()
        setIsStudioOpen((prev) => !prev)
      } else if (e.key === '?') {
        e.preventDefault()
        setIsShortcutsOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsEqOpen(false)
        setIsStudioOpen(false)
        setIsShortcutsOpen(false)
        setIsModalOpen(false)
      } else if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onNextStation()
      } else if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onPrevStation()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [volume, prevVolume, isPlaying, togglePlay, onNextStation, onPrevStation])

  const handleVolumeChange = (value: number) => {
    const audio = document.getElementById('radioPlayer') as HTMLAudioElement | null
    if (audio) {
      audio.volume = value
    }
    setVolume(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('radio_player_volume', value.toString())
    }
  }

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume)
      handleVolumeChange(0)
    } else {
      handleVolumeChange(prevVolume > 0 ? prevVolume : 0.8)
    }
  }

  const handleShare = async () => {
    const station = currentStation
    if (!station) return
    const shareText = `Escuchando ${station.name} (${station.country || 'En vivo'}) en Radio Satelital: ${window.location.origin}`
    if (navigator.share) {
      try {
        await navigator.share({ title: station.name, text: shareText, url: window.location.href })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const stationName = currentStation?.name || 'Radio Satelital'
  const stationMeta = currentStation?.country
    ? `${currentStation.country}${currentStation.region ? ` · ${currentStation.region}` : ''}`
    : 'Catálogo satelital en vivo'
  const timeLabel = new Date(secondsElapsed * 1000).toISOString().substring(14, 19)

  const statusBadgeText =
    playbackStatus === 'loading'
      ? 'CONECTANDO'
      : playbackStatus === 'reconnecting'
      ? 'RECONECTANDO'
      : isPlaying
      ? 'EN VIVO'
      : 'LISTO'

  return (
    <>
      {/* Barra de Reproducción Fija al Fondo (Bottom Dock Estilo Spotify/Apple Music) */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-white/[0.08] backdrop-blur-xl shadow-2xl transition-all"
        id="player-dock"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
          {/* LADO IZQUIERDO: Estación y Metadatos */}
          <div
            className="flex items-center gap-3 min-w-0 flex-1 md:max-w-xs cursor-pointer select-none group"
            onClick={() => setIsModalOpen(true)}
            title="Haz clic para ver detalles y consola de audio"
          >
            <StationArtwork station={currentStation} isPlaying={isPlaying} size="mini" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-red-400 transition-colors">
                  {stationName}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate">
                <span className="truncate">{stationMeta}</span>
                <span className="hidden sm:inline text-zinc-600">·</span>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 font-bold ${
                    isPlaying ? 'text-red-400' : 'text-zinc-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'
                    }`}
                  />
                  {statusBadgeText}
                </span>
              </div>
            </div>
          </div>

          {/* CENTRO: Controles de Reproducción y Visualizador */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onPrevStation}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
                title="Emisora anterior (Ctrl + ←)"
                aria-label="Anterior"
              >
                <SkipBack size={18} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-all"
                title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause size={20} className="fill-white" />
                ) : (
                  <Play size={20} className="fill-white ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={onNextStation}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
                title="Siguiente emisora (Ctrl + →)"
                aria-label="Siguiente"
              >
                <SkipForward size={18} />
              </button>
            </div>

            {/* Fila de telemetría: visualizador e indicador de tiempo */}
            <div className="hidden sm:flex items-center gap-2 mt-1">
              <span className="text-[11px] font-mono text-zinc-400">{timeLabel}</span>
              <div className="px-1 flex items-center">
                <AudioVisualizer isPlaying={isPlaying} variant="mini" />
              </div>
              {statusMessage && (
                <span className="text-[11px] text-amber-400 font-medium truncate max-w-[120px]">
                  {statusMessage}
                </span>
              )}
            </div>
          </div>

          {/* LADO DERECHO: Herramientas Broadcast, Volumen, Temporizador y Expandir */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1 md:max-w-md">
            {/* Indicador de Grabación Activa en vivo */}
            {recorderState.isRecording && (
              <button
                type="button"
                onClick={() => setIsStudioOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 text-[11px] font-mono font-bold animate-pulse"
                title="Grabación en curso - Clic para ver cabina"
              >
                <Circle size={10} className="fill-red-500 text-red-500" />
                <span>REC</span>
              </button>
            )}

            {/* Botón Ecualizador DSP */}
            <button
              type="button"
              onClick={() => setIsEqOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-white/[0.06] transition-colors"
              title="Ecualizador Paramétrico DSP (E)"
              aria-label="Ecualizador"
            >
              <Sliders size={16} />
            </button>

            {/* Botón Cabina de Estudio On-Air */}
            <button
              type="button"
              onClick={() => setIsStudioOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all"
              title="Cabina de Estudio On-Air y Vúmetros (O)"
              aria-label="Cabina On-Air"
            >
              <Radio size={14} />
              <span className="hidden md:inline">On-Air</span>
            </button>

            {/* Botón Atajos de Teclado */}
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
              title="Atajos de teclado (?)"
              aria-label="Atajos de teclado"
            >
              <Keyboard size={16} />
            </button>

            {/* Control de volumen (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                title={volume === 0 ? 'Activar sonido (M)' : 'Silenciar (M)'}
                aria-label="Silenciar"
              >
                {volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 xl:w-20 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                aria-label="Control de volumen"
              />
            </div>

            {/* Temporizador de apagado rápido */}
            <SleepTimerModal currentMinutes={sleepTimerMinutes} onSetTimer={setSleepTimer} />

            {/* Botón para expandir consola */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
              title="Expandir consola de audio"
              aria-label="Expandir"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </footer>

      {/* Modal / Consola de Audio Expandida de Alta Fidelidad */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
              onClick={() => setIsModalOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-lg bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col text-zinc-100 overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Consola de Reproducción Satelital"
            >
              {/* Barra superior del modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                    {statusBadgeText}
                  </span>
                  {sleepTimerMinutes && (
                    <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      🌙 {sleepTimerMinutes}m para apagado
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Cerrar consola"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Artwork y título de la emisora */}
              <div className="text-center space-y-4 mb-6">
                <StationArtwork station={currentStation} isPlaying={isPlaying} size="modal" />

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {stationName}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">{stationMeta}</p>
                  <p className="text-xs font-mono text-zinc-500 mt-1">
                    Tiempo de sintonización activa: {timeLabel}
                  </p>
                </div>
              </div>

              {/* Visualizador de espectro acústico en la consola */}
              <div className="flex justify-center mb-6 py-3 bg-black/40 rounded-xl border border-white/[0.04]">
                <AudioVisualizer isPlaying={isPlaying} variant="card" />
              </div>

              {/* Controles de transporte principales */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button
                  type="button"
                  onClick={onPrevStation}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Emisora anterior"
                >
                  <SkipBack size={24} />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition-all"
                  title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? (
                    <Pause size={28} className="fill-white" />
                  ) : (
                    <Play size={28} className="fill-white ml-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNextStation}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Siguiente emisora"
                >
                  <SkipForward size={24} />
                </button>
              </div>

              {/* Fila de herramientas de estudio dentro de la consola */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setIsEqOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-amber-300 border border-white/[0.08] transition-all"
                >
                  <Sliders size={14} />
                  <span>Ecualizador DSP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setIsStudioOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 transition-all"
                >
                  <Radio size={14} />
                  <span>Cabina On-Air & REC</span>
                </button>
              </div>

              {/* Fila de volumen y compartir en la consola */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2.5 flex-1">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">¡Enlace copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Compartir</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Ecualizador Paramétrico de 5 Bandas */}
      <EqualizerModal isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />

      {/* Modo Pantalla de Estudio "On-Air" & Grabadora */}
      <StudioDisplayModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        currentStation={currentStation}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        onNextStation={onNextStation}
        onPrevStation={onPrevStation}
        onOpenEq={() => {
          setIsStudioOpen(false)
          setIsEqOpen(true)
        }}
      />

      {/* Modal de Atajos de Teclado */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </>
  )
}
