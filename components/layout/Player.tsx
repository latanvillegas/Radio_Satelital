"use client"
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
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
} from 'lucide-react'
import AudioVisualizer from '@/components/features/AudioVisualizer'
import SleepTimerModal from '@/components/features/SleepTimerModal'

type Props = {
  currentStation: Station | null
  onNextStation: () => void
  onPrevStation: () => void
}

type PlayerMode = 'mini' | 'card' | 'full' | 'bubble'

function StationArtwork({
  station,
  isPlaying,
  size = 'mini',
}: {
  station: Station | null
  isPlaying: boolean
  size?: 'mini' | 'card' | 'full'
}) {
  const [imgError, setImgError] = useState(false)
  const hasLogo = Boolean(station?.logoUrl) && !imgError

  return (
    <div className={`station-artwork station-artwork-${size} ${isPlaying ? 'is-playing' : 'is-paused'}`}>
      <span className="artwork-ring artwork-ring-1" />
      <span className="artwork-ring artwork-ring-2" />
      <span className="artwork-ring artwork-ring-3" />
      <div className="station-artwork-core">
        {hasLogo ? (
          <img
            className="station-artwork-image"
            src={station!.logoUrl}
            alt={station?.name || 'Radio'}
            onError={() => setImgError(true)}
          />
        ) : (
          <Radio size={size === 'mini' ? 20 : size === 'card' ? 48 : 64} strokeWidth={2} />
        )}
      </div>
    </div>
  )
}

function ControlButton({
  onClick,
  ariaLabel,
  children,
  variant = 'default',
}: {
  onClick: () => void
  ariaLabel: string
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'ghost'
}) {
  return (
    <button
      type="button"
      className={`player-icon-btn player-icon-btn-${variant}`}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      aria-label={ariaLabel}
    >
      {children}
    </button>
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

  const [mode, setMode] = useState<PlayerMode>('mini')
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radio_player_volume')
      return saved ? Number(saved) : 0.85
    }
    return 0.85
  })
  const [prevVolume, setPrevVolume] = useState(0.85)
  const [copied, setCopied] = useState(false)
  const [dockPosition, setDockPosition] = useState({ x: 0, y: 0 })
  const dragControls = useDragControls()

  // Sincronizar volumen inicial con el elemento audio
  useEffect(() => {
    const audio = document.getElementById('radioPlayer') as HTMLAudioElement | null
    if (audio) {
      audio.volume = volume
    }
  }, [volume])

  // Atajos de teclado para control de audio profesional (Espacio = Play/Pause, M = Mute)
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
  }, [volume, prevVolume, isPlaying])

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
  const playingClass = isPlaying ? 'is-playing' : 'is-paused'

  const statusBadgeText =
    playbackStatus === 'loading'
      ? 'CONECTANDO'
      : playbackStatus === 'reconnecting'
      ? 'RECONECTANDO'
      : isPlaying
      ? 'EN VIVO'
      : 'LISTO'

  const statusBadgeClass =
    playbackStatus === 'reconnecting'
      ? 'status-reconnecting'
      : isPlaying
      ? 'live'
      : ''

  return (
    <>
      <div className={`radio-player-root ${mode === 'bubble' ? 'radio-player-root-bubble' : ''}`} id="player-section">
        {mode === 'mini' && (
          <motion.div
            className={`player-mini-bar glass-panel rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${playingClass}`}
            onClick={() => setMode('card')}
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            drag
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.05}
            dragListener={false}
            onDragEnd={(_, info) => {
              setDockPosition((curr) => ({
                x: curr.x + info.offset.x,
                y: curr.y + info.offset.y,
              }))
            }}
            style={{ x: dockPosition.x, y: dockPosition.y }}
          >
            <button
              type="button"
              className="player-mini-handle"
              aria-label="Mover reproductor"
              onPointerDown={(event) => {
                event.stopPropagation()
                dragControls.start(event)
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <span className="player-mini-grip" />
              <span className="player-mini-grip" />
              <span className="player-mini-grip" />
            </button>

            <div className="player-mini-main">
              <StationArtwork station={currentStation} isPlaying={isPlaying} size="mini" />
              <div className="player-mini-copy">
                <span className="player-mini-title">{stationName}</span>
                <div className="player-mini-meta-row">
                  <span className={`status-indicator ${statusBadgeClass}`}>{statusBadgeText}</span>
                  {statusMessage && <span className="player-status-msg">{statusMessage}</span>}
                </div>
              </div>
            </div>

            {/* Visualizador de audio reactivo en la barra */}
            <div className="hidden sm:flex items-center px-2">
              <AudioVisualizer isPlaying={isPlaying} variant="mini" />
            </div>

            <div className="player-mini-actions">
              {/* Temporizador rápido */}
              <SleepTimerModal currentMinutes={sleepTimerMinutes} onSetTimer={setSleepTimer} />

              <ControlButton
                onClick={togglePlay}
                ariaLabel={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
                variant="primary"
              >
                {isPlaying ? <Pause size={18} strokeWidth={2.4} /> : <Play size={18} strokeWidth={2.4} />}
              </ControlButton>

              <ControlButton onClick={() => setMode('card')} ariaLabel="Expandir reproductor" variant="ghost">
                <Maximize2 size={18} strokeWidth={2.1} />
              </ControlButton>
            </div>
          </motion.div>
        )}

        {mode === 'bubble' && (
          <motion.button
            type="button"
            className="player-bubble"
            drag
            dragMomentum={false}
            whileTap={{ scale: 0.96 }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMode('card')}
            aria-label="Abrir reproductor"
          >
            <span className={`player-bubble-rings ${playingClass}`}>
              <span className="player-bubble-ring" />
              <span className="player-bubble-ring player-bubble-ring-2" />
            </span>
            <span className={`player-bubble-core ${playingClass}`}>
              <Radio size={22} strokeWidth={2.2} />
            </span>
          </motion.button>
        )}

        <AnimatePresence>
          {mode === 'card' && (
            <motion.div
              className="player-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMode('mini')}
            >
              <motion.div
                className={`player-card-modal glass-panel rounded-xl shadow-lg ${playingClass}`}
                initial={{ scale: 0.94, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 20 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="player-card-top-bar">
                  <div className="flex items-center gap-2">
                    <span className={`status-indicator ${statusBadgeClass}`}>{statusBadgeText}</span>
                    {sleepTimerMinutes && (
                      <span className="text-xs text-amber-400 font-medium">
                        🌙 {sleepTimerMinutes}m para apagado
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="player-close-btn"
                    onClick={() => setMode('mini')}
                    aria-label="Cerrar reproductor"
                  >
                    <X size={18} strokeWidth={2.4} />
                  </button>
                </div>

                <div className="player-card-header">
                  <StationArtwork station={currentStation} isPlaying={isPlaying} size="card" />
                  <div className="player-card-text">
                    <h2 className="player-card-title">{stationName}</h2>
                    <p className="player-card-meta">{stationMeta}</p>
                    <p className="player-card-submeta">Tiempo de sintonía: {timeLabel}</p>
                    {statusMessage && (
                      <p className="text-xs text-amber-400 mt-1 font-semibold">{statusMessage}</p>
                    )}
                  </div>
                </div>

                {/* Visualizador de espectro interactivo */}
                <div className="flex justify-center my-3 py-2 bg-black/25 rounded-lg border border-white/5">
                  <AudioVisualizer isPlaying={isPlaying} variant="card" />
                </div>

                <div className="player-card-controls">
                  <ControlButton onClick={onPrevStation} ariaLabel="Emisora anterior (Ctrl+←)">
                    <SkipBack size={24} strokeWidth={2.2} />
                  </ControlButton>
                  <ControlButton
                    onClick={togglePlay}
                    ariaLabel={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
                    variant="primary"
                  >
                    {isPlaying ? <Pause size={24} strokeWidth={2.4} /> : <Play size={24} strokeWidth={2.4} />}
                  </ControlButton>
                  <ControlButton onClick={onNextStation} ariaLabel="Siguiente emisora (Ctrl+→)">
                    <SkipForward size={24} strokeWidth={2.2} />
                  </ControlButton>
                </div>

                <div className="player-card-footer">
                  <div className="player-volume-inline">
                    <button
                      type="button"
                      className="player-icon-btn player-icon-btn-ghost p-1"
                      onClick={toggleMute}
                      title="Silenciar / Activar sonido (M)"
                      aria-label="Silenciar"
                    >
                      {volume === 0 ? (
                        <VolumeX size={18} strokeWidth={2.1} className="text-red-400" />
                      ) : (
                        <Volume2 size={18} strokeWidth={2.1} />
                      )}
                    </button>
                    <input
                      className="volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(event) => handleVolumeChange(Number(event.target.value))}
                      aria-label="Control de volumen"
                    />
                    <span className="text-xs font-mono text-zinc-400 w-8 text-right">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  <div className="player-mode-actions">
                    <SleepTimerModal currentMinutes={sleepTimerMinutes} onSetTimer={setSleepTimer} />
                    <button
                      type="button"
                      className="player-secondary-btn"
                      onClick={handleShare}
                      title="Compartir emisora"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                      <span>{copied ? 'Copiado' : 'Compartir'}</span>
                    </button>
                    <button type="button" className="player-secondary-btn" onClick={() => setMode('full')}>
                      <Maximize2 size={15} strokeWidth={2.2} />
                      <span>Pantalla completa</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mode === 'full' && (
            <motion.div
              className={`player-fullscreen ${playingClass}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="player-full-background" aria-hidden="true">
                <span className="player-full-orb player-full-orb-1" />
                <span className="player-full-orb player-full-orb-2" />
                <span className="player-full-orb player-full-orb-3" />
              </div>

              <div className="player-full-shell">
                <button
                  type="button"
                  className="player-close-btn player-close-btn-light"
                  onClick={() => setMode('card')}
                  aria-label="Salir de pantalla completa"
                >
                  <Minimize2 size={20} strokeWidth={2.4} />
                </button>

                <StationArtwork station={currentStation} isPlaying={isPlaying} size="full" />
                <div className="player-full-copy">
                  <span className={`status-indicator ${statusBadgeClass}`}>{statusBadgeText}</span>
                  <h2 className="player-full-title">{stationName}</h2>
                  <p className="player-full-meta">{stationMeta}</p>
                  <p className="player-full-submeta">{timeLabel}</p>
                  {statusMessage && (
                    <p className="text-sm text-amber-300 font-semibold mt-1">{statusMessage}</p>
                  )}
                </div>

                <div className="my-6">
                  <AudioVisualizer isPlaying={isPlaying} variant="full" />
                </div>

                <div className="player-full-controls">
                  <ControlButton onClick={onPrevStation} ariaLabel="Anterior">
                    <SkipBack size={32} strokeWidth={2.2} />
                  </ControlButton>
                  <ControlButton onClick={togglePlay} ariaLabel={isPlaying ? 'Pausar' : 'Reproducir'} variant="primary">
                    {isPlaying ? <Pause size={32} strokeWidth={2.4} /> : <Play size={32} strokeWidth={2.4} />}
                  </ControlButton>
                  <ControlButton onClick={onNextStation} ariaLabel="Siguiente">
                    <SkipForward size={32} strokeWidth={2.2} />
                  </ControlButton>
                </div>

                <div className="flex items-center gap-4 mt-6 max-w-xs w-full px-4 py-2 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
                  <button type="button" onClick={toggleMute} aria-label="Silenciar">
                    {volume === 0 ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} />}
                  </button>
                  <input
                    className="volume-slider flex-1"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(event) => handleVolumeChange(Number(event.target.value))}
                    aria-label="Volumen"
                  />
                  <span className="text-xs font-mono">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <audio id="radioPlayer" crossOrigin="anonymous" preload="none" />
    </>
  )
}
