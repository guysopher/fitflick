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

  const currentExercise = workout.exercises[currentExerciseIndex];

  const handleExerciseComplete = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
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
  };

  if (!isWorkoutActive) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start?</h2>
          <p className="text-white mb-8">
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}: {currentExercise.name}
          </p>
          <button
            onClick={handleStartWorkout}
            className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5z"/>
            </svg>
          </button>
          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
            >
              Back
            </button>
          </div>
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [workoutProgress, setWorkoutProgress] = useState(0);

  // Get video metadata for speed adjustment
  const videoMetadata = getVideoMetadata(exercise.videoUrl);
  const videoSpeed = videoMetadata?.video_speed || 1.0;

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video playback speed
    video.playbackRate = videoSpeed;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setWorkoutProgress(progress);
      
      // Auto-complete when video ends
      if (progress >= 95) {
        onWorkoutComplete();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onWorkoutComplete, videoSpeed]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const restartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    setWorkoutProgress(0);
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
        className="w-full h-full object-cover"
        loop
        playsInline
        autoPlay
        onClick={togglePlay}
      />

      {/* Top Overlay - Exercise Info */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 to-transparent p-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-3">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white font-medium">
            {exercise.duration}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm text-white font-medium ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty}
          </span>
        </div>

        {/* Target Muscles */}
        <div className="flex flex-wrap gap-2 mb-3">
          {exercise.targetMuscles.map((muscle, index) => (
            <span 
              key={index}
              className="bg-white/20 px-2 py-1 rounded-full text-xs text-white"
            >
              {muscle}
            </span>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="bg-white/20 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${workoutProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={restartVideo}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              🔄
            </button>
            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </div>
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