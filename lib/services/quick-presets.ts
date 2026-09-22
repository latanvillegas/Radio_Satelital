/**
 * Servicio de Presets Rápidos de Estudio (Dial 1 a 6)
 * Permite memorizar y sintonizar emisoras favoritas instantáneamente con las teclas 1-6.
 */

import type { Station } from '@/types/station'

const STORAGE_KEY = 'radio_quick_presets_v1'
const TOTAL_PRESETS = 6

type PresetListener = (presets: (Station | null)[]) => void
const listeners = new Set<PresetListener>()

let currentPresets: (Station | null)[] = new Array(TOTAL_PRESETS).fill(null)

function loadPresets(): (Station | null)[] {
  if (typeof window === 'undefined') return new Array(TOTAL_PRESETS).fill(null)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const result = new Array(TOTAL_PRESETS).fill(null)
        for (let i = 0; i < TOTAL_PRESETS; i++) {
          if (parsed[i]) result[i] = parsed[i]
        }
        return result
      }
    }
  } catch {}
  return new Array(TOTAL_PRESETS).fill(null)
}

function savePresets(presets: (Station | null)[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch {}
}

function notifyListeners() {
  listeners.forEach((fn) => fn([...currentPresets]))
}

export function initQuickPresets(defaultStations: Station[] = []) {
  if (typeof window === 'undefined') return
  const loaded = loadPresets()
  // Si están completamente vacíos y se proporcionan estaciones, poblar con las primeras
  const hasAny = loaded.some(Boolean)
  if (!hasAny && defaultStations.length > 0) {
    for (let i = 0; i < Math.min(TOTAL_PRESETS, defaultStations.length); i++) {
      loaded[i] = defaultStations[i]
    }
    savePresets(loaded)
  }
  currentPresets = loaded
  notifyListeners()
}

export function getQuickPresets(): (Station | null)[] {
  if (currentPresets.every((p) => p === null) && typeof window !== 'undefined') {
    currentPresets = loadPresets()
  }
  return [...currentPresets]
}

export function setQuickPreset(slotIndex: number, station: Station) {
  if (slotIndex < 0 || slotIndex >= TOTAL_PRESETS) return
  currentPresets[slotIndex] = station
  savePresets(currentPresets)
  notifyListeners()
}

export function clearQuickPreset(slotIndex: number) {
  if (slotIndex < 0 || slotIndex >= TOTAL_PRESETS) return
  currentPresets[slotIndex] = null
  savePresets(currentPresets)
  notifyListeners()
}

export function subscribeQuickPresets(listener: PresetListener): () => void {
  listeners.add(listener)
  listener(getQuickPresets())
  return () => {
    listeners.delete(listener)
  }
}
