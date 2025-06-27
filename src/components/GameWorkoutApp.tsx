'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Droplets, Share, Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Target } from 'lucide-react';

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

interface Workout {
  id: string;
  name: string;
  duration: number; // in minutes
  videoUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  coinsReward: number;
  description: string;
  unlockLevel: number;
}

const workouts: Workout[] = [
  {
    id: 'zumba-zoom',
    name: 'Zumba Zoom',
    duration: 15,
    videoUrl: '/videos/zumba-zoom.mp4',
    difficulty: 'Easy',
    coinsReward: 50,
    description: 'Dance and jump with Zumba! Perfect for beginners.',
    unlockLevel: 1
  },
  {
    id: 'hamster-hop',
    name: 'Hamster Hop',
    duration: 18,
    videoUrl: '/videos/hamster-hop.mp4',
    difficulty: 'Easy',
    coinsReward: 60,
    description: 'Hop around like our energetic hamster friend!',
    unlockLevel: 2
  },
  {
    id: 'tail-wag-twists',
    name: 'Tail Wag Twists',
    duration: 20,
    videoUrl: '/videos/tail-wag-twists.mp4',
    difficulty: 'Medium',
    coinsReward: 80,
    description: 'Twist and turn with Zumba\'s signature moves!',
    unlockLevel: 3
  }
];

const jokes = [
  "Why don't hamsters ever get lost? Because they always know which wheel to turn! 🐹",
  "What's a dog's favorite type of music? Anything with a good BARK-beat! 🎵",
  "Why did Zumba bring a ladder to the gym? To reach new heights! 🪜",
  "What do you call a hamster who loves to exercise? A gym-ster! 💪",
  "Why don't dogs make good DJs? They always paws the music! 🎧"
];

interface TikTokVideoPlayerProps {
  workout: Workout;
  userProgress: UserProgress;
  onWorkoutComplete: () => void;
  onClose: () => void;
}

function TikTokVideoPlayer({ workout, userProgress, onWorkoutComplete, onClose }: TikTokVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [workoutProgress, setWorkoutProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      setWorkoutProgress(progress);
      
      // Auto-complete when video ends
      if (progress >= 95) {
        onWorkoutComplete();
      }
    };

    const handleLoadedData = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [onWorkoutComplete]);

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

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={workout.videoUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        onClick={togglePlay}
      />

      {/* Top Overlay - Workout Info */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 to-transparent p-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{workout.name}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-3">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white font-medium">
            {workout.duration} min
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white font-medium">
            +{workout.coinsReward} coins
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white font-medium">
            {workout.difficulty}
          </span>
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
      </div>

      {/* Side Character Motivations */}
      <div className="absolute right-4 top-1/3 z-40 space-y-4">
        {/* Zumba Motivation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 max-w-48">
          <div className="flex items-center gap-2 mb-2">
            {/* Custom Zumba character */}
            <div className="w-8 h-8 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full relative">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
            <span className="font-bold text-gray-800 text-sm">Zumba</span>
          </div>
          <p className="text-gray-700 text-xs">
            &quot;You&apos;re doing amazing, Shahar! Keep moving those paws! 🎵&quot;
          </p>
        </div>

        {/* Pip Encouragement */}
        <div className="bg-sky-100/90 backdrop-blur-sm rounded-2xl p-3 max-w-48">
          <div className="flex items-center gap-2 mb-2">
            {/* Custom Pip character */}
            <div className="w-8 h-8 bg-gradient-to-b from-sky-300 to-sky-500 rounded-full relative">
              <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
            <span className="font-bold text-gray-800 text-sm">Pip</span>
          </div>
          <p className="text-gray-700 text-xs">
            &quot;Don&apos;t forget to drink water! 💧 You&apos;re my workout hero!&quot;
          </p>
        </div>
      </div>

      {/* Center Play/Pause */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <button
            onClick={togglePlay}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            
            <button
              onClick={restartVideo}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleMute}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Streak Display */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-4 py-2">
            <div className="flex items-center gap-2 text-white">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-sm">{userProgress.streak} day streak!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameWorkoutApp() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'workout' | 'complete' | 'profile'>('home');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
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

  const handleWorkoutStart = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentScreen('workout');
  };

  const handleWorkoutComplete = () => {
    if (!selectedWorkout) return;
    
    // Update user progress
    setUserProgress(prev => ({
      ...prev,
      coins: prev.coins + selectedWorkout.coinsReward,
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
    const message = `🎉 Shahar just crushed it with ${selectedWorkout?.name}! 💪 ${userProgress.streak} day streak and counting! 🔥`;
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

          {/* Ready to Move Section */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-emerald-700 mb-2">Ready to Move?</h3>
              <p className="text-emerald-800">A new fitness adventure is waiting for you!</p>
            </div>
            <button
              onClick={() => handleWorkoutStart(workouts[0])}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              Let&apos;s Go! 🚀
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

  // Workout Screen
  if (currentScreen === 'workout' && selectedWorkout) {
    return (
      <TikTokVideoPlayer
        workout={selectedWorkout}
        userProgress={userProgress}
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
            You completed {selectedWorkout?.name} and earned {selectedWorkout?.coinsReward} coins!
          </p>
          
          {/* Rewards */}
          <div className="bg-yellow-100 rounded-2xl p-4 mb-4">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-yellow-700 font-semibold">+{selectedWorkout?.coinsReward} Coins</p>
            <p className="text-yellow-600 text-sm">Streak: {userProgress.streak} days! 🔥</p>
          </div>

          {/* Daily Joke */}
          {showJoke && (
            <div className="bg-pink-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🐹</span>
                <span className="font-bold text-pink-700">Hammy's Daily Joke</span>
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
            <h1 className="text-white font-bold text-lg">Shahar's Profile</h1>
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