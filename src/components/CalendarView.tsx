'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface CalendarViewProps {
  onWorkoutSelect: () => void;
}

interface CompletedWorkout {
  date: string;
  workoutId: number;
  completed: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onWorkoutSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);

  // Load completed workouts from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('completedWorkouts');
    if (saved) {
      setCompletedWorkouts(JSON.parse(saved));
    }
  }, []);

  // Save completed workouts to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    return date < today && !isToday(date);
  };

  const isWorkoutCompleted = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return completedWorkouts.some(workout => workout.date === dateString && workout.completed);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Fitness Journey
          </h1>
          <p className="text-gray-600">Track your daily workouts</p>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {formatMonthYear(currentDate)}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-12"></div>;
              }

              const isTodayDate = isToday(day);
              const isPast = isPastDate(day);
              const isCompleted = isWorkoutCompleted(day);

              return (
                <div
                  key={day.getDate()}
                  className={`
                    h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium relative
                    ${isTodayDate 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg ring-2 ring-blue-200' 
                      : isPast 
                        ? isCompleted 
                          ? 'bg-green-100 text-green-800 border-2 border-green-300'
                          : 'bg-gray-50 text-gray-400'
                        : 'bg-gray-50 text-gray-300'
                    }
                    ${isPast && !isTodayDate ? 'cursor-default' : ''}
                  `}
                >
                  {day.getDate()}
                  {isPast && isCompleted && (
                    <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Workout Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💪</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready for today&apos;s workout?
            </h3>
            <p className="text-gray-600 text-sm">
              Complete today's session to earn your checkmark!
            </p>
          </div>

          <button
            onClick={onWorkoutSelect}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Let&apos;s Go! 🚀
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {completedWorkouts.filter(w => w.completed).length}
              </div>
              <div className="text-xs text-gray-600">Workouts Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {(() => {
                  const completed = completedWorkouts.filter(w => w.completed);
                  if (completed.length === 0) return 0;
                  
                  let currentStreak = 0;
                  const sortedDates = completed
                    .map(w => new Date(w.date))
                    .sort((a, b) => b.getTime() - a.getTime());
                  
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  for (let i = 0; i < sortedDates.length; i++) {
                    const checkDate = new Date(today);
                    checkDate.setDate(checkDate.getDate() - i);
                    checkDate.setHours(0, 0, 0, 0);
                    
                    const workoutDate = new Date(sortedDates[i]);
                    workoutDate.setHours(0, 0, 0, 0);
                    
                    if (workoutDate.getTime() === checkDate.getTime()) {
                      currentStreak++;
                    } else {
                      break;
                    }
                  }
                  
                  return currentStreak;
                })()}
              </div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(() => {
                  const thisMonth = today.getMonth();
                  const thisYear = today.getFullYear();
                  return completedWorkouts.filter(w => {
                    const workoutDate = new Date(w.date);
                    return w.completed && 
                           workoutDate.getMonth() === thisMonth && 
                           workoutDate.getFullYear() === thisYear;
                  }).length;
                })()}
              </div>
              <div className="text-xs text-gray-600">This Month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 