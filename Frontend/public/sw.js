// Service Worker pour ShopNow - Optimisation des performances
const CACHE_NAME = 'shopnow-v1.0.0';
const DYNAMIC_CACHE = 'shopnow-dynamic-v1';

// Assets statiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// URLs d'API à mettre en cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/auth\/user/
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting(); // Force activation
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Nettoyer les anciens caches
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim(); // Prendre le contrôle immédiatement
      })
  );
});

// Stratégie de mise en cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Ignorer les requêtes non-GET
  if (method !== 'GET') return;

  // Ignorer les requêtes chrome-extension
  if (url.startsWith('chrome-extension://')) return;

  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const { url } = request;

  try {
    // 1. Stratégie Cache First pour les assets statiques
    if (STATIC_ASSETS.some(asset => url.endsWith(asset))) {
      return await cacheFirst(request);
    }

    // 2. Stratégie Network First pour les APIs avec cache de secours
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url))) {
      return await networkFirstWithCache(request);
    }

    // 3. Stratégie Stale While Revalidate pour les images
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return await staleWhileRevalidate(request);
    }

    // 4. Stratégie Network Only pour les autres requêtes
    return await fetch(request);

  } catch (error) {
    console.error('🔥 Request failed:', url, error);
    
    // Fallback vers le cache si disponible
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback page pour les erreurs de navigation
    if (request.mode === 'navigate') {
      return await caches.match('/index.html');
    }

    throw error;
  }
}

// Cache First - Pour les assets statiques
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  
  // Mettre en cache la réponse
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

// Network First avec cache de secours - Pour les APIs
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Mettre en cache les réponses API réussies
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('🔄 Network failed, trying cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Stale While Revalidate - Pour les images
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Récupérer la nouvelle version en arrière-plan
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignorer les erreurs réseau pour cette stratégie
  });

  // Retourner immédiatement la version en cache ou attendre le réseau
  return cachedResponse || fetchPromise;
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    default:
      console.log('🔔 Unknown message type:', type);
  }
});

// Utilitaires
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const text = await response.text();
        totalSize += text.length;
      }
    }
  }

  return Math.round(totalSize / 1024); // Retourner en KB
}

async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ All caches cleared');
}
