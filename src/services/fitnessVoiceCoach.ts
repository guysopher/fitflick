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
  messageType?: 'instruction' | 'motivation' | 'rest-announcement' | 'general';
}

// Cache interface for pre-generated audio
interface AudioCache {
  [key: string]: Blob;
}

export class FitnessVoiceCoach {
  private static instance: FitnessVoiceCoach;
  private currentUtterance: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private lastPepTalkTime: number = 0;
  private pepTalkInterval: number = 8000; // 8 seconds between pep talks
  private audioCache: AudioCache = {};
  private generationInProgress: Set<string> = new Set();

  private constructor() {
    // No initialization needed anymore
  }

  static getInstance(): FitnessVoiceCoach {
    if (!FitnessVoiceCoach.instance) {
      FitnessVoiceCoach.instance = new FitnessVoiceCoach();
    }
    return FitnessVoiceCoach.instance;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.currentUtterance) {
      this.stopSpeaking();
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

    const now = Date.now();
    
    // Don't deliver pep talks too frequently
    if (now - this.lastPepTalkTime < this.pepTalkInterval) return;

    this.lastPepTalkTime = now;

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

  // Play pre-generated audio blob
  private async playAudioBlob(audioBlob: Blob): Promise<void> {
    if (!this.isEnabled) return;

    // Stop any currently playing audio
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
        console.error('Cached audio playback error:', error);
        resolve();
      };

      // Store reference for potential cancellation
      this.currentUtterance = audio;
      audio.play().catch((error) => {
        console.error('Failed to play cached audio:', error);
        URL.revokeObjectURL(audioUrl);
        this.currentUtterance = null;
        resolve();
      });
    });
  }

  stopSpeaking(): void {
    // Stop audio if playing
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