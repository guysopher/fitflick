'use client';

import React, { useState } from 'react';
import CalendarView from './CalendarView';
import WorkoutOfTheDay from './WorkoutOfTheDay';
import { beginnerToAdvancedWorkout, Exercise } from '@/data/exercises';

// Import the TikTokVideoPlayer from GameWorkoutApp
import { videos } from '@/data/videos';

interface CompletedWorkout {
  date: string;
  workoutId: number;
  completed: boolean;
}

// Helper function to get video metadata
const getVideoMetadata = (videoFileName: string) => {
  const fileName = videoFileName.replace('/videos/', '');
  return videos.find(video => video.filename === fileName);
};

// Workout Player Component (extracted from GameWorkoutApp)
interface WorkoutPlayerProps {
  workout: typeof beginnerToAdvancedWorkout;
  onWorkoutComplete: () => void;
  onClose: () => void;
}

function WorkoutPlayer({ workout, onWorkoutComplete, onClose }: WorkoutPlayerProps) {
  // Workout sequence state
  const [workoutStep, setWorkoutStep] = useState(0); // Overall step counter
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(10); // Get ready timer
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(10);

  // Calculate current exercise based on the pattern
  const getCurrentExercise = () => {
    const totalExercises = workout.exercises.length;
    
    // Calculate which pair group we're in (0-1, 2-3, 4-5, etc.)
    const pairGroup = Math.floor(workoutStep / 4);
    
    // Calculate position within the current pair cycle (0-3)
    const positionInCycle = workoutStep % 4;
    
    // Determine exercise indices for current pair
    const baseIndex = pairGroup * 2;
    const firstExerciseIndex = baseIndex;
    const secondExerciseIndex = baseIndex + 1;
    
    // Handle edge case: if we're at the last exercise and it's odd
    if (firstExerciseIndex >= totalExercises) {
      return workout.exercises[totalExercises - 1];
    }
    
    // If second exercise doesn't exist (odd number), use first for all positions
    if (secondExerciseIndex >= totalExercises) {
      return workout.exercises[firstExerciseIndex];
    }
    
    // Pattern within each pair cycle: ex1, ex2, ex1, ex2
    if (positionInCycle === 0 || positionInCycle === 2) {
      return workout.exercises[firstExerciseIndex];
    } else {
      return workout.exercises[secondExerciseIndex];
    }
  };

  const currentExercise = getCurrentExercise();

  // Calculate total steps in workout (each exercise done twice, in pairs)
  const getTotalSteps = () => {
    const totalExercises = workout.exercises.length;
    // Each exercise is done exactly twice
    return totalExercises * 2;
  };

  const totalSteps = getTotalSteps();

  const handleExerciseComplete = () => {
    if (workoutStep < totalSteps - 1) {
      // Start rest period before next exercise
      setIsWorkoutActive(false);
      setIsResting(true);
      setRestTimer(10);
    } else {
      // Workout completed
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Save completion to localStorage
      const savedWorkouts = localStorage.getItem('completedWorkouts');
      const completedWorkouts: CompletedWorkout[] = savedWorkouts ? JSON.parse(savedWorkouts) : [];
      
      // Check if today's workout is already recorded
      const existingIndex = completedWorkouts.findIndex(
        w => w.date === todayString && w.workoutId === workout.id
      );
      
      if (existingIndex >= 0) {
        completedWorkouts[existingIndex].completed = true;
      } else {
        completedWorkouts.push({
          date: todayString,
          workoutId: workout.id,
          completed: true
        });
      }
      
      localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
      onWorkoutComplete();
    }
  };

  const handleStartWorkout = () => {
    setIsWorkoutActive(true);
    setCountdown(null);
  };

  // Handle countdown timer (get ready)
  React.useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsWorkoutActive(true);
      setCountdown(null);
    }
  }, [countdown]);

  // Handle rest timer
  React.useEffect(() => {
    if (isResting && restTimer > 0) {
      const timer = setTimeout(() => {
        setRestTimer(restTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (restTimer === 0 && isResting) {
      // Rest complete, move to next step
      setWorkoutStep(workoutStep + 1);
      setIsResting(false);
      setCountdown(null); // Go directly to workout, no get ready after rest
      setIsWorkoutActive(true);
      setRestTimer(10); // Reset for next rest
    }
  }, [isResting, restTimer, workoutStep]);

  // Always use TikTokVideoPlayer with appropriate mode
  const getMode = (): PlayerMode => {
    if (isResting) return 'rest';
    if (!isWorkoutActive) return 'get-ready';
    return 'workout';
  };

  const getTimer = () => {
    if (isResting) return restTimer || 0;
    if (!isWorkoutActive) return countdown || 0;
    return 20; // 20 seconds for workout
  };

  const handleComplete = () => {
    if (!isWorkoutActive) {
      handleStartWorkout();
    } else if (isResting) {
      handleExerciseComplete();
    } else {
      handleExerciseComplete();
    }
  };

  // Calculate next exercise for display
  const getNextExercise = () => {
    const nextStep = workoutStep + 1;
    if (nextStep >= totalSteps) return null;
    
    const totalExercises = workout.exercises.length;
    const pairGroup = Math.floor(nextStep / 4);
    const positionInCycle = nextStep % 4;
    const baseIndex = pairGroup * 2;
    const firstExerciseIndex = baseIndex;
    const secondExerciseIndex = baseIndex + 1;
    
    // Handle edge case: if we're at the last exercise and it's odd
    if (firstExerciseIndex >= totalExercises) {
      return workout.exercises[totalExercises - 1];
    }
    
    // If second exercise doesn't exist (odd number), use first for all positions
    if (secondExerciseIndex >= totalExercises) {
      return workout.exercises[firstExerciseIndex];
    }
    
    if (positionInCycle === 0 || positionInCycle === 2) {
      return workout.exercises[firstExerciseIndex];
    } else {
      return workout.exercises[secondExerciseIndex];
    }
  };

  const nextExercise = getNextExercise();

  return (
    <TikTokVideoPlayer 
      exercise={currentExercise}
      mode={getMode()}
      timer={getTimer()}
      onWorkoutComplete={handleComplete}
      onClose={onClose}
      nextExerciseName={nextExercise?.name}
      currentExerciseIndex={workoutStep}
      totalExercises={totalSteps}
    />
  );
}

// TikTok Video Player Component (extracted from GameWorkoutApp)
type PlayerMode = 'get-ready' | 'workout' | 'rest';

interface TikTokVideoPlayerProps {
  exercise: Exercise;
  mode: PlayerMode;
  timer: number;
  onWorkoutComplete: () => void;
  onClose: () => void;
  nextExerciseName?: string;
  currentExerciseIndex?: number;
  totalExercises?: number;
}

function TikTokVideoPlayer({ 
  exercise, 
  mode, 
  timer, 
  onWorkoutComplete, 
  onClose, 
  nextExerciseName,
  currentExerciseIndex = 0,
  totalExercises = 1
}: TikTokVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimer, setCurrentTimer] = useState(timer);

  // Get video URL based on mode
  const getVideoUrl = () => {
    switch (mode) {
      case 'get-ready':
        return '/videos/Ready.mp4';
      case 'rest':
        return '/videos/Resting.mp4';
      case 'workout':
      default:
        return exercise.videoUrl;
    }
  };

  // Get video metadata for speed adjustment (only for workout mode)
  const videoMetadata = mode === 'workout' ? getVideoMetadata(exercise.videoUrl) : null;
  const videoSpeed = videoMetadata?.video_speed || 1.0;

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video playback speed and start playing
    video.playbackRate = mode === 'workout' ? videoSpeed : 1.0;
    video.muted = true; // Always muted
    
    const playVideo = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        console.log('Auto-play failed, user interaction required');
        setIsPlaying(false);
      }
    };

    playVideo();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
      }, [videoSpeed, mode]);

  // Update timer when prop changes (for get-ready and rest modes)
  React.useEffect(() => {
    setCurrentTimer(timer);
  }, [timer]);

  // Timer countdown for workout mode
  React.useEffect(() => {
    if (mode === 'workout' && isPlaying && currentTimer > 0) {
      const timerInterval = setInterval(() => {
        setCurrentTimer(prev => {
          if (prev <= 1) {
            onWorkoutComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [mode, isPlaying, currentTimer, onWorkoutComplete]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (mode === 'workout') {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  // Get title based on mode
  const getTitle = () => {
    switch (mode) {
      case 'get-ready':
        return 'Get Ready!';
      case 'rest':
        return 'Rest Time';
      case 'workout':
      default:
        return exercise.name;
    }
  };

  // Get subtitle based on mode
  const getSubtitle = () => {
    switch (mode) {
      case 'get-ready':
        return `Exercise ${currentExerciseIndex + 1} of ${totalExercises}: ${exercise.name}`;
      case 'rest':
        return nextExerciseName ? `Next: ${nextExerciseName}` : null;
      case 'workout':
      default:
        return null;
    }
  };



  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/images/standing.png)',
          filter: 'blur(20px)',
          transform: 'scale(1.1)' // Slightly scale up to hide blur edges
        }}
      />
      
      {/* Video Foreground */}
      <video
        ref={videoRef}
        src={getVideoUrl()}
        className="relative w-full h-full object-contain z-10"
        loop
        playsInline
        autoPlay
        muted
        onClick={mode === 'workout' ? togglePlayPause : undefined}
      />

      {/* Top Overlay - Title */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-thin text-white">{getTitle()}</h2>
            {getSubtitle() && (
              <p className="text-white/80 text-lg mt-2 font-normal">{getSubtitle()}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white text-xl hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Bottom Overlay - Timer */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="text-center">
          <span className="text-8xl font-thin text-white">{currentTimer}</span>
        </div>
      </div>

      {/* Play/Pause Indicator (only shown when paused and in workout mode) */}
      {!isPlaying && mode === 'workout' && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Skip/Start Button for get-ready and rest modes */}
      {(mode === 'get-ready' || mode === 'rest') && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pt-20">
          <button
            onClick={onWorkoutComplete}
            className="mt-8 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors font-normal"
          >
            {mode === 'get-ready' ? 'Start Now' : 'Skip Rest'}
          </button>
        </div>
      )}
    </div>
  );
}

type ViewMode = 'calendar' | 'workout' | 'player';

export default function FitnessCalendarApp() {
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');
  const [selectedWorkout, setSelectedWorkout] = useState<typeof beginnerToAdvancedWorkout | null>(null);

  const handleWorkoutSelect = () => {
    setCurrentView('workout');
  };

  const handleWorkoutStart = (workout: typeof beginnerToAdvancedWorkout) => {
    setSelectedWorkout(workout);
    setCurrentView('player');
  };

  const handleWorkoutComplete = () => {
    setSelectedWorkout(null);
    setCurrentView('calendar');
  };

  const handleBackToCalendar = () => {
    setCurrentView('calendar');
  };

  const handleClosePlayer = () => {
    setSelectedWorkout(null);
    setCurrentView('workout');
  };

  if (currentView === 'player' && selectedWorkout) {
    return (
      <WorkoutPlayer
        workout={selectedWorkout}
        onWorkoutComplete={handleWorkoutComplete}
        onClose={handleClosePlayer}
      />
    );
  }

  if (currentView === 'workout') {
    return (
      <WorkoutOfTheDay
        onWorkoutStart={handleWorkoutStart}
        onBack={handleBackToCalendar}
      />
    );
  }

  return (
    <CalendarView onWorkoutSelect={handleWorkoutSelect} />
  );
} 