/* Radio Satelital — solo recursos estáticos de la propia web. Nunca cachear streams. */
const CACHE = 'radio-satelital-shell-v3'
const MAX_ENTRIES = 96
const SHELL = ['/', '/icon-192.png', '/icon-512.png', '/manifest.json']

async function saveToCache(request, response) {
  if (!response.ok || response.type === 'opaque') return
  // Clone before the asynchronous cache opening, while the network response is unconsumed.
  const copy = response.clone()
  try {
    const cache = await caches.open(CACHE)
    await cache.put(request, copy)
    const keys = await cache.keys()
    // A bounded cache prevents obsolete hashed bundles from accumulating forever.
    if (keys.length > MAX_ENTRIES) {
      for (const key of keys.slice(0, keys.length - MAX_ENTRIES)) await cache.delete(key)
    }
  } catch { /* quota or storage blocked: network playback remains available */ }
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('radio-satelital-shell-') && k !== CACHE).map(k => caches.delete(k)))),
    self.clients.claim(),
  ]))
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.destination === 'audio' || request.destination === 'video' || request.headers.has('range')) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) event.waitUntil(saveToCache('/', response))
      return response
    }).catch(() => caches.match('/').then(cached => cached || Response.error())))
    return
  }

  if (url.pathname.startsWith('/_next/static/') || SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        if (response.ok) event.waitUntil(saveToCache(request, response))
        return response
      })
    }))
  }
})
