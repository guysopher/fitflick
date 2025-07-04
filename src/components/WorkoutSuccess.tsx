'use client';

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Trophy, Share, Calendar, Star, Flame, Target, Clock, Medal, CheckCircle, Heart } from 'lucide-react';

interface WorkoutSuccessProps {
  exercise: {
    name: string;
    difficulty: string;
    targetMuscles: string[];
    category: string;
  };
  completionData: {
    coinsEarned: number;
    caloriesBurned: number;
    actualDuration: number;
  };
  userProgress?: {
    streak: number;
    totalWorkouts: number;
    coins: number;
  };
  todayJoke?: string;
  onClose: () => void;
  onShare: () => void;
}

const WorkoutSuccess: React.FC<WorkoutSuccessProps> = ({
  exercise,
  completionData,
  userProgress,
  todayJoke,
  onClose,
  onShare
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Animation sequence
  useEffect(() => {
    const sequence = [
      { delay: 0, step: 0 },
      { delay: 500, step: 1 },   // Show main celebration
      { delay: 1000, step: 2 },  // Show stats
      { delay: 1500, step: 3 },  // Show calendar
      { delay: 2000, step: 4 },  // Show joke
      { delay: 2500, step: 5 },  // Show action buttons
    ];

    sequence.forEach(({ delay, step }) => {
      setTimeout(() => {
        setAnimationStep(step);
        if (step === 3) setShowCalendar(true);
      }, delay);
    });
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🔥';
      case 'advanced': return '💪';
      default: return '⭐';
    }
  };

  const getCelebrationMessage = () => {
    const messages = [
      "🎉 INCREDIBLE! You're unstoppable!",
      "🚀 You absolutely crushed it!",
      "⚡ What a POWERHOUSE performance!",
      "🏆 Champion level effort right there!",
      "🌟 You're on fire today!",
      "💥 That was AMAZING!",
      "🎯 Perfect execution!",
      "🔥 You're becoming stronger every day!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && typeof window !== 'undefined' && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#fdcb6e']}
        />
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm" />
      
      {/* Floating Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center text-white space-y-6">
          
          {/* Main Trophy Animation */}
          <div className={`transform transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <Trophy className="w-32 h-32 mx-auto mb-6 text-yellow-300 relative z-10 animate-bounce" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
              SUCCESS!
            </h1>
            <p className="text-2xl font-semibold mb-2 animate-pulse">
              {getCelebrationMessage()}
            </p>
            <div className="flex items-center justify-center gap-2 text-lg">
              <span>You completed</span>
              <span className="font-bold text-yellow-300">{exercise.name}</span>
              <span className={getDifficultyColor(exercise.difficulty)}>
                {getDifficultyEmoji(exercise.difficulty)}
              </span>
            </div>
          </div>

          {/* Stats Display */}
          <div className={`transform transition-all duration-1000 delay-500 ${animationStep >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="group hover:scale-105 transition-transform">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:rotate-12 transition-transform">
                    <Medal className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-300 animate-pulse">+{completionData.coinsEarned}</p>
                  <p className="text-sm opacity-80">Coins</p>
                </div>
                <div className="group hover:scale-105 transition-transform">
                  <div className="bg-gradient-to-r from-red-400 to-pink-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:rotate-12 transition-transform">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-red-300 animate-pulse">{completionData.caloriesBurned}</p>
                  <p className="text-sm opacity-80">Calories</p>
                </div>
                <div className="group hover:scale-105 transition-transform">
                  <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:rotate-12 transition-transform">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-blue-300 animate-pulse">{formatTime(completionData.actualDuration)}</p>
                  <p className="text-sm opacity-80">Duration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Success */}
          {showCalendar && (
            <div className={`transform transition-all duration-1000 delay-1000 ${animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <div className="bg-green-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30 shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-green-400" />
                  <CheckCircle className="w-8 h-8 text-green-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-green-300 mb-2">Day Complete!</h3>
                <p className="text-green-200 opacity-90">
                  Today gets a shiny checkmark! 🎯
                </p>
                {userProgress && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-orange-300">
                      <Flame className="w-5 h-5" />
                      <span className="font-bold">{userProgress.streak} day streak!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercise Details */}
          <div className={`transform transition-all duration-1000 delay-1200 ${animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-purple-300">Muscles Targeted</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {exercise.targetMuscles.map((muscle, index) => (
                  <span
                    key={index}
                    className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm border border-purple-400/30"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Motivational Quote */}
          {todayJoke && (
            <div className={`transform transition-all duration-1000 delay-1500 ${animationStep >= 4 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <span className="font-semibold text-pink-300">Pip says:</span>
                </div>
                <p className="text-white/90 italic leading-relaxed">{todayJoke}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`transform transition-all duration-1000 delay-2000 ${animationStep >= 5 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="space-y-4">
              <button
                onClick={onShare}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
              >
                <Share className="w-6 h-6" />
                Share Your Victory! 🎉
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105"
              >
                Continue Your Journey ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSuccess; 