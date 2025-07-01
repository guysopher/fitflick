'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
  isActive: boolean;
  volume?: number;
  fadeInDuration?: number;
  onLoadError?: () => void;
}

export default function BackgroundMusic({ 
  isActive, 
  volume = 1, 
  fadeInDuration = 5000,
  onLoadError 
}: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      console.log('Background music loaded successfully');
    };

    const handleError = (e: Event) => {
      console.error('Background music failed to load:', e);
      onLoadError?.();
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
    };
  }, [onLoadError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    if (isActive) {
      // Start playing and fade in
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Failed to play background music:', error);
      });
      
      // Fade in logic
      setCurrentVolume(0);
      audio.volume = 0;
      
      const fadeSteps = 50;
      const stepDuration = fadeInDuration / fadeSteps;
      const volumeStep = volume / fadeSteps;
      let step = 0;

      fadeIntervalRef.current = setInterval(() => {
        step++;
        const newVolume = volumeStep * step;
        setCurrentVolume(newVolume);
        audio.volume = Math.min(newVolume, volume);

        if (step >= fadeSteps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
        }
      }, stepDuration);

    } else {
      // Stop playing and reset
      audio.pause();
      audio.currentTime = 0;
      setCurrentVolume(0);
      audio.volume = 0;
      
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, [isActive, isLoaded, volume, fadeInDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      loop
      preload="auto"
      style={{ display: 'none' }}
    >
      <source src="/audio/music (1).mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
} 