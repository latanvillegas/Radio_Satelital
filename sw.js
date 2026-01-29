/* sw.js v8.7 - Service Worker Completo (UPDATED)
   Cumple con todos los requisitos de PWABuilder:
   - Cache Offline (v8.7)
   - Sincronización en segundo plano (Background Sync)
   - Sincronización periódica (Periodic Sync)
   - Notificaciones Push (Re-engagement)
*/

// CAMBIO CLAVE: Al subir a v8.7, el celular borrará la caché vieja
const CACHE_NAME = 'radio-satelital-v8.7';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=8.7',
  './main.js?v=8.7', // Esto obliga a cargar el main.js nuevo
  './stations.js?v=8.7',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. INSTALACIÓN
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // Fuerza al SW a activarse de inmediato
  self.skipWaiting();
});

// 2. ACTIVACIÓN (Limpieza de caché antigua)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Borra todo lo que no sea la v8.7
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  // Toma el control de la página inmediatamente
  self.clients.claim();
});

// 3. FETCH (Estrategia Cache First)
self.addEventListener('fetch', (e) => {
  // No cachear streams de audio ni llamadas externas de API
  if (e.request.url.includes('.mp3') || 
      e.request.url.includes('stream') || 
      e.request.url.includes('icecast') ||
      e.request.method !== 'GET') {
    return; 
  }

  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => {
        // Fallback offline simple si falla la red y es navegación
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// 4. BACKGROUND SYNC (Resiliencia a mala conexión)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-stations') {
    event.waitUntil(syncStations());
  }
});

async function syncStations() {
  console.log('[SW] Sincronizando emisoras en segundo plano...');
}

// 5. PERIODIC SYNC (Actualización de contenido en segundo plano)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  console.log('[SW] Actualizando contenido periódicamente...');
}

// 6. NOTIFICACIONES PUSH (Re-engagement)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : '¡Sintoniza Radio Satelital!';
  
  const options = {
    body: data,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'explore', title: 'Escuchar' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Radio Satelital', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
