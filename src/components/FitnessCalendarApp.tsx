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
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(10); // Start with countdown immediately
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(10); // 10 second rest

  const currentExercise = workout.exercises[currentExerciseIndex];

  const handleExerciseComplete = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      // Start rest period
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

  // Handle countdown timer
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
      // Rest complete, move to next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsResting(false);
      setCountdown(10);
      setRestTimer(10); // Reset for next rest
    }
  }, [isResting, restTimer, currentExerciseIndex]);

  // Rest screen
  if (isResting) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Background Image */}
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/standing.png)' }}
        />
        
        {/* Rest Overlay */}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-start pt-20">
          <div className="text-center">
            <h2 className="text-4xl font-thin text-white mb-4">Rest Time</h2>
            <p className="text-white/80 text-lg mb-8">
              Next: Exercise {currentExerciseIndex + 2} of {workout.exercises.length}
            </p>
            
            {/* Rest Timer */}
            <div className="text-center">
              <span className="text-8xl font-thin text-white">{restTimer}</span>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white text-xl hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (!isWorkoutActive) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Background Image */}
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/standing.png)' }}
        />
        
        {/* Get Ready Overlay */}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-start pt-20">
          <div className="text-center">
                         <h2 className="text-4xl font-thin text-white mb-4">Get Ready!</h2>
            <p className="text-white/80 text-lg mb-8">
              Exercise {currentExerciseIndex + 1} of {workout.exercises.length}: {currentExercise.name}
            </p>
            
            {/* Countdown Timer */}
            <div className="text-center">
              <span className="text-8xl font-thin text-white">{countdown}</span>
            </div>
          </div>
          
          {/* Skip button */}
          <button
            onClick={handleStartWorkout}
            className="mt-8 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
          >
            Start Now
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white text-xl hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return <TikTokVideoPlayer exercise={currentExercise} onWorkoutComplete={handleExerciseComplete} onClose={onClose} />;
}

// TikTok Video Player Component (extracted from GameWorkoutApp)
interface TikTokVideoPlayerProps {
  exercise: Exercise;
  onWorkoutComplete: () => void;
  onClose: () => void;
}

function TikTokVideoPlayer({ exercise, onWorkoutComplete, onClose }: TikTokVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [exerciseTimer, setExerciseTimer] = useState(20); // 20 second timer

  // Get video metadata for speed adjustment
  const videoMetadata = getVideoMetadata(exercise.videoUrl);
  const videoSpeed = videoMetadata?.video_speed || 1.0;

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video playback speed and start playing
    video.playbackRate = videoSpeed;
    video.muted = true; // Always muted
    
    const playVideo = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
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
  }, [videoSpeed]);

  // Exercise timer countdown
  React.useEffect(() => {
    if (isPlaying && exerciseTimer > 0) {
      const timer = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev <= 1) {
            onWorkoutComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, exerciseTimer, onWorkoutComplete]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };



  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={exercise.videoUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        autoPlay
        muted
        onClick={togglePlayPause}
      />

      {/* Top Overlay - Exercise Name */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
                     <h2 className="text-3xl font-thin text-white">{exercise.name}</h2>
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
          <span className="text-8xl font-thin text-white">{exerciseTimer}</span>
        </div>
      </div>

      {/* Play/Pause Indicator (only shown when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5z"/>
            </svg>
          </div>
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