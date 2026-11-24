import type { Station, StationSource } from '../../types/station'

export type { StationSource }

export type StationInput = {
  id?: string
  name?: string
  country?: string
  region?: string
  streamUrl?: string
  url?: string
  logoUrl?: string
  isFavorite?: boolean
  bitrate?: number
  codec?: string
  tags?: unknown
}

export type StationRecord = Omit<Station, 'id' | 'url' | 'streamUrl'> & {
  id: string
  url: string
  streamUrl: string
  source?: StationSource
}

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function stationSlug(station: Pick<Station, 'id' | 'name'>): string {
  if (station.id && /^rb-[0-9a-f-]{36}$/i.test(station.id)) return station.id.toLowerCase()
  const base = normalizeSearch(station.name || station.id || '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || (station.id ? normalizeSearch(station.id) : 'emisora')
}

export function findStationByParam<T extends Station>(stations: T[], param: string): T | null {
  const target = normalizeSearch(param)
  if (!target) return null

  const targetSlug = target.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  for (const station of stations) {
    if (station.id && normalizeSearch(station.id) === target) return station
    if (stationSlug(station) === targetSlug) return station
    if (normalizeSearch(station.name) === target) return station
  }

  return null
}

/** Elimina niveles geográficos repetidos sin alterar nombres ni URLs. */
export function normalizeRegion(value: string, country = ''): string {
  const seen = new Set<string>()
  const parts = value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  const clean: string[] = []
  for (const raw of parts) {
    const key = normalizeSearch(raw)
    if (!key || key === normalizeSearch(country) || seen.has(key)) continue
    seen.add(key)
    if (key === 'jaen') clean.push('Jaén')
    else if (key === 'cajamarca') clean.push('Cajamarca')
    else clean.push(raw)
  }
  return clean.join(', ')
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function inferGenres(name: string, explicitTags: string[] = []): string[] {
  const result = new Set<string>(explicitTags.map((t) => t.toLowerCase()))
  const n = name.toLowerCase()

  if (n.includes('mega') || n.includes('pop') || n.includes('disney') || n.includes('hit') || n.includes('top')) {
    result.add('pop')
  }
  if (n.includes('rock') || n.includes('metal') || n.includes('clasic') || n.includes('classic')) {
    result.add('rock')
  }
  if (n.includes('urban') || n.includes('reggaeton') || n.includes('latina') || n.includes('flow') || n.includes('rumba')) {
    result.add('urbano')
  }
  if (
    n.includes('noticia') ||
    n.includes('news') ||
    n.includes('inform') ||
    n.includes('rpp') ||
    n.includes('caracol') ||
    n.includes('cadena') ||
    n.includes('w radio')
  ) {
    result.add('noticias')
  }
  if (n.includes('deporte') || n.includes('sport') || n.includes('futbol') || n.includes('gol')) {
    result.add('deportes')
  }
  if (n.includes('romant') || n.includes('amor') || n.includes('balada') || n.includes('suave') || n.includes('inolvidable')) {
    result.add('romántica')
  }
  if (n.includes('dance') || n.includes('electro') || n.includes('ibiza') || n.includes('house') || n.includes('techno')) {
    result.add('electrónica')
  }

  if (result.size === 0) {
    result.add('variada')
  }

  return Array.from(result)
}

export function stationKey(station: Pick<Station, 'id' | 'name' | 'url' | 'streamUrl' | 'source'>): string {
  if (station.source === 'radio-browser' && station.id) return station.id
  const streamUrl = cleanText(station.streamUrl ?? station.url)
  return `${cleanText(station.name)}|${streamUrl}`
}

export function normalizeStation(
  input: StationInput,
  source: StationSource,
  fallbackId: string
): StationRecord | null {
  const name = cleanText(input.name)
  const streamUrl = cleanText(input.streamUrl ?? input.url)

  if (!name || !streamUrl) {
    return null
  }

  const baseTags = cleanTags(input.tags)
  const tags = inferGenres(name, baseTags)

  const record: StationRecord = {
    id: cleanText(input.id) || fallbackId,
    name,
    url: streamUrl,
    streamUrl,
    country: cleanText(input.country),
    region: normalizeRegion(cleanText(input.region), cleanText(input.country)),
    logoUrl: cleanText(input.logoUrl),
    isFavorite: Boolean(input.isFavorite),
    tags,
    source,
  }

  if (typeof input.bitrate === 'number') record.bitrate = input.bitrate
  if (typeof input.codec === 'string' && input.codec.trim()) record.codec = input.codec.trim()

  return record
}

export function normalizeStationList(
  inputs: StationInput[],
  source: StationSource,
  prefix: string
): StationRecord[] {
  return inputs
    .map((input, index) => normalizeStation(input, source, `${prefix}-${index}`))
    .filter((station): station is StationRecord => Boolean(station))
}

export function mergeStationsByStreamUrl(
  freshStations: StationRecord[],
  fallbackStations: StationRecord[]
): StationRecord[] {
  const byStreamUrl = new Map<string, StationRecord>()

  freshStations.forEach((station) => {
    byStreamUrl.set(station.streamUrl, station)
  })

  fallbackStations.forEach((station) => {
    if (!byStreamUrl.has(station.streamUrl)) {
      byStreamUrl.set(station.streamUrl, station)
    }
  })

  return Array.from(byStreamUrl.values())
}

export type StationFilterState = {
  country?: string
  region?: string
  genre?: string
}

export function applyFavoriteState<T extends Station>(stations: T[], favorites: Set<string>): T[] {
  return stations.map((station) => ({
    ...station,
    isFavorite: favorites.has(stationKey(station)),
  }))
}

export function buildStationFilterOptions(stations: Station[]): {
  countries: string[]
  regions: string[]
  genres: string[]
} {
  const genreSet = new Set<string>()
  stations.forEach((s) => {
    s.tags?.forEach((t) => genreSet.add(t))
  })

  return {
    countries: Array.from(
      new Set(stations.map((station) => station.country).filter((c): c is string => Boolean(c)))
    ),
    regions: Array.from(
      new Set(stations.map((station) => station.region).filter((r): r is string => Boolean(r)))
    ),
    genres: Array.from(genreSet).sort(),
  }
}

export function filterStations<T extends Station>(
  stations: T[],
  options: {
    query: string
    onlyFavs: boolean
    filters: StationFilterState
    favorites: Set<string>
  }
): T[] {
  const normalizedQuery = normalizeSearch(options.query)

  return stations.filter((station) => {
    if (options.onlyFavs && !options.favorites.has(stationKey(station))) {
      return false
    }

    if (options.filters.country && station.country !== options.filters.country) {
      return false
    }

    if (options.filters.region) {
      const wanted = normalizeSearch(options.filters.region)
      const levels = (station.region || '').split(',').map((level) => normalizeSearch(level))
      if (normalizeSearch(station.region || '') !== wanted && !levels.includes(wanted)) {
        return false
      }
    }

    if (options.filters.genre && !station.tags?.includes(options.filters.genre.toLowerCase())) {
      return false
    }

    if (normalizedQuery) {
      const haystack = [
        station.name,
        station.region ?? '',
        station.country ?? '',
        ...(station.tags ?? []),
      ]
        .join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

      if (!haystack.includes(normalizedQuery)) {
        return false
      }
    }

    return true
  })
}

export function findStationIndex(
  stations: Station[],
  currentStation: Pick<Station, 'id' | 'streamUrl' | 'url'> | null
): number {
  if (!currentStation) {
    return -1
  }

  return stations.findIndex(
    (station) =>
      (Boolean(station.id) && station.id === currentStation.id) ||
      (Boolean(station.streamUrl) && station.streamUrl === currentStation.streamUrl) ||
      (Boolean(station.url) && station.url === currentStation.url)
  )
}
