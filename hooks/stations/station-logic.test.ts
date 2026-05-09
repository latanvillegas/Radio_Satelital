import { describe, expect, it } from 'vitest'
import { applyFavoriteState, buildStationFilterOptions, filterStations } from '../../lib/services/stations'

const stations = [
  { id: '1', name: 'La Mega', url: 'https://mega.example.com', streamUrl: 'https://mega.example.com', country: 'Venezuela', region: 'Caracas', logoUrl: '', isFavorite: false, tags: [], source: 'local' as const },
  { id: '2', name: 'Disney FM', url: 'https://disney.example.com', streamUrl: 'https://disney.example.com', country: 'Perú', region: 'Lima', logoUrl: '', isFavorite: false, tags: [], source: 'local' as const },
]

describe('station logic used by useStations', () => {
  it('aplica favoritos sobre la lista', () => {
    const withFavorites = applyFavoriteState(stations, new Set(['La Mega|https://mega.example.com']))

    expect(withFavorites[0].isFavorite).toBe(true)
    expect(withFavorites[1].isFavorite).toBe(false)
  })

  it('filtra por query, país y favoritos', () => {
    const filtered = filterStations(stations, {
      query: 'mega',
      onlyFavs: false,
      filters: { country: 'Venezuela' },
      favorites: new Set(),
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('La Mega')
  })

  it('expone opciones únicas de filtros', () => {
    expect(buildStationFilterOptions(stations)).toEqual({
      countries: ['Venezuela', 'Perú'],
      regions: ['Caracas', 'Lima'],
    })
  })
})