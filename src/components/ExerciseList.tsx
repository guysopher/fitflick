'use client';

import React, { useState, useMemo } from 'react';
import { exercises, exerciseCategories, difficultyLevels, Exercise } from '@/data/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryColor = (category: string) => {
  const colors = {
    'Cardio': 'bg-pink-100 text-pink-800',
    'Upper Body': 'bg-blue-100 text-blue-800',
    'Lower Body': 'bg-purple-100 text-purple-800',
    'Core': 'bg-indigo-100 text-indigo-800',
    'Plyometric': 'bg-orange-100 text-orange-800',
    'Functional': 'bg-teal-100 text-teal-800',
    'Agility': 'bg-cyan-100 text-cyan-800',
    'Mobility': 'bg-lime-100 text-lime-800',
    'Balance': 'bg-emerald-100 text-emerald-800',
    'Compound': 'bg-amber-100 text-amber-800',
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onSelect?.(exercise)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{exercise.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
          {exercise.difficulty}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{exercise.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
          {exercise.category}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {exercise.targetMuscles.map((muscle, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-medium"
          >
            {muscle}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function ExerciseList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.targetMuscles.some(muscle => 
                            muscle.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || exercise.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Tabata Exercise Library
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover 100 powerful exercises perfect for high-intensity tabata workouts. 
            Build strength, endurance, and agility with our comprehensive exercise collection.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Categories</option>
              {exerciseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="All">All Difficulties</option>
              {difficultyLevels.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md px-6 py-4 border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{filteredExercises.length}</div>
            <div className="text-sm text-gray-600">Exercises Found</div>
          </div>
          <div className="bg-white rounded-xl shadow-md px-6 py-4 border border-gray-100">
            <div className="text-2xl font-bold text-purple-600">{exerciseCategories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-xl shadow-md px-6 py-4 border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{difficultyLevels.length}</div>
            <div className="text-sm text-gray-600">Difficulty Levels</div>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExercises.map(exercise => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onSelect={setSelectedExercise}
            />
          ))}
        </div>

        {/* No results */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Selected Exercise Modal */}
        {selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedExercise.name}</h2>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">{selectedExercise.description}</p>
                
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedExercise.category)}`}>
                    {selectedExercise.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(selectedExercise.difficulty)}`}>
                    {selectedExercise.difficulty}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Target Muscles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.targetMuscles.map((muscle, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 