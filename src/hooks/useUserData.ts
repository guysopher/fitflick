import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserProgress {
  level: number;
  coins: number;
  streak: number;
  totalWorkouts: number;
  badges: string[];
  waterCups: number;
  unlockedCostumes: string[];
  currentCostume: string;
}

interface WorkoutData {
  name: string;
  exercises: any[];
  difficulty: string;
  estimatedDuration: number;
}

interface ExerciseCompletion {
  exerciseId: number;
  exerciseName: string;
  actualDuration: number;
  restDuration: number;
  completionPercentage: number;
}

export function useUserData() {
  const { data: session, status, update } = useSession();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from database
  const fetchUserData = useCallback(async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserProgress({
        level: data.user.level || 1,
        coins: data.user.coins || 0,
        streak: data.user.streak || 0,
        totalWorkouts: data.user.totalWorkouts || 0,
        badges: data.user.badges || [],
        waterCups: data.user.waterCups || 0,
        unlockedCostumes: data.user.unlockedCostumes || [],
        currentCostume: data.user.currentCostume || 'default',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Update user progress in database
  const updateUserProgress = useCallback(async (updates: Partial<UserProgress>) => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update user progress');
      }

      const data = await response.json();
      setUserProgress(prev => ({ ...prev, ...updates } as UserProgress));
      
      // Update session with new data
      await update();
      
      return data.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, update]);

  // Create a new workout
  const createWorkout = useCallback(async (workoutData: WorkoutData) => {
    if (!session?.user?.email) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        throw new Error('Failed to create workout');
      }

      const data = await response.json();
      return data.workout;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workout');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Complete a workout
  const completeWorkout = useCallback(async (
    workoutId: number, 
    completionData: {
      exerciseCompletions: ExerciseCompletion[];
      totalDuration: number;
      caloriesBurned: number;
      coinsEarned: number;
    }
  ) => {
    if (!session?.user?.email) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workouts/${workoutId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionData),
      });

      if (!response.ok) {
        throw new Error('Failed to complete workout');
      }

      const data = await response.json();
      
      // Refresh user data to get updated progress
      await fetchUserData();
      await update();
      
      return data.workout;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete workout');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, fetchUserData, update]);

  // Get user workouts
  const getUserWorkouts = useCallback(async (limit = 10, offset = 0) => {
    if (!session?.user?.email) return [];

    try {
      const response = await fetch(`/api/workouts?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }

      const data = await response.json();
      return data.workouts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workouts');
      return [];
    }
  }, [session?.user?.email]);

  // Get user statistics
  const getUserStats = useCallback(async (days = 30) => {
    if (!session?.user?.email) return null;

    try {
      const response = await fetch(`/api/stats?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      return null;
    }
  }, [session?.user?.email]);

  // Load user data when session is available
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && !userProgress) {
      fetchUserData();
    }
  }, [status, session?.user?.email, userProgress, fetchUserData]);

  return {
    // State
    userProgress,
    loading,
    error,
    isAuthenticated: status === 'authenticated',
    
    // Actions
    fetchUserData,
    updateUserProgress,
    createWorkout,
    completeWorkout,
    getUserWorkouts,
    getUserStats,
    
    // Session data
    session,
  };
} 