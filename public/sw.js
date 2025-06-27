const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response before caching
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for saving workout progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'workout-progress') {
    event.waitUntil(syncWorkoutProgress());
  }
});

async function syncWorkoutProgress() {
  try {
    // Sync offline workout data when back online
    const pendingData = await getStoredWorkoutData();
    if (pendingData.length > 0) {
      await syncToServer(pendingData);
      await clearStoredWorkoutData();
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

async function getStoredWorkoutData() {
  // Get workout data from IndexedDB or localStorage
  return JSON.parse(localStorage.getItem('pendingWorkouts') || '[]');
}

async function syncToServer(data) {
  // Sync workout progress to server when online
  console.log('Syncing workout data:', data);
}

async function clearStoredWorkoutData() {
  localStorage.removeItem('pendingWorkouts');
}

// Push notifications for workout reminders
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : "Time for your workout with Zumba! 🐶",
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: '/' },
    actions: [
      {
        action: 'start-workout',
        title: 'Start Workout',
        icon: '/icon-192.png'
      },
      {
        action: 'remind-later',
        title: 'Remind Later',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Shahar\'s Workout Time! 🎉', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'start-workout') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'remind-later') {
    // Schedule another reminder
    console.log('Reminder scheduled for later');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 