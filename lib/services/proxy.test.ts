import { describe, expect, it } from 'vitest'
import { getOptimalUrl, shouldUseProxy } from './proxy'

describe('proxy', () => {
  it('detecta urls que necesitan proxy', () => {
    expect(shouldUseProxy({ name: 'A', url: 'https://eu1.lhdserver.es:9007/stream' })).toBe(true)
    expect(shouldUseProxy({ name: 'B', url: 'https://example.com/stream' })).toBe(false)
  })

  it('devuelve la url proxificada cuando corresponde', () => {
    const result = getOptimalUrl({ name: 'A', url: 'https://eu1.lhdserver.es:9007/stream' })

    expect(result.isProxied).toBe(true)
    expect(result.url).toContain('api.allorigins.win/raw?url=')
  })
})