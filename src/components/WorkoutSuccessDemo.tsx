'use client';

import React, { useState } from 'react';
import WorkoutSuccess from './WorkoutSuccess';

const WorkoutSuccessDemo = () => {
  const [demoType, setDemoType] = useState<'single' | 'multi'>('single');
  const [showSuccess, setShowSuccess] = useState(false);

  const singleWorkoutDemo = {
    exercise: {
      name: 'Jumping Jacks',
      difficulty: 'Beginner',
      targetMuscles: ['Full Body', 'Cardio system'],
      category: 'Cardio'
    },
    completionData: {
      coinsEarned: 45,
      caloriesBurned: 85,
      actualDuration: 300, // 5 minutes
    },
    userProgress: {
      streak: 7,
      totalWorkouts: 25,
      coins: 850,
      level: 5,
      weeklyGoal: 5,
      weeklyProgress: 4
    },
    todayJoke: "Why don't hamsters ever get lost? Because they always know which wheel to turn! 🐹",
    workoutType: 'single' as const
  };

  const multiWorkoutDemo = {
    exercise: {
      name: 'High-Intensity Core Crusher',
      difficulty: 'Advanced',
      targetMuscles: ['Full Body', 'Core', 'Cardio'],
      category: 'Full Workout'
    },
    completionData: {
      coinsEarned: 120,
      caloriesBurned: 185,
      actualDuration: 480, // 8 minutes
      exercisesCompleted: 8,
      totalWorkoutTime: 480,
      exerciseBreakdown: {
        cardio: 3,
        core: 4,
        fitness: 1
      }
    },
    userProgress: {
      streak: 10,
      totalWorkouts: 50,
      coins: 1250,
      level: 10,
      weeklyGoal: 5,
      weeklyProgress: 5
    },
    todayJoke: "What's the best thing about Switzerland? I don't know, but the flag is a big plus! 🇨🇭",
    workoutType: 'multi' as const
  };

  const currentDemo = demoType === 'single' ? singleWorkoutDemo : multiWorkoutDemo;

  const handleStartDemo = () => {
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
  };

  const handleShare = () => {
    const message = `🎉 Just completed ${currentDemo.exercise.name}! 💪 ${
      demoType === 'multi' && 'exercisesCompleted' in currentDemo.completionData
        ? `Crushed ${currentDemo.completionData.exercisesCompleted} exercises and ` 
        : ''
    }burned ${currentDemo.completionData.caloriesBurned} calories! 🔥`;
    
    // For demo, just show an alert
    alert(`Demo Share:\n${message}`);
  };

  if (showSuccess) {
    return (
      <WorkoutSuccess
        exercise={currentDemo.exercise}
        completionData={currentDemo.completionData}
        userProgress={currentDemo.userProgress}
        todayJoke={currentDemo.todayJoke}
        onClose={handleClose}
        onShare={handleShare}
        workoutType={currentDemo.workoutType}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          🏆 Enhanced Success Screen Demo
        </h1>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">✨ New Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">🎯 Single Exercise Mode</h3>
              <ul className="space-y-2 text-green-700">
                <li>• Enhanced celebration messages</li>
                <li>• Achievement badges (streaks, milestones)</li>
                <li>• Weekly goal progress tracking</li>
                <li>• Level progression display</li>
                <li>• Improved animations & confetti</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">🚀 Multi-Exercise Mode</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Complete workout summaries</li>
                <li>• Exercise breakdown (cardio/core/fitness)</li>
                <li>• Total exercises completed</li>
                <li>• Enhanced stats display</li>
                <li>• Workout-specific achievements</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">🏅 Achievement System</h3>
            <div className="grid md:grid-cols-3 gap-4 text-yellow-700">
              <div>
                <strong>Streak Achievements:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 3 days - "On Fire!" 🔥</li>
                  <li>• 7 days - "Week Warrior!" 👑</li>
                  <li>• 30 days - "Unstoppable!" 🏆</li>
                </ul>
              </div>
              <div>
                <strong>Workout Milestones:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 1st workout - "First Steps!" 🎬</li>
                  <li>• 10 workouts - "Double Digits!" 🎯</li>
                  <li>• 50 workouts - "Half Century!" 🏅</li>
                </ul>
              </div>
              <div>
                <strong>Progress Tracking:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Level progression</li>
                  <li>• Weekly goal tracking</li>
                  <li>• Visual progress bars</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Choose Demo Type:</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={() => setDemoType('single')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  demoType === 'single'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎯 Single Exercise Demo
              </button>
              
              <button
                onClick={() => setDemoType('multi')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  demoType === 'multi'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🚀 Multi-Exercise Demo
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">
                {demoType === 'single' ? '🎯 Single Exercise Preview:' : '🚀 Multi-Exercise Preview:'}
              </h4>
              <div className="text-left space-y-2 text-gray-700">
                <p><strong>Exercise:</strong> {currentDemo.exercise.name}</p>
                <p><strong>Difficulty:</strong> {currentDemo.exercise.difficulty}</p>
                <p><strong>Coins Earned:</strong> +{currentDemo.completionData.coinsEarned}</p>
                <p><strong>Calories Burned:</strong> {currentDemo.completionData.caloriesBurned}</p>
                <p><strong>Duration:</strong> {Math.floor(currentDemo.completionData.actualDuration / 60)}:{(currentDemo.completionData.actualDuration % 60).toString().padStart(2, '0')}</p>
                                 {demoType === 'multi' && 'exercisesCompleted' in currentDemo.completionData && (
                   <>
                     <p><strong>Exercises Completed:</strong> {currentDemo.completionData.exercisesCompleted}</p>
                     <p><strong>Exercise Breakdown:</strong> {currentDemo.completionData.exerciseBreakdown.cardio} Cardio, {currentDemo.completionData.exerciseBreakdown.core} Core, {currentDemo.completionData.exerciseBreakdown.fitness} Fitness</p>
                   </>
                 )}
                <p><strong>User Level:</strong> {currentDemo.userProgress.level}</p>
                <p><strong>Streak:</strong> {currentDemo.userProgress.streak} days</p>
                <p><strong>Weekly Progress:</strong> {currentDemo.userProgress.weeklyProgress}/{currentDemo.userProgress.weeklyGoal}</p>
              </div>
            </div>
            
            <button
              onClick={handleStartDemo}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              🎉 Show Success Screen Demo
            </button>
          </div>
        </div>
        
        <div className="text-center text-gray-600">
          <p className="text-sm">
            This demo showcases the enhanced WorkoutSuccess component with achievements, 
            exercise breakdowns, and improved user experience for both single exercises and full workouts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSuccessDemo; 