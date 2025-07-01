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
  volume = 0.3, 
  fadeInDuration = 2000,
  onLoadError 
}: BackgroundMusicProps) {
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string>('');
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('🎵 Audio ref is null');
      return;
    }

    console.log('🎵 Setting up background music:', audio.src);

    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      console.log('🎵 Background music loaded and ready to play');
    };

    const handleError = (e: Event) => {
      const errorMsg = `Audio load error: ${audio.error?.message || 'Unknown error'}`;
      console.error('🎵 Background music failed to load:', errorMsg);
      setAudioError(errorMsg);
      onLoadError?.();
    };

    const handlePlay = () => {
      console.log('🎵 Audio started playing');
      setIsPlaying(true);
      setNeedsUserInteraction(false);
    };

    const handlePause = () => {
      console.log('🎵 Audio paused');
      setIsPlaying(false);
      // If audio paused unexpectedly and we want it playing, show user interaction button
      if (isActive && hasUserInteracted.current) {
        console.log('🎵 Audio paused unexpectedly, requiring user interaction again');
        setNeedsUserInteraction(true);
      }
    };

    const handleEnded = () => {
      console.log('🎵 Audio ended (this should not happen with loop=true)');
      setIsPlaying(false);
    };

    const handleStalled = () => {
      console.log('🎵 Audio stalled - network issue?');
    };

    const handleSuspend = () => {
      console.log('🎵 Audio suspended - browser may have paused for policy reasons');
      if (isActive) {
        setNeedsUserInteraction(true);
      }
    };

    // Add all event listeners
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
    };
  }, [onLoadError, isActive]);

  const startMusic = async () => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) {
      console.log('🎵 Cannot start music - audio not ready', { audio: !!audio, isLoaded });
      return;
    }

    // Clear any existing fade interval
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    try {
      // Mark that user has interacted
      hasUserInteracted.current = true;
      
      audio.currentTime = 0;
      console.log('🎵 Starting background music...');
      
      // Set initial volume to 0 for fade-in
      audio.volume = 0;
      setCurrentVolume(0);
      
      await audio.play();
      console.log('🎵 Background music playing successfully! 🎶');
      console.log('🎵 Audio duration:', audio.duration, 'seconds');
      console.log('🎵 Audio loop:', audio.loop);
      
      setNeedsUserInteraction(false);
      setAudioError('');
      
      // Start fade-in
      const fadeSteps = 50;
      const stepDuration = fadeInDuration / fadeSteps;
      const volumeStep = volume / fadeSteps;
      let step = 0;

      fadeIntervalRef.current = setInterval(() => {
        step++;
        const newVolume = Math.min(volumeStep * step, volume);
        setCurrentVolume(newVolume);
        
        if (audio && !audio.paused) {
          audio.volume = newVolume;
        }

        if (step >= fadeSteps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
        }
      }, stepDuration);

    } catch (error) {
      console.error('🎵 Failed to play background music:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown playback error';
      setAudioError(errorMsg);
      setNeedsUserInteraction(true);
      setIsPlaying(false);
      onLoadError?.();
    }
  };

  const stopMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('🎵 Stopping background music');
    audio.pause();
    audio.currentTime = 0;
    setCurrentVolume(0);
    audio.volume = 0;
    setIsPlaying(false);
    
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  // Handle isActive prop changes
  useEffect(() => {
    if (!isLoaded) return;

    if (isActive && !isPlaying) {
      console.log('🎵 isActive=true, attempting to start music');
      // Only try automatic start if user hasn't interacted yet
      if (!hasUserInteracted.current) {
        startMusic();
      } else {
        // User has interacted before, show button for them to click again
        setNeedsUserInteraction(true);
      }
    } else if (!isActive && isPlaying) {
      console.log('🎵 isActive=false, stopping music');
      stopMusic();
    }
  }, [isActive, isLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Music Control Button - shows when user interaction is needed */}
      {isLoaded && isActive && needsUserInteraction && (
        <button
          onClick={startMusic}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
        >
          🎵 {hasUserInteracted.current ? 'Resume' : 'Start'} Music
        </button>
      )}

      {/* Music Playing Indicator */}
      {isLoaded && isPlaying && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 1000,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ 
            animation: 'pulse 1.5s ease-in-out infinite alternate',
            display: 'inline-block'
          }}>🎵</span>
          Music Playing (Vol: {Math.round(currentVolume * 100)}%)
        </div>
      )}

      {/* Error Indicator */}
      {audioError && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          background: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '15px',
          fontSize: '11px',
          zIndex: 1000,
          pointerEvents: 'none',
          maxWidth: '200px'
        }}>
          ⚠️ Audio Error: {audioError}
        </div>
      )}
      
      <audio
        ref={audioRef}
        loop
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/audio/music1.mp3" type="audio/mp3" />
        <source src="/audio/music (1).mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
} 