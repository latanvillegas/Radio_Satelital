import { describe, expect, it } from 'vitest'
import {
  mergeStationsByStreamUrl,
  normalizeStation,
  normalizeStationList,
  normalizeRegion,
  stationKey,
} from './station-normalizer'

describe('station-normalizer', () => {
  it('normaliza una emisora desde un registro local', () => {
    const station = normalizeStation(
      { name: '  La Mega  ', url: ' https://example.com/stream ', country: ' Venezuela ', tags: [' pop ', '', 123 as never] },
      'local',
      'local-0',
    )

    expect(station).toEqual({
      id: 'local-0',
      name: 'La Mega',
      url: 'https://example.com/stream',
      streamUrl: 'https://example.com/stream',
      country: 'Venezuela',
      region: '',
      logoUrl: '',
      isFavorite: false,
      tags: ['pop'],
      source: 'local',
    })
  })

  it('descarta registros incompletos', () => {
    expect(normalizeStation({ name: 'Sin URL' }, 'local', 'local-1')).toBeNull()
    expect(normalizeStation({ url: 'https://example.com' }, 'local', 'local-2')).toBeNull()
  })

  it('normaliza listas completas', () => {
    const stations = normalizeStationList(
      [
        { name: 'A', url: 'https://a.example.com' },
        { name: 'B', url: 'https://b.example.com' },
      ],
      'local',
      'local',
    )

    expect(stations).toHaveLength(2)
    expect(stations[0].id).toBe('local-0')
    expect(stations[1].id).toBe('local-1')
  })

  it('prioriza las emisoras frescas al fusionar por streamUrl', () => {
    const merged = mergeStationsByStreamUrl(
      [
        { id: 'custom-1', name: 'La Mega', url: 'https://example.com/stream', streamUrl: 'https://example.com/stream', country: 'VE', region: '', logoUrl: '', isFavorite: false, tags: [], source: 'local' },
      ],
      [
        { id: 'local-1', name: 'La Mega Local', url: 'https://example.com/stream', streamUrl: 'https://example.com/stream', country: 'VE', region: '', logoUrl: '', isFavorite: false, tags: [], source: 'local' },
        { id: 'local-2', name: 'Otra', url: 'https://other.example.com', streamUrl: 'https://other.example.com', country: 'AR', region: '', logoUrl: '', isFavorite: false, tags: [], source: 'local' },
      ],
    )

    expect(merged).toHaveLength(2)
    expect(merged[0].id).toBe('custom-1')
    expect(merged[0].name).toBe('La Mega')
  })

  it('genera una key estable para favoritos', () => {
    expect(stationKey({ name: ' La Mega ', url: 'https://example.com/stream' })).toBe('La Mega|https://example.com/stream')
  })

  it('colapsa geografía con y sin tilde y preserva claves de favoritos', () => {
    expect(normalizeRegion('JAEN, JAÉN, CAJAMARCA', 'Perú')).toBe('Jaén, Cajamarca')
    expect(normalizeRegion('Cajamarca, Cajamarca, Cajamarca', 'Perú')).toBe('Cajamarca')
    expect(normalizeRegion('Chile', 'Chile')).toBe('')
    const station = normalizeStation({ name: 'Activa Jaén', region: 'jaén, jaén, Cajamarca', url: 'https://example.org/radio' }, 'local', 'x')!
    expect(station.region).toBe('Jaén, Cajamarca')
    expect(stationKey(station)).toBe('Activa Jaén|https://example.org/radio')
  })

  it('no etiqueta una emisora católica como urbana solo por Activa', () => {
    const station = normalizeStation({ name: 'Activa 95.1 FM Católica', url: 'https://example.org/catolica' }, 'local', 'x')!
    expect(station.tags).not.toContain('urbano')
  })
})
