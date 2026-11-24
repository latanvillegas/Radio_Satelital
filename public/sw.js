/* Radio Satelital — Static shell, controlled updates, no media caching. */
const CACHE = 'radio-satelital-shell-v6'
const SHELL = ['/', '/icon-192.png', '/icon-512.png', '/manifest.json']
const isStaticAsset = (url) => url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const response = await fetch('/', { cache: 'reload' })
    if (!response.ok) throw new Error('App shell unavailable')
    const html = await response.clone().text()
    const assets = new Set()
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = new URL(match[1], self.location.origin)
      if (isStaticAsset(url)) assets.add(url.href)
    }
    // Fail installation rather than advertise a partially cached offline shell.
    await cache.addAll([...SHELL.filter(path => path !== '/'), ...assets])
    await cache.put('/', response)
  })())
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => key.startsWith('radio-satelital-shell-') && key !== CACHE).map(key => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin ||
      request.destination === 'audio' || request.destination === 'video' ||
      request.headers.has('range') || /\.(m3u8|mp3|aac|ogg|opus|flac|m4a|mp4|ts)(?:$)/i.test(url.pathname)) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      try {
        const response = await fetch(request)
        if (response.ok) await cache.put(request, response.clone()).catch(() => {})
        return response
      } catch {
        return (await cache.match(request)) || (await cache.match('/')) || Response.error()
      }
    })())
    return
  }

  // Next's content-hashed assets are immutable; do not revalidate each hit.
  if (isStaticAsset(url) || SHELL.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(request)
      if (cached) return cached
      try {
        const response = await fetch(request)
        if (response.ok) await cache.put(request, response.clone()).catch(() => {})
        return response
      } catch {
        return Response.error()
      }
    })())
  }
})
