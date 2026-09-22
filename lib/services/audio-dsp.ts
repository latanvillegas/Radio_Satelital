/**
 * Procesador de Señal Digital (DSP) y Ecualizador de Estudio Broadcast
 * Utiliza Web Audio API con degradación elegante para compatibilidad total de streams.
 */

export interface EqBand {
  id: string
  label: string
  frequency: number
  type: BiquadFilterType
  gain: number // -12dB a +12dB
}

export interface DspPreset {
  id: string
  name: string
  description: string
  gains: [number, number, number, number, number]
  preAmp: number // dB
  compressor: boolean
}

export const DSP_PRESETS: DspPreset[] = [
  {
    id: 'flat',
    name: 'Plano (Flat)',
    description: 'Respuesta acústica neutra de monitoreo',
    gains: [0, 0, 0, 0, 0],
    preAmp: 0,
    compressor: false,
  },
  {
    id: 'voice',
    name: 'Voz / Noticias',
    description: 'Acentúa frecuencias vocales y reduce retumbes',
    gains: [-3, 2, 4, 3, -1],
    preAmp: 2,
    compressor: true,
  },
  {
    id: 'bass',
    name: 'Bass Boost',
    description: 'Graves profundos y contundentes',
    gains: [6, 4, -1, 1, 2],
    preAmp: 0,
    compressor: false,
  },
  {
    id: 'pop',
    name: 'Pop & Éxitos',
    description: 'Curva en V comercial de alta energía',
    gains: [4, 1, -1, 3, 5],
    preAmp: 1,
    compressor: true,
  },
  {
    id: 'acoustic',
    name: 'Acústico & Jazz',
    description: 'Claridad natural de instrumentos de cuerda y metales',
    gains: [2, 1, 2, 3, 2],
    preAmp: 0,
    compressor: false,
  },
  {
    id: 'bright',
    name: 'Estudio Brillo',
    description: 'Definición cristalina en frecuencias altas',
    gains: [-2, 0, 2, 5, 6],
    preAmp: 1,
    compressor: false,
  },
]

export interface DspState {
  enabled: boolean
  activePresetId: string
  bands: [number, number, number, number, number] // Ganancia por banda en dB (-12 a +12)
  preAmp: number // dB (0 a +12)
  compressor: boolean
  isWebAudioActive: boolean
}

const STORAGE_KEY = 'radio_dsp_settings_v1'

const DEFAULT_STATE: DspState = {
  enabled: true,
  activePresetId: 'flat',
  bands: [0, 0, 0, 0, 0],
  preAmp: 0,
  compressor: false,
  isWebAudioActive: false,
}

let audioCtx: AudioContext | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let filterNodes: BiquadFilterNode[] = []
let preAmpNode: GainNode | null = null
let compressorNode: DynamicsCompressorNode | null = null
let analyserNode: AnalyserNode | null = null
let streamDestNode: MediaStreamAudioDestinationNode | null = null
let connectedAudioElement: HTMLAudioElement | null = null

let currentState: DspState = DEFAULT_STATE
const dspListeners = new Set<(state: DspState) => void>()

function loadSavedState(): DspState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_STATE, ...parsed, isWebAudioActive: false }
    }
  } catch {}
  return DEFAULT_STATE
}

function saveState(state: DspState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        enabled: state.enabled,
        activePresetId: state.activePresetId,
        bands: state.bands,
        preAmp: state.preAmp,
        compressor: state.compressor,
      })
    )
  } catch {}
}

function notifyDspChange() {
  dspListeners.forEach((fn) => fn(currentState))
}

export function subscribeDsp(listener: (state: DspState) => void): () => void {
  dspListeners.add(listener)
  listener(currentState)
  return () => {
    dspListeners.delete(listener)
  }
}

export function getDspState(): DspState {
  return currentState
}

const FREQUENCIES = [60, 250, 1000, 4000, 14000]
const FILTER_TYPES: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf']

/**
 * Inicializa el grafo Web Audio conectándolo al elemento <audio>.
 * Si falla debido a políticas de CORS de navegadores estrictos, la señal sigue
 * sonando a través de la salida normal del elemento de audio.
 */
export function initAudioDsp(audio: HTMLAudioElement): boolean {
  if (typeof window === 'undefined') return false

  // Cargar preferencias guardadas la primera vez
  if (currentState === DEFAULT_STATE) {
    currentState = loadSavedState()
  }

  if (connectedAudioElement === audio && audioCtx && audioCtx.state !== 'closed') {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
    return true
  }

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return false

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass()
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }

    if (!sourceNode || connectedAudioElement !== audio) {
      try {
        sourceNode = audioCtx.createMediaElementSource(audio)
        connectedAudioElement = audio
      } catch (err) {
        // En caso de que el elemento ya estuviera conectado previamente
        console.warn('[DSP] Reutilizando conexión previa o captura:', err)
      }
    }

    if (!sourceNode) return false

    // Crear filtros de ecualización de 5 bandas
    filterNodes = FREQUENCIES.map((freq, i) => {
      const filter = audioCtx!.createBiquadFilter()
      filter.type = FILTER_TYPES[i]
      filter.frequency.value = freq
      filter.gain.value = currentState.enabled ? currentState.bands[i] : 0
      if (FILTER_TYPES[i] === 'peaking') {
        filter.Q.value = 1.2
      }
      return filter
    })

    // Pre-amplificador (GainNode)
    preAmpNode = audioCtx.createGain()
    const preAmpGainMultiplier = Math.pow(10, (currentState.enabled ? currentState.preAmp : 0) / 20)
    preAmpNode.gain.value = preAmpGainMultiplier

    // Compresor de estudio broadcast (evita distorsión/clipping)
    compressorNode = audioCtx.createDynamicsCompressor()
    compressorNode.threshold.value = -24
    compressorNode.knee.value = 30
    compressorNode.ratio.value = 4
    compressorNode.attack.value = 0.003
    compressorNode.release.value = 0.25

    // Analizador de espectro y vúmetros
    analyserNode = audioCtx.createAnalyser()
    analyserNode.fftSize = 128
    analyserNode.smoothingTimeConstant = 0.8

    // Destino de grabación en vivo (StreamDestination)
    streamDestNode = audioCtx.createMediaStreamDestination()

    // Conectar el grafo de audio:
    // source -> band0 -> band1 -> band2 -> band3 -> band4 -> preAmp -> compressor/bypass -> analyser -> destination & record
    let lastNode: AudioNode = sourceNode
    for (const filter of filterNodes) {
      lastNode.connect(filter)
      lastNode = filter
    }

    lastNode.connect(preAmpNode)
    lastNode = preAmpNode

    if (currentState.compressor && currentState.enabled) {
      lastNode.connect(compressorNode)
      lastNode = compressorNode
    }

    lastNode.connect(analyserNode)
    analyserNode.connect(audioCtx.destination)
    analyserNode.connect(streamDestNode)

    currentState = { ...currentState, isWebAudioActive: true }
    notifyDspChange()
    return true
  } catch (e) {
    console.warn('[DSP] No se pudo inicializar Web Audio graph (posible CORS o política):', e)
    currentState = { ...currentState, isWebAudioActive: false }
    notifyDspChange()
    return false
  }
}

export function setDspEnabled(enabled: boolean) {
  currentState = { ...currentState, enabled }
  saveState(currentState)

  if (filterNodes.length === 5) {
    filterNodes.forEach((filter, i) => {
      filter.gain.value = enabled ? currentState.bands[i] : 0
    })
  }

  if (preAmpNode) {
    const mult = enabled ? Math.pow(10, currentState.preAmp / 20) : 1
    preAmpNode.gain.value = mult
  }

  notifyDspChange()
}

export function setBandGain(bandIndex: number, gainDb: number) {
  if (bandIndex < 0 || bandIndex >= 5) return
  const clamped = Math.max(-12, Math.min(12, gainDb))
  const newBands = [...currentState.bands] as [number, number, number, number, number]
  newBands[bandIndex] = clamped

  currentState = {
    ...currentState,
    bands: newBands,
    activePresetId: 'custom',
  }
  saveState(currentState)

  if (filterNodes[bandIndex] && currentState.enabled) {
    filterNodes[bandIndex].gain.setTargetAtTime(clamped, audioCtx?.currentTime || 0, 0.05)
  }

  notifyDspChange()
}

export function setPreAmpGain(gainDb: number) {
  const clamped = Math.max(0, Math.min(12, gainDb))
  currentState = { ...currentState, preAmp: clamped }
  saveState(currentState)

  if (preAmpNode && currentState.enabled) {
    const mult = Math.pow(10, clamped / 20)
    preAmpNode.gain.setTargetAtTime(mult, audioCtx?.currentTime || 0, 0.05)
  }

  notifyDspChange()
}

export function setCompressorEnabled(enabled: boolean) {
  currentState = { ...currentState, compressor: enabled }
  saveState(currentState)
  // Re-enlazar si se desea o dejar configurado
  notifyDspChange()
}

export function applyPreset(presetId: string) {
  const preset = DSP_PRESETS.find((p) => p.id === presetId)
  if (!preset) return

  currentState = {
    ...currentState,
    activePresetId: preset.id,
    bands: [...preset.gains],
    preAmp: preset.preAmp,
    compressor: preset.compressor,
  }
  saveState(currentState)

  if (filterNodes.length === 5 && currentState.enabled) {
    filterNodes.forEach((node, idx) => {
      node.gain.setTargetAtTime(preset.gains[idx], audioCtx?.currentTime || 0, 0.05)
    })
  }

  if (preAmpNode && currentState.enabled) {
    const mult = Math.pow(10, preset.preAmp / 20)
    preAmpNode.gain.setTargetAtTime(mult, audioCtx?.currentTime || 0, 0.05)
  }

  notifyDspChange()
}

export function getAnalyserData(): Uint8Array | null {
  if (!analyserNode) return null
  const data = new Uint8Array(analyserNode.frequencyBinCount)
  analyserNode.getByteFrequencyData(data)
  return data
}

/**
 * Retorna el stream procesado para la grabadora
 */
export function getDspOutputStream(): MediaStream | null {
  if (streamDestNode) {
    return streamDestNode.stream
  }
  return null
}
