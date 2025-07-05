/**
 * Simple Voice Coach - Web Speech API Implementation
 * 
 * This is a simplified, reliable voice coaching system that works without any external APIs.
 * It uses the browser's built-in Web Speech API for text-to-speech functionality.
 */

export interface SimpleVoiceOptions {
  exerciseName: string;
  mode: 'get-ready' | 'workout' | 'rest';
  timeRemaining?: number;
  currentStep?: number;
  totalSteps?: number;
}

export class SimpleVoiceCoach {
  private static instance: SimpleVoiceCoach;
  private isEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  // Pre-defined motivational messages
  private messages = {
    getReady: [
      "Get ready for {exercise}!",
      "Prepare yourself for {exercise}!",
      "Time for {exercise}! You've got this!",
      "Ready to rock {exercise}? Let's go!",
      "Here comes {exercise}! Show your strength!"
    ],
    workoutStart: [
      "Let's do {exercise}! Push yourself!",
      "Go, go, go! {exercise} time!",
      "You're amazing! Keep that {exercise} going!",
      "Strong work on {exercise}!",
      "Perfect form! Keep going!"
    ],
    motivation: [
      "You're doing great! Keep pushing!",
      "Amazing work! Don't stop now!",
      "You're stronger than you think!",
      "Keep going! You've got this!",
      "Fantastic effort! Push through!",
      "You're on fire! Stay strong!",
      "Incredible! You're unstoppable!"
    ],
    rest: [
      "Great job! Take a well-deserved rest.",
      "Awesome work! Time to breathe and recover.",
      "Excellent! Rest up for the next one.",
      "You crushed it! Enjoy your break.",
      "Well done! Recharge those muscles."
    ],
    countdown: {
      3: "Three!",
      2: "Two!",
      1: "One!",
      0: "Go!"
    }
  };

  private constructor() {
    this.checkBrowserSupport();
    this.initializeVoice();
  }

  static getInstance(): SimpleVoiceCoach {
    if (!SimpleVoiceCoach.instance) {
      SimpleVoiceCoach.instance = new SimpleVoiceCoach();
    }
    return SimpleVoiceCoach.instance;
  }

  private checkBrowserSupport(): void {
    this.isSupported = 'speechSynthesis' in window;
    if (!this.isSupported) {
      console.warn('🎤 Web Speech API not supported in this browser');
    }
  }

  private initializeVoice(): void {
    if (!this.isSupported) return;

    // Wait for voices to load
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      
      // Prefer English voices, then female voices, then any voice
      this.selectedVoice = 
        voices.find(voice => voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')) ||
        voices.find(voice => voice.lang.startsWith('en')) ||
        voices.find(voice => voice.name.toLowerCase().includes('female')) ||
        voices[0] || null;

      if (this.selectedVoice) {
        console.log('🎤 Voice selected:', this.selectedVoice.name);
      }
    };

    // Some browsers load voices asynchronously
    if (speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      speechSynthesis.addEventListener('voiceschanged', setVoice);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && this.currentUtterance) {
      this.stopSpeaking();
    }
  }

  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  private getRandomMessage(category: keyof typeof this.messages, exerciseName?: string): string {
    const messageArray = this.messages[category] as string[];
    const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];
    
    // Replace placeholders
    return exerciseName ? 
      randomMessage.replace('{exercise}', exerciseName) : 
      randomMessage;
  }

  private speak(text: string, options: Partial<SpeechSynthesisUtterance> = {}): void {
    if (!this.isEnabled || !this.isSupported) return;

    // Stop any current speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    
    utterance.rate = options.rate || 1.1;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;

    // Event handlers
    utterance.onstart = () => {
      console.log('🎤 Speaking:', text);
    };

    utterance.onend = () => {
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error('🎤 Speech error:', event.error);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.currentUtterance) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  // Main voice coaching methods
  announceGetReady(options: SimpleVoiceOptions): void {
    const message = this.getRandomMessage('getReady', options.exerciseName);
    this.speak(message);
  }

  announceWorkoutStart(options: SimpleVoiceOptions): void {
    const message = this.getRandomMessage('workoutStart', options.exerciseName);
    this.speak(message);
  }

  provideMidWorkoutMotivation(): void {
    const message = this.getRandomMessage('motivation');
    this.speak(message, { rate: 1.2, pitch: 1.1 }); // More energetic
  }

  announceRest(options: SimpleVoiceOptions): void {
    const message = this.getRandomMessage('rest');
    this.speak(message, { rate: 0.9 }); // Slower for rest
  }

  countdown(seconds: number): void {
    if (seconds >= 0 && seconds <= 3) {
      const message = this.messages.countdown[seconds as keyof typeof this.messages.countdown];
      this.speak(message, { rate: 1.0, pitch: 1.2 });
    }
  }

  // Comprehensive workout guidance
  provideWorkoutGuidance(options: SimpleVoiceOptions): void {
    const { mode, exerciseName, timeRemaining } = options;

    switch (mode) {
      case 'get-ready':
        this.announceGetReady(options);
        break;
      
      case 'workout':
        // Announce start, then motivation halfway through
        this.announceWorkoutStart(options);
        
        if (timeRemaining && timeRemaining > 10) {
          setTimeout(() => {
            this.provideMidWorkoutMotivation();
          }, Math.max(5000, (timeRemaining - 10) * 500)); // Halfway through or after 5 seconds
        }
        break;
      
      case 'rest':
        this.announceRest(options);
        break;
    }
  }

  // Test the voice system
  testVoice(): void {
    this.speak("Hello! I'm your fitness voice coach. I'm here to motivate and guide you through your workouts. Let's get started!");
  }

  // Get system status for UI feedback
  getStatus(): { supported: boolean; enabled: boolean; voice: string | null } {
    return {
      supported: this.isSupported,
      enabled: this.isEnabled,
      voice: this.selectedVoice?.name || null
    };
  }
}

// Export a simple interface that matches the existing complex one
export interface VoiceCoachInterface {
  setEnabled(enabled: boolean): void;
  initializeVoiceSchedule(options: any): void;
  stopSpeaking(): void;
  testVoice(): void;
}

// Adapter to match existing interface
export class VoiceCoachAdapter implements VoiceCoachInterface {
  private simpleCoach: SimpleVoiceCoach;

  constructor() {
    this.simpleCoach = SimpleVoiceCoach.getInstance();
  }

  setEnabled(enabled: boolean): void {
    this.simpleCoach.setEnabled(enabled);
  }

  initializeVoiceSchedule(options: {
    mode: 'get-ready' | 'workout' | 'rest';
    totalSeconds: number;
    exerciseName: string;
    currentStep: number;
    totalSteps: number;
  }): void {
    // Convert to simple options and provide guidance
    this.simpleCoach.provideWorkoutGuidance({
      exerciseName: options.exerciseName,
      mode: options.mode,
      timeRemaining: options.totalSeconds,
      currentStep: options.currentStep,
      totalSteps: options.totalSteps
    });
  }

  stopSpeaking(): void {
    this.simpleCoach.stopSpeaking();
  }

  testVoice(): void {
    this.simpleCoach.testVoice();
  }
}

export default SimpleVoiceCoach; 