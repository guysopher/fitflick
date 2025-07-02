'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';

interface BackgroundMusicProps {
  isActive: boolean;
  volume?: number;
  fadeInDuration?: number;
  onLoadError?: () => void;
}

export interface BackgroundMusicRef {
  startMusic: () => Promise<void>;
  stopMusic: () => void;
  pauseMusic: () => void;
  resumeMusic: () => void;
  isPlaying: boolean;
  isLoaded: boolean;
}

const BackgroundMusic = forwardRef<BackgroundMusicRef, BackgroundMusicProps>(({ 
  isActive, 
  volume = 0.3, 
  fadeInDuration = 2000,
  onLoadError 
}, ref) => {
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string>('');
  const [isSuspended, setIsSuspended] = useState(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      audio.currentTime = 0;
      console.log('🎵 Starting background music from main play button...');
      console.log('🎵 Audio state before play:', {
        paused: audio.paused,
        currentTime: audio.currentTime,
        volume: audio.volume,
        readyState: audio.readyState,
        networkState: audio.networkState
      });
      
      // Set initial volume to 0 for fade-in
      audio.volume = 0;
      
      // Clear suspended and error states
      setIsSuspended(false);
      setAudioError('');
      
      // This must be called directly in response to user interaction
      const playPromise = audio.play();
      console.log('🎵 Play promise created:', playPromise);
      
      await playPromise;
      
      console.log('🎵 Background music playing successfully! 🎶');
      console.log('🎵 Audio duration:', audio.duration, 'seconds');
      console.log('🎵 Audio loop:', audio.loop);
      
      // Start fade-in
      const fadeSteps = 50;
      const stepDuration = fadeInDuration / fadeSteps;
      const volumeStep = volume / fadeSteps;
      let step = 0;

      fadeIntervalRef.current = setInterval(() => {
        step++;
        const newVolume = Math.min(volumeStep * step, volume);
        
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
      console.error('🎵 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        audioState: {
          paused: audio.paused,
          currentTime: audio.currentTime,
          readyState: audio.readyState,
          networkState: audio.networkState
        }
      });
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown playback error';
      setAudioError(errorMsg);
      setIsPlaying(false);
      setIsSuspended(false); // Clear suspended state on error
      onLoadError?.();
    }
  };

  const stopMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('🎵 Stopping background music');
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0;
    setIsPlaying(false);
    
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  const pauseMusic = () => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    console.log('🎵 Pausing background music');
    audio.pause();
    setIsPlaying(false);
    
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const resumeMusic = () => {
    const audio = audioRef.current;
    if (!audio || isPlaying || !isLoaded) return;

    console.log('🎵 Resuming background music');
    audio.play().then(() => {
      console.log('🎵 Background music resumed successfully');
      setIsPlaying(true);
    }).catch(error => {
      console.error('🎵 Failed to resume background music:', error);
    });
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    isPlaying,
    isLoaded
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('🎵 Audio ref is null');
      return;
    }

    console.log('🎵 Setting up background music:', audio.src);
    console.log('🎵 Audio element properties:', {
      readyState: audio.readyState,
      networkState: audio.networkState,
      currentSrc: audio.currentSrc,
      duration: audio.duration,
      paused: audio.paused,
      ended: audio.ended,
      loop: audio.loop,
      preload: audio.preload
    });

    const handleLoadStart = () => {
      console.log('🎵 Audio load started');
    };

    const handleLoadedMetadata = () => {
      console.log('🎵 Audio metadata loaded - duration:', audio.duration);
    };

    const handleLoadedData = () => {
      console.log('🎵 Audio data loaded');
    };

    const handleCanPlay = () => {
      console.log('🎵 Audio can start playing');
    };

    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      console.log('🎵 Background music loaded and ready to play');
      console.log('🎵 Final audio properties:', {
        duration: audio.duration,
        readyState: audio.readyState,
        currentSrc: audio.currentSrc
      });
    };

    const handleError = () => {
      const errorMsg = `Audio load error: ${audio.error?.message || 'Unknown error'}`;
      console.error('🎵 Background music failed to load:', errorMsg);
      console.error('🎵 Audio error details:', {
        error: audio.error,
        code: audio.error?.code,
        message: audio.error?.message,
        networkState: audio.networkState,
        readyState: audio.readyState,
        currentSrc: audio.currentSrc
      });
      setAudioError(errorMsg);
      onLoadError?.();
    };

    const handleAbort = () => {
      console.log('🎵 Audio loading aborted');
    };

    const handleStalled = () => {
      console.log('🎵 Audio loading stalled - network issue?');
      console.log('🎵 Network state:', audio.networkState);
    };

    const handleSuspend = () => {
      console.log('🎵 Audio loading suspended - attempting to resume...');
      setIsSuspended(true);
      
      // If we're supposed to be playing but got suspended, try to resume
      if (isLoaded && isPlaying) {
        console.log('🎵 Music was playing when suspended, attempting to resume...');
        
        // Add a small delay then try to resume
        setTimeout(() => {
          const audio = audioRef.current;
          if (audio && audio.paused && isPlaying) {
            console.log('🎵 Attempting to resume suspended audio...');
            audio.play().then(() => {
              console.log('🎵 Successfully resumed suspended audio');
              setIsSuspended(false);
            }).catch(error => {
              console.error('🎵 Failed to resume suspended audio:', error);
            });
          }
        }, 1000);
      }
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(0);
        const duration = audio.duration;
        if (duration > 0) {
          const percentLoaded = (bufferedEnd / duration) * 100;
          console.log(`🎵 Audio loading progress: ${percentLoaded.toFixed(1)}%`);
        }
      }
    };

    const handlePlay = () => {
      console.log('🎵 Audio started playing');
      setIsPlaying(true);
      setIsSuspended(false);
    };

    const handlePause = () => {
      console.log('🎵 Audio paused');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('🎵 Audio ended (this should not happen with loop=true)');
      setIsPlaying(false);
    };

    // Add all event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    audio.addEventListener('abort', handleAbort);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // Force load attempt
    audio.load();
    console.log('🎵 Forced audio.load() call');

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('abort', handleAbort);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onLoadError]);

  // Handle isActive prop changes
  useEffect(() => {
    if (!isActive && isPlaying) {
      console.log('🎵 isActive=false, stopping music');
      stopMusic();
    }
  }, [isActive, isPlaying, stopMusic]);

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


      {/* Suspended Music Indicator with Resume Button */}
      {isLoaded && isSuspended && (
        <button
          onClick={startMusic}
          style={{
            display: 'none',
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ⚠️ Resume Music
        </button>
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
});

BackgroundMusic.displayName = 'BackgroundMusic';

export default BackgroundMusic; 