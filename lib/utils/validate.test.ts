import { describe, expect, it, vi } from 'vitest'
import { validateStationUrl, checkStreamReachable } from './validate'
import { getLocalStations } from '../services/stations'

describe('public stream URL validation', () => {
  it.each([
    'file:///etc/passwd', 'javascript:alert(1)', 'https://user:pass@radio.example.com',
    'http://localhost.', 'http://test.local', 'http://127.0.0.1', 'http://127.1',
    'http://2130706433', 'http://0x7f000001', 'http://0.0.0.0', 'http://10.1.2.3',
    'http://172.16.0.1', 'http://192.168.1.1', 'http://169.254.169.254',
    'http://100.64.0.1', 'http://[::1]', 'http://[::ffff:127.0.0.1]',
    'http://[fe80::1]', 'http://[fc00::1]', 'http://224.0.0.1',
  ])('rejects %s', url => expect(validateStationUrl(url)).toBe(false))
  it.each(['https://radio.example.com/live', 'http://radio.example.com:8000/live', 'https://8.8.8.8/live', 'https://[2606:4700::1111]/live'])('accepts %s', url => expect(validateStationUrl(url)).toBe(true))
  it('accepts every normalized catalog station', () => {
    expect(getLocalStations().filter(station => !validateStationUrl(station.streamUrl))).toEqual([])
  })
  it('never fetches a forbidden URL', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    try {
      expect(await checkStreamReachable('http://127.0.0.1')).toBe(false)
      expect(fetchMock).not.toHaveBeenCalled()
    } finally { vi.unstubAllGlobals() }
  })
  it('clears timeout on a rejected request', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    try {
      expect(await checkStreamReachable('https://radio.example.com/live')).toBe(false)
      expect(vi.getTimerCount()).toBe(0)
    } finally { vi.unstubAllGlobals(); vi.useRealTimers() }
  })
})
