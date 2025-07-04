'use client';

import React, { useState, useEffect } from 'react';
import { Play, ArrowLeft, Clock, Target, Zap, Mic, Music, MicOff, VolumeX } from 'lucide-react';
import { getTodaysWorkout, getWorkoutForDate, CustomWorkout } from '@/data/workouts';

interface WorkoutOfTheDayProps {
  onWorkoutStart: (workout: CustomWorkout, preferences: { coachEnabled: boolean; musicEnabled: boolean }) => void;
  onBack: () => void;
}

interface CompletedWorkout {
  date: string;
  workoutId: number;
  completed: boolean;
}

const WorkoutOfTheDay: React.FC<WorkoutOfTheDayProps> = ({ onWorkoutStart, onBack }) => {
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [coachEnabled, setCoachEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [todaysWorkout, setTodaysWorkout] = useState<CustomWorkout | null>(null);

  // Load completed workouts from localStorage and get today's workout
  useEffect(() => {
    const saved = localStorage.getItem('completedWorkouts');
    if (saved) {
      setCompletedWorkouts(JSON.parse(saved));
    }
    
    // Get today's workout (now always returns a workout)
    const workout = getTodaysWorkout();
    setTodaysWorkout(workout);
  }, []);

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const isCompletedToday = completedWorkouts.some(
    workout => workout.date === todayString && workout.completed
  );

  const handleStartWorkout = () => {
    if (todaysWorkout) {
      onWorkoutStart(todaysWorkout, { coachEnabled, musicEnabled });
    }
  };

  // Show loading state if workout is not yet loaded
  if (!todaysWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loading today's workout...
        </div>
      </div>
    );
  }

  // Calculate total workout duration in seconds
  const totalDuration = todaysWorkout.exercises.reduce((total, exercise) => {
    const duration = parseInt(exercise.duration.split(' ')[0]) || 20;
    return total + duration;
  }, 0) * todaysWorkout.structure.rounds;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyDistribution = () => {
    const distribution = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    todaysWorkout.exercises.forEach(exercise => {
      distribution[exercise.difficulty]++;
    });
    return distribution;
  };

  const difficultyDistribution = getDifficultyDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-md p-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/50 transition-colors mr-3"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Workout of the Day
            </h1>
            <p className="text-gray-600 text-sm">
              {today.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Workout Name */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {todaysWorkout.name}
          </h2>
          <p className="text-gray-600">
            {todaysWorkout.description}
          </p>
        </div>

        {/* Workout Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {todaysWorkout.structure.totalDuration}
              </div>
              <div className="text-xs text-gray-600">Duration</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {todaysWorkout.exercises.length}
              </div>
              <div className="text-xs text-gray-600">Exercises</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">Mixed</div>
              <div className="text-xs text-gray-600">Intensity</div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Difficulty Breakdown</h3>
            <div className="flex gap-2 flex-wrap">
              {difficultyDistribution.Beginner > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    {difficultyDistribution.Beginner} Beginner
                  </span>
                </div>
              )}
              {difficultyDistribution.Intermediate > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    {difficultyDistribution.Intermediate} Intermediate
                  </span>
                </div>
              )}
              {difficultyDistribution.Advanced > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    {difficultyDistribution.Advanced} Advanced
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Play Button */}
        <div className="flex flex-col items-center mb-8">
          {isCompletedToday && (
            <div className="mb-4 px-4 py-2 bg-green-100 border border-green-300 rounded-full">
              <span className="text-green-800 text-sm font-medium">✅ Completed Today!</span>
            </div>
          )}
          
          <div className="relative">
            <button
              onClick={handleStartWorkout}
              className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 group"
            >
              <Play className="w-12 h-12 text-white ml-1 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Workout Toggles */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {/* Coach Toggle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setCoachEnabled(!coachEnabled)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  coachEnabled 
                    ? 'bg-green-500 shadow-lg hover:bg-green-600 hover:shadow-xl' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                {coachEnabled ? (
                  <Mic className="w-8 h-8 text-white" />
                ) : (
                  <MicOff className="w-8 h-8 text-gray-600" />
                )}
              </button>
              <span className={`text-sm mt-2 font-medium ${coachEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                Coach
              </span>
            </div>

            {/* Music Toggle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  musicEnabled 
                    ? 'bg-blue-500 shadow-lg hover:bg-blue-600 hover:shadow-xl' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                {musicEnabled ? (
                  <Music className="w-8 h-8 text-white" />
                ) : (
                  <VolumeX className="w-8 h-8 text-gray-600" />
                )}
              </button>
              <span className={`text-sm mt-2 font-medium ${musicEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
                Music
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-center mt-6 max-w-xs">
            {isCompletedToday 
              ? "Great job! You can always do it again to improve your form."
              : "Tap the play button to start your workout and earn today's checkmark!"
            }
          </p>
        </div>

        {/* Exercise Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">What&apos;s Included</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {todaysWorkout.exercises.map((exercise, index) => (
              <div key={exercise.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{exercise.name}</h4>
                  <p className="text-xs text-gray-600">{exercise.duration}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  exercise.difficulty === 'Beginner' 
                    ? 'bg-green-100 text-green-800'
                    : exercise.difficulty === 'Intermediate'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {exercise.difficulty}
                </div>
              </div>
            ))}
            {todaysWorkout.exercises.length > 5 && (
              <div className="text-center py-2">
                <span className="text-gray-500 text-sm">
                  +{todaysWorkout.exercises.length - 5} more exercises
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Motivation */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-center text-white">
          <h3 className="text-lg font-semibold mb-2">💪 Ready to Get Stronger?</h3>
          <p className="text-sm opacity-90 mb-3">
            Every workout brings you one step closer to your fitness goals. 
            You&apos;ve got this! 🚀
          </p>
          <p className="text-xs opacity-75">
            💡 Tip: Rest days are now optional - listen to your body and take breaks when you need them!
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutOfTheDay; 