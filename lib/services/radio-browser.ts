import type { Station } from '../../types/station'
import { normalizeStation, type StationRecord } from './station-normalizer'
import { validateStationUrl } from '../utils/validate'

export const RADIO_BROWSER_PAGE_SIZE = 24
const MIRRORS = ['https://de1.api.radio-browser.info', 'https://nl1.api.radio-browser.info']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CACHE_KEY = 'radio_browser_saved_v1'
let preferred = 0
const text = (v: unknown, max = 200) => typeof v === 'string' ? v.trim().slice(0, max) : ''
const secureUrl = (v: unknown) => typeof v === 'string' && v.length <= 4096 && v.startsWith('https://') && validateStationUrl(v) ? v : ''
export function radioBrowserUuid(id: unknown): string | null {
  const value = text(id, 80).replace(/^rb-/, '')
  return UUID.test(value) ? value.toLowerCase() : null
}

let regionNames: Intl.DisplayNames | undefined
export function countryName(code: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(['es'], { type: 'region' })
    return regionNames.of(code) || code
  }
  catch { return code }
}

export function normalizeRadioBrowserStation(value: unknown): StationRecord | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const uuid = radioBrowserUuid(raw.stationuuid)
  const url = secureUrl(raw.url_resolved) || secureUrl(raw.url)
  const name = text(raw.name)
  if (!uuid || !url || !name || raw.lastcheckok === 0 || raw.lastcheckok === false || raw.ssl_error === 1) return null
  const code = text(raw.countrycode, 2).toUpperCase()
  const country = /^[A-Z]{2}$/.test(code) ? countryName(code) : text(raw.country)
  const result = normalizeStation({
    id: 'rb-' + uuid, name, streamUrl: url, country, region: text(raw.state),
    // Avoid contacting arbitrary logo servers from a third-party directory before playback.
    tags: text(raw.tags, 1000).split(',').slice(0, 20),
    bitrate: typeof raw.bitrate === 'number' && Number.isFinite(raw.bitrate) && raw.bitrate >= 0 ? raw.bitrate : undefined,
    codec: text(raw.codec, 40),
  }, 'radio-browser', 'rb-' + uuid)
  return result ? { ...result, hls: raw.hls === 1 || raw.hls === true } : null
}

async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  let failure: unknown = new Error('Radio Browser no disponible')
  const first = preferred
  for (let i = 0; i < MIRRORS.length; i++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const index = (first + i) % MIRRORS.length
    const controller = new AbortController()
    const abort = () => controller.abort()
    signal?.addEventListener('abort', abort, { once: true })
    const timer = setTimeout(abort, 5000)
    try {
      const response = await fetch(MIRRORS[index] + path, {
        signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error',
      })
      if (!response.ok) throw new Error('HTTP ' + response.status)
      const body: unknown = await response.json()
      preferred = index
      return body
    } catch (err) {
      failure = err
      if (signal?.aborted) throw err
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
    }
  }
  throw failure
}

export async function searchRadioBrowser(options: { name: string; country: string; genre: string; page: number }, signal?: AbortSignal) {
  const params = new URLSearchParams({
    limit: String(RADIO_BROWSER_PAGE_SIZE), offset: String(Math.max(0, options.page) * RADIO_BROWSER_PAGE_SIZE),
    hidebroken: 'true', order: 'votes', reverse: 'true',
  })
  if (options.name.trim()) params.set('name', options.name.trim().slice(0, 120))
  if (/^[A-Z]{2}$/.test(options.country)) params.set('countrycode', options.country)
  if (options.genre.trim()) params.set('tag', options.genre.trim().slice(0, 80))
  const raw = await request('/json/stations/search?' + params, signal)
  if (!Array.isArray(raw)) throw new Error('Respuesta de catálogo inválida')
  const records = new Map<string, StationRecord>()
  const ids = new Set<string>()
  for (const value of raw.slice(0, RADIO_BROWSER_PAGE_SIZE)) {
    const station = normalizeRadioBrowserStation(value)
    if (station && !ids.has(station.id) && !records.has(station.streamUrl)) {
      records.set(station.streamUrl, station)
      ids.add(station.id)
    }
  }
  return { stations: Array.from(records.values()), hasMore: raw.length >= RADIO_BROWSER_PAGE_SIZE }
}

export async function resolveRadioBrowserStation(id: string, signal?: AbortSignal): Promise<StationRecord | null> {
  const uuid = radioBrowserUuid(id)
  if (!uuid) return null
  const raw = await request('/json/stations/byuuid?uuids=' + encodeURIComponent(uuid), signal)
  if (!Array.isArray(raw)) throw new Error('Respuesta de emisora inválida')
  return raw.map(normalizeRadioBrowserStation).find(s => s?.id === 'rb-' + uuid) ?? null
}

export function reportRadioBrowserPlay(station: Station): void {
  const uuid = station.source === 'radio-browser' ? radioBrowserUuid(station.id) : null
  if (uuid) void request('/json/url/' + uuid).catch(() => {})
}

export function readSavedRadioBrowserStations(): Station[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.filter((s): s is Station => Boolean(s && typeof s === 'object' && s.source === 'radio-browser' &&
      typeof s.id === 'string' && s.id.startsWith('rb-') && radioBrowserUuid(s.id) &&
      typeof s.name === 'string' && s.name.trim() && secureUrl(s.streamUrl) &&
      (s.tags === undefined || (Array.isArray(s.tags) && s.tags.every((tag: unknown) => typeof tag === 'string'))) &&
      (s.country === undefined || typeof s.country === 'string') && (s.region === undefined || typeof s.region === 'string')))
  } catch { return [] }
}

export function rememberRadioBrowserStation(station: Station, favorites: Set<string>, recent: string[]): Station[] {
  const old = readSavedRadioBrowserStations()
  if (station.source !== 'radio-browser' || !radioBrowserUuid(station.id) || !secureUrl(station.streamUrl)) return old
  const all = [station, ...old.filter(s => s.id !== station.id)]
  // Keep all favorites and current/recent stations; cap only unpinned discovery history.
  const pinned = all.filter(s => s.id === station.id || favorites.has(s.id!) || recent.includes(s.id!))
  const rest = all.filter(s => !pinned.includes(s)).slice(0, 40)
  const saved = [...pinned, ...rest]
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(saved)) } catch {}
  return saved
}
