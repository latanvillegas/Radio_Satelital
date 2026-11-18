/* Radio Satelital — Service Worker de interfaz estática con actualización controlada. */
const CACHE = 'radio-satelital-shell-v4'
const SHELL = ['/', '/icon-192.png', '/icon-512.png', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('radio-satelital-shell-') && k !== CACHE)
            .map((k) => caches.delete(k))
        )
      ),
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (
    request.destination === 'audio' ||
    request.destination === 'video' ||
    request.headers.has('range') ||
    url.pathname.endsWith('.m3u8')
  ) {
    return
  }

  // Navegación HTML (incluyendo /emisora/[slug]/): Network-First con respaldo offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)))
          }
          return response
        })
        .catch(() =>
          caches
            .match(request)
            .then((exact) => exact || caches.match('/'))
            .then((r) => r || Response.error())
        )
    )
    return
  }

  // Activos estáticos con hash de compilación: Stale-While-Revalidate
  if (url.pathname.startsWith('/_next/static/') || SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => null)

        if (cached) {
          event.waitUntil(networkPromise)
          return cached
        }
        const fresh = await networkPromise
        return fresh || Response.error()
      })
    )
  }
})
