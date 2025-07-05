/**
 * Development Configuration
 * Handles development mode settings and mock data
 */

export const DEV_CONFIG = {
  // Check if we're in development mode and should bypass authentication
  isDevelopment: process.env.NODE_ENV === 'development',
  bypassAuth: process.env.BYPASS_AUTH === 'true' || (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_CLIENT_ID),
};

// Mock user data for development
export const MOCK_USER = {
  id: 'dev-user-1',
  name: 'Dev User',
  email: 'dev@example.com',
  image: null,
  level: 2,
  coins: 250,
  streak: 5,
  totalWorkouts: 15,
  badges: ['First Workout', 'Water Champion', 'Streak Master'],
  waterCups: 6,
  unlockedCostumes: ['Default', 'Sporty', 'Casual'],
  currentCostume: 'Sporty',
};

// Mock session for development
export const MOCK_SESSION = {
  user: MOCK_USER,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

export function shouldBypassAuth(): boolean {
  return DEV_CONFIG.bypassAuth;
}

export function getMockSession() {
  return shouldBypassAuth() ? MOCK_SESSION : null;
}

export function logDevMode() {
  if (DEV_CONFIG.isDevelopment) {
    console.log('🔧 Development Mode Active');
    if (DEV_CONFIG.bypassAuth) {
      console.log('🚫 Authentication Bypassed - Using Mock User');
      console.log('👤 Mock User:', MOCK_USER.name, MOCK_USER.email);
    } else {
      console.log('✅ Authentication Required - Production Mode');
    }
  }
} 