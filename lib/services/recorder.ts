/**
 * Grabadora de Emisiones en Vivo (Stream Recorder)
 * Permite capturar transmisiones de radio en tiempo real con indicador y descarga instantánea.
 */

import { getDspOutputStream } from './audio-dsp'
import { getAudio } from './player'

export interface RecorderState {
  isRecording: boolean
  isPaused: boolean
  isFinalizing?: boolean
  durationSeconds: number
  recordedBlob: Blob | null
  recordedUrl: string | null
  fileName: string | null
  stationName: string | null
  error: string | null
}

const DEFAULT_RECORDER_STATE: RecorderState = {
  isRecording: false,
  isPaused: false,
  durationSeconds: 0,
  recordedBlob: null,
  recordedUrl: null,
  fileName: null,
  stationName: null,
  error: null,
}

let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []
let stopPromise: Promise<Blob | null> | null = null
let resolveStop: ((blob: Blob | null) => void) | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null
let finalizationTimer: ReturnType<typeof setTimeout> | null = null
const FINALIZATION_TIMEOUT_MS = 5000
let currentState: RecorderState = DEFAULT_RECORDER_STATE
const recorderListeners = new Set<(state: RecorderState) => void>()

function notifyRecorderChange() {
  recorderListeners.forEach((l) => l(currentState))
}

export function subscribeRecorder(listener: (state: RecorderState) => void): () => void {
  recorderListeners.add(listener)
  listener(currentState)
  return () => {
    recorderListeners.delete(listener)
  }
}

export function getRecorderState(): RecorderState {
  return currentState
}

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
      return t
    }
  }
  return ''
}

export function startRecording(stationName = 'Radio Satelital'): boolean {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    currentState = { ...currentState, error: 'Grabación no soportada en este navegador' }
    notifyRecorderChange()
    return false
  }

  if (currentState.isFinalizing || stopPromise) return false
  if (currentState.isRecording) {
    return true
  }

  // 1. Obtener stream de audio (priorizar DSP con EQ aplicado, o capturar desde el elemento audio)
  let stream = getDspOutputStream()

  if (!stream || stream.getAudioTracks().length === 0) {
    const audio = getAudio()
    if (audio) {
      const anyAudio = audio as unknown as { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream }
      if (typeof anyAudio.captureStream === 'function') {
        try {
          stream = anyAudio.captureStream()
        } catch {}
      } else if (typeof anyAudio.mozCaptureStream === 'function') {
        try {
          stream = anyAudio.mozCaptureStream()
        } catch {}
      }
    }
  }

  if (!stream || stream.getAudioTracks().length === 0) {
    currentState = {
      ...currentState,
      error: 'Inicia la reproducción de una emisora antes de grabar',
    }
    notifyRecorderChange()
    return false
  }

  try {
    const mimeType = getSupportedMimeType()
    const options: MediaRecorderOptions = mimeType ? { mimeType } : {}
    const recorder = new MediaRecorder(stream, options)
    mediaRecorder = recorder
    recordedChunks = []

    recorder.ondataavailable = (e) => {
      if (mediaRecorder === recorder && e.data && e.data.size > 0) {
        recordedChunks.push(e.data)
      }
    }

    recorder.onstop = () => finishRecording(recorder)
    recorder.onerror = () => {
      if (mediaRecorder !== recorder) return
      currentState = { ...currentState, error: 'La captura se interrumpió; se conservan los datos disponibles.' }
      void stopRecording()
    }

    recorder.start(1000) // Trocear cada segundo
    if (currentState.recordedUrl) URL.revokeObjectURL(currentState.recordedUrl)

    if (timerInterval) clearInterval(timerInterval)
    const startTime = Date.now()

    timerInterval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000)
      currentState = { ...currentState, durationSeconds: secs }
      notifyRecorderChange()
    }, 1000)

    const cleanStation = stationName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
    const ext = recordingExtension(recorder.mimeType || mimeType)
    const fileName = `RadioSatelital_${cleanStation}_${timestamp}.${ext}`

    currentState = {
      isRecording: true,
      isPaused: false,
      isFinalizing: false,
      durationSeconds: 0,
      recordedBlob: null,
      recordedUrl: null,
      fileName,
      stationName,
      error: null,
    }
    notifyRecorderChange()
    return true
  } catch (err) {
    console.error('[Recorder] Error al iniciar grabación:', err)
    mediaRecorder = null
    recordedChunks = []
    currentState = {
      ...currentState,
      error: 'No se pudo iniciar la captura de audio (seguridad de stream o permisos)',
    }
    notifyRecorderChange()
    return false
  }
}

export function recordingExtension(mime: string): string {
  const type = mime.toLowerCase()
  if (type.includes('ogg')) return 'ogg'
  if (type.includes('mp4')) return 'm4a'
  return 'webm'
}

function clearRecordingTimer() {
  if (timerInterval !== null) clearInterval(timerInterval)
  timerInterval = null
}

function finishRecording(recorder: MediaRecorder) {
  if (mediaRecorder !== recorder) return
  clearRecordingTimer()
  if (finalizationTimer !== null) clearTimeout(finalizationTimer)
  finalizationTimer = null
  const mimeType = recorder.mimeType || recordedChunks[0]?.type || 'audio/webm'
  const blob = recordedChunks.length ? new Blob(recordedChunks, { type: mimeType }) : null
  let url: string | null = null
  if (blob) {
    try { url = URL.createObjectURL(blob) } catch {}
  }
  recordedChunks = []
  mediaRecorder = null
  recorder.ondataavailable = null
  recorder.onerror = null
  recorder.onstop = null
  const resolve = resolveStop
  resolveStop = null
  stopPromise = null
  currentState = {
    ...currentState,
    isRecording: false,
    isPaused: false,
    isFinalizing: false,
    recordedBlob: blob,
    recordedUrl: url,
    fileName: currentState.fileName?.replace(/\.[^.]+$/, '.' + recordingExtension(mimeType)) ?? null,
    error: currentState.error || (blob ? null : 'No se recibieron datos de audio.'),
  }
  resolve?.(blob)
  notifyRecorderChange()
}

/** Wait for the final data and stop event; preserve received chunks if the browser never completes. */
export function stopRecording(): Promise<Blob | null> {
  if (stopPromise) return stopPromise
  const recorder = mediaRecorder
  if (!recorder) return Promise.resolve(null)
  clearRecordingTimer()
  const pending = new Promise<Blob | null>(resolve => { resolveStop = resolve })
  stopPromise = pending
  currentState = { ...currentState, isRecording: false, isFinalizing: true }
  finalizationTimer = setTimeout(() => {
    if (mediaRecorder !== recorder) return
    currentState = { ...currentState, error: 'El navegador no confirmó el cierre; la grabación puede estar incompleta.' }
    finishRecording(recorder)
  }, FINALIZATION_TIMEOUT_MS)
  notifyRecorderChange()
  try {
    if (recorder.state !== 'inactive') recorder.stop()
  } catch {
    currentState = { ...currentState, error: 'No se pudo detener normalmente la grabación.' }
    finishRecording(recorder)
  }
  return pending
}

export function downloadRecording(blob?: Blob | null, fileName?: string | null) {
  const targetBlob = blob || currentState.recordedBlob
  const targetName = fileName || currentState.fileName || `RadioSatelital_Emision_${Date.now()}.webm`

  if (!targetBlob) return

  const url = URL.createObjectURL(targetBlob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = targetName
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    a.remove()
    URL.revokeObjectURL(url)
  }, 1500)
}
