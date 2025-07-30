'use client';

import React, { useState, useRef } from 'react';
import CalendarView from './CalendarView';
import WorkoutOfTheDay from './WorkoutOfTheDay';
import BackgroundMusic, { BackgroundMusicRef } from './BackgroundMusic';
import WorkoutSuccess from './WorkoutSuccess';
import { beginnerToAdvancedWorkout, Exercise } from '@/data/exercises';
import { CustomWorkout } from '@/data/workouts';
import { TimerVoiceCoach, VoiceDebugInfo, ActionLogEntry } from '@/services/timerVoiceCoach';

// Import the TikTokVideoPlayer from GameWorkoutApp
import { videos } from '@/data/videos';

interface CompletedWorkout {
  date: string;
  workoutId: number;
  completed: boolean;
}

// Helper function to get video metadata
const getVideoMetadata = (videoFileName: string) => {
  const fileName = videoFileName.replace('/videos/', '');
  return videos.find(video => video.filename === fileName);
};

// Workout Player Component (extracted from GameWorkoutApp)
interface WorkoutPlayerProps {
  workout: CustomWorkout;
  onWorkoutComplete: (completionData: any) => void;
  onClose: () => void;
  backgroundMusicRef?: React.RefObject<BackgroundMusicRef | null>;
  preferences: { coachEnabled: boolean; musicEnabled: boolean };
}

function WorkoutPlayer({ workout, onWorkoutComplete, onClose, backgroundMusicRef, preferences }: WorkoutPlayerProps) {
  // Parse workout durations from the structure
  const workoutDurationSeconds = parseInt(workout.structure.workDuration.split(' ')[0]) || 20;
  const restDurationSeconds = parseInt(workout.structure.restDuration.split(' ')[0]) || 10;
  const getReadySeconds = 15; // 15 seconds get-ready time
  
  // Workout sequence state
  const [workoutStep, setWorkoutStep] = useState(0); // Overall step counter
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(getReadySeconds); // Get ready timer
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(restDurationSeconds);
  const [isPaused, setIsPaused] = useState(false); // Track pause state

  // Calculate current exercise based on the pattern
  const getCurrentExercise = () => {
    const totalExercises = workout.exercises.length;
    
    // Calculate which pair group we're in (0-1, 2-3, 4-5, etc.)
    const pairGroup = Math.floor(workoutStep / 4);
    
    // Calculate position within the current pair cycle (0-3)
    const positionInCycle = workoutStep % 4;
    
    // Determine exercise indices for current pair
    const baseIndex = pairGroup * 2;
    const firstExerciseIndex = baseIndex;
    const secondExerciseIndex = baseIndex + 1;
    
    // Handle edge case: if we're at the last exercise and it's odd
    if (firstExerciseIndex >= totalExercises) {
      return workout.exercises[totalExercises - 1];
    }
    
    // If second exercise doesn't exist (odd number), use first for all positions
    if (secondExerciseIndex >= totalExercises) {
      return workout.exercises[firstExerciseIndex];
    }
    
    // Pattern within each pair cycle: ex1, ex2, ex1, ex2
    if (positionInCycle === 0 || positionInCycle === 2) {
      return workout.exercises[firstExerciseIndex];
    } else {
      return workout.exercises[secondExerciseIndex];
    }
  };

  const currentExercise = getCurrentExercise();

  // Calculate total steps in workout (each exercise done twice, in pairs)
  const getTotalSteps = () => {
    const totalExercises = workout.exercises.length;
    // Each exercise is done exactly twice
    return totalExercises * 2;
  };

  const totalSteps = getTotalSteps();

  const handleExerciseComplete = () => {
    if (workoutStep < totalSteps - 1) {
      // Start rest period before next exercise
      setIsWorkoutActive(false);
      setIsResting(true);
      setRestTimer(restDurationSeconds);
    } else {
      // Workout completed
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Save completion to localStorage
      const savedWorkouts = localStorage.getItem('completedWorkouts');
      const completedWorkouts: CompletedWorkout[] = savedWorkouts ? JSON.parse(savedWorkouts) : [];
      
      // Check if today's workout is already recorded
      const existingIndex = completedWorkouts.findIndex(
        w => w.date === todayString && w.workoutId === workout.id
      );
      
      if (existingIndex >= 0) {
        completedWorkouts[existingIndex].completed = true;
      } else {
        completedWorkouts.push({
          date: todayString,
          workoutId: workout.id,
          completed: true
        });
      }
      
      localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
      
      // Calculate workout completion data
      const totalDuration = totalSteps * (workoutDurationSeconds + restDurationSeconds);
      const coinsEarned = Math.floor(totalSteps * 15); // 15 coins per exercise
      const caloriesBurned = Math.floor(totalDuration * 0.2); // Rough estimate
      
      const completionData = {
        coinsEarned,
        caloriesBurned,
        actualDuration: totalDuration,
        exercisesCompleted: totalSteps,
        totalWorkoutTime: totalDuration,
        exerciseBreakdown: workout.exerciseBreakdown
      };
      
      onWorkoutComplete(completionData);
    }
  };

  const handleStartWorkout = () => {
    setIsWorkoutActive(true);
    setCountdown(null);
  };

  // Handle countdown timer (get ready)
  React.useEffect(() => {
    if (countdown !== null && countdown > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsWorkoutActive(true);
      setCountdown(null);
    }
  }, [countdown, isPaused]);

  // Handle rest timer
  React.useEffect(() => {
    if (isResting && restTimer > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setRestTimer(restTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (restTimer === 0 && isResting) {
      // Rest complete, move to next step
      setWorkoutStep(workoutStep + 1);
      setIsResting(false);
      setCountdown(null); // Go directly to workout, no get ready after rest
      setIsWorkoutActive(true);
      setRestTimer(restDurationSeconds); // Reset for next rest
    }
  }, [isResting, restTimer, workoutStep, isPaused, restDurationSeconds]);

  // Always use TikTokVideoPlayer with appropriate mode
  const getMode = (): PlayerMode => {
    if (isResting) return 'rest';
    if (!isWorkoutActive) return 'get-ready';
    return 'workout';
  };

  const getTimer = () => {
    if (isResting) return restTimer || 0;
    if (!isWorkoutActive) return countdown || 0;
    return workoutDurationSeconds; // Use workout duration from structure
  };

  const handleComplete = () => {
    if (!isWorkoutActive) {
      handleStartWorkout();
    } else if (isResting) {
      handleExerciseComplete();
    } else {
      handleExerciseComplete();
    }
  };

  // Calculate next exercise for display
  const getNextExercise = () => {
    const nextStep = workoutStep + 1;
    if (nextStep >= totalSteps) return null;
    
    const totalExercises = workout.exercises.length;
    const pairGroup = Math.floor(nextStep / 4);
    const positionInCycle = nextStep % 4;
    const baseIndex = pairGroup * 2;
    const firstExerciseIndex = baseIndex;
    const secondExerciseIndex = baseIndex + 1;
    
    // Handle edge case: if we're at the last exercise and it's odd
    if (firstExerciseIndex >= totalExercises) {
      return workout.exercises[totalExercises - 1];
    }
    
    // If second exercise doesn't exist (odd number), use first for all positions
    if (secondExerciseIndex >= totalExercises) {
      return workout.exercises[firstExerciseIndex];
    }
    
    if (positionInCycle === 0 || positionInCycle === 2) {
      return workout.exercises[firstExerciseIndex];
    } else {
      return workout.exercises[secondExerciseIndex];
    }
  };

  const nextExercise = getNextExercise();

  return (
    <TikTokVideoPlayer 
      exercise={currentExercise}
      mode={getMode()}
      timer={getTimer()}
      onWorkoutComplete={handleComplete}
      onClose={onClose}
      nextExerciseName={nextExercise?.name}
      currentExerciseIndex={workoutStep}
      totalExercises={totalSteps}
      isPaused={isPaused}
      onPauseChange={setIsPaused}
      backgroundMusicRef={backgroundMusicRef}
      nextExercise={nextExercise}
      preferences={preferences}
    />
  );
}

// TikTok Video Player Component (extracted from GameWorkoutApp)
type PlayerMode = 'get-ready' | 'workout' | 'rest';

interface TikTokVideoPlayerProps {
  exercise: Exercise;
  mode: PlayerMode;
  timer: number;
  onWorkoutComplete: () => void;
  onClose: () => void;
  nextExerciseName?: string;
  currentExerciseIndex?: number;
  totalExercises?: number;
  isPaused?: boolean;
  onPauseChange?: (paused: boolean) => void;
  backgroundMusicRef?: React.RefObject<BackgroundMusicRef | null>;
  nextExercise?: Exercise | null; // Add next exercise for preloading
  preferences: { coachEnabled: boolean; musicEnabled: boolean };
}

function TikTokVideoPlayer({ 
  exercise, 
  mode, 
  timer, 
  onWorkoutComplete, 
  onClose, 
  nextExerciseName,
  currentExerciseIndex = 0,
  totalExercises = 1,
  isPaused = false,
  onPauseChange,
  backgroundMusicRef,
  nextExercise = null,
  preferences
}: TikTokVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const preloadVideoRef = React.useRef<HTMLVideoElement>(null); // For preloading next video
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimer, setCurrentTimer] = useState(timer);
  const [playedBeeps, setPlayedBeeps] = useState<Set<number>>(new Set());
  const [showPlayPauseAnimation, setShowPlayPauseAnimation] = useState(false);
  const [animationIcon, setAnimationIcon] = useState<'play' | 'pause'>('play');
  const [voiceCoachEnabled] = useState(preferences.coachEnabled);
  const [voiceStatus, setVoiceStatus] = useState<'loading' | 'available' | 'unavailable'>('available');
  const [debugInfo, setDebugInfo] = useState<VoiceDebugInfo | null>(null);
  const voiceCoach = React.useRef<TimerVoiceCoach | null>(null);
  const currentAudioContext = React.useRef<AudioContext | null>(null);
  const pepTalkTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasDeliveredMotivation = React.useRef<boolean>(false);

  // Function to play tabata beep sequence
  const playTabataBeepSequence = () => {
    try {
      // Close any existing audio context to stop previous beeps
      if (currentAudioContext.current) {
        currentAudioContext.current.close();
      }
      
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();
      currentAudioContext.current = context;

      const makeBeep = (startTime: number, duration: number, frequency = 880, volume = 0.3) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        // Create a smooth volume envelope to avoid harsh clicks
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.01); // Quick fade in
        gain.gain.setValueAtTime(volume, startTime + duration - 0.05); // Hold
        gain.gain.linearRampToValueAtTime(0, startTime + duration); // Fade out

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = context.currentTime;
      const shortDuration = 0.15;
      const longDuration = 0.8;
      const gap = 1;

      // Musical frequencies (C4, E4, G4 for the short beeps, C5 for final)
      const frequencies = [261.63, 329.63, 392.00, 523.25]; // C-E-G-C chord

      // 3 short ascending beeps with higher volume
      for (let i = 0; i < 3; i++) {
        makeBeep(now + i * gap, shortDuration, frequencies[i], 0.4);
      }

      // 1 final beep with higher pitch and volume
      makeBeep(now + 3 * gap, longDuration, frequencies[3], 0.5);
    } catch (error) {
      console.log('Audio context not available:', error);
    }
  };

  // Get video URL based on mode
  const getVideoUrl = () => {
    switch (mode) {
      case 'get-ready':
        return '/videos/Ready.mp4';
      case 'rest':
        // Show next exercise video during rest, fallback to resting video if no next exercise
        return nextExercise?.videoUrl || '/videos/Resting.mp4';
      case 'workout':
      default:
        return exercise.videoUrl;
    }
  };

  // Get next video URL for preloading
  const getNextVideoUrl = React.useCallback(() => {
    switch (mode) {
      case 'get-ready':
        // During get-ready, preload the upcoming workout video
        return exercise.videoUrl;
      case 'workout':
        // During workout, preload the rest video
        return '/videos/Resting.mp4';
      case 'rest':
        // During rest, preload the next exercise video (if exists)
        return nextExercise ? nextExercise.videoUrl : null;
      default:
        return null;
    }
  }, [mode, exercise.videoUrl, nextExercise?.videoUrl]);

  // Get video metadata for speed adjustment (only for workout mode)
  const videoMetadata = mode === 'workout' ? getVideoMetadata(exercise.videoUrl) : null;
  const videoSpeed = videoMetadata?.video_speed || 1.0;

  // Initialize voice coach
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      voiceCoach.current = TimerVoiceCoach.getInstance();
      voiceCoach.current.setEnabled(voiceCoachEnabled);
      
      // Set up debug info callback
      voiceCoach.current.onDebugUpdate((info) => {
        setDebugInfo(info);
      });
      
      // TimerVoiceCoach is always available (uses pre-recorded audio)
      setVoiceStatus('available');
    }

    return () => {
      if (voiceCoach.current) {
        // voiceCoach.current.stopSpeaking();
      }
      if (pepTalkTimeoutRef.current) {
        clearTimeout(pepTalkTimeoutRef.current);
      }
      // Clean up audio context
      if (currentAudioContext.current) {
        currentAudioContext.current.close();
        currentAudioContext.current = null;
      }
    };
  }, [voiceCoachEnabled]);

  // Handle voice coach enable/disable
  React.useEffect(() => {
    if (voiceCoach.current) {
      voiceCoach.current.setEnabled(voiceCoachEnabled);
    }
  }, [voiceCoachEnabled]);

  // Trigger voice guidance when mode changes
  React.useEffect(() => {
    if (voiceCoach.current && voiceCoachEnabled) {
      console.log(`🎤 Updating voice coach for ${mode} mode`);
      
      voiceCoach.current.onTimerUpdate({
        exerciseName: exercise.name,
        mode,
        timeRemaining: currentTimer,
        currentStep: currentExerciseIndex,
        totalSteps: totalExercises,
        nextExercise: nextExercise?.name,
        exercisesLeft: totalExercises - currentExerciseIndex - 1
      });
    }
  }, [mode, exercise.name, voiceCoachEnabled, currentTimer, nextExercise?.name, currentExerciseIndex, totalExercises]);

  // Handle pause/resume of voice
  React.useEffect(() => {
    if (voiceCoach.current && isPaused) {
      voiceCoach.current.stopSpeaking();
    }
  }, [isPaused]);

  // Update voice coach every second with timer value
  React.useEffect(() => {
    if (voiceCoach.current && voiceCoachEnabled && !isPaused) {
      const interval = setInterval(() => {
        voiceCoach.current?.onTimerUpdate({
          exerciseName: exercise.name,
          mode,
          timeRemaining: currentTimer,
          currentStep: currentExerciseIndex,
          totalSteps: totalExercises,
          nextExercise: nextExercise?.name,
          exercisesLeft: totalExercises - currentExerciseIndex - 1
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [voiceCoachEnabled, isPaused, exercise.name, mode, currentExerciseIndex, totalExercises, currentTimer, nextExercise?.name]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video playback speed and start playing
    video.playbackRate = mode === 'workout' ? videoSpeed : 1.0;
    video.muted = true; // Always muted
    
    const playVideo = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        console.log('Auto-play failed, user interaction required');
        setIsPlaying(false);
      }
    };

    playVideo();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
      }, [videoSpeed, mode]);

  // Video preloading effect
  React.useEffect(() => {
    const preloadVideo = preloadVideoRef.current;
    const nextVideoUrl = getNextVideoUrl();
    
    if (preloadVideo && nextVideoUrl && isPlaying) {
      // Start preloading after a short delay to avoid interfering with current video load
      const preloadTimeout = setTimeout(() => {
        console.log(`🎬 Preloading next video: ${nextVideoUrl}`);
        preloadVideo.src = nextVideoUrl;
        preloadVideo.preload = 'auto';
        preloadVideo.load();
        
        const handlePreloadSuccess = () => {
          console.log(`✅ Successfully preloaded: ${nextVideoUrl}`);
          preloadVideo.removeEventListener('loadeddata', handlePreloadSuccess);
          preloadVideo.removeEventListener('error', handlePreloadError);
        };
        
        const handlePreloadError = (error: Event) => {
          console.warn(`⚠️ Failed to preload: ${nextVideoUrl}`, error);
          preloadVideo.removeEventListener('loadeddata', handlePreloadSuccess);
          preloadVideo.removeEventListener('error', handlePreloadError);
        };
        
        preloadVideo.addEventListener('loadeddata', handlePreloadSuccess);
        preloadVideo.addEventListener('error', handlePreloadError);
      }, 2000); // 2 second delay
      
      return () => {
        clearTimeout(preloadTimeout);
      };
    }
  }, [isPlaying, getNextVideoUrl]);

  // Update timer when prop changes (for get-ready and rest modes)
  React.useEffect(() => {
    setCurrentTimer(timer);
    // Reset played beeps when timer resets
    setPlayedBeeps(new Set());
  }, [timer]);

  // Timer countdown for workout mode
  React.useEffect(() => {
    if (mode === 'workout' && isPlaying && !isPaused && currentTimer > 0) {
      const timerInterval = setInterval(() => {
        setCurrentTimer(prev => {
          if (prev <= 1) {
            onWorkoutComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [mode, isPlaying, isPaused, currentTimer, onWorkoutComplete]);

  // Beep logic for all timer modes
  React.useEffect(() => {
    // Play beeps at 4 seconds remaining (only if not paused)
    if (currentTimer === 4 && !playedBeeps.has(4) && !isPaused) {
      playTabataBeepSequence();
      setPlayedBeeps(prev => new Set(prev).add(4));
    }
  }, [currentTimer, playedBeeps, isPaused]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setAnimationIcon('pause');
      // Pause voice coaching when video is paused
      voiceCoach.current?.stopSpeaking();
      // Stop any ongoing beeps
      if (currentAudioContext.current) {
        currentAudioContext.current.close();
        currentAudioContext.current = null;
      }
      // Pause background music (only if enabled)
      if (preferences.musicEnabled) {
        backgroundMusicRef?.current?.pauseMusic();
      }
      // Notify parent about pause state
      onPauseChange?.(true);
    } else {
      video.play();
      setAnimationIcon('play');
      // Resume background music (only if enabled)
      if (preferences.musicEnabled) {
        backgroundMusicRef?.current?.resumeMusic();
      }
      // Notify parent about resume state
      onPauseChange?.(false);
    }
    
    // Show animation
    setShowPlayPauseAnimation(true);
    setTimeout(() => setShowPlayPauseAnimation(false), 600);
  };

  // Get title based on mode
  const getTitle = () => {
    // Always show exercise counter
    return `Exercise ${currentExerciseIndex + 1} / ${totalExercises}`;
  };

  // Get subtitle based on mode
  const getSubtitle = () => {
    switch (mode) {
      case 'get-ready':
        return `Get Ready! - ${exercise.name}`;
      case 'rest':
        return nextExerciseName ? `Rest Time - Next: ${nextExerciseName}` : 'Rest Time';
      case 'workout':
      default:
        return exercise.name;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/images/standing.png)',
          filter: 'blur(20px)',
          transform: 'scale(1.1)' // Slightly scale up to hide blur edges
        }}
      />
      
      {/* Video Foreground */}
      <video
        ref={videoRef}
        src={getVideoUrl()}
        className="relative w-full h-full object-contain z-10 cursor-pointer"
        loop
        playsInline
        autoPlay
        muted
        onClick={togglePlayPause}
      />

      {/* Hidden Preload Video */}
      <video
        ref={preloadVideoRef}
        className="hidden"
        preload="auto"
        muted
      />

      {/* Top Overlay - Title */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-thin text-white">{getTitle()}</h2>
            {getSubtitle() && (
              <p className="text-white/80 text-lg mt-2 font-normal">{getSubtitle()}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white text-xl hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Overlay - Timer */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="text-center">
          <span className="text-8xl font-thin text-white">{currentTimer}</span>
        </div>
      </div>

      {/* Animated Play/Pause Indicator */}
      {showPlayPauseAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div 
            className="flex items-center justify-center"
            style={{
              animation: showPlayPauseAnimation ? 'fadeGrow 0.6s ease-out' : 'none'
            }}
          >
            {animationIcon === 'play' ? (
              <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l8-5z"/>
              </svg>
            ) : (
              <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"/>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Debug Voice Schedule Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg max-w-sm">
          <h3 className="font-bold mb-2">🎤 Timer Voice Coach Debug</h3>
          <div className="text-sm space-y-1">
            <div>Mode: {mode}</div>
            <div>Timer: {currentTimer}s</div>
            <div>Exercise: {exercise.name}</div>
            <div>Coach Enabled: {voiceCoachEnabled ? '✅' : '❌'}</div>
            <div>Voice Status: {voiceStatus === 'available' ? '✅ Available' : voiceStatus === 'unavailable' ? '❌ Not Available' : '⏳ Loading'}</div>
            <div>Paused: {isPaused ? '⏸️' : '▶️'}</div>
            {debugInfo && (
              <div className="border-t pt-2 mt-2">
                <div className="text-xs font-semibold mb-1">Simple Voice Coach Debug:</div>
                <div className="text-xs space-y-1">
                  <div>Time: {debugInfo.time}s</div>
                  <div>Mode: {debugInfo.mode}</div>
                  <div>Exercise: {debugInfo.exerciseName}</div>
                  <div>Next Exercise: {debugInfo.nextExercise}</div>
                  
                  <div className="mt-2 text-xs">
                    <span className={`px-2 py-1 rounded ${debugInfo.isGenerating ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                      {debugInfo.isGenerating ? '🤖 Generating' : '⏸️ Generate Idle'}
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded ${debugInfo.isPlaying ? 'bg-green-600' : 'bg-gray-600'}`}>
                      {debugInfo.isPlaying ? '🔊 Playing' : '⏸️ Audio Idle'}
                    </span>
                    <span className="ml-2 text-gray-300">Cache: {debugInfo.cacheSize}</span>
                  </div>

                  <div className="font-semibold text-yellow-300 mt-2">Current Action:</div>
                  <div className="pl-2 text-yellow-100">{debugInfo.currentAction}</div>
                  <div className="font-semibold text-blue-300 mt-2">Next Action:</div>
                  <div className="pl-2 text-blue-100">{debugInfo.nextAction}</div>
                  
                  {debugInfo.actionLog && debugInfo.actionLog.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                      <div className="font-semibold text-green-300">📝 Action Log:</div>
                      <div className="max-h-24 overflow-y-auto">
                        {debugInfo.actionLog.slice(-5).map((entry, index) => (
                          <div key={index} className="pl-2 text-green-100 text-xs">
                            {entry.timestamp}: {entry.action} @ {entry.time}s ({entry.mode})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="text-xs opacity-75 mt-2">
              Voice Coach: LIVE - Real Text Generation + TTS + Audio Playback
            </div>
          </div>
        </div>
      )}

      {/* Voice Status Indicator (always visible when voice is enabled) */}
      {voiceCoachEnabled && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            voiceStatus === 'available' ? 'bg-green-500/80 text-white' :
            voiceStatus === 'unavailable' ? 'bg-red-500/80 text-white' :
            'bg-yellow-500/80 text-white'
          }`}>
            {voiceStatus === 'available' ? '🎤 Ready' :
             voiceStatus === 'unavailable' ? '🎤 Voice Unavailable' :
             '🎤 Loading Voice...'}
          </div>
          {/* Timer-based trigger indicator */}
          {debugInfo?.currentAction && debugInfo.currentAction !== 'Waiting' && (
            <div className="text-xs text-white bg-black/50 px-2 py-1 rounded mt-1">
              {debugInfo.currentAction}
            </div>
          )}
        </div>
      )}

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes fadeGrow {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 0.8;
            transform: scale(2.1);
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }
      `}</style>
    </div>
  );
}

type ViewMode = 'calendar' | 'workout' | 'player' | 'success';

const jokes = [
  "Why don't hamsters ever get lost? Because they always know which wheel to turn! 🐹",
  "What's a dog's favorite type of music? Anything with a good BARK-beat! 🎵",
  "Why did the fitness instructor bring a ladder to class? To reach new heights! 🪜",
  "What do you call a hamster who loves to exercise? A gym-ster! 💪",
  "Why don't dogs make good DJs? They always paws the music! 🎧",
  "What's the best thing about Switzerland? I don't know, but the flag is a big plus! 🇨🇭",
  "Why did the scarecrow win an award? He was outstanding in his field! 🏆",
  "What do you call a bear with no teeth? A gummy bear! 🐻"
];

export default function FitnessCalendarApp() {
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');
  const [selectedWorkout, setSelectedWorkout] = useState<CustomWorkout | null>(null);
  const [completionData, setCompletionData] = useState<any>(null);
  const [workoutPreferences, setWorkoutPreferences] = useState<{ coachEnabled: boolean; musicEnabled: boolean }>({ coachEnabled: true, musicEnabled: true });
  const [todayJoke, setTodayJoke] = useState('');
  const backgroundMusicRef = useRef<BackgroundMusicRef>(null);

  // Set random joke on component mount
  React.useEffect(() => {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    setTodayJoke(randomJoke);
  }, []);

  const handleWorkoutSelect = () => {
    setCurrentView('workout');
  };

  const handleWorkoutStart = async (workout: CustomWorkout, preferences: { coachEnabled: boolean; musicEnabled: boolean }) => {
    console.log('🎵 Starting workout with preferences:', preferences);
    
    // Start the music only if enabled, using the same user interaction
    if (preferences.musicEnabled) {
      try {
        await backgroundMusicRef.current?.startMusic();
        console.log('🎵 Music started successfully with workout');
      } catch (error) {
        console.error('🎵 Failed to start music with workout:', error);
      }
    } else {
      console.log('🎵 Music disabled by user preference');
    }
    
    // Store preferences and workout separately
    setWorkoutPreferences(preferences);
    setSelectedWorkout(workout);
    setCurrentView('player');
  };

  const handleWorkoutComplete = (workoutCompletionData: any) => {
    setCompletionData(workoutCompletionData);
    setCurrentView('success');
  };

  const handleBackToCalendar = () => {
    setCurrentView('calendar');
  };

  const handleClosePlayer = () => {
    setSelectedWorkout(null);
    setCurrentView('workout');
  };

  const handleSuccessClose = () => {
    setSelectedWorkout(null);
    setCompletionData(null);
    setCurrentView('calendar');
  };

  const handleSuccessShare = () => {
    if (!selectedWorkout) return;
    
    const message = `I just completed ${selectedWorkout.name}! 💪 Crushed ${completionData?.exercisesCompleted || 0} exercises and burned ${completionData?.caloriesBurned || 0} calories! 🔥`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Background Music - controlled via ref */}
      <BackgroundMusic 
        ref={backgroundMusicRef}
        isActive={currentView === 'workout' || currentView === 'player'} 
        volume={0.3} 
        fadeInDuration={2000}
        onLoadError={() => console.error('Background music failed to load')}
      />
      
      {currentView === 'player' && selectedWorkout ? (
        <WorkoutPlayer
          workout={selectedWorkout}
          onWorkoutComplete={handleWorkoutComplete}
          onClose={handleClosePlayer}
          backgroundMusicRef={backgroundMusicRef}
          preferences={workoutPreferences}
        />
      ) : currentView === 'success' && selectedWorkout && completionData ? (
        <WorkoutSuccess
          exercise={{
            name: selectedWorkout.name,
            difficulty: 'Mixed',
            targetMuscles: ['Full Body', 'Core', 'Cardio'],
            category: 'Full Workout'
          }}
          completionData={completionData}
          userProgress={{
            streak: Math.floor(Math.random() * 10) + 1, // Mock data for now
            totalWorkouts: Math.floor(Math.random() * 50) + 1,
            coins: Math.floor(Math.random() * 1000) + 100,
            level: Math.floor(Math.random() * 5) + 1,
            weeklyGoal: 5,
            weeklyProgress: Math.floor(Math.random() * 5) + 1
          }}
          todayJoke={todayJoke}
          onClose={handleSuccessClose}
          onShare={handleSuccessShare}
          workoutType="multi"
        />
      ) : currentView === 'workout' ? (
        <WorkoutOfTheDay
          onWorkoutStart={handleWorkoutStart}
          onBack={handleBackToCalendar}
        />
      ) : (
        <CalendarView onWorkoutSelect={handleWorkoutSelect} />
      )}
    </>
  );
} 