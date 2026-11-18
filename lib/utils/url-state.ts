import type { Station, StationScope } from '../../types/station'
import { stationSlug } from '../services/station-normalizer'

export interface ExplorerUrlState {
  station?: string
  scope?: StationScope
  q?: string
  country?: string
  region?: string
  genre?: string
}

const VALID_SCOPES = new Set<StationScope>([
  'all',
  'jaen',
  'cajamarca',
  'peru',
  'world',
  'favorites',
  'recent',
])

export function parseExplorerUrlState(search: string): ExplorerUrlState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const rawScope = params.get('scope')?.trim() as StationScope | undefined
  const scope = rawScope && VALID_SCOPES.has(rawScope) && rawScope !== 'all' ? rawScope : undefined

  const station = params.get('station')?.trim() || undefined
  const q = params.get('q')?.trim() || undefined
  const country = params.get('country')?.trim() || undefined
  const region = params.get('region')?.trim() || undefined
  const genre = params.get('genre')?.trim() || undefined

  return {
    ...(station ? { station } : {}),
    ...(scope ? { scope } : {}),
    ...(q ? { q } : {}),
    ...(country ? { country } : {}),
    ...(region ? { region } : {}),
    ...(genre ? { genre } : {}),
  }
}

export function serializeExplorerUrlState(state: ExplorerUrlState): string {
  const params = new URLSearchParams()

  if (state.station?.trim()) params.set('station', state.station.trim())
  if (state.scope && state.scope !== 'all') params.set('scope', state.scope)
  if (state.q?.trim()) params.set('q', state.q.trim())
  if (!state.scope) {
    if (state.country?.trim()) params.set('country', state.country.trim())
    if (state.region?.trim()) params.set('region', state.region.trim())
  }
  if (state.genre?.trim()) params.set('genre', state.genre.trim())

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export function buildStationShareUrl(originOrHref: string, station: Station | null): string {
  try {
    const parsed = new URL(originOrHref)
    if (!station) return `${parsed.origin}/`
    const slug = stationSlug(station)
    return `${parsed.origin}/emisora/${encodeURIComponent(slug)}/`
  } catch {
    const base = originOrHref.split('?')[0].split('#')[0].replace(/\/$/, '')
    if (!station) return `${base}/`
    const slug = stationSlug(station)
    return `${base}/emisora/${encodeURIComponent(slug)}/`
  }
}
