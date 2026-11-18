import { describe, expect, it } from 'vitest'
import {
  buildStationShareUrl,
  parseExplorerUrlState,
  serializeExplorerUrlState,
} from './url-state'
import { findStationByParam, stationSlug } from '../services/station-normalizer'

describe('url-state & deep linking', () => {
  it('generates clean ASCII slugs from accented Spanish station names', () => {
    expect(stationSlug({ name: 'Activa Jaén 95.1 FM' })).toBe('activa-jaen-95-1-fm')
    expect(stationSlug({ name: 'Radio Marañón' })).toBe('radio-maranon')
  })

  it('matches stations by slug, id, or normalized name', () => {
    const catalog = [
      { id: 'local-1', name: 'Activa Jaén', streamUrl: 'https://a.example/live' },
      { id: 'local-2', name: 'Radio Marañón', streamUrl: 'https://b.example/live' },
    ]
    expect(findStationByParam(catalog, 'activa-jaen')?.name).toBe('Activa Jaén')
    expect(findStationByParam(catalog, 'local-2')?.name).toBe('Radio Marañón')
    expect(findStationByParam(catalog, 'radio marañón')?.name).toBe('Radio Marañón')
    expect(findStationByParam(catalog, 'inexistente')).toBeNull()
  })

  it('parses and serializes explorer query params symmetrically', () => {
    const parsed = parseExplorerUrlState('?station=activa-jaen&scope=jaen&q=cumbia&genre=pop')
    expect(parsed).toEqual({
      station: 'activa-jaen',
      scope: 'jaen',
      q: 'cumbia',
      genre: 'pop',
    })

    const serialized = serializeExplorerUrlState(parsed)
    expect(serialized).toBe('?station=activa-jaen&scope=jaen&q=cumbia&genre=pop')
  })

  it('ignores invalid scopes and builds canonical /emisora/<slug>/ share URLs', () => {
    expect(parseExplorerUrlState('?scope=invalid')).toEqual({})
    expect(
      buildStationShareUrl('https://latanvillegas.online/?scope=world#explorar', {
        name: 'Activa Jaén',
      })
    ).toBe('https://latanvillegas.online/emisora/activa-jaen/')
  })
})
