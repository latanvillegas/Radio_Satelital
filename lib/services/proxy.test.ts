import { describe, expect, it } from 'vitest'
import { getOptimalUrl, shouldUseProxy } from './proxy'

describe('proxy', () => {
  it('sirve HTTPS directo sin dependencias de proxies públicos', () => {
    const station = { name: 'Activa Jaén', url: 'https://sp.onliveperu.com/8108/stream' }
    expect(shouldUseProxy(station)).toBe(false)
    expect(getOptimalUrl(station)).toEqual({ url: station.url, isProxied: false })
  })
})
