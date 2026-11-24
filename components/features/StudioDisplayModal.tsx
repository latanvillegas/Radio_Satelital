"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Circle,
  Square,
  Download,
  RotateCw,
  Activity,
  Sliders,
  Maximize2,
  Minimize2,
  Keyboard,
} from 'lucide-react'
import type { Station } from '@/types/station'
import AudioVisualizer from '@/components/features/AudioVisualizer'
import StationArtwork from '@/components/features/StationArtwork'
import {
  startRecording,
  stopRecording,
  downloadRecording,
  subscribeRecorder,
  type RecorderState,
  getRecorderState,
} from '@/lib/services/recorder'
import { getCurrentStreamTelemetry, resyncStream } from '@/lib/services/player'
import { getAnalyserData } from '@/lib/services/audio-dsp'
import {
  getTelemetrySummary,
  subscribeTelemetry,
  type TelemetrySummary,
} from '@/lib/services/telemetry'
import { useDialogFocusTrap } from '@/hooks/ui/useDialogFocusTrap'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentStation: Station | null
  isPlaying: boolean
  togglePlay: () => void
  onNextStation: () => void
  onPrevStation: () => void
  onOpenEq: () => void
}

const SHORTCUTS: ReadonlyArray<readonly [string, string]> = [
  ['Espacio', 'Reproducir o pausar'],
  ['←', 'Emisora anterior'],
  ['→', 'Siguiente emisora'],
  ['E', 'Abrir ecualizador'],
  ['R', 'Iniciar o detener grabación'],
  ['S', 'Re-sincronizar stream'],
  ['F', 'Pantalla completa'],
  ['?', 'Mostrar u ocultar atajos'],
  ['Esc', 'Cerrar ventana actual'],
]

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
  const [recorderState, setRecorderState] = useState<RecorderState>(() => getRecorderState())
  const [vuL, setVuL] = useState(0)
  const [vuR, setVuR] = useState(0)
  const [telemetry, setTelemetry] = useState(() => getCurrentStreamTelemetry())
  const [opsSummary, setOpsSummary] = useState<TelemetrySummary>(() => getTelemetrySummary())
  const [isResyncing, setIsResyncing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  useDialogFocusTrap({
    open: isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeBtnRef,
    disableEscape: showShortcuts,
  })

  useEffect(() => {
    if (!isOpen) return
    const updateClocks = () => {
      const now = new Date()
      setLocalTime(now.toLocaleTimeString('es-PE', { hour12: false }))
      setUtcTime(now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false }) + ' UTC')
    }
    updateClocks()
    const timer = setInterval(updateClocks, 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    return subscribeRecorder((state) => setRecorderState({ ...state }))
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const update = () => setTelemetry(getCurrentStreamTelemetry())
    update()
    const interval = setInterval(update, 1500)
    const unsubscribeOps = subscribeTelemetry((summary) => setOpsSummary(summary))
    return () => {
      clearInterval(interval)
      unsubscribeOps()
    }
  }, [isOpen, currentStation, isPlaying])

  useEffect(() => {
    if (!isOpen) return
    if (!isPlaying) {
      setVuL(0)
      setVuR(0)
      return
    }
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: ReturnType<typeof setInterval> | null = null
    const updateVu = () => {
      const data = getAnalyserData()
      const count = Math.min(32, data?.length ?? 0)
      let sum = 0
      for (let i = 0; i < count; i++) sum += data![i]
      const now = Date.now()
      // The existing spectrum analyser is not a stereo or calibrated peak meter.
      const avg = count ? sum / count / 255 :
        (motionPreference.matches ? 0.4 : 0.4 + Math.sin(now / 180) * 0.22 + Math.cos(now / 290) * 0.14)
      const l = Math.min(1, Math.max(0, avg * (motionPreference.matches ? 1 : 0.92 + Math.sin(now / 220) * 0.12)))
      const r = Math.min(1, Math.max(0, avg * (motionPreference.matches ? 1 : 0.92 + Math.cos(now / 250) * 0.12)))
      setVuL(prev => motionPreference.matches ? l : prev + (l - prev) * 0.65)
      setVuR(prev => motionPreference.matches ? r : prev + (r - prev) * 0.65)
    }
    const sync = () => {
      if (timer !== null) clearInterval(timer)
      timer = null
      if (document.hidden) return
      updateVu()
      if (!motionPreference.matches) timer = setInterval(updateVu, 100)
      else timer = setInterval(updateVu, 1000)
    }
    document.addEventListener('visibilitychange', sync)
    motionPreference.addEventListener?.('change', sync)
    sync()
    return () => {
      if (timer !== null) clearInterval(timer)
      document.removeEventListener('visibilitychange', sync)
      motionPreference.removeEventListener?.('change', sync)
    }
  }, [isOpen, isPlaying])

  const handleStartRec = useCallback(() => {
    startRecording(currentStation?.name || 'Radio_Satelital')
  }, [currentStation?.name])

  const handleStopRec = useCallback(() => {
    void stopRecording()
  }, [])

  const handleResync = useCallback(() => {
    setIsResyncing(true)
    resyncStream()
    setTimeout(() => setIsResyncing(false), 1200)
  }, [])

  const handleExportDiagnostics = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      currentStation: currentStation
        ? { id: currentStation.id, name: currentStation.name, country: currentStation.country }
        : null,
      liveStream: getCurrentStreamTelemetry(),
      observability: getTelemetrySummary(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `radio-satelital-diagnostico-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [currentStation])

  const toggleFullscreenMode = useCallback(() => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement))
    sync()
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }
      const key = event.key.toLowerCase()
      if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
        event.preventDefault()
        setShowShortcuts((v) => !v)
        return
      }
      if (event.key === 'Escape' && showShortcuts) {
        event.preventDefault()
        event.stopPropagation()
        setShowShortcuts(false)
        return
      }
      if (showShortcuts) return
      if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.code === 'Space') {
        if (target?.closest('button, a[href], [role="button"]')) return
        event.preventDefault()
        togglePlay()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrevStation()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNextStation()
      } else if (key === 'e') {
        event.preventDefault()
        onOpenEq()
      } else if (key === 'r') {
        event.preventDefault()
        if (recorderState.isRecording) handleStopRec()
        else if (isPlaying) handleStartRec()
      } else if (key === 's') {
        event.preventDefault()
        handleResync()
      } else if (key === 'f') {
        event.preventDefault()
        toggleFullscreenMode()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    isOpen,
    showShortcuts,
    isPlaying,
    recorderState.isRecording,
    togglePlay,
    onPrevStation,
    onNextStation,
    onOpenEq,
    handleStartRec,
    handleStopRec,
    handleResync,
    toggleFullscreenMode,
  ])

  const stationTitle = currentStation?.name || 'Radio Satelital'
  const stationLocation = currentStation?.country
    ? `${currentStation.country}${currentStation.region ? ` · ${currentStation.region}` : ''}`
    : 'Transmisión en directo'
  const recMinutes = Math.floor(recorderState.durationSeconds / 60)
    .toString()
    .padStart(2, '0')
  const recSeconds = (recorderState.durationSeconds % 60).toString().padStart(2, '0')

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
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
            initial={{ scale: 0.96, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-5xl bg-elevated border border-line rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col text-ink max-h-[95dvh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-console-title"
          >
            {/* Cabecera de Cabina */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div
                  className={`px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs tracking-wider flex items-center gap-2 ${
                    isPlaying
                      ? 'bg-accent-subtle text-accent border-accent'
                      : 'bg-surface text-ink-muted border-line'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPlaying ? 'bg-accent' : 'bg-ink-muted'
                    }`}
                  />
                  <span>{isPlaying ? 'ON AIR' : 'STANDBY'}</span>
                </div>

                {recorderState.isRecording && (
                  <div className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-500 border border-red-500/35 font-mono text-xs font-bold tabular-nums flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>
                      REC {recMinutes}:{recSeconds}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 bg-surface px-4 py-2 rounded-xl border border-line font-mono tabular-nums">
                <div className="text-right">
                  <span className="text-[10px] text-ink-muted block font-sans font-semibold">
                    Hora local
                  </span>
                  <span className="text-sm font-bold text-ink">{localTime}</span>
                </div>
                <div className="w-px h-6 bg-line" />
                <div>
                  <span className="text-[10px] text-ink-muted block font-sans font-semibold">
                    Tiempo universal
                  </span>
                  <span className="text-sm font-bold text-accent">{utcTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowShortcuts(true)}
                  className="min-w-[44px] min-h-[44px] rounded-xl grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
                  title="Atajos de teclado"
                  aria-label="Mostrar atajos de teclado"
                >
                  <Keyboard size={18} />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreenMode}
                  className="min-w-[44px] min-h-[44px] rounded-xl grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                  aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Activar pantalla completa'}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] rounded-xl grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
                  aria-label="Cerrar cabina de monitoreo"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Cuerpo de Cabina */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-5">
              <div className="lg:col-span-8 flex flex-col justify-between bg-surface border border-line rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <StationArtwork station={currentStation} variant="card" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-ink-muted">
                      Monitor principal · {currentStation?.id || 'SAT-01'}
                    </p>
                    <h2
                      id="studio-console-title"
                      className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight mt-0.5 truncate"
                    >
                      {stationTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-ink-secondary truncate mt-0.5">
                      {stationLocation}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-line">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-ink-secondary flex items-center gap-1.5">
                      <Activity size={14} className="text-accent" />
                      <span>Analizador de espectro acústico (20 Hz – 20 kHz)</span>
                    </span>
                    <span className="text-[11px] font-mono text-ink-muted">FFT 128</span>
                  </div>
                  <div className="w-full flex justify-center py-2.5 bg-canvas rounded-xl border border-line overflow-hidden">
                    <AudioVisualizer isPlaying={isPlaying} variant="studio" />
                  </div>
                </div>

                {recorderState.error && (
                  <p className="mt-3 text-xs text-red-500 font-medium">{recorderState.error}</p>
                )}

                <div className="flex flex-wrap items-center gap-2.5 mt-5">
                  {recorderState.isFinalizing ? (
                    <span role="status" className="text-sm text-ink-secondary">Finalizando grabación…</span>
                  ) : !recorderState.isRecording ? (
                    <button
                      type="button"
                      onClick={handleStartRec}
                      disabled={!isPlaying}
                      className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border bg-accent-subtle text-accent border-accent transition-colors disabled:opacity-40"
                    >
                      <Circle size={13} fill="currentColor" />
                      <span>Grabar emisión</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopRec}
                      className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white transition-colors tabular-nums"
                    >
                      <Square size={13} fill="currentColor" />
                      <span>
                        Detener ({recMinutes}:{recSeconds})
                      </span>
                    </button>
                  )}

                  {recorderState.recordedBlob && !recorderState.isRecording && (
                    <button
                      type="button"
                      onClick={() => downloadRecording()}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
                    >
                      <Download size={14} />
                      <span>Descargar grabación</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onOpenEq}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-subtle hover:bg-canvas text-ink border border-line transition-colors"
                  >
                    <Sliders size={14} className="text-accent" />
                    <span>Ecualizador (E)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResync}
                    disabled={isResyncing}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-subtle hover:bg-canvas text-ink border border-line transition-colors disabled:opacity-50"
                  >
                    <RotateCw size={14} className={isResyncing ? 'animate-spin text-accent' : ''} />
                    <span>Re-sincronizar</span>
                  </button>
                </div>
              </div>

              {/* Telemetría y Vúmetros */}
              <div className="lg:col-span-4 flex flex-col justify-between bg-surface border border-line rounded-2xl p-5">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-ink">Indicadores L / R estimados</span>
                    <span className="text-[11px] font-mono text-ink-muted">Orientativo</span>
                  </div>

                  {(
                    [
                      ['CH-L', vuL],
                      ['CH-R', vuR],
                    ] as const
                  ).map(([label, value]) => (
                    <div className="mb-4" key={label}>
                      <div className="flex items-center justify-between text-xs font-mono tabular-nums text-ink-secondary mb-1">
                        <span className="font-bold text-accent">{label}</span>
                        <span>
                          {isPlaying ? `${Math.round(value * 100)} %` : '0 %'}
                        </span>
                      </div>
                      <div className="h-3.5 bg-input rounded-lg p-0.5 overflow-hidden flex items-center border border-line">
                        <div
                          className="h-full rounded-sm transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between text-[10px] font-mono tabular-nums text-ink-muted px-0.5 select-none">
                    <span>0%</span>
                    <span>20%</span>
                    <span>40%</span>
                    <span>60%</span>
                    <span>80%</span>
                    <span>100%</span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-ink-muted">Nivel espectral estimado; no es medición estéreo ni dBFS calibrado. Sin acceso al analizador se muestra una señal indicativa.</p>
                <dl className="mt-6 pt-4 border-t border-line space-y-2.5 text-xs font-mono tabular-nums">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-muted">Códec</dt>
                    <dd className="text-ink font-bold truncate">{telemetry.codec}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-muted">Bitrate est.</dt>
                    <dd className="text-ink font-bold">{telemetry.bitrate} kbps</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-muted">Buffer activo</dt>
                    <dd className="text-accent font-bold">{telemetry.bufferedSeconds.toFixed(1)} s</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-muted">Latencia (TTFA)</dt>
                    <dd className="text-ink font-bold">
                      {telemetry.ttfaMs !== null ? `${telemetry.ttfaMs} ms` : '—'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-muted">Transporte</dt>
                    <dd className="text-ink-secondary font-semibold">
                      {telemetry.isProxied
                        ? 'Proxy HTTPS'
                        : telemetry.isHls
                        ? 'HLS Adaptativo'
                        : 'Stream Directo'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-muted">Salud sesión</dt>
                    <dd className="text-ink font-bold">
                      {opsSummary.totalPlays} ok · {opsSummary.totalFailures} fallos
                    </dd>
                  </div>
                  {opsSummary.webVitals.lcpMs !== null && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-ink-muted">Web Vitals (LCP)</dt>
                      <dd className="text-ink-secondary font-semibold">
                        {opsSummary.webVitals.lcpMs} ms
                        {opsSummary.webVitals.clsScore !== null
                          ? ` · CLS ${opsSummary.webVitals.clsScore}`
                          : ''}
                      </dd>
                    </div>
                  )}
                </dl>

                <button
                  type="button"
                  onClick={handleExportDiagnostics}
                  className="mt-4 w-full min-h-[38px] px-3 rounded-xl border border-line bg-canvas hover:bg-subtle text-ink-secondary hover:text-ink text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Download size={13} className="text-accent" />
                  <span>Exportar diagnóstico JSON</span>
                </button>
              </div>
            </div>

            {/* Transporte inferior */}
            <div className="pt-4 border-t border-line flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrevStation}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-surface hover:bg-subtle border border-line text-ink grid place-items-center transition-colors"
                  aria-label="Emisora anterior"
                >
                  <SkipBack size={18} />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-xl bg-accent text-accent-fg hover:bg-accent-hover grid place-items-center shadow-md transition-colors"
                  aria-label={isPlaying ? 'Pausar transmisión' : 'Iniciar transmisión'}
                >
                  {isPlaying ? (
                    <Pause size={22} fill="currentColor" />
                  ) : (
                    <Play size={22} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onNextStation}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-surface hover:bg-subtle border border-line text-ink grid place-items-center transition-colors"
                  aria-label="Siguiente emisora"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowShortcuts(true)}
                className="text-xs font-mono text-ink-muted hidden sm:inline-flex items-center gap-2 hover:text-ink transition-colors"
              >
                <span>Pulsa</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-ink font-bold">
                  ?
                </kbd>
                <span>para ver los atajos de cabina</span>
              </button>
            </div>

            {/* Sub-modal de atajos */}
            <AnimatePresence>
              {showShortcuts && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex items-center justify-center p-4 backdrop-blur-md rounded-3xl"
                  style={{ backgroundColor: 'var(--bg-scrim)' }}
                  onClick={() => setShowShortcuts(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.96, y: 8 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl border border-line bg-elevated shadow-2xl overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Atajos de teclado de la cabina"
                  >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl grid place-items-center bg-accent-subtle text-accent">
                          <Keyboard size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-ink">Atajos de cabina</h3>
                          <p className="text-xs text-ink-muted">Control rápido con teclado</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowShortcuts(false)}
                        className="min-w-[40px] min-h-[40px] rounded-xl grid place-items-center text-ink-muted hover:text-ink hover:bg-subtle"
                        aria-label="Cerrar atajos"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="p-3.5 grid gap-1">
                      {SHORTCUTS.map(([key, action]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 hover:bg-subtle"
                        >
                          <span className="text-xs sm:text-sm text-ink-secondary">{action}</span>
                          <kbd className="min-w-[40px] px-2 py-1 rounded-lg bg-surface border border-line text-center text-xs font-mono font-bold text-ink">
                            {key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
