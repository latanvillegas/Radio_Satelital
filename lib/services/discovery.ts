import type { Station } from '../../types/station'
import { stationKey } from './station-normalizer'

type Discovery = {
  featured: Station | null
  quickPicks: Station[]
  cajamarca: Station[]
  aroundTheWorld: Station[]
}

/**
 * Deterministic, local-only recommendations.
 * There is no tracking, popularity claim, or inferred user location.
 */
export function buildDiscovery(stations: Station[], recent: Station[], active: Station | null): Discovery {
  const key = (station: Station) => stationKey(station)
  const unique = (candidates: Station[], max: number, exclude: Set<string> = new Set()) => {
    const result: Station[] = []
    const seen = new Set(exclude)
    for (const station of candidates) {
      const id = key(station)
      if (!id || seen.has(id)) continue
      seen.add(id)
      result.push(station)
      if (result.length === max) break
    }
    return result
  }
  const allKeys = new Set(stations.map(key))
  const validRecent = recent.filter(s => allKeys.has(key(s)))
  const favorites = stations.filter(s => s.isFavorite)
  const peru = stations.filter(s => s.country?.toLocaleLowerCase('es').includes('perú'))
  const cajamarca = peru.filter(s => (s.region || '').toLocaleLowerCase('es').includes('cajamarca'))
  const featured = active || validRecent[0] || favorites[0] || cajamarca[0] || peru[0] || stations[0] || null
  const excluded = new Set(featured ? [key(featured)] : [])
  const localPicks = unique(cajamarca, 5)
  // Evitar mostrar las mismas cinco emisoras en las dos secciones.
  const quickExcluded = new Set([...excluded, ...localPicks.map(key)])
  const quickPicks = unique([...favorites, ...validRecent, ...peru, ...stations], 5, quickExcluded)
  const countries = new Set<string>()
  const worldCandidates: Station[] = []
  for (const station of stations) {
    const country = station.country?.trim() || ''
    if (!country || country.toLocaleLowerCase('es') === 'perú' || countries.has(country)) continue
    countries.add(country)
    worldCandidates.push(station)
  }
  const aroundTheWorld = unique(worldCandidates, 6)
  return { featured, quickPicks, cajamarca: localPicks, aroundTheWorld }
}
