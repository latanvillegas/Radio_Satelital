/**
 * Grabadora de Emisiones en Vivo (Stream Recorder)
 * Permite capturar transmisiones de radio en tiempo real con indicador y descarga instantánea.
 */

import { getDspOutputStream } from './audio-dsp'
import { getAudio } from './player'

export interface RecorderState {
  isRecording: boolean
  isPaused: boolean
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
let timerInterval: ReturnType<typeof setInterval> | null = null
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

  if (!stream) {
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
    mediaRecorder = new MediaRecorder(stream, options)
    recordedChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data)
      }
    }

    mediaRecorder.onerror = (err) => {
      console.error('[Recorder] Error en MediaRecorder:', err)
      stopRecording()
    }

    mediaRecorder.start(1000) // Trocear cada segundo

    if (timerInterval) clearInterval(timerInterval)
    const startTime = Date.now()

    timerInterval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000)
      currentState = { ...currentState, durationSeconds: secs }
      notifyRecorderChange()
    }, 1000)

    const cleanStation = stationName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
    const ext = mimeType.includes('ogg') ? 'ogg' : 'webm'
    const fileName = `RadioSatelital_${cleanStation}_${timestamp}.${ext}`

    currentState = {
      isRecording: true,
      isPaused: false,
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
    currentState = {
      ...currentState,
      error: 'No se pudo iniciar la captura de audio (seguridad de stream o permisos)',
    }
    notifyRecorderChange()
    return false
  }
}

export function stopRecording(): Blob | null {
  if (!currentState.isRecording || !mediaRecorder) {
    return null
  }

  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  try {
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
  } catch (e) {
    console.warn('[Recorder] Error al detener:', e)
  }

  const mimeType = mediaRecorder.mimeType || 'audio/webm'
  const blob = new Blob(recordedChunks, { type: mimeType })
  const url = URL.createObjectURL(blob)

  currentState = {
    ...currentState,
    isRecording: false,
    isPaused: false,
    recordedBlob: blob,
    recordedUrl: url,
  }
  notifyRecorderChange()
  return blob
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
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 1500)
}
