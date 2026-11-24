import { afterEach, describe, expect, it, vi } from 'vitest'
import { normalizeRadioBrowserStation, searchRadioBrowser, resolveRadioBrowserStation } from './radio-browser'
import { stationKey } from './station-normalizer'
import { buildStationShareUrl } from '../utils/url-state'

const uuid = '01234567-89ab-cdef-0123-456789abcdef'
const item = { stationuuid: uuid, name: 'Radio Test', url: 'http://radio.example.com/live', url_resolved: 'https://radio.example.com/live', countrycode: 'PE', tags: 'rock,jazz', hls: 1, lastcheckok: 1 }
afterEach(() => vi.unstubAllGlobals())
describe('Radio Browser', () => {
  it('normalizes stable identity, HTTPS, country and HLS', () => {
    const s = normalizeRadioBrowserStation(item)!
    expect(s).toMatchObject({ id: 'rb-' + uuid, country: 'Perú', source: 'radio-browser', hls: true, streamUrl: item.url_resolved })
    expect(stationKey(s)).toBe('rb-' + uuid)
    expect(buildStationShareUrl('https://latanvillegas.online/', s)).toBe('https://latanvillegas.online/?station=rb-' + uuid + '&scope=browser')
  })
  it('rejects unsafe, broken and HTTP-only streams', () => {
    expect(normalizeRadioBrowserStation({ ...item, url_resolved: 'https://127.0.0.1/a' })).toBeNull()
    expect(normalizeRadioBrowserStation({ ...item, lastcheckok: 0 })).toBeNull()
    expect(normalizeRadioBrowserStation({ ...item, url_resolved: '' })).toBeNull()
    expect(normalizeRadioBrowserStation({ ...item, stationuuid: 'bad' })).toBeNull()
  })
  it('bounds search, deduplicates and retries an alternate mirror', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ ok: true, json: async () => [item, item] })
    vi.stubGlobal('fetch', fetchMock)
    const result = await searchRadioBrowser({ name: 'Test & radio', country: 'PE', genre: 'rock', page: 2 })
    expect(result.stations).toHaveLength(1)
    expect(result.hasMore).toBe(false)
    const urls = fetchMock.mock.calls.map(call => new URL(call[0]))
    expect(urls[0].hostname).not.toBe(urls[1].hostname)
    expect(urls[1].searchParams.get('limit')).toBe('24')
    expect(urls[1].searchParams.get('offset')).toBe('48')
    expect(urls[1].searchParams.get('countrycode')).toBe('PE')
    expect(urls[1].searchParams.get('name')).toBe('Test & radio')
    expect(urls[1].searchParams.get('tag')).toBe('rock')
  })
  it('resolves a shared station by stable UUID and respects abort', async () => {
    const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => [item] })
    vi.stubGlobal('fetch', mock)
    expect((await resolveRadioBrowserStation('rb-' + uuid))?.id).toBe('rb-' + uuid)
    expect(new URL(mock.mock.calls[0][0]).searchParams.get('uuids')).toBe(uuid)
    const abort = new AbortController(); abort.abort()
    await expect(searchRadioBrowser({ name: '', country: '', genre: '', page: 0 }, abort.signal)).rejects.toMatchObject({ name: 'AbortError' })
    expect(mock).toHaveBeenCalledTimes(1)
  })
})
