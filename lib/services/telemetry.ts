/**
 * Servicio de Observabilidad Operativa y Salud de Streams
 * Registra latencia real de primer audio (TTFA), tasa de éxito por emisora y Web Vitals sin rastreo externo.
 */

export type StreamHealthState = 'unknown' | 'healthy' | 'degraded' | 'unreachable'

export interface StationHealthRecord {
  key: string
  stationName: string
  plays: number
  failures: number
  consecutiveFailures: number
  lastTtfaMs: number | null
  avgTtfaMs: number | null
  lastFailureReason: string | null
  lastCheckedAt: number
  status: StreamHealthState
}

export interface WebVitalsSnapshot {
  fcpMs: number | null
  lcpMs: number | null
  clsScore: number | null
}

export interface TelemetrySummary {
  totalPlays: number
  totalFailures: number
  avgGlobalTtfaMs: number | null
  healthyStationsCount: number
  unreachableStationsCount: number
  webVitals: WebVitalsSnapshot
  records: Record<string, StationHealthRecord>
}

const STORAGE_KEY = 'radio_stream_telemetry_v1'
const MAX_STORED_STATIONS = 80

let recordsCache: Record<string, StationHealthRecord> | null = null
let vitalsInstalled = false
const webVitals: WebVitalsSnapshot = {
  fcpMs: null,
  lcpMs: null,
  clsScore: null,
}

type TelemetryListener = (summary: TelemetrySummary) => void
const listeners = new Set<TelemetryListener>()

function ensureLoaded(): Record<string, StationHealthRecord> {
  if (recordsCache) return recordsCache
  if (typeof window === 'undefined') {
    recordsCache = {}
    return recordsCache
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, StationHealthRecord>
      if (parsed && typeof parsed === 'object') {
        recordsCache = parsed
        return recordsCache
      }
    }
  } catch {}
  recordsCache = {}
  return recordsCache
}

function persistRecords() {
  if (typeof window === 'undefined' || !recordsCache) return
  try {
    const entries = Object.entries(recordsCache)
    if (entries.length > MAX_STORED_STATIONS) {
      entries.sort((a, b) => b[1].lastCheckedAt - a[1].lastCheckedAt)
      recordsCache = Object.fromEntries(entries.slice(0, MAX_STORED_STATIONS))
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recordsCache))
  } catch {}
}

function computeStatus(rec: Pick<StationHealthRecord, 'consecutiveFailures' | 'avgTtfaMs'>): StreamHealthState {
  if (rec.consecutiveFailures >= 2) return 'unreachable'
  if (rec.consecutiveFailures === 1 || (rec.avgTtfaMs !== null && rec.avgTtfaMs > 4500)) {
    return 'degraded'
  }
  return 'healthy'
}

function notify() {
  const snapshot = getTelemetrySummary()
  listeners.forEach((fn) => {
    try {
      fn(snapshot)
    } catch {}
  })
}

export function installWebVitalsObserver(): void {
  if (vitalsInstalled || typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return
  }
  vitalsInstalled = true

  try {
    const paintObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          webVitals.fcpMs = Math.round(entry.startTime)
          notify()
        }
      }
    })
    paintObs.observe({ type: 'paint', buffered: true })
  } catch {}

  try {
    const lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      if (last) {
        webVitals.lcpMs = Math.round(last.startTime)
        notify()
      }
    })
    lcpObs.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {}

  try {
    let clsValue = 0
    const clsObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        if (!shift.hadRecentInput && typeof shift.value === 'number') {
          clsValue += shift.value
          webVitals.clsScore = Number(clsValue.toFixed(3))
          notify()
        }
      }
    })
    clsObs.observe({ type: 'layout-shift', buffered: true })
  } catch {}
}

export function recordStreamSuccess(key: string, stationName: string, ttfaMs: number | null): StationHealthRecord {
  const store = ensureLoaded()
  const existing = store[key]
  const plays = (existing?.plays ?? 0) + 1

  let avgTtfaMs = existing?.avgTtfaMs ?? null
  if (ttfaMs !== null && ttfaMs >= 0) {
    avgTtfaMs =
      avgTtfaMs === null
        ? ttfaMs
        : Math.round(avgTtfaMs * 0.7 + ttfaMs * 0.3)
  }

  const updated: StationHealthRecord = {
    key,
    stationName,
    plays,
    failures: existing?.failures ?? 0,
    consecutiveFailures: 0,
    lastTtfaMs: ttfaMs,
    avgTtfaMs,
    lastFailureReason: null,
    lastCheckedAt: Date.now(),
    status: computeStatus({ consecutiveFailures: 0, avgTtfaMs }),
  }

  store[key] = updated
  persistRecords()
  notify()
  return updated
}

export function recordStreamFailure(key: string, stationName: string, reason: string): StationHealthRecord {
  const store = ensureLoaded()
  const existing = store[key]
  const consecutiveFailures = (existing?.consecutiveFailures ?? 0) + 1

  const updated: StationHealthRecord = {
    key,
    stationName,
    plays: existing?.plays ?? 0,
    failures: (existing?.failures ?? 0) + 1,
    consecutiveFailures,
    lastTtfaMs: existing?.lastTtfaMs ?? null,
    avgTtfaMs: existing?.avgTtfaMs ?? null,
    lastFailureReason: reason,
    lastCheckedAt: Date.now(),
    status: computeStatus({ consecutiveFailures, avgTtfaMs: existing?.avgTtfaMs ?? null }),
  }

  store[key] = updated
  persistRecords()
  notify()
  return updated
}

export function getStationHealth(key: string): StationHealthRecord | null {
  const store = ensureLoaded()
  return store[key] ?? null
}

export function getTelemetrySummary(): TelemetrySummary {
  const store = ensureLoaded()
  const values = Object.values(store)

  let totalPlays = 0
  let totalFailures = 0
  let ttfaSum = 0
  let ttfaCount = 0
  let healthyStationsCount = 0
  let unreachableStationsCount = 0

  for (const item of values) {
    totalPlays += item.plays
    totalFailures += item.failures
    if (item.avgTtfaMs !== null) {
      ttfaSum += item.avgTtfaMs
      ttfaCount++
    }
    if (item.status === 'healthy') healthyStationsCount++
    if (item.status === 'unreachable') unreachableStationsCount++
  }

  return {
    totalPlays,
    totalFailures,
    avgGlobalTtfaMs: ttfaCount > 0 ? Math.round(ttfaSum / ttfaCount) : null,
    healthyStationsCount,
    unreachableStationsCount,
    webVitals: { ...webVitals },
    records: { ...store },
  }
}

export function resetTelemetry(): void {
  recordsCache = {}
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }
  notify()
}

export function subscribeTelemetry(listener: TelemetryListener): () => void {
  installWebVitalsObserver()
  listeners.add(listener)
  listener(getTelemetrySummary())
  return () => {
    listeners.delete(listener)
  }
}
