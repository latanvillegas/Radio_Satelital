/**
 * Public radio URL policy. Literal addresses and local hostnames only:
 * not a server-side SSRF defense; DNS and every redirect must be validated by the proxy.
 */
export function validateStationUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    if (parsed.username || parsed.password) return false
    const host = parsed.hostname.toLowerCase().replace(/\.$/, '')
    if (!host || host === 'localhost' || /\.(localhost|local|internal|lan|home\.arpa)$/.test(host)) return false

    // WHATWG URL canonicalizes decimal, hexadecimal and shortened IPv4 literals.
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      const [a, b, c] = host.split('.').map(Number)
      return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)))) ||
        (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
        (a === 203 && b === 0 && c === 113))
    }
    // Allow IPv6 global unicast only; exclude documentation range.
    if (host.startsWith('[')) return /^\[[23][0-9a-f]{3}:/.test(host) && !/^\[2001:db8:/.test(host)
    return host.includes('.')
  } catch {
    return false
  }
}

export async function checkStreamReachable(url: string, timeout = 5000): Promise<boolean> {
  if (!validateStationUrl(url)) return false
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      method: 'HEAD', signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer',
      redirect: 'error',
    })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export function canSubmitGlobalNow(): boolean {
  try {
    const last = Number(localStorage.getItem('ultra_last_submit') || '0')
    const now = Date.now()
    if (now - last < 60000) return false
    localStorage.setItem('ultra_last_submit', String(now))
    return true
  } catch {
    return false
  }
}
