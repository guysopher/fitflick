'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Droplets, Share, Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Target, ArrowLeft, Clock, Trophy, SkipForward, User, Settings, TrendingUp, Zap } from 'lucide-react';
import { exercises, Exercise } from '@/data/exercises';
import { useUserData } from '@/hooks/useUserData';
import { useSession } from 'next-auth/react';
import BackgroundMusic, { BackgroundMusicRef } from './BackgroundMusic';
import WorkoutSuccess from './WorkoutSuccess';
import TimerVoiceCoach from '@/services/timerVoiceCoach';

const jokes = [
  "Why don't hamsters ever get lost? Because they always know which wheel to turn! 🐹",
  "What's a dog's favorite type of music? Anything with a good BARK-beat! 🎵",
  "Why did Zumba bring a ladder to the gym? To reach new heights! 🪜",
  "What do you call a hamster who loves to exercise? A gym-ster! 💪",
  "Why don't dogs make good DJs? They always paws the music! 🎧"
];

// Helper function to calculate coins reward based on difficulty and duration
const calculateCoinsReward = (difficulty: string, duration: string) => {
  const baseReward = 30;
  const difficultyMultiplier = {
    'Beginner': 1,
    'Intermediate': 1.5,
    'Advanced': 2
  };
  
  const durationInSeconds = parseInt(duration) || 30;
  const durationBonus = Math.floor(durationInSeconds / 10) * 5;
  
  return Math.floor(baseReward * (difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1) + durationBonus);
};

interface TikTokVideoPlayerProps {
  exercise: Exercise;
  onWorkoutComplete: (completionData: any) => void;
  onClose: () => void;
  backgroundMusicRef?: React.RefObject<BackgroundMusicRef | null>;
}

type WorkoutPhase = 'get-ready' | 'workout' | 'rest';

function TikTokVideoPlayer({ exercise, onWorkoutComplete, onClose, backgroundMusicRef }: TikTokVideoPlayerProps) {
  const workoutVideoRef = useRef<HTMLVideoElement>(null);
  const voiceCoachRef = useRef<TimerVoiceCoach | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [workoutProgress, setWorkoutProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<WorkoutPhase>('get-ready');
  const [phaseTimer, setPhaseTimer] = useState(5); // 5 seconds for get ready

  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [actualDuration, setActualDuration] = useState(0);

  // Initialize voice coach
  useEffect(() => {
    voiceCoachRef.current = TimerVoiceCoach.getInstance();
    voiceCoachRef.current.setEnabled(true);
    
    return () => {
      if (voiceCoachRef.current) {
        voiceCoachRef.current.stopSpeaking();
      }
    };
  }, []);

  // Handle voice coaching when workout starts
  useEffect(() => {
    if (voiceCoachRef.current && isPlaying) {
      console.log(`🎤 Updating voice coach for workout`);
      
      voiceCoachRef.current.onTimerUpdate({
        exerciseName: exercise.name,
        mode: 'workout',
        timeRemaining: Math.floor(duration - currentTime),
        currentStep: 1,
        totalSteps: 1
      });
    }
  }, [isPlaying, exercise.name]);

  // Update voice coach every second with timer value
  useEffect(() => {
    if (voiceCoachRef.current && isPlaying) {
      const interval = setInterval(() => {
        const remainingTime = Math.floor(duration - currentTime);
        voiceCoachRef.current?.onTimerUpdate({
          exerciseName: exercise.name,
          mode: 'workout',
          timeRemaining: remainingTime,
          currentStep: 1,
          totalSteps: 1
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, exercise.name, duration, currentTime]);

  // Handle pause/resume of voice
  useEffect(() => {
    if (voiceCoachRef.current && !isPlaying) {
      voiceCoachRef.current.stopSpeaking();
    }
  }, [isPlaying]);

  // Timer effect for get-ready phase
  useEffect(() => {
    if (currentPhase === 'get-ready') {
      const timer = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev <= 1) {
            setCurrentPhase('workout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentPhase]);

  // Handle workout phase
  useEffect(() => {
    const video = workoutVideoRef.current;
    if (!video || currentPhase !== 'workout') return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      setWorkoutProgress(progress);
      
      // Auto-complete workout when video ends
      if (progress >= 95) {
        handleWorkoutCompletion();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedData = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [currentPhase]);

  const handleWorkoutCompletion = () => {
    const completionTime = new Date();
    setCompletedAt(completionTime);
    setActualDuration(Math.floor(currentTime));
    
    const completionData = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      actualDuration: Math.floor(currentTime),
      restDuration: 0,
      completionPercentage: workoutProgress,
    };

    onWorkoutComplete(completionData);
  };

  const togglePlay = () => {
    const video = workoutVideoRef.current;
    if (!video || currentPhase !== 'workout') return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = workoutVideoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'get-ready': return 'Get Ready!';
      case 'workout': return 'Workout Time';
      case 'rest': return 'Great Job!';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-lg font-bold">{exercise.name}</h2>
          <p className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-full">
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Phase Display */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 text-center">
        <h3 className="text-2xl font-bold">{getPhaseTitle()}</h3>
        {currentPhase === 'get-ready' && (
          <p className="text-4xl font-bold mt-2">{phaseTimer}</p>
        )}
        {currentPhase === 'workout' && (
          <div className="mt-2">
            <div className="w-full bg-white/30 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${workoutProgress}%` }}
              />
            </div>
            <p className="mt-2">{Math.round(workoutProgress)}% Complete</p>
          </div>
        )}
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {currentPhase === 'workout' && (
          <>
            <video
              ref={workoutVideoRef}
              src={exercise.videoUrl}
              className="w-full h-full object-cover"
              muted={isMuted}
              playsInline
              autoPlay
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-6 py-3">
              <button onClick={togglePlay} className="text-white p-2">
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>
              <span className="text-white font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </>
        )}

        {currentPhase === 'get-ready' && (
          <div className="text-center text-white">
            <div className="text-8xl mb-4">🏃‍♂️</div>
            <p className="text-xl">Prepare for {exercise.name}</p>
            <p className="text-lg mt-2">Starting in {phaseTimer} seconds...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameWorkoutAppDB() {
  const { data: session } = useSession();
  const {
    userProgress,
    loading,
    error,
    isAuthenticated,
    updateUserProgress,
    createWorkout,
    completeWorkout,
    getUserWorkouts,
    getUserStats,
  } = useUserData();

  const [currentScreen, setCurrentScreen] = useState<'home' | 'workout' | 'complete' | 'profile' | 'exercises'>('home');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<number | null>(null);
  const [showJoke, setShowJoke] = useState(false);
  const [todayJoke, setTodayJoke] = useState('');
  const [completionData, setCompletionData] = useState<any>(null);
  const backgroundMusicRef = useRef<BackgroundMusicRef>(null);

  useEffect(() => {
    // Set random joke for today
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    setTodayJoke(randomJoke);
  }, []);

  const handleWorkoutStart = async (exercise: Exercise) => {
    if (!isAuthenticated) {
      alert('Please sign in to start a workout');
      return;
    }

    try {
      setSelectedExercise(exercise);
      
      // Create workout in database
      const workout = await createWorkout({
        name: `${exercise.name} Session`,
        exercises: [exercise],
        difficulty: exercise.difficulty,
        estimatedDuration: parseInt(exercise.duration) || 30,
      });

      setCurrentWorkoutId(workout.id);
      setCurrentScreen('workout');
    } catch (error) {
      console.error('Failed to start workout:', error);
      alert('Failed to start workout. Please try again.');
    }
  };

  const handleWorkoutComplete = async (exerciseCompletionData: any) => {
    if (!selectedExercise || !currentWorkoutId || !isAuthenticated) return;
    
    try {
      const coinsEarned = calculateCoinsReward(selectedExercise.difficulty, selectedExercise.duration);
      const estimatedCalories = Math.floor(exerciseCompletionData.actualDuration * 0.15); // Rough estimate
      
      const completionPayload = {
        exerciseCompletions: [exerciseCompletionData],
        totalDuration: exerciseCompletionData.actualDuration,
        caloriesBurned: estimatedCalories,
        coinsEarned,
      };

      // Complete workout in database
      await completeWorkout(currentWorkoutId, completionPayload);
      
      setCompletionData({
        ...exerciseCompletionData,
        coinsEarned,
        caloriesBurned: estimatedCalories,
      });
      
      setCurrentScreen('complete');
      setShowJoke(true);
    } catch (error) {
      console.error('Failed to complete workout:', error);
      alert('Failed to complete workout. Please try again.');
    }
  };

  const addWaterCup = async () => {
    if (!userProgress || !isAuthenticated) return;
    
    try {
      await updateUserProgress({
        waterCups: userProgress.waterCups + 1,
        coins: userProgress.coins + 5, // Bonus coins for hydration
      });
    } catch (error) {
      console.error('Failed to update water cups:', error);
    }
  };

  const shareWorkout = () => {
    if (!selectedExercise || !userProgress) return;
    
    const message = `🎉 Just crushed it with ${selectedExercise.name}! 💪 ${userProgress.streak} day streak and counting! 🔥`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Show loading or error states
  if (loading && !userProgress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fitness data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to FitFlick!</h1>
          <p className="text-gray-600 mb-6">Sign in to track your workouts and progress</p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Workout screen
  if (currentScreen === 'workout' && selectedExercise) {
    return (
      <TikTokVideoPlayer
        exercise={selectedExercise}
        onWorkoutComplete={handleWorkoutComplete}
        onClose={() => setCurrentScreen('home')}
        backgroundMusicRef={backgroundMusicRef}
      />
    );
  }

  // Completion screen
  if (currentScreen === 'complete' && selectedExercise && completionData) {
    return (
      <WorkoutSuccess
        exercise={selectedExercise}
        completionData={completionData}
        userProgress={userProgress || undefined}
        todayJoke={showJoke ? todayJoke : undefined}
        onClose={() => {
          setCurrentScreen('home');
          setSelectedExercise(null);
          setCompletionData(null);
          setShowJoke(false);
        }}
        onShare={shareWorkout}
      />
    );
  }

  // Home Screen
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <BackgroundMusic 
        ref={backgroundMusicRef}
        isActive={true}
        volume={0.3}
      />
      
      <div className="max-w-md mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center pt-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Hey {session?.user?.name?.split(' ')[0] || 'Fitness Hero'}! 👋
          </h1>
          <p className="text-slate-600 font-medium">Ready for today&apos;s adventure?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-rose-100 border border-rose-200 rounded-xl p-4 text-center shadow-sm">
            <Flame className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-rose-600">{userProgress?.streak || 0}</p>
            <p className="text-sm text-rose-700 font-medium">Day Streak</p>
          </div>

          <div className="bg-violet-100 border border-violet-200 rounded-xl p-4 text-center shadow-sm">
            <Target className="w-8 h-8 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-violet-600">Level {userProgress?.level || 1}</p>
            <p className="text-sm text-violet-700 font-medium">Fitness Hero</p>
          </div>
        </div>

        {/* Coins Display */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full px-6 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-white font-bold">
              <span className="text-lg">🪙</span>
              <span className="text-xl">{userProgress?.coins || 0}</span>
            </div>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-sky-100 border border-sky-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-sky-500" />
              <span className="font-semibold text-sky-700">Water Today</span>
            </div>
            <button 
              onClick={addWaterCup}
              className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-4 py-1 text-sm font-medium"
              disabled={loading}
            >
              +1 Cup
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-sky-600">{userProgress?.waterCups || 0}/8 cups</span>
            <span className="text-sm text-sky-600">{Math.round(((userProgress?.waterCups || 0) / 8) * 100)}%</span>
          </div>
          <div className="w-full bg-sky-200 rounded-full h-2">
            <div 
              className="bg-sky-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((userProgress?.waterCups || 0) / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Exercise Selection */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-emerald-700 mb-2">Choose Your Exercise</h3>
            <p className="text-emerald-800">Pick from {exercises.length} amazing exercises!</p>
          </div>
          
          {/* Quick Start - First Exercise */}
          <button
            onClick={() => handleWorkoutStart(exercises[0])}
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all mb-3"
          >
            {loading ? 'Starting...' : `Quick Start: ${exercises[0].name} 🚀`}
          </button>
          
          {/* View All Exercises Button */}
          <button
            onClick={() => setCurrentScreen('exercises')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all"
          >
            View All Exercises 📋
          </button>
        </div>

        {/* Pip's Daily Message */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-sky-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">Pip</span>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Daily Motivation</p>
              <p className="text-sm text-slate-600">
                Keep up the amazing work! Every workout brings you closer to your goals. 💪
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 