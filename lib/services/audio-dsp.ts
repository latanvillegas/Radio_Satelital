/**
 * Procesador de Señal Digital (DSP) y Ecualizador de Estudio Broadcast
 * Utiliza Web Audio API con reconexión dinámica de nodos sin fugas y degradación elegante ante CORS.
 */

export interface EqBand {
  id: string
  label: string
  frequency: number
  type: BiquadFilterType
  gain: number
}

export interface DspPreset {
  id: string
  name: string
  description: string
  gains: [number, number, number, number, number]
  preAmp: number
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
  bands: [number, number, number, number, number]
  preAmp: number
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

const FREQUENCIES = [60, 250, 1000, 4000, 14000] as const
const FILTER_TYPES: readonly BiquadFilterType[] = [
  'lowshelf',
  'peaking',
  'peaking',
  'peaking',
  'highshelf',
]

let audioCtx: AudioContext | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let filterNodes: BiquadFilterNode[] = []
let preAmpNode: GainNode | null = null
let compressorNode: DynamicsCompressorNode | null = null
let analyserNode: AnalyserNode | null = null
let streamDestNode: MediaStreamAudioDestinationNode | null = null
let connectedAudioElement: HTMLAudioElement | null = null
let stateHydrated = false

let currentState: DspState = { ...DEFAULT_STATE }
const dspListeners = new Set<(state: DspState) => void>()

function loadSavedState(): DspState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DspState>
      const validBands =
        Array.isArray(parsed.bands) && parsed.bands.length === 5
          ? (parsed.bands.map((v) => Math.max(-12, Math.min(12, Number(v) || 0))) as [
              number,
              number,
              number,
              number,
              number,
            ])
          : [...DEFAULT_STATE.bands]
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_STATE.enabled,
        activePresetId:
          typeof parsed.activePresetId === 'string'
            ? parsed.activePresetId
            : DEFAULT_STATE.activePresetId,
        bands: validBands as [number, number, number, number, number],
        preAmp:
          typeof parsed.preAmp === 'number'
            ? Math.max(0, Math.min(12, parsed.preAmp))
            : DEFAULT_STATE.preAmp,
        compressor:
          typeof parsed.compressor === 'boolean' ? parsed.compressor : DEFAULT_STATE.compressor,
        isWebAudioActive: false,
      }
    }
  } catch {}
  return { ...DEFAULT_STATE }
}

function ensureHydratedState() {
  if (stateHydrated || typeof window === 'undefined') return
  stateHydrated = true
  const loaded = loadSavedState()
  currentState = { ...loaded, isWebAudioActive: currentState.isWebAudioActive }
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
  ensureHydratedState()
  dspListeners.add(listener)
  listener(currentState)
  return () => {
    dspListeners.delete(listener)
  }
}

export function getDspState(): DspState {
  ensureHydratedState()
  return currentState
}

function disconnectProcessingNodes() {
  try {
    sourceNode?.disconnect()
  } catch {}
  for (const node of filterNodes) {
    try {
      node.disconnect()
    } catch {}
  }
  try {
    preAmpNode?.disconnect()
  } catch {}
  try {
    compressorNode?.disconnect()
  } catch {}
  try {
    analyserNode?.disconnect()
  } catch {}
}

/**
 * Reconecta la cadena activa en caliente sin recrear el MediaElementAudioSourceNode,
 * permitiendo activar/desactivar el compresor o el bypass instantáneamente.
 */
function rewireGraph() {
  if (!audioCtx || !sourceNode || filterNodes.length !== 5 || !preAmpNode || !compressorNode || !analyserNode) {
    return
  }

  disconnectProcessingNodes()

  let lastNode: AudioNode = sourceNode
  if (currentState.enabled) {
    for (const filter of filterNodes) {
      lastNode.connect(filter)
      lastNode = filter
    }
    lastNode.connect(preAmpNode)
    lastNode = preAmpNode

    if (currentState.compressor) {
      lastNode.connect(compressorNode)
      lastNode = compressorNode
    }
  }

  lastNode.connect(analyserNode)
  analyserNode.connect(audioCtx.destination)
  if (streamDestNode) {
    analyserNode.connect(streamDestNode)
  }
}

function syncNodeParameters() {
  if (!audioCtx) return
  const now = audioCtx.currentTime || 0

  if (filterNodes.length === 5) {
    filterNodes.forEach((filter, idx) => {
      const targetGain = currentState.enabled ? currentState.bands[idx] : 0
      filter.gain.setTargetAtTime(targetGain, now, 0.04)
    })
  }

  if (preAmpNode) {
    const mult = currentState.enabled ? Math.pow(10, currentState.preAmp / 20) : 1
    preAmpNode.gain.setTargetAtTime(mult, now, 0.04)
  }
}

export function initAudioDsp(audio: HTMLAudioElement): boolean {
  if (typeof window === 'undefined') return false
  if (audio.crossOrigin !== 'anonymous') return false

  ensureHydratedState()

  if (connectedAudioElement === audio && audioCtx && audioCtx.state !== 'closed' && filterNodes.length === 5) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
    syncNodeParameters()
    if (!currentState.isWebAudioActive) {
      currentState = { ...currentState, isWebAudioActive: true }
      notifyDspChange()
    }
    return true
  }

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return false

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass()
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }

    disconnectProcessingNodes()

    if (!sourceNode || connectedAudioElement !== audio) {
      sourceNode = audioCtx.createMediaElementSource(audio)
      connectedAudioElement = audio
    }

    const ctx = audioCtx
    filterNodes = FREQUENCIES.map((freq, i) => {
      const filter = ctx.createBiquadFilter()
      filter.type = FILTER_TYPES[i]
      filter.frequency.value = freq
      filter.gain.value = currentState.enabled ? currentState.bands[i] : 0
      if (FILTER_TYPES[i] === 'peaking') {
        filter.Q.value = 1.2
      }
      return filter
    })

    preAmpNode = ctx.createGain()
    preAmpNode.gain.value = currentState.enabled ? Math.pow(10, currentState.preAmp / 20) : 1

    compressorNode = ctx.createDynamicsCompressor()
    compressorNode.threshold.value = -24
    compressorNode.knee.value = 30
    compressorNode.ratio.value = 4
    compressorNode.attack.value = 0.003
    compressorNode.release.value = 0.25

    analyserNode = ctx.createAnalyser()
    analyserNode.fftSize = 128
    analyserNode.smoothingTimeConstant = 0.8

    streamDestNode = ctx.createMediaStreamDestination()

    rewireGraph()

    currentState = { ...currentState, isWebAudioActive: true }
    notifyDspChange()
    return true
  } catch (e) {
    console.warn('[DSP] No se pudo inicializar Web Audio graph:', e)
    currentState = { ...currentState, isWebAudioActive: false }
    notifyDspChange()
    return false
  }
}

export function setDspEnabled(enabled: boolean) {
  ensureHydratedState()
  currentState = { ...currentState, enabled }
  saveState(currentState)
  syncNodeParameters()
  rewireGraph()
  notifyDspChange()
}

export function setBandGain(bandIndex: number, gainDb: number) {
  ensureHydratedState()
  if (!Number.isInteger(bandIndex) || bandIndex < 0 || bandIndex >= 5 || !Number.isFinite(gainDb)) return
  const clamped = Math.max(-12, Math.min(12, gainDb))
  const newBands = [...currentState.bands] as [number, number, number, number, number]
  newBands[bandIndex] = clamped

  currentState = {
    ...currentState,
    bands: newBands,
    activePresetId: 'custom',
  }
  saveState(currentState)
  syncNodeParameters()
  notifyDspChange()
}

export function setPreAmpGain(gainDb: number) {
  ensureHydratedState()
  if (!Number.isFinite(gainDb)) return
  const clamped = Math.max(0, Math.min(12, gainDb))
  currentState = { ...currentState, preAmp: clamped }
  saveState(currentState)
  syncNodeParameters()
  notifyDspChange()
}

export function setCompressorEnabled(enabled: boolean) {
  ensureHydratedState()
  currentState = { ...currentState, compressor: enabled }
  saveState(currentState)
  rewireGraph()
  notifyDspChange()
}

export function applyPreset(presetId: string) {
  ensureHydratedState()
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
  syncNodeParameters()
  rewireGraph()
  notifyDspChange()
}

let analyserBuffer: Uint8Array | null = null

export function getAnalyserData(): Uint8Array | null {
  if (!analyserNode) return null
  if (!analyserBuffer || analyserBuffer.length !== analyserNode.frequencyBinCount) {
    analyserBuffer = new Uint8Array(analyserNode.frequencyBinCount)
  }
  analyserNode.getByteFrequencyData(analyserBuffer)
  return analyserBuffer
}

export function getDspOutputStream(): MediaStream | null {
  return streamDestNode ? streamDestNode.stream : null
}

export function suspendAudioDsp(): void {
  if (audioCtx?.state === 'running') void audioCtx.suspend().catch(() => {})
}

export function resumeAudioDsp(): void {
  if (audioCtx?.state === 'suspended') void audioCtx.resume().catch(() => {})
}

export function releaseAudioDsp(): void {
  disconnectProcessingNodes()
  const ctx = audioCtx
  audioCtx = null
  if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {})
  sourceNode = null
  connectedAudioElement = null
  filterNodes = []
  preAmpNode = null
  compressorNode = null
  analyserNode = null
  streamDestNode = null
  analyserBuffer = null
  currentState = { ...currentState, isWebAudioActive: false }
  notifyDspChange()
}
