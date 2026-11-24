"use client"

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Maximize2,
  Pause,
  Play,
  Radio,
  Share2,
  SkipBack,
  SkipForward,
  Sliders,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import type { Station } from '@/types/station'
import { usePlayer } from '@/hooks/player'
import { useDialogFocusTrap } from '@/hooks/ui/useDialogFocusTrap'
import { buildStationShareUrl } from '@/lib/utils/url-state'
import AudioVisualizer from '@/components/features/AudioVisualizer'
import StationArtwork from '@/components/features/StationArtwork'
import SleepTimerModal from '@/components/features/SleepTimerModal'
import EqualizerModal from '@/components/features/EqualizerModal'
import StudioDisplayModal from '@/components/features/StudioDisplayModal'

interface Props {
  currentStation: Station | null
  onNextStation: () => void
  onPrevStation: () => void
  visible?: boolean
}

export default function Player({
  currentStation,
  onNextStation,
  onPrevStation,
  visible = true,
}: Props) {
  const {
    isPlaying,
    togglePlay,
    playbackStatus,
    statusMessage,
    secondsElapsed,
    sleepTimerMinutes,
    setSleepTimer,
  } = usePlayer()

  const [expanded, setExpanded] = useState(false)
  const [eqOpen, setEqOpen] = useState(false)
  const [studioOpen, setStudioOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [volume, setVolume] = useState(0.85)
  const [prevVolume, setPrevVolume] = useState(0.85)

  const closeRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useDialogFocusTrap({
    open: expanded,
    onClose: () => setExpanded(false),
    containerRef: dialogRef,
    initialFocusRef: closeRef,
  })

  // Hidratar volumen guardado solo en cliente para evitar discrepancias SSR
  useEffect(() => {
    try {
      const saved = localStorage.getItem('radio_player_volume')
      if (saved !== null) {
        const parsed = Math.max(0, Math.min(1, Number(saved)))
        if (!Number.isNaN(parsed)) setVolume(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const audio = document.getElementById('radioPlayer') as HTMLAudioElement | null
    if (audio) audio.volume = volume
  }, [volume, currentStation])

  const updateVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val))
    setVolume(clamped)
    try {
      localStorage.setItem('radio_player_volume', String(clamped))
    } catch {}
    const audio = document.getElementById('radioPlayer') as HTMLAudioElement | null
    if (audio) audio.volume = clamped
  }

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume)
      updateVolume(0)
    } else {
      updateVolume(prevVolume || 0.85)
    }
  }

  const handleShare = async () => {
    if (!currentStation || typeof window === 'undefined') return
    const shareUrl = buildStationShareUrl(window.location.href, currentStation)
    const text = `Escuchando ${currentStation.name} en vivo por Radio Satelital`
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${currentStation.name} — Radio Satelital`,
          text,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  const name = currentStation?.name || 'Radio Satelital'
  const meta = currentStation?.country
    ? [currentStation.region, currentStation.country].filter(Boolean).join(' · ')
    : 'Selecciona una emisora para escuchar'

  const canCancel = isPlaying || playbackStatus === 'loading' || playbackStatus === 'reconnecting' || playbackStatus === 'offline'
  const statusBadge =
    playbackStatus === 'reconnecting'
      ? 'Reconectando'
      : playbackStatus === 'loading'
      ? 'Conectando'
      : playbackStatus === 'offline'
      ? 'Sin red'
      : playbackStatus === 'error'
      ? 'Sin señal'
      : isPlaying
      ? 'En vivo'
      : 'Listo'

  const formattedTime = new Date(secondsElapsed * 1000).toISOString().substring(14, 19)

  return (
    <>
      {/* Barra inferior compacta */}
      <footer
        className={`surface-player-bar fixed bottom-0 inset-x-0 z-40 shadow-2xl transition-transform duration-200 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-haspopup="dialog"
            aria-expanded={expanded}
            className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-xl py-1"
          >
            <span aria-hidden="true"><StationArtwork station={currentStation} variant="dock" /></span>
            <div className="min-w-0 flex-1">
              <div
                className={`text-sm font-bold truncate ${
                  isPlaying ? 'text-accent' : 'text-ink'
                }`}
              >
                {name}
              </div>
              <div className="text-xs text-ink-secondary truncate" role="status">
                {statusMessage || meta}
              </div>
            </div>
            <span className="sr-only">Abrir reproductor expandido</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onPrevStation}
              aria-label="Emisora anterior"
              className="min-w-[44px] min-h-[44px] rounded-xl grid place-items-center text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
            >
              <SkipBack size={18} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={!currentStation}
              aria-label={canCancel ? 'Pausar radio' : 'Reproducir radio'}
              className="w-11 h-11 rounded-full grid place-items-center bg-accent text-accent-fg hover:bg-accent-hover shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {canCancel ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onNextStation}
              aria-label="Siguiente emisora"
              className="min-w-[44px] min-h-[44px] rounded-xl grid place-items-center text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="hidden md:flex flex-1 justify-end items-center gap-3">
            <div className="flex items-center gap-2 w-32">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={volume === 0 ? 'Restaurar volumen' : 'Silenciar audio'}
                className="min-w-[36px] min-h-[36px] rounded-lg grid place-items-center text-ink-muted hover:text-ink"
              >
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                aria-label="Volumen maestro"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => updateVolume(Number(e.target.value))}
                className="w-full h-1.5 cursor-pointer"
              />
            </div>

            <span
              className={`text-xs font-mono font-bold whitespace-nowrap ${
                isPlaying ? 'text-accent' : 'text-ink-muted'
              }`}
            >
              {statusBadge}
            </span>

            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Ampliar controles del reproductor"
              className="min-w-[44px] min-h-[44px] rounded-xl grid place-items-center text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
            >
              <Maximize2 size={17} />
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de reproductor inmersivo */}
      <AnimatePresence>
        {expanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="absolute inset-0 "
              style={{ backgroundColor: 'var(--bg-scrim)' }}
              onClick={() => setExpanded(false)}
              aria-hidden="true"
            />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="expanded-player-title"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 w-full h-full sm:h-auto sm:max-w-xl sm:max-h-[92vh] overflow-y-auto sm:rounded-3xl border-0 sm:border border-line bg-elevated p-6 sm:p-8 shadow-2xl flex flex-col justify-between text-ink"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-accent">
                  {isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  )}
                  <span>{statusBadge}</span>
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Cerrar reproductor expandido"
                  className="min-w-[44px] min-h-[44px] rounded-full grid place-items-center text-ink-muted hover:bg-subtle hover:text-ink transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="text-center flex flex-col items-center my-2">
                <StationArtwork station={currentStation} variant="hero" />
                <h2
                  id="expanded-player-title"
                  className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink"
                >
                  {name}
                </h2>
                <p className="mt-1 text-sm text-ink-secondary truncate max-w-full">
                  {statusMessage || meta}
                </p>
              </div>

              <div className="my-5 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center overflow-hidden">
                <AudioVisualizer isPlaying={isPlaying} variant="card" />
              </div>

              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  aria-label="Emisora anterior"
                  onClick={onPrevStation}
                  className="w-12 h-12 rounded-full grid place-items-center text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
                >
                  <SkipBack size={22} />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!currentStation}
                  aria-label={canCancel ? 'Pausar radio' : 'Reproducir radio'}
                  className="w-16 h-16 rounded-full grid place-items-center bg-accent text-accent-fg hover:bg-accent-hover shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {canCancel ? (
                    <Pause size={27} fill="currentColor" />
                  ) : (
                    <Play size={27} fill="currentColor" className="ml-1" />
                  )}
                </button>

                <button
                  type="button"
                  aria-label="Siguiente emisora"
                  onClick={onNextStation}
                  className="w-12 h-12 rounded-full grid place-items-center text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
                >
                  <SkipForward size={22} />
                </button>
              </div>

              <div className="mt-4 text-center text-xs font-mono tabular-nums text-ink-muted">
                {isPlaying ? `Tiempo de escucha · ${formattedTime}` : 'Pulsa reproducir para iniciar'}
              </div>

              <div className="mt-5 pt-4 border-t border-line flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={volume === 0 ? 'Restaurar volumen' : 'Silenciar'}
                  className="min-w-[40px] min-h-[40px] rounded-xl grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle"
                >
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <input
                  aria-label="Volumen"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => updateVolume(Number(e.target.value))}
                  className="flex-1 cursor-pointer"
                />

                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!currentStation}
                  className="min-h-[40px] px-3.5 rounded-xl inline-flex items-center gap-2 bg-subtle hover:bg-surface border border-line text-xs font-semibold text-ink transition-colors whitespace-nowrap disabled:opacity-40"
                >
                  {copied ? <Check size={14} className="text-accent" /> : <Share2 size={14} />}
                  <span>{copied ? 'Enlace copiado' : 'Compartir'}</span>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <SleepTimerModal
                  currentMinutes={sleepTimerMinutes}
                  onSetTimer={setSleepTimer}
                />
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(false)
                    setEqOpen(true)
                  }}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-line bg-subtle hover:bg-surface text-xs font-semibold text-ink transition-colors whitespace-nowrap"
                >
                  <Sliders size={16} />
                  <span>Ecualizador</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(false)
                    setStudioOpen(true)
                  }}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-line bg-subtle hover:bg-surface text-xs font-semibold text-ink transition-colors whitespace-nowrap"
                >
                  <Radio size={16} />
                  <span>Cabina</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EqualizerModal isOpen={eqOpen} onClose={() => setEqOpen(false)} />

      <StudioDisplayModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
        currentStation={currentStation}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        onNextStation={onNextStation}
        onPrevStation={onPrevStation}
        onOpenEq={() => {
          setStudioOpen(false)
          setEqOpen(true)
        }}
      />
    </>
  )
}
