import stationsData from '../../data/stations.json'
import cajamarcaStationsData from '../../data/stations-cajamarca.json'
import {
  applyFavoriteState,
  buildStationFilterOptions,
  filterStations,
  findStationByParam,
  findStationIndex,
  normalizeSearch,
  normalizeStationList,
  stationKey,
  stationSlug,
  type StationFilterState,
  type StationInput,
  type StationRecord,
} from './station-normalizer'

export {
  applyFavoriteState,
  buildStationFilterOptions,
  filterStations,
  findStationByParam,
  findStationIndex,
  normalizeSearch,
  stationKey,
  stationSlug,
  type StationFilterState,
  type StationRecord,
}

export type Radio = StationRecord

/** Ranking editorial estable: insignia -> Jaén -> Cajamarca -> Perú -> mundo. */
function stationWeight(station: StationRecord): number {
  const name = normalizeSearch(station.name)
  const region = normalizeSearch(station.region || '')
  const country = normalizeSearch(station.country || '')
  if (name === 'activa jaen') return 0
  if (country !== 'peru') return 4
  if (region.includes('jaen')) return 1
  if (region.includes('cajamarca')) return 2
  return 3
}

let cachedLocalStations: StationRecord[] | null = null

/** Obtiene emisoras locales y elimina duplicados por URL exacta con caché en memoria. */
export function getLocalStations(): StationRecord[] {
  if (cachedLocalStations) return cachedLocalStations

  const allStations: StationInput[] = [
    ...(stationsData as StationInput[]),
    ...(cajamarcaStationsData as StationInput[]),
  ]

  const normalized = normalizeStationList(allStations, 'local', 'local')
  const byStreamUrl = new Map<string, StationRecord>()

  for (const station of normalized) {
    if (!byStreamUrl.has(station.streamUrl)) {
      byStreamUrl.set(station.streamUrl, station)
    }
  }

  cachedLocalStations = Array.from(byStreamUrl.values()).sort(
    (a, b) => stationWeight(a) - stationWeight(b)
  )
  return cachedLocalStations
}

export async function getMergedStations(): Promise<StationRecord[]> {
  return getLocalStations()
}
