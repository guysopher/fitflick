import OpenAI from 'openai';

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
}

export class FitnessVoiceCoach {
  private static instance: FitnessVoiceCoach;
  private speechSynthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabled: boolean = true;
  private lastPepTalkTime: number = 0;
  private pepTalkInterval: number = 8000; // 8 seconds between pep talks

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

  private async generatePepTalk(options: PepTalkOptions): Promise<string> {
    const { exerciseName, timeRemaining, currentStep, totalSteps, userName = 'Shahar', mode } = options;

    let prompt = '';
    
    switch (mode) {
      case 'get-ready':
        prompt = `You are an energetic fitness coach. Generate a very short (1-2 sentences max) motivational message to get ${userName} ready for the "${exerciseName}" exercise. This is exercise ${currentStep + 1} of ${totalSteps}. Be encouraging and positive. Keep it brief and punchy!`;
        break;
      
      case 'workout':
        const phase = timeRemaining > 15 ? 'beginning' : timeRemaining > 7 ? 'middle' : 'final push';
        prompt = `You are an energetic fitness coach. Generate a very short (1-2 sentences max) motivational message for ${userName} who is currently doing "${exerciseName}" with ${timeRemaining} seconds remaining. This is the ${phase} phase. Be encouraging, energetic, and supportive. Focus on form, breathing, or pushing through. Keep it brief!`;
        break;
      
      case 'rest':
        prompt = `You are a supportive fitness coach. Generate a very short (1-2 sentences max) recovery message for ${userName} during their rest period. Encourage them to breathe, stay hydrated, and prepare for the next exercise. Keep it calm but motivating and brief!`;
        break;
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
      // Fallback messages
      const fallbackMessages = {
        'get-ready': [`Get ready, ${userName}! Let's crush this ${exerciseName}!`, `${userName}, time to show that ${exerciseName} who's boss!`],
        'workout': [`Push it, ${userName}! You've got this!`, `Great form, ${userName}! Keep it up!`, `${timeRemaining} seconds left - you're crushing it!`],
        'rest': [`Nice work, ${userName}! Catch your breath.`, `Great job! Use this time to recover, ${userName}.`]
      };
      
      const messages = fallbackMessages[mode];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }

  private async speakText(text: string): Promise<void> {
    if (!this.isEnabled) return;

    // Stop any currently playing audio
    this.stopSpeaking();

    try {
      // Use OpenAI's TTS API for high-quality voice
      const response = await openai.audio.speech.create({
        model: 'tts-1', // Use tts-1 for faster response, tts-1-hd for higher quality
        voice: 'nova', // Nova has an energetic, friendly tone perfect for fitness coaching
        input: text,
        speed: 1.1, // Slightly faster for energy
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

    try {
      const pepTalk = await this.generatePepTalk(options);
      await this.speakText(pepTalk);
    } catch (error) {
      console.error('Error delivering immediate pep talk:', error);
    }
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
    await this.speakText("Hey Shahar! Your AI fitness coach is here with a natural, high-quality voice powered by OpenAI. I'm ready to motivate you through every rep, every set, and every workout. Let's crush those fitness goals together!");
  }
} 