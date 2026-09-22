import type { Station } from '../../types/station'

export type StationSource = 'local'

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

// Inferencia inteligente de tags y géneros a partir del nombre
export function inferGenres(name: string, explicitTags: string[] = []): string[] {
  const result = new Set<string>(explicitTags.map(t => t.toLowerCase()))
  const n = name.toLowerCase()

  if (n.includes('mega') || n.includes('pop') || n.includes('disney') || n.includes('hit') || n.includes('top')) {
    result.add('pop')
  }
  if (n.includes('rock') || n.includes('metal') || n.includes('clasic') || n.includes('classic')) {
    result.add('rock')
  }
  if (n.includes('activa') || n.includes('urban') || n.includes('reggaeton') || n.includes('latina') || n.includes('flow') || n.includes('rumba')) {
    result.add('urbano')
  }
  if (n.includes('noticia') || n.includes('news') || n.includes('inform') || n.includes('rpp') || n.includes('caracol') || n.includes('cadena') || n.includes('w radio')) {
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

  const baseTags = cleanTags(input.tags)
  const tags = inferGenres(name, baseTags)

  return {
    id: cleanText(input.id) || fallbackId,
    name,
    url: streamUrl,
    streamUrl,
    country: cleanText(input.country),
    region: cleanText(input.region),
    logoUrl: cleanText(input.logoUrl),
    isFavorite: Boolean(input.isFavorite),
    tags,
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
  genre?: string
}

export function applyFavoriteState(stations: StationRecord[], favorites: Set<string>): StationRecord[] {
  return stations.map((station) => ({
    ...station,
    isFavorite: favorites.has(stationKey(station)),
  }))
}

export function buildStationFilterOptions(stations: StationRecord[]): { countries: string[]; regions: string[]; genres: string[] } {
  const genreSet = new Set<string>()
  stations.forEach((s) => {
    s.tags?.forEach((t) => genreSet.add(t))
  })

  return {
    countries: Array.from(new Set(stations.map(station => station.country).filter(Boolean))) as string[],
    regions: Array.from(new Set(stations.map(station => station.region).filter(Boolean))) as string[],
    genres: Array.from(genreSet).sort(),
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
  const normalizedQuery = options.query.normalize('NFD').toLowerCase().trim()

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
