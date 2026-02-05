// sw.js v9.5 - Service Worker Optimizado (Cache + Network)
// =========================================================

// Nombre de la memoria caché (Debe coincidir con tu versión actual)
const CACHE_NAME = 'radio-satelital-v9.5';

// Lista de archivos requeridos para funcionar sin internet
// NOTA: Las versiones (?v=9.5) deben ser idénticas a las del index.html
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css?v=9.5',
  './stations.js?v=9.5',
  './main.js?v=9.5',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './404.html'
];

// 1. INSTALACIÓN: Descarga los archivos a la memoria del celular
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando v9.5...');
  
  // Obliga al SW a activarse inmediatamente sin esperar a que cierres la pestaña
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando archivos del sistema...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVACIÓN: Borra las memorias viejas (v8.7, v8.5, etc.)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando y limpiando versiones antiguas...');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  
  // Toma el control de la página de inmediato
  return self.clients.claim();
});

// 3. INTERCEPTOR: Decide qué mostrar al usuario
self.addEventListener('fetch', (event) => {
  // Solo interceptamos peticiones GET (lectura)
  if (event.request.method !== 'GET') return;

  // EXCEPCIÓN: NO cachear el streaming de audio (mp3, icecast, etc.)
  // Si cacheamos el audio, llenaremos la memoria del usuario en minutos.
  const url = event.request.url;
  if (url.includes('stream') || url.includes('.mp3') || url.includes('icecast') || url.includes('shoutcast')) {
    return; 
  }

  // ESTRATEGIA: "Stale-While-Revalidate"
  // 1. Muestra lo que hay en memoria (Carga Instantánea).
  // 2. En segundo plano, baja la versión nueva de internet para la próxima vez.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      
      // Promesa de red: Busca actualizaciones en internet
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Si la respuesta es válida, actualizamos la copia en caché
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // SI NO HAY INTERNET y falló el fetch:
        // Si es una navegación (abrir la página), mostrar error 404 personalizado
        if (event.request.mode === 'navigate') {
          return caches.match('./404.html');
        }
      });

      // Retorna la versión en caché si existe, si no, espera a la red
      return cachedResponse || fetchPromise;
    })
  );
});
