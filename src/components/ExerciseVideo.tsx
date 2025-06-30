'use client';

import React, { useRef, useState, useEffect } from 'react';
import { videos } from '@/data/videos';

interface ExerciseVideoProps {
  exercise: {
    name: string;
    description: string;
    videoUrl: string;
    duration?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    targetMuscles?: string[];
    instructions?: string[];
  };
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

// Helper function to get video metadata
const getVideoMetadata = (videoFileName: string) => {
  const fileName = videoFileName.replace('/videos/', '');
  return videos.find(video => video.filename === fileName);
};

export default function ExerciseVideo({ 
  exercise, 
  autoPlay = false, 
  showControls = true,
  className = ""
}: ExerciseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get video metadata for speed adjustment
  const videoMetadata = getVideoMetadata(exercise.videoUrl);
  const videoSpeed = videoMetadata?.video_speed || 1.0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video playback speed
    video.playbackRate = videoSpeed;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError('Failed to load video');
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [videoSpeed]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const restartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    video.play();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 ${className}`}>
      {/* Exercise Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{exercise.name}</h2>
            <p className="text-gray-200 text-sm mb-3">{exercise.description}</p>
            
            <div className="flex items-center gap-2 flex-wrap">
              {exercise.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>
              )}
              {exercise.duration && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {exercise.duration}
                </span>
              )}
              {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  {exercise.targetMuscles.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-sm">Loading exercise video...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">⚠️</span>
              </div>
              <p className="text-white text-sm">{error}</p>
              <p className="text-gray-400 text-xs mt-2">Please check the video URL</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={exercise.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="metadata"
        />

        {/* Play/Pause Overlay */}
        {!isLoading && !error && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            onClick={togglePlayPause}
          >
            <div className={`
              w-20 h-20 bg-black/50 rounded-full flex items-center justify-center
              transition-all duration-300 group-hover:bg-black/70 group-hover:scale-110
              ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
            `}>
              {isPlaying ? (
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Video Controls */}
      {showControls && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={restartVideo}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                title="Restart"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full">
              Exercise Demo
            </div>
          </div>
        </div>
      )}

      {/* Instructions Panel (Optional) */}
      {exercise.instructions && exercise.instructions.length > 0 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/60 max-w-xs">
            <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
            <ol className="space-y-1">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
} 