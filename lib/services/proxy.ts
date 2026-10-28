import type { Station } from '../../types/station'

/** No intermediarios públicos. Los HTTP requieren un proxy PROPIO con allowlist por estación. */
const STREAM_PROXY_BASE = process.env.NEXT_PUBLIC_STREAM_PROXY_BASE_URL?.replace(/\/$/, '') || ''

export function shouldUseProxy(station: Station): boolean {
  const source = station.streamUrl || station.url || ''
  try { return Boolean(STREAM_PROXY_BASE) && new URL(source).protocol === 'http:' }
  catch { return false }
}

export function getProxiedUrl(station: Station): string {
  const source = station.streamUrl || station.url || ''
  if (!shouldUseProxy(station)) return source
  return `${STREAM_PROXY_BASE}/stream?station=${encodeURIComponent(station.id || station.name)}`
}
export function getOptimalUrl(station: Station): { url: string; isProxied: boolean } {
  const source = station.streamUrl || station.url || ''
  return shouldUseProxy(station)
    ? { url: getProxiedUrl(station), isProxied: true }
    : { url: source, isProxied: false }
}
