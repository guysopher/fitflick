import { 
  fallbackMessages, 
  generateTestPrompt,
  getHardCodedGetReadyMessage
} from './fitnessCoachPrompts';

export interface PepTalkOptions {
  exerciseName: string;
  timeRemaining: number;
  currentStep: number;
  totalSteps: number;
  userName?: string;
  mode: 'workout' | 'rest' | 'get-ready';
  messageType?: 'instruction' | 'motivation' | 'rest-announcement' | 'general' | 'get-ready';
}

// Cache interface for pre-generated audio
interface AudioCache {
  [key: string]: Blob;
}

interface VoiceSchedule {
  id: string;
  triggerTime: number; // remaining seconds when to trigger
  audioData: Blob | null;
  textContent: string;
  options: PepTalkOptions;
  isGenerated: boolean;
  isPlaying: boolean;
  hasFailed: boolean;
  priority: number; // New: Priority for voice queue (lower number = higher priority)
}

interface TimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  mode: 'get-ready' | 'workout' | 'rest';
  exerciseName: string;
  currentStep: number;
  totalSteps: number;
}

export class FitnessVoiceCoach {
  private static instance: FitnessVoiceCoach;
  private currentUtterance: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private audioCache: AudioCache = {};
  private generationInProgress: Set<string> = new Set();
  
  // Enhanced voice scheduling system
  private voiceSchedule: VoiceSchedule[] = [];
  private timerState: TimerState | null = null;
  private timerInterval: NodeJS.Timeout | null = null;
  private isScheduleActive: boolean = false;
  
  // New: Voice queue management
  private voiceQueue: VoiceSchedule[] = [];
  private isPlayingVoice: boolean = false;
  private currentVoicePromise: Promise<void> | null = null;
  
  // Fallback system
  private fallbackAudioFiles: Map<string, string> = new Map([
    ['get-ready', '/audio/Get Ready.mp3'],
    ['workout-start', '/audio/music1.mp3'],
    ['mid-workout', '/audio/music2.mp3'],
    ['rest', '/audio/Get Ready.mp3']
  ]);

  // NEW: Audio coordination for preventing interference
  private backgroundMusicRef: React.RefObject<any> | null = null;
  private audioContextRef: React.MutableRefObject<AudioContext | null> | null = null;
  private wasBackgroundMusicPlaying: boolean = false;

  private constructor() {
    // Initialize fallback audio preloading
    this.preloadFallbackAudio();
  }

  static getInstance(): FitnessVoiceCoach {
    if (!FitnessVoiceCoach.instance) {
      FitnessVoiceCoach.instance = new FitnessVoiceCoach();
    }
    return FitnessVoiceCoach.instance;
  }

  private preloadFallbackAudio(): void {
    // Preload fallback audio files to avoid loading delays
    this.fallbackAudioFiles.forEach((path, key) => {
      const audio = new Audio(path);
      audio.load();
    });
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      // Stop all voice-related activity
      this.stopAllVoice();
      // Resume external audio that might have been paused
      this.resumeExternalAudio();
    }
  }

  private generateCacheKey(options: PepTalkOptions): string {
    return `${options.mode}-${options.exerciseName}-${options.messageType || 'general'}-${options.currentStep}`;
  }

  async preGenerateAudio(options: PepTalkOptions): Promise<void> {
    if (!this.isEnabled) return;

    const cacheKey = this.generateCacheKey(options);
    
    // Check if already cached or in progress
    if (this.audioCache[cacheKey] || this.generationInProgress.has(cacheKey)) {
      return;
    }

    this.generationInProgress.add(cacheKey);
    
    try {
      const pepTalk = await this.generatePepTalk(options);
      const audioBlob = await this.generateAudioFromText(pepTalk);
      
      if (audioBlob) {
        this.audioCache[cacheKey] = audioBlob;
        console.log(`✅ Pre-generated audio cached for: ${cacheKey}`);
      }
    } catch (error) {
      console.error(`❌ Failed to pre-generate audio for ${cacheKey}:`, error);
    } finally {
      this.generationInProgress.delete(cacheKey);
    }
  }

  clearCache(): void {
    this.audioCache = {};
    this.generationInProgress.clear();
  }

  private async generatePepTalk(options: PepTalkOptions): Promise<string> {
    const { exerciseName, timeRemaining, currentStep, totalSteps, userName = 'Shahar', mode, messageType = 'general' } = options;

    // Use hard-coded messages for get-ready to eliminate lag
    if (mode === 'get-ready') {
      return getHardCodedGetReadyMessage({
        userName,
        exerciseName,
        timeRemaining,
        currentStep,
        totalSteps,
      });
    }

    try {
      // Call API route to generate pep talk
      const response = await fetch('/api/generate-pep-talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.text || 'Great job, keep going!';
      
    } catch (error) {
      console.error('Error generating pep talk:', error);
      
      // Determine message type for fallback
      let actualMessageType = messageType;
      if (messageType === 'general') {
        if (mode === 'workout') {
          actualMessageType = 'motivation';
        } else if (mode === 'rest') {
          actualMessageType = 'rest-announcement';
        } else {
          actualMessageType = 'instruction';
        }
      }
      
      // Use centralized fallback messages
      const messages = fallbackMessages[actualMessageType as keyof typeof fallbackMessages] || fallbackMessages['motivation'];
      const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
      
      // Personalize the fallback message with dynamic replacements
      return selectedMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{exerciseName\}/g, exerciseName);
    }
  }

  private async generateAudioFromText(text: string): Promise<Blob | null> {
    try {
      // Voice generation doesn't need audio coordination - it's just API call
      // Call API route for TTS
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`TTS API request failed: ${response.status}`);
      }

      // Return the audio blob
      return await response.blob();
      
    } catch (error) {
      console.error('Error generating audio from text:', error);
      return null;
    }
  }

  // NEW: Register external audio references for coordination
  registerAudioSources(backgroundMusicRef?: React.RefObject<any>, audioContextRef?: React.MutableRefObject<AudioContext | null>) {
    this.backgroundMusicRef = backgroundMusicRef || null;
    this.audioContextRef = audioContextRef || null;
  }

  // NEW: Stop all external audio before voice playback
  private stopExternalAudio(): void {
    try {
      // Only coordinate with external audio if voice is enabled
      if (!this.isEnabled) return;

      // Stop background music if it's playing
      if (this.backgroundMusicRef?.current) {
        this.wasBackgroundMusicPlaying = this.backgroundMusicRef.current.isPlaying;
        if (this.wasBackgroundMusicPlaying) {
          console.log('🎤 Pausing background music for voice');
          this.backgroundMusicRef.current.pauseMusic();
        }
      }

      // Stop any tabata beeps (AudioContext)
      if (this.audioContextRef?.current) {
        console.log('🎤 Stopping tabata beeps for voice');
        this.audioContextRef.current.close();
        this.audioContextRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping external audio:', error);
    }
  }

  // NEW: Resume external audio after voice finishes
  private resumeExternalAudio(): void {
    try {
      // Resume background music if it was playing
      if (this.backgroundMusicRef?.current && this.wasBackgroundMusicPlaying) {
        console.log('🎤 Resuming background music after voice');
        // Small delay to ensure voice audio is completely finished
        setTimeout(() => {
          if (this.backgroundMusicRef?.current) {
            this.backgroundMusicRef.current.resumeMusic();
          }
          this.wasBackgroundMusicPlaying = false;
        }, 200);
      }
    } catch (error) {
      console.error('Error resuming external audio:', error);
    }
  }

  // NEW: Enhanced voice playback with proper queue management
  private async playVoiceFromQueue(): Promise<void> {
    if (this.isPlayingVoice || this.voiceQueue.length === 0) return;

    // Get the highest priority voice from queue
    this.voiceQueue.sort((a, b) => a.priority - b.priority);
    const voice = this.voiceQueue.shift()!;

    this.isPlayingVoice = true;
    console.log(`🎤 Playing voice from queue: ${voice.id} (priority: ${voice.priority})`);

    try {
      // Stop all audio sources before playing voice
      this.stopCurrentAudio();
      this.stopExternalAudio();

      if (voice.audioData && voice.isGenerated) {
        // Play generated audio
        await this.playAudioBlob(voice.audioData);
      } else {
        // Use fallback system
        await this.playFallbackAudio(voice);
      }
    } catch (error) {
      console.error(`❌ Failed to play voice ${voice.id}:`, error);
      voice.hasFailed = true;
    } finally {
      this.isPlayingVoice = false;
      voice.isPlaying = false;
      
      // Resume external audio after voice finishes
      this.resumeExternalAudio();
      
      // Process next voice in queue
      if (this.voiceQueue.length > 0) {
        setTimeout(() => this.playVoiceFromQueue(), 100);
      }
    }
  }

  // NEW: Add voice to queue with priority
  private addVoiceToQueue(voice: VoiceSchedule): void {
    if (voice.isPlaying || voice.hasFailed) return;

    // Remove any existing voice with same ID from queue
    this.voiceQueue = this.voiceQueue.filter(v => v.id !== voice.id);
    
    // Add new voice to queue
    this.voiceQueue.push(voice);
    
    // Start processing queue
    this.playVoiceFromQueue();
  }

  // NEW: Stop current audio without affecting queue
  private stopCurrentAudio(): void {
    if (this.currentUtterance) {
      this.currentUtterance.pause();
      this.currentUtterance.currentTime = 0;
      this.currentUtterance = null;
    }
  }

  // NEW: Initialize voice schedule for a workout session
  initializeVoiceSchedule(options: {
    mode: 'get-ready' | 'workout' | 'rest';
    totalSeconds: number;
    exerciseName: string;
    currentStep: number;
    totalSteps: number;
    nextExerciseName?: string;
  }): void {
    if (!this.isEnabled) return;

    const { mode, totalSeconds, exerciseName, currentStep, totalSteps, nextExerciseName } = options;
    
    console.log(`🎤 Initializing voice schedule for ${mode} mode:`, options);
    
    // Clear existing schedule and queue
    this.clearVoiceSchedule();
    this.clearVoiceQueue();
    
    // Create new schedule based on mode
    switch (mode) {
      case 'get-ready':
        this.createGetReadySchedule(totalSeconds, exerciseName, currentStep, totalSteps);
        break;
      case 'workout':
        this.createWorkoutSchedule(totalSeconds, exerciseName, currentStep, totalSteps);
        break;
      case 'rest':
        this.createRestSchedule(totalSeconds, exerciseName, currentStep, totalSteps, nextExerciseName);
        break;
    }

    // Start the timer
    this.startVoiceTimer(totalSeconds, mode, exerciseName, currentStep, totalSteps);
  }

  private createGetReadySchedule(totalSeconds: number, exerciseName: string, currentStep: number, totalSteps: number): void {
    // 1. Immediate: Play default get-ready audio (highest priority)
    this.voiceSchedule.push({
      id: 'get-ready-immediate',
      triggerTime: totalSeconds - 1, // Play almost immediately
      audioData: null, // Will use fallback audio
      textContent: `Get ready for ${exerciseName}!`,
      options: {
        exerciseName,
        timeRemaining: totalSeconds,
        currentStep,
        totalSteps,
        userName: 'Shahar',
        mode: 'get-ready',
        messageType: 'get-ready'
      },
      isGenerated: false,
      isPlaying: false,
      hasFailed: false,
      priority: 1
    });

    // 2. Prepare workout instruction voice (to be ready when workout starts)
    this.voiceSchedule.push({
      id: 'workout-instruction-prep',
      triggerTime: Math.max(1, totalSeconds - 3), // Prepare 3 seconds before end
      audioData: null,
      textContent: '',
      options: {
        exerciseName,
        timeRemaining: 20, // Assume 20 seconds for workout
        currentStep,
        totalSteps,
        userName: 'Shahar',
        mode: 'workout',
        messageType: 'instruction'
      },
      isGenerated: false,
      isPlaying: false,
      hasFailed: false,
      priority: 10 // Lower priority - this is just preparation
    });
  }

  private createWorkoutSchedule(totalSeconds: number, exerciseName: string, currentStep: number, totalSteps: number): void {
    // 1. Immediate: Play workout instruction (should be pre-cached)
    this.voiceSchedule.push({
      id: 'workout-instruction',
      triggerTime: totalSeconds - 1, // Play almost immediately
      audioData: null,
      textContent: `Let's do ${exerciseName}! You've got this!`,
      options: {
        exerciseName,
        timeRemaining: totalSeconds,
        currentStep,
        totalSteps,
        userName: 'Shahar',
        mode: 'workout',
        messageType: 'instruction'
      },
      isGenerated: false,
      isPlaying: false,
      hasFailed: false,
      priority: 1
    });

    // 2. Mid-workout motivation (at 50% remaining time)
    const midWorkoutTime = Math.floor(totalSeconds * 0.5);
    if (midWorkoutTime > 5) {
      this.voiceSchedule.push({
        id: 'mid-workout-motivation',
        triggerTime: midWorkoutTime,
        audioData: null,
        textContent: `Keep going! You're doing great!`,
        options: {
          exerciseName,
          timeRemaining: midWorkoutTime,
          currentStep,
          totalSteps,
          userName: 'Shahar',
          mode: 'workout',
          messageType: 'motivation'
        },
        isGenerated: false,
        isPlaying: false,
        hasFailed: false,
        priority: 2
      });
    }

    // 3. Prepare rest announcement (to be ready when rest starts)
    this.voiceSchedule.push({
      id: 'rest-announcement-prep',
      triggerTime: Math.max(1, totalSeconds - 5), // Prepare 5 seconds before end
      audioData: null,
      textContent: '',
      options: {
        exerciseName,
        timeRemaining: 10, // Assume 10 seconds for rest
        currentStep,
        totalSteps,
        userName: 'Shahar',
        mode: 'rest',
        messageType: 'rest-announcement'
      },
      isGenerated: false,
      isPlaying: false,
      hasFailed: false,
      priority: 10 // Lower priority - this is just preparation
    });
  }

  private createRestSchedule(totalSeconds: number, exerciseName: string, currentStep: number, totalSteps: number, nextExerciseName?: string): void {
    // 1. Immediate: Play rest announcement
    this.voiceSchedule.push({
      id: 'rest-announcement',
      triggerTime: totalSeconds - 1,
      audioData: null,
      textContent: `Great job! Take a rest.`,
      options: {
        exerciseName,
        timeRemaining: totalSeconds,
        currentStep,
        totalSteps,
        userName: 'Shahar',
        mode: 'rest',
        messageType: 'rest-announcement'
      },
      isGenerated: false,
      isPlaying: false,
      hasFailed: false,
      priority: 1
    });

    // 2. If there's a next exercise, prepare its instruction
    if (nextExerciseName && totalSeconds > 5) {
      this.voiceSchedule.push({
        id: 'next-workout-instruction-prep',
        triggerTime: Math.max(1, totalSeconds - 3),
        audioData: null,
        textContent: '',
        options: {
          exerciseName: nextExerciseName,
          timeRemaining: 20,
          currentStep: currentStep + 1,
          totalSteps,
          userName: 'Shahar',
          mode: 'workout',
          messageType: 'instruction'
        },
        isGenerated: false,
        isPlaying: false,
        hasFailed: false,
        priority: 10 // Lower priority - this is just preparation
      });
    }
  }

  private startVoiceTimer(totalSeconds: number, mode: string, exerciseName: string, currentStep: number, totalSteps: number): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerState = {
      isActive: true,
      remainingSeconds: totalSeconds,
      totalSeconds,
      mode: mode as any,
      exerciseName,
      currentStep,
      totalSteps
    };

    this.isScheduleActive = true;

    // Start preparation of first voice items
    this.prepareUpcomingVoices();

    this.timerInterval = setInterval(() => {
      if (!this.timerState || !this.isScheduleActive) return;

      this.timerState.remainingSeconds--;
      
      // Check if any voice should be triggered
      this.checkVoiceTriggers();
      
      // Prepare upcoming voices
      this.prepareUpcomingVoices();
      
      // Stop timer if reached 0
      if (this.timerState.remainingSeconds <= 0) {
        this.stopVoiceTimer();
      }
    }, 1000);
  }

  // FIXED: Enhanced voice trigger checking with proper queue management
  private checkVoiceTriggers(): void {
    if (!this.timerState || !this.isScheduleActive) return;

    const currentTime = this.timerState.remainingSeconds;
    
    // Find voices that should be triggered now
    const voicesToTrigger = this.voiceSchedule.filter(voice => 
      voice.triggerTime === currentTime && !voice.isPlaying && !voice.hasFailed
    );

    // Process each voice that should be triggered
    voicesToTrigger.forEach(voice => {
      if (voice.id.endsWith('-prep')) {
        // This is a preparation voice, not meant to be played
        this.prepareVoice(voice);
      } else {
        // This is a voice that should be played - add to queue
        voice.isPlaying = true; // Mark as playing to prevent re-triggering
        this.addVoiceToQueue(voice);
      }
    });
  }

  private prepareUpcomingVoices(): void {
    if (!this.timerState) return;

    const currentTime = this.timerState.remainingSeconds;
    
    // Prepare voices that will be needed soon (within 5 seconds)
    const voicesToPrepare = this.voiceSchedule.filter(voice => 
      voice.triggerTime <= currentTime + 5 && 
      voice.triggerTime > currentTime && 
      !voice.isGenerated && 
      !voice.hasFailed &&
      !this.generationInProgress.has(voice.id)
    );

    voicesToPrepare.forEach(voice => {
      this.prepareVoice(voice);
    });
  }

  private async prepareVoice(voice: VoiceSchedule): Promise<void> {
    if (voice.isGenerated || this.generationInProgress.has(voice.id)) return;

    this.generationInProgress.add(voice.id);
    console.log(`🎤 Preparing voice: ${voice.id}`);

    try {
      // Generate text if not already available
      if (!voice.textContent) {
        voice.textContent = await this.generatePepTalk(voice.options);
      }

      // Generate audio
      const audioBlob = await this.generateAudioFromText(voice.textContent);
      
      if (audioBlob) {
        voice.audioData = audioBlob;
        voice.isGenerated = true;
        console.log(`✅ Voice prepared successfully: ${voice.id}`);
      } else {
        throw new Error('Failed to generate audio blob');
      }
    } catch (error) {
      console.error(`❌ Failed to prepare voice ${voice.id}:`, error);
      voice.hasFailed = true;
      // Don't set isGenerated to true, so fallback can be used
    } finally {
      this.generationInProgress.delete(voice.id);
    }
  }

  // FIXED: Enhanced fallback audio with proper stopping
  private async playFallbackAudio(voice: VoiceSchedule): Promise<void> {
    const fallbackKey = this.getFallbackKey(voice.options.mode, voice.options.messageType);
    const fallbackPath = this.fallbackAudioFiles.get(fallbackKey);

    if (fallbackPath) {
      console.log(`🎵 Using fallback audio for ${voice.id}: ${fallbackPath}`);
      
      // Always stop current audio first
      this.stopCurrentAudio();
      
      const audio = new Audio(fallbackPath);
      audio.volume = 0.8;
      
      return new Promise((resolve) => {
        audio.onended = () => {
          if (this.currentUtterance === audio) {
            this.currentUtterance = null;
          }
          resolve();
        };
        audio.onerror = () => {
          console.error(`❌ Fallback audio failed: ${fallbackPath}`);
          if (this.currentUtterance === audio) {
            this.currentUtterance = null;
          }
          resolve();
        };
        
        this.currentUtterance = audio;
        audio.play().catch(error => {
          console.error(`❌ Failed to play fallback audio:`, error);
          if (this.currentUtterance === audio) {
            this.currentUtterance = null;
          }
          resolve();
        });
      });
    } else {
      console.warn(`⚠️ No fallback audio available for ${voice.id}`);
    }
  }

  private getFallbackKey(mode: string, messageType?: string): string {
    switch (mode) {
      case 'get-ready':
        return 'get-ready';
      case 'workout':
        return messageType === 'motivation' ? 'mid-workout' : 'workout-start';
      case 'rest':
        return 'rest';
      default:
        return 'get-ready';
    }
  }

  private stopVoiceTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isScheduleActive = false;
    this.timerState = null;
  }

  private clearVoiceSchedule(): void {
    this.voiceSchedule = [];
    this.stopVoiceTimer();
  }

  // NEW: Clear voice queue
  private clearVoiceQueue(): void {
    this.voiceQueue = [];
    this.isPlayingVoice = false;
  }

  private stopAllVoice(): void {
    this.stopCurrentAudio();
    this.clearVoiceSchedule();
    this.clearVoiceQueue();
  }

  // NEW: Enhanced pause that stops current audio and clears queue
  pauseVoiceSchedule(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isScheduleActive = false;
    this.stopCurrentAudio();
    this.clearVoiceQueue();
  }

  resumeVoiceSchedule(): void {
    if (!this.timerState || this.isScheduleActive) return;

    this.isScheduleActive = true;
    
    // Resume timer from where it left off
    this.timerInterval = setInterval(() => {
      if (!this.timerState || !this.isScheduleActive) return;

      this.timerState.remainingSeconds--;
      
      this.checkVoiceTriggers();
      this.prepareUpcomingVoices();
      
      if (this.timerState.remainingSeconds <= 0) {
        this.stopVoiceTimer();
      }
    }, 1000);
  }

  // NEW: Update remaining time (for manual sync)
  updateRemainingTime(seconds: number): void {
    if (this.timerState) {
      this.timerState.remainingSeconds = seconds;
    }
  }

  // FIXED: Enhanced audio blob playback with better stopping
  private async playAudioBlob(audioBlob: Blob): Promise<void> {
    if (!this.isEnabled) return;

    // Always stop current audio first
    this.stopCurrentAudio();

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (this.currentUtterance === audio) {
          this.currentUtterance = null;
        }
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        if (this.currentUtterance === audio) {
          this.currentUtterance = null;
        }
        console.error('Audio playback error:', error);
        resolve();
      };

      this.currentUtterance = audio;
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        URL.revokeObjectURL(audioUrl);
        if (this.currentUtterance === audio) {
          this.currentUtterance = null;
        }
        resolve();
      });
    });
  }

  // ENHANCED: Better stopping mechanism
  stopSpeaking(): void {
    this.stopCurrentAudio();
    this.clearVoiceQueue();
  }

  // Test the voice coach
  async testVoice(): Promise<void> {
    const testMessage = generateTestPrompt();
    
    // Create a test voice and add to queue
    const testVoice: VoiceSchedule = {
      id: 'test-voice',
      triggerTime: 0,
      audioData: null,
      textContent: testMessage,
      options: {
        exerciseName: 'Test Exercise',
        timeRemaining: 10,
        currentStep: 1,
        totalSteps: 1,
        userName: 'Shahar',
        mode: 'workout',
        messageType: 'motivation'
      },
      isGenerated: false,
      isPlaying: false,
      hasFailed: false,
      priority: 1
    };

    // Generate audio for test
    const audioBlob = await this.generateAudioFromText(testMessage);
    if (audioBlob) {
      testVoice.audioData = audioBlob;
      testVoice.isGenerated = true;
    }

    this.addVoiceToQueue(testVoice);
  }
} 