/**
 * PWA Utility Functions
 * Helper functions for Progressive Web App functionality
 */

/**
 * Check if the app is running as an installed PWA
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // Check if running as PWA on iOS Safari
    Boolean((window.navigator as { standalone?: boolean }).standalone)
  );
}

/**
 * Check if the device supports PWA installation
 */
export function isPWASupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
}

/**
 * Get the current network status
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Store workout data offline for later sync
 */
export function storeWorkoutOffline(workoutData: Record<string, unknown>): void {
  try {
    const existingData = JSON.parse(localStorage.getItem('pendingWorkouts') || '[]');
    existingData.push({
      ...workoutData,
      timestamp: new Date().toISOString(),
      offline: true
    });
    localStorage.setItem('pendingWorkouts', JSON.stringify(existingData));
  } catch (error) {
    console.error('Failed to store workout offline:', error);
  }
}

/**
 * Get stored offline workout data
 */
export function getOfflineWorkouts(): Record<string, unknown>[] {
  try {
    return JSON.parse(localStorage.getItem('pendingWorkouts') || '[]');
  } catch (error) {
    console.error('Failed to get offline workouts:', error);
    return [];
  }
}

/**
 * Clear offline workout data after successful sync
 */
export function clearOfflineWorkouts(): void {
  try {
    localStorage.removeItem('pendingWorkouts');
  } catch (error) {
    console.error('Failed to clear offline workouts:', error);
  }
}

/**
 * Request persistent storage for the PWA
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const persistent = await navigator.storage.persist();
      console.log(`Persistent storage: ${persistent ? 'granted' : 'denied'}`);
      return persistent;
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
      return false;
    }
  }
  return false;
}

/**
 * Estimate storage usage for the PWA
 */
export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      return await navigator.storage.estimate();
    } catch (error) {
      console.error('Failed to get storage estimate:', error);
      return null;
    }
  }
  return null;
} 