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
  
  // New robust voice scheduling system
  private voiceSchedule: VoiceSchedule[] = [];
  private timerState: TimerState | null = null;
  private timerInterval: NodeJS.Timeout | null = null;
  private isScheduleActive: boolean = false;
  
  // Fallback system
  private fallbackAudioFiles: Map<string, string> = new Map([
    ['get-ready', '/audio/Get Ready.mp3'],
    ['workout-start', '/audio/music1.mp3'],
    ['mid-workout', '/audio/music2.mp3'],
    ['rest', '/audio/Get Ready.mp3']
  ]);

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
    // Preload fallback audio files
    this.fallbackAudioFiles.forEach((audioPath, key) => {
      const audio = new Audio(audioPath);
      audio.preload = 'auto';
      audio.load();
      console.log(`🎵 Preloaded fallback audio: ${key} -> ${audioPath}`);
    });
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAllVoice();
      this.clearVoiceSchedule();
    }
  }

  // Generate cache key for audio
  private generateCacheKey(options: PepTalkOptions): string {
    const { exerciseName, currentStep, messageType, mode } = options;
    return `${exerciseName}-${currentStep}-${messageType || mode}`;
  }

  // Pre-generate audio for upcoming message
  async preGenerateAudio(options: PepTalkOptions): Promise<void> {
    const cacheKey = this.generateCacheKey(options);
    
    // Skip if already generated or in progress
    if (this.audioCache[cacheKey] || this.generationInProgress.has(cacheKey)) {
      return;
    }

    this.generationInProgress.add(cacheKey);

    try {
      // Generate text first
      const text = await this.generatePepTalk(options);
      
      // Generate audio via API route
      const audioBlob = await this.generateAudioFromText(text);
      
      if (audioBlob) {
        // Store audio blob in cache
        this.audioCache[cacheKey] = audioBlob;
        console.log(`Pre-generated audio for: ${cacheKey}`);
      }
    } catch (error) {
      console.error('Error pre-generating audio:', error);
    } finally {
      this.generationInProgress.delete(cacheKey);
    }
  }

  // Clear old cache entries to prevent memory leaks
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

  private async speakText(text: string): Promise<void> {
    if (!this.isEnabled) return;

    // Stop any currently playing audio
    this.stopSpeaking();

    try {
      // Generate audio via API route
      const audioBlob = await this.generateAudioFromText(text);
      
      if (!audioBlob) {
        console.error('Failed to generate audio blob');
        return;
      }

      // Play the audio blob
      await this.playAudioBlob(audioBlob);

    } catch (error) {
      console.error('TTS error:', error);
      // Fail silently for TTS errors
      return;
    }
  }

  async deliverPepTalk(options: PepTalkOptions): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const pepTalk = await this.generatePepTalk(options);
      await this.speakText(pepTalk);
    } catch (error) {
      console.error('Error delivering pep talk:', error);
    }
  }

  // Immediate pep talk for important moments (start of exercise, transitions)
  async deliverImmediatePepTalk(options: PepTalkOptions): Promise<void> {
    if (!this.isEnabled) return;

    const cacheKey = this.generateCacheKey(options);

    try {
      // Check if we have pre-generated audio
      if (this.audioCache[cacheKey]) {
        console.log(`Using cached audio for: ${cacheKey}`);
        await this.playAudioBlob(this.audioCache[cacheKey]);
        return;
      }

      // Fallback to real-time generation
      const pepTalk = await this.generatePepTalk(options);
      await this.speakText(pepTalk);
    } catch (error) {
      console.error('Error delivering immediate pep talk:', error);
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
    
    // Clear existing schedule
    this.clearVoiceSchedule();
    
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
    // 1. Immediate: Play default get-ready audio
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
      hasFailed: false
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
      hasFailed: false
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
      hasFailed: false
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
        hasFailed: false
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
      hasFailed: false
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
      hasFailed: false
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
        hasFailed: false
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

  private checkVoiceTriggers(): void {
    if (!this.timerState || !this.isScheduleActive) return;

    const currentTime = this.timerState.remainingSeconds;
    
    // Find voices that should be triggered now
    const voicesToTrigger = this.voiceSchedule.filter(voice => 
      voice.triggerTime === currentTime && !voice.isPlaying && !voice.hasFailed
    );

    voicesToTrigger.forEach(voice => {
      if (voice.id.endsWith('-prep')) {
        // This is a preparation voice, not meant to be played
        this.prepareVoice(voice);
      } else {
        // This is a voice that should be played
        this.playScheduledVoice(voice);
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

  private async playScheduledVoice(voice: VoiceSchedule): Promise<void> {
    if (!this.isEnabled || voice.isPlaying) return;

    voice.isPlaying = true;
    console.log(`🎤 Playing scheduled voice: ${voice.id}`);

    try {
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
      voice.isPlaying = false;
    }
  }

  private async playFallbackAudio(voice: VoiceSchedule): Promise<void> {
    const fallbackKey = this.getFallbackKey(voice.options.mode, voice.options.messageType);
    const fallbackPath = this.fallbackAudioFiles.get(fallbackKey);

    if (fallbackPath) {
      console.log(`🎵 Using fallback audio for ${voice.id}: ${fallbackPath}`);
      const audio = new Audio(fallbackPath);
      audio.volume = 0.8;
      
      return new Promise((resolve) => {
        audio.onended = () => {
          this.currentUtterance = null;
          resolve();
        };
        audio.onerror = () => {
          console.error(`❌ Fallback audio failed: ${fallbackPath}`);
          this.currentUtterance = null;
          resolve();
        };
        
        this.currentUtterance = audio;
        audio.play().catch(error => {
          console.error(`❌ Failed to play fallback audio:`, error);
          this.currentUtterance = null;
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

  private stopAllVoice(): void {
    this.stopSpeaking();
    this.clearVoiceSchedule();
  }

  // NEW: Pause/Resume voice schedule (for when workout is paused)
  pauseVoiceSchedule(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isScheduleActive = false;
    this.stopSpeaking();
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

  // Modified: Play pre-generated audio blob
  private async playAudioBlob(audioBlob: Blob): Promise<void> {
    if (!this.isEnabled) return;

    this.stopSpeaking();

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentUtterance = null;
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        this.currentUtterance = null;
        console.error('Audio playback error:', error);
        resolve();
      };

      this.currentUtterance = audio;
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        URL.revokeObjectURL(audioUrl);
        this.currentUtterance = null;
        resolve();
      });
    });
  }

  stopSpeaking(): void {
    if (this.currentUtterance) {
      this.currentUtterance.pause();
      this.currentUtterance.currentTime = 0;
      this.currentUtterance = null;
    }
  }

  // Test the voice coach
  async testVoice(): Promise<void> {
    const testMessage = generateTestPrompt();
    await this.speakText(testMessage);
  }
} 