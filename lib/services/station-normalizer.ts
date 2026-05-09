import type { Station } from '../../types/station'

export type StationSource = 'local' | 'firebase'

export type StationInput = {
  id?: string
  name?: string
  country?: string
  region?: string
  streamUrl?: string
  url?: string
  logoUrl?: string
  isFavorite?: boolean
  tags?: unknown
}

export type StationRecord = Omit<Station, 'id' | 'url' | 'streamUrl'> & {
  id: string
  url: string
  streamUrl: string
  source?: StationSource
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
}

export function stationKey(station: Pick<Station, 'name' | 'url' | 'streamUrl'>): string {
  const streamUrl = cleanText(station.streamUrl ?? station.url)
  return `${cleanText(station.name)}|${streamUrl}`
}

export function normalizeStation(input: StationInput, source: StationSource, fallbackId: string): StationRecord | null {
  const name = cleanText(input.name)
  const streamUrl = cleanText(input.streamUrl ?? input.url)

  if (!name || !streamUrl) {
    return null
  }

  return {
    id: cleanText(input.id) || fallbackId,
    name,
    url: streamUrl,
    streamUrl,
    country: cleanText(input.country),
    region: cleanText(input.region),
    logoUrl: cleanText(input.logoUrl),
    isFavorite: Boolean(input.isFavorite),
    tags: cleanTags(input.tags),
    source,
  }
}

export function normalizeStationList(inputs: StationInput[], source: StationSource, prefix: string): StationRecord[] {
  return inputs
    .map((input, index) => normalizeStation(input, source, `${prefix}-${index}`))
    .filter((station): station is StationRecord => Boolean(station))
}

export function mergeStationsByStreamUrl(freshStations: StationRecord[], fallbackStations: StationRecord[]): StationRecord[] {
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

type StationFilterState = {
  country?: string
  region?: string
}

export function applyFavoriteState(stations: StationRecord[], favorites: Set<string>): StationRecord[] {
  return stations.map((station) => ({
    ...station,
    isFavorite: favorites.has(stationKey(station)),
  }))
}

export function buildStationFilterOptions(stations: StationRecord[]): { countries: string[]; regions: string[] } {
  return {
    countries: Array.from(new Set(stations.map(station => station.country).filter(Boolean))) as string[],
    regions: Array.from(new Set(stations.map(station => station.region).filter(Boolean))) as string[],
  }
}

export function filterStations(
  stations: StationRecord[],
  options: {
    query: string
    onlyFavs: boolean
    filters: StationFilterState
    favorites: Set<string>
  },
): StationRecord[] {
  const normalizedQuery = options.query.normalize('NFD').toLowerCase()

  return stations.filter((station) => {
    if (options.onlyFavs && !options.favorites.has(stationKey(station))) {
      return false
    }

    if (options.filters.country && station.country !== options.filters.country) {
      return false
    }

    if (options.filters.region && station.region !== options.filters.region) {
      return false
    }

    if (normalizedQuery) {
      const haystack = [station.name, station.region ?? '', station.country ?? '']
        .join(' ')
        .normalize('NFD')
        .toLowerCase()

      if (!haystack.includes(normalizedQuery)) {
        return false
      }
    }

    return true
  })
}

export function findStationIndex(stations: StationRecord[], currentStation: Pick<StationRecord, 'id' | 'streamUrl' | 'url'> | null): number {
  if (!currentStation) {
    return -1
  }

  return stations.findIndex(station => (
    station.id === currentStation.id
    || station.streamUrl === currentStation.streamUrl
    || station.url === currentStation.url
  ))
}