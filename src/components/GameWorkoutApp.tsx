'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Droplets, Share, Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Target } from 'lucide-react';
import { exercises, Exercise } from '@/data/exercises';
import { videos } from '@/data/videos';

interface UserProgress {
  level: number;
  coins: number;
  streak: number;
  totalWorkouts: number;
  badges: string[];
  waterCups: number;
  lastWorkout: string;
  unlockedCostumes: string[];
  currentCostume: string;
}

// Helper function to get video metadata
const getVideoMetadata = (videoFileName: string) => {
  const fileName = videoFileName.replace('/videos/', '');
  return videos.find(video => video.filename === fileName);
};

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

const jokes = [
  "Why don't hamsters ever get lost? Because they always know which wheel to turn! 🐹",
  "What's a dog's favorite type of music? Anything with a good BARK-beat! 🎵",
  "Why did Zumba bring a ladder to the gym? To reach new heights! 🪜",
  "What do you call a hamster who loves to exercise? A gym-ster! 💪",
  "Why don't dogs make good DJs? They always paws the music! 🎧"
];

interface TikTokVideoPlayerProps {
  exercise: Exercise;
  onWorkoutComplete: () => void;
  onClose: () => void;
}

type WorkoutPhase = 'get-ready' | 'workout' | 'rest';

function TikTokVideoPlayer({ exercise, onWorkoutComplete, onClose }: TikTokVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [workoutProgress, setWorkoutProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<WorkoutPhase>('get-ready');
  const [phaseTimer, setPhaseTimer] = useState(5); // 5 seconds for get ready, customizable for rest

  // Get current video URL based on phase
  const getCurrentVideoUrl = () => {
    switch (currentPhase) {
      case 'get-ready':
        return '/videos/Ready.mp4';
      case 'rest':
        return '/videos/Resting.mp4';
      case 'workout':
      default:
        return exercise.videoUrl;
    }
  };

  // Get video metadata for speed adjustment
  const videoMetadata = getVideoMetadata(exercise.videoUrl);
  const videoSpeed = videoMetadata?.video_speed || 1.0;

  // Timer effect for get-ready and rest phases
  useEffect(() => {
    if (currentPhase === 'get-ready' || currentPhase === 'rest') {
      const timer = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev <= 1) {
            if (currentPhase === 'get-ready') {
              setCurrentPhase('workout');
              setPhaseTimer(0);
            } else if (currentPhase === 'rest') {
              onWorkoutComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentPhase, onWorkoutComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video playback speed (only for workout phase)
    if (currentPhase === 'workout') {
      video.playbackRate = videoSpeed;
    } else {
      video.playbackRate = 1.0; // Normal speed for get-ready and rest videos
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      if (currentPhase === 'workout') {
        const progress = (video.currentTime / video.duration) * 100;
        setWorkoutProgress(progress);
        
        // Auto-complete workout when video ends, then go to rest
        if (progress >= 95) {
          setCurrentPhase('rest');
          setPhaseTimer(10); // 10 seconds rest
          setWorkoutProgress(100);
        }
      }
    };

    const handleLoadedData = () => {
      setDuration(video.duration);
      // Auto-play for get-ready and rest phases
      if (currentPhase === 'get-ready' || currentPhase === 'rest') {
        video.play();
        setIsPlaying(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [onWorkoutComplete, videoSpeed, currentPhase]);

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const coinsReward = calculateCoinsReward(exercise.difficulty, exercise.duration);

  // Get phase-specific title and display info
  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'get-ready':
        return 'Get Ready!';
      case 'rest':
        return 'Rest Time';
      case 'workout':
      default:
        return exercise.name;
    }
  };

  const getPhaseSubtitle = () => {
    switch (currentPhase) {
      case 'get-ready':
        return 'Prepare for your workout';
      case 'rest':
        return 'Take a breather';
      case 'workout':
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={getCurrentVideoUrl()}
        className="w-full h-full object-cover"
        loop
        playsInline
        onClick={currentPhase === 'workout' ? togglePlay : undefined}
      />

      {/* Top Overlay - Exercise Info */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 to-transparent p-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{getPhaseTitle()}</h2>
            {getPhaseSubtitle() && (
              <p className="text-white/80 text-sm mt-1">{getPhaseSubtitle()}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Phase Timer */}
        {(currentPhase === 'get-ready' || currentPhase === 'rest') && (
          <div className="text-center mb-4">
            <div className="text-6xl font-bold text-white mb-2">{phaseTimer}</div>
            <div className="text-white/80 text-sm">
              {currentPhase === 'get-ready' ? 'seconds to start' : 'seconds remaining'}
            </div>
          </div>
        )}

        {/* Workout Phase Info */}
        {currentPhase === 'workout' && (
          <>
            <div className="flex items-center gap-4 mb-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white font-medium">
                {exercise.duration}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white font-medium">
                +{coinsReward} coins
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
            
            <div className="flex justify-between text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </>
        )}

        {/* Get Ready Phase Info */}
        {currentPhase === 'get-ready' && (
          <div className="text-center">
            <div className="bg-white/20 px-4 py-2 rounded-full text-white font-medium mb-2">
              Next: {exercise.name}
            </div>
            <div className="text-white/80 text-sm">
              {exercise.difficulty} • {exercise.duration}
            </div>
          </div>
        )}

        {/* Rest Phase Info */}
        {currentPhase === 'rest' && (
          <div className="text-center">
            <div className="bg-green-500/80 px-4 py-2 rounded-full text-white font-medium mb-2">
              Great work! 💪
            </div>
            <div className="text-white/80 text-sm">
              You earned +{coinsReward} coins
            </div>
          </div>
        )}
      </div>

      {/* Side Exercise Instructions - Only show during workout */}
      {currentPhase === 'workout' && (
        <div className="absolute right-4 top-1/3 z-40 space-y-4 max-w-xs">
          <div className="bg-black/50 rounded-lg p-4 text-white">
            <h3 className="font-bold text-lg mb-2">Instructions</h3>
            <ul className="space-y-1 text-sm">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-400 mr-2 mt-1">•</span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom Control Bar - Only show during workout */}
      {currentPhase === 'workout' && (
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={restartVideo}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <RotateCcw size={24} />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            
            <button
              onClick={toggleMute}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GameWorkoutApp() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'workout' | 'complete' | 'profile' | 'exercises'>('home');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showJoke, setShowJoke] = useState(false);
  const [todayJoke, setTodayJoke] = useState('');
  
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    coins: 150,
    streak: 3,
    totalWorkouts: 12,
    badges: ['First Workout', 'Water Champion'],
    waterCups: 4,
    lastWorkout: new Date().toISOString().split('T')[0],
    unlockedCostumes: ['Default', 'Sporty'],
    currentCostume: 'Sporty'
  });

  useEffect(() => {
    // Set random joke for today
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    setTodayJoke(randomJoke);
  }, []);

  const handleWorkoutStart = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentScreen('workout');
  };

  const handleWorkoutComplete = () => {
    if (!selectedExercise) return;
    
    // Update user progress
    setUserProgress(prev => ({
      ...prev,
      coins: prev.coins + calculateCoinsReward(selectedExercise.difficulty, selectedExercise.duration),
      totalWorkouts: prev.totalWorkouts + 1,
      streak: prev.streak + 1,
      lastWorkout: new Date().toISOString().split('T')[0]
    }));
    
    setCurrentScreen('complete');
    setShowJoke(true);
  };

  const addWaterCup = () => {
    setUserProgress(prev => ({
      ...prev,
      waterCups: prev.waterCups + 1,
      coins: prev.coins + 5 // Bonus coins for hydration
    }));
  };

  const shareWorkout = () => {
    const message = `🎉 Shahar just crushed it with ${selectedExercise?.name}! 💪 ${userProgress.streak} day streak and counting! 🔥`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="text-center pt-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text text-transparent mb-2">
              Hey Shahar! 👋
            </h1>
            <p className="text-slate-600 font-medium">Ready for today&apos;s adventure?</p>
          </div>

          {/* Characters Section */}
          <div className="flex justify-center items-end gap-8 mb-6">
            <div className="text-center">
              {/* Zumba Character - Golden Dog */}
              <div className="relative mb-2">
                <div className="w-20 h-16 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-t-3xl relative">
                  {/* Dog ears */}
                  <div className="absolute -top-2 left-2 w-6 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full transform -rotate-12"></div>
                  <div className="absolute -top-2 right-2 w-6 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full transform rotate-12"></div>
                  {/* Dog face */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                    {/* Eyes */}
                    <div className="flex gap-2 mb-1">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                    {/* Nose */}
                    <div className="w-1.5 h-1.5 bg-black rounded-full mx-auto"></div>
                  </div>
                </div>
                {/* Dog body */}
                <div className="w-16 h-12 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-b-2xl mx-auto"></div>
              </div>
              <p className="text-sm font-semibold text-rose-600">Zumba</p>
            </div>
            
            <div className="text-center">
              {/* Pip Character - Blue Hamster */}
              <div className="relative mb-2">
                <div className="w-12 h-12 bg-gradient-to-b from-sky-300 to-sky-500 rounded-full relative">
                  {/* Hamster ears */}
                  <div className="absolute -top-1 left-2 w-3 h-3 bg-sky-400 rounded-full"></div>
                  <div className="absolute -top-1 right-2 w-3 h-3 bg-sky-400 rounded-full"></div>
                  {/* Hamster face */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                    {/* Eyes */}
                    <div className="flex gap-1 mb-1">
                      <div className="w-1 h-1 bg-black rounded-full"></div>
                      <div className="w-1 h-1 bg-black rounded-full"></div>
                    </div>
                    {/* Smile */}
                    <div className="w-2 h-1 border-b border-black rounded-full"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm font-semibold text-sky-600">Pip</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-rose-100 border border-rose-200 rounded-xl p-4 text-center shadow-sm">
              <Flame className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-rose-600">{userProgress.streak}</p>
              <p className="text-sm text-rose-700 font-medium">Day Streak</p>
            </div>

            <div className="bg-violet-100 border border-violet-200 rounded-xl p-4 text-center shadow-sm">
              <Target className="w-8 h-8 text-violet-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-violet-600">Level {userProgress.level}</p>
              <p className="text-sm text-violet-700 font-medium">Fitness Hero</p>
            </div>
          </div>

          {/* Coins Display */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full px-6 py-2 shadow-lg">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-lg">🪙</span>
                <span className="text-xl">{userProgress.coins}</span>
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
              >
                +1 Cup
              </button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-sky-600">{userProgress.waterCups}/8 cups</span>
              <span className="text-sm text-sky-600">{Math.round((userProgress.waterCups / 8) * 100)}%</span>
            </div>
            <div className="w-full bg-sky-200 rounded-full h-2">
              <div 
                className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(userProgress.waterCups / 8) * 100}%` }}
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
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all mb-3"
            >
              Quick Start: {exercises[0].name} 🚀
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
              {/* Small Pip character */}
              <div className="w-8 h-8 bg-gradient-to-b from-sky-300 to-sky-500 rounded-full relative flex-shrink-0 mt-1">
                <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-0.5 mb-0.5">
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700 mb-1">Pip says:</p>
                <p className="text-sm text-slate-600">{todayJoke}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exercises Selection Screen
  if (currentScreen === 'exercises') {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
        case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-sm border-b border-white/30 sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center">
            <button
              onClick={() => setCurrentScreen('home')}
              className="mr-4 text-gray-700 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-gray-800 font-bold text-lg">Choose Your Exercise</h1>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((exercise) => (
            <div 
              key={exercise.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleWorkoutStart(exercise)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-1">{exercise.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)} ml-2`}>
                  {exercise.difficulty}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{exercise.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{exercise.duration}</span>
                <span className="text-sm text-gray-500">{exercise.category}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {exercise.targetMuscles.slice(0, 3).map((muscle, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-medium"
                  >
                    {muscle}
                  </span>
                ))}
                {exercise.targetMuscles.length > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-medium">
                    +{exercise.targetMuscles.length - 3} more
                  </span>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Reward:</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    +{calculateCoinsReward(exercise.difficulty, exercise.duration)} coins
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Workout Screen
  if (currentScreen === 'workout' && selectedExercise) {
          return (
        <TikTokVideoPlayer
          exercise={selectedExercise}
          onWorkoutComplete={handleWorkoutComplete}
          onClose={() => setCurrentScreen('home')}
        />
      );
  }

  // Workout Complete Screen
  if (currentScreen === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center max-w-sm w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Amazing Job!</h2>
          <p className="text-gray-600 mb-4">
            You completed {selectedExercise?.name} and earned {calculateCoinsReward(selectedExercise?.difficulty || '', selectedExercise?.duration || '')} coins!
          </p>
          
          {/* Rewards */}
          <div className="bg-yellow-100 rounded-2xl p-4 mb-4">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-yellow-700 font-semibold">+{calculateCoinsReward(selectedExercise?.difficulty || '', selectedExercise?.duration || '')} Coins</p>
            <p className="text-yellow-600 text-sm">Streak: {userProgress.streak} days! 🔥</p>
          </div>

          {/* Daily Joke */}
          {showJoke && (
            <div className="bg-pink-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🐹</span>
                <span className="font-bold text-pink-700">Hammy&apos;s Daily Joke</span>
              </div>
              <p className="text-pink-600 text-sm">{todayJoke}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={shareWorkout}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Share className="w-5 h-5" />
              Share on WhatsApp
            </button>
            
            <button
              onClick={() => setCurrentScreen('home')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile/Settings Screen
  if (currentScreen === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300">
        <div className="bg-white/20 backdrop-blur-sm border-b border-white/30">
          <div className="px-4 py-4 flex items-center">
            <button
              onClick={() => setCurrentScreen('home')}
              className="mr-4 text-white"
            >
              ← Back
            </button>
            <h1 className="text-white font-bold text-lg">Shahar&apos;s Profile</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Avatar Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
              👧🏻
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Shahar the Champion!</h2>
            <p className="text-gray-600">Level {userProgress.level} Fitness Hero</p>
          </div>

          {/* Achievements */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6">
            <h3 className="font-bold text-gray-800 mb-4">Achievements 🏆</h3>
            <div className="grid grid-cols-2 gap-3">
              {userProgress.badges.map((badge, index) => (
                <div key={index} className="bg-yellow-100 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🏅</div>
                  <p className="text-yellow-700 text-sm font-semibold">{badge}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6">
            <h3 className="font-bold text-gray-800 mb-4">Your Stats 📊</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Workouts</span>
                <span className="font-bold text-gray-800">{userProgress.totalWorkouts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Longest Streak</span>
                <span className="font-bold text-gray-800">{userProgress.streak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coins Earned</span>
                <span className="font-bold text-gray-800">{userProgress.coins}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 