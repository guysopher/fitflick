const STATIC_CACHE = 'fitflick-static-v2';
const DYNAMIC_CACHE = 'fitflick-dynamic-v2';
const MEDIA_CACHE = 'fitflick-media-v2';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// Media files that should be cached for offline workouts
const MEDIA_PATTERNS = [
  /\/videos\/.+\.mp4$/,
  /\/audio\/.+\.mp3$/,
  /\/images\/.+\.(png|jpg|jpeg|gif|webp)$/
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
          .filter(cacheName => 
            cacheName !== STATIC_CACHE && 
            cacheName !== DYNAMIC_CACHE && 
            cacheName !== MEDIA_CACHE
          )
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

  // Check if it's a media file
  const isMediaFile = MEDIA_PATTERNS.some(pattern => pattern.test(request.url));
  
  if (isMediaFile) {
    // Cache-first strategy for media files (videos, audio, images)
    event.respondWith(handleMediaRequest(request));
  } else {
    // Network-first strategy for other content
    event.respondWith(handleRegularRequest(request));
  }
});

// Handle media files with cache-first strategy
async function handleMediaRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(MEDIA_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Media file unavailable offline:', request.url);
    return new Response('Media unavailable offline', { status: 503 });
  }
}

// Handle regular requests with network-first strategy
async function handleRegularRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('App unavailable offline', { status: 503 });
    }
    
    return new Response('Content unavailable offline', { status: 503 });
  }
}

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