// sw.js
// =======================
// SERVICE WORKER v6.6
// =======================

const CACHE_NAME = 'satelital-ultra-v6.6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/stations.js',
  './manifest.json'
  // Si tienes iconos locales, agrégalos aquí. Ejemplo:
  // './icons/icon-192.png',
  // './icons/icon-512.png'
];

// 1. INSTALACIÓN: Cachear recursos estáticos críticos
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Instalando v6.6...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando archivos...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Forzar activación inmediata
  );
});

// 2. ACTIVACIÓN: Limpiar cachés antiguas (CRÍTICO para ver cambios)
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activando y limpiando versiones viejas...');
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Tomar control de los clientes inmediatamente
  );
});

// 3. FETCH: Interceptar peticiones
self.addEventListener('fetch', (e) => {
  // Ignorar peticiones que no sean GET o sean streams de audio externos
  if (e.request.method !== 'GET') return;
  
  // Estrategia: Cache First, falling back to Network
  // (Primero caché, si no está, va a la red)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request)
        .catch(() => {
          // Si falla la red y no está en caché (offline total),
          // podrías retornar una página de fallback aquí si la tuvieras.
        });
    })
  );
});
