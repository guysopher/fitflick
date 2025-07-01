import OpenAI from 'openai';
import { 
  promptGenerators, 
  fallbackMessages, 
  generateTestPrompt,
  getHardCodedGetReadyMessage,
  type PromptContext 
} from './fitnessCoachPrompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Allow client-side usage
});

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
  private speechSynthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabled: boolean = true;
  private lastPepTalkTime: number = 0;
  private pepTalkInterval: number = 8000; // 8 seconds between pep talks
  private audioCache: AudioCache = {};
  private generationInProgress: Set<string> = new Set();

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
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
      this.speechSynthesis.cancel();
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
      
      // Generate audio with OpenAI TTS
      const response = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: 'nova',
        input: text,
        speed: 1,
      });

      // Store audio blob in cache
      const audioBlob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });
      this.audioCache[cacheKey] = audioBlob;
      
      console.log(`Pre-generated audio for: ${cacheKey}`);
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

    // Determine message type based on context if not explicitly provided
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
    
    // Create context for prompt generation
    const promptContext: PromptContext = {
      userName,
      exerciseName,
      timeRemaining,
      currentStep,
      totalSteps,
    };

    // Get the appropriate prompt generator
    const promptGenerator = promptGenerators[actualMessageType as keyof typeof promptGenerators];
    let prompt = '';
    
    if (promptGenerator) {
      prompt = promptGenerator(promptContext);
    } else {
      // Fallback to mode-based prompts (get-ready already handled above)
      switch (mode) {
        case 'workout':
          prompt = promptGenerators.workout(promptContext);
          break;
        case 'rest':
          prompt = promptGenerators.rest(promptContext);
          break;
        default:
          prompt = promptGenerators.motivation(promptContext);
      }
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 1,
      });

      return completion.choices[0]?.message?.content?.trim() || 'Great job, keep going!';
    } catch (error) {
      console.error('Error generating pep talk:', error);
      // Use centralized fallback messages
      const messages = fallbackMessages[actualMessageType as keyof typeof fallbackMessages] || fallbackMessages['motivation'];
      const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
      
      // Personalize the fallback message with dynamic replacements
      return selectedMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{exerciseName\}/g, exerciseName);
    }
  }

  private async speakText(text: string): Promise<void> {
    if (!this.isEnabled) return;

    // Stop any currently playing audio
    this.stopSpeaking();

    try {
      // Use OpenAI's TTS API for high-quality voice
      const response = await openai.audio.speech.create({
        model: 'tts-1-hd', // Use tts-1 for faster response, tts-1-hd for higher quality
        voice: 'nova', // Nova has an energetic, friendly tone perfect for fitness coaching
        input: text,
        speed: 1, // Slightly faster for energy
      });

      // Convert response to audio blob
      const audioBlob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio element
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentUtterance = null;
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          this.currentUtterance = null;
          console.error('Audio playback error:', error);
          // Fallback to browser speech synthesis
          this.fallbackToBuiltInSpeech(text).then(resolve).catch(resolve);
        };

        // Store reference for potential cancellation
        this.currentUtterance = audio as any;
        audio.play().catch((error) => {
          console.error('Failed to play OpenAI TTS audio:', error);
          // Fallback to browser speech synthesis
          this.fallbackToBuiltInSpeech(text).then(resolve).catch(resolve);
        });
      });

    } catch (error) {
      console.error('OpenAI TTS error:', error);
      // Fallback to browser speech synthesis
      return this.fallbackToBuiltInSpeech(text);
    }
  }

  // Fallback method using browser's built-in speech synthesis
  private async fallbackToBuiltInSpeech(text: string): Promise<void> {
    if (!this.isEnabled) return;

    // Cancel any current speech
    this.speechSynthesis.cancel();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = 1.1; // Slightly faster
      utterance.pitch = 1.1; // Slightly higher pitch for energy
      utterance.volume = 0.8;
      
      // Try to find a suitable voice
      const voices = this.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen'))
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        resolve();
      };

      this.currentUtterance = utterance;
      this.speechSynthesis.speak(utterance);
    });
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
      this.currentUtterance = audio as any;
      audio.play().catch((error) => {
        console.error('Failed to play cached audio:', error);
        URL.revokeObjectURL(audioUrl);
        this.currentUtterance = null;
        resolve();
      });
    });
  }

  stopSpeaking(): void {
    // Stop browser speech synthesis
    this.speechSynthesis.cancel();
    
    // Stop OpenAI TTS audio if playing
    if (this.currentUtterance) {
      if (this.currentUtterance instanceof HTMLAudioElement) {
        this.currentUtterance.pause();
        this.currentUtterance.currentTime = 0;
      }
      this.currentUtterance = null;
    }
  }

  // Test the voice coach
  async testVoice(): Promise<void> {
    const testMessage = generateTestPrompt();
    await this.speakText(testMessage);
  }
} 