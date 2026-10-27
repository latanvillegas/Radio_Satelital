/* Radio Satelital — solo recursos estáticos de la propia web. Nunca cachear streams. */
const CACHE = 'radio-satelital-shell-v2'
const SHELL = ['/', '/icon-192.png', '/icon-512.png', '/manifest.json']

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
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put('/', copy))) }
      return response
    }).catch(() => caches.match('/').then(cached => cached || Response.error())))
    return
  }

  if (url.pathname.startsWith('/_next/static/') || SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy))) }
        return response
      })
    }))
  }
})
