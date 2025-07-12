/**
 * Simple Timer Voice Coach - Debug Only
 * 
 * Shows debug information:
 * - Time
 * - Current action
 * - Next action  
 * - Mode
 */

export interface TimerVoiceOptions {
    exerciseName: string;
    mode: 'get-ready' | 'workout' | 'rest';
    currentStep: number;
    totalSteps: number;
    timeRemaining: number;
    nextExercise?: string;
    exercisesLeft?: number;
}

export interface ActionLogEntry {
    time: number;
    mode: string;
    action: string;
    exercise: string;
    timestamp: string;
}

export interface VoiceDebugInfo {
    time: number;
    mode: string;
    currentAction: string;
    nextAction: string;
    exerciseName: string;
    nextExercise: string;
    actionLog: ActionLogEntry[];
    isGenerating: boolean;
    isPlaying: boolean;
    cacheSize: number;
    currentStep: number;
    totalSteps: number;
}

export class TimerVoiceCoach {
    private static instance: TimerVoiceCoach;
    private isEnabled: boolean = true;
    private debugInfo: VoiceDebugInfo;
    private debugCallbacks: ((info: VoiceDebugInfo) => void)[] = [];
    private lastLoggedAction: string = '';
    
    // Audio management
    private currentAudio: HTMLAudioElement | null = null;
    private audioCache: Map<string, HTMLAudioElement> = new Map();
    private audioNext: HTMLAudioElement | null = null;
    private isGenerating: boolean = false;

    private constructor() {
        console.log(`🎤 VOICE COACH: Initialized with real actions`);

        this.debugInfo = {
            time: 0,
            mode: 'get-ready',
            currentAction: 'Waiting',
            nextAction: 'None',
            exerciseName: '',
            nextExercise: '',
            actionLog: [],
            isGenerating: false,
            isPlaying: false,
            cacheSize: 0,
            currentStep: 0,
            totalSteps: 0
        };
    }

    static getInstance(): TimerVoiceCoach {
        if (!TimerVoiceCoach.instance) {
            TimerVoiceCoach.instance = new TimerVoiceCoach();
        }
        return TimerVoiceCoach.instance;
    }

    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        console.log(`🎤 VOICE COACH: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    onTimerUpdate(options: TimerVoiceOptions): void {
        if (!this.isEnabled) return;

        const { timeRemaining, mode, exerciseName, nextExercise = 'None', currentStep, totalSteps } = options;

        // Round timeRemaining to handle floating point precision issues
        const roundedTime = Math.round(timeRemaining);

        // Debug: Log exact timer values
        if (timeRemaining !== roundedTime) {
            console.log(`🎤 ⚠️ TIMER PRECISION: Received ${timeRemaining}s, using ${roundedTime}s`);
        }

        // Update debug info
        this.debugInfo.time = roundedTime;
        this.debugInfo.mode = mode;
        this.debugInfo.exerciseName = exerciseName;
        this.debugInfo.nextExercise = nextExercise;
        this.debugInfo.currentStep = currentStep;
        this.debugInfo.totalSteps = totalSteps;

        // Determine current action based on mode and time
        this.debugInfo.currentAction = this.getCurrentAction(roundedTime, mode);
        this.debugInfo.nextAction = this.getNextAction(roundedTime, mode);

        // Enhanced console log with timing check
        console.debug(`🎤 DEBUG: ${roundedTime}s (raw: ${timeRemaining}) | ${mode} | Current: ${this.debugInfo.currentAction} | Next: ${this.debugInfo.nextAction}`);

        // Update status
        this.debugInfo.isGenerating = this.isGenerating;
        this.debugInfo.isPlaying = this.currentAudio !== null;
        this.debugInfo.cacheSize = this.audioCache.size;

        // Update debug callbacks
        this.updateDebugInfo();
    }

    private getCurrentAction(timeRemaining: number, mode: string): string {
        let currentAction = '';
        let shouldLog = false;

        // Exact timing logic as specified
        // if (timeRemaining === 8) {
        //     if (mode === 'get-ready') {
        //         currentAction = 'Generate Get Started Voice';
        //         shouldLog = true;
        //     } else if (mode === 'rest') {
        //         currentAction = 'Generate Rest Voice';
        //         shouldLog = true;
        //     } else if (mode === 'workout') {
        //         currentAction = 'Generate Rest Voice';
        //         shouldLog = true;
        //     }
         if (timeRemaining >= 10) {
            if (mode === 'get-ready' && timeRemaining === 15) {
                currentAction = 'Play Get Started';
                shouldLog = true;
            } else if (mode === 'rest' && timeRemaining === 10) {
                currentAction = 'Play Rest';
                shouldLog = true;
            } else if (mode === 'workout' && timeRemaining === 20) {
            currentAction = 'Play Start Workout';
            shouldLog = true;
            }
        } else {
            // Default states when not on trigger times
            if (mode === 'workout') {
                currentAction = 'Working Out';
            } else if (mode === 'rest') {
                currentAction = 'Resting';
            } else if (mode === 'get-ready') {
                currentAction = 'Getting Ready';
            } else {
                currentAction = 'Unknown';
            }
        }

        const nextMode = (mode === 'get-ready' || mode === 'rest') ? 'workout' : 'rest';
        const nextAction = mode === 'workout' ? 'Generate Rest Voice' : 'Generate Start Workout Voice';
        const nextTimeRemaining = mode === 'workout' ? 10 : 20;
        const nextExercise = mode === 'get-ready' ? this.debugInfo.exerciseName : this.debugInfo.nextExercise;

        // Add to log if it's a trigger action and we haven't logged it yet
        if (shouldLog && this.lastLoggedAction !== currentAction) {
            this.addToActionLog(timeRemaining, mode, currentAction);
            this.executeAction(currentAction, timeRemaining, mode);
            this.handleGenerateAction(nextAction, nextTimeRemaining, nextMode, nextExercise, this.debugInfo.currentStep, this.debugInfo.totalSteps);

            this.lastLoggedAction = currentAction;
        }

        // Reset lastLoggedAction when we're not on a trigger
        if (!shouldLog) {
            this.lastLoggedAction = '';
        }

        return currentAction;
    }

    private addToActionLog(time: number, mode: string, action: string): void {
        const timestamp = new Date().toLocaleTimeString();
        
        // Enhanced action description with exercise names
        let enhancedAction = action;
        if (action.includes('Generate')) {
            if (action === 'Generate Get Started Voice') {
                enhancedAction = `Generate Get Started Voice for ${this.debugInfo.exerciseName}`;
            } else if (action === 'Generate Start Workout Voice') {
                enhancedAction = `Generate Start Workout Voice for ${this.debugInfo.exerciseName}`;
            } else if (action === 'Generate Rest Voice') {
                if (mode === 'rest') {
                    enhancedAction = `Generate Rest Voice for ${this.debugInfo.nextExercise}`;
                } else {
                    enhancedAction = `Generate Rest Voice (${this.debugInfo.exerciseName} → ${this.debugInfo.nextExercise})`;
                }
            } else if (action === 'Generate Next Workout Voice') {
                enhancedAction = `Generate Start Workout Voice for ${this.debugInfo.nextExercise}`;
            }
        } else if (action.includes('Play')) {
            if (action === 'Play Get Started') {
                enhancedAction = `Play Get Started for ${this.debugInfo.exerciseName}`;
            } else {
                enhancedAction = `${action} for ${this.debugInfo.exerciseName}`;
            }
        }

        const logEntry: ActionLogEntry = {
            time,
            mode,
            action: enhancedAction,
            exercise: this.debugInfo.exerciseName,
            timestamp
        };

        this.debugInfo.actionLog.push(logEntry);
        console.log(`🎤 📝 ACTION LOGGED: ${enhancedAction} at ${time}s (${mode})`);

        // Keep only last 10 actions to prevent memory issues
        if (this.debugInfo.actionLog.length > 10) {
            this.debugInfo.actionLog.shift();
        }
    }

    private getNextAction(timeRemaining: number, mode: string): string {
        // Check for next trigger in descending order
        if (timeRemaining > 20) return 'Play Start Workout at 20s';
        if (timeRemaining > 10) {
            if (mode === 'get-ready') return 'Play Get Started at 10s';
            if (mode === 'rest') return 'Play Rest at 10s';
        }
        if (timeRemaining > 8) {
            if (mode === 'get-ready') return 'Generate Get Started Voice at 8s';
            if (mode === 'rest') return 'Generate Rest Voice at 8s';
            if (mode === 'workout') return 'Generate Rest Voice at 8s';
        }

        // No more actions in current mode
        if (mode === 'workout') return 'End Workout';
        if (mode === 'rest') return 'End Rest';
        if (mode === 'get-ready') return 'Start Workout';
        
        return 'None';
    }

    private updateDebugInfo(): void {
        this.debugCallbacks.forEach(callback => callback(this.debugInfo));
    }

    onDebugUpdate(callback: (info: VoiceDebugInfo) => void): void {
        this.debugCallbacks.push(callback);
    }

    getDebugInfo(): VoiceDebugInfo {
        return { ...this.debugInfo };
    }

    reset(): void {
        console.log(`🎤 VOICE COACH: Reset`);
        
        // Stop current audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        // Clear audio cache
        this.audioCache.clear();
        this.audioNext = null;
        this.isGenerating = false;
        
        // Reset debug info
        this.debugInfo.time = 0;
        this.debugInfo.currentAction = 'Waiting';
        this.debugInfo.nextAction = 'None';
        this.debugInfo.actionLog = [];
        this.debugInfo.isGenerating = false;
        this.debugInfo.isPlaying = false;
        this.debugInfo.cacheSize = 0;
        this.lastLoggedAction = '';
        this.updateDebugInfo();
    }

    stopSpeaking(): void {
        console.log(`🎤 VOICE COACH: Stop`);
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }

    // Execute real actions
    private executeAction(action: string, timeRemaining: number, mode: string): void {
        console.log(`🎤 🎯 EXECUTING: ${action}`);

        if (action.includes('Generate')) {
        } else if (action.includes('Play')) {
            this.handlePlayAction(action, timeRemaining, mode);
        }
    }

    private async handleGenerateAction(action: string, timeRemaining: number, mode: string, nextExercise: string, currentStep: number, totalSteps: number): Promise<void> {
        if (this.isGenerating) {
            console.log(`🎤 ⚠️ GENERATE SKIP: Already generating, skipping ${action}`);
            return;
        }

        this.isGenerating = true;
        console.log(`🎤 🤖 GENERATE START: ${action}`);

        try {
            // Generate text via API
            const text = await this.generateText(action, mode, timeRemaining, nextExercise, currentStep, totalSteps);
            console.log(`🎤 📝 TEXT GENERATED: "${text}"`);

            // Convert to speech via TTS API
            const audioUrl = await this.generateSpeech(text, action);
            console.log(`🎤 🔊 SPEECH GENERATED: Audio ready`);

            // Cache the audio for playback
            const cacheKey = this.getCacheKey(action, mode);
            const audio = new Audio(audioUrl);
            this.audioCache.set(cacheKey, audio);
            this.audioNext = audio;
            console.log(`🎤 💾 CACHED: ${cacheKey}`);

        } catch (error) {
            console.error(`🎤 ❌ GENERATE ERROR: ${action}`, error);
        }

        this.isGenerating = false;
    }

    private handlePlayAction(action: string, timeRemaining: number, mode: string): void {
        console.log(`🎤 🔊 PLAY START: ${action}`);

        // Stop any currently playing audio
        if (this.currentAudio) {
            this.currentAudio.pause();
        }

        // Use static audio file for Get Started action
        if (action === 'Play Get Started') {
            console.log(`🎤 🎵 PLAYING STATIC: Get Ready.mp3`);
            const audio = new Audio('/audio/Get Ready.mp3');
            this.playAudio(audio);
            return;
        }

        // Try to get cached audio first for other actions
        const cacheKey = this.getCacheKey(action, mode);
        let audio = this.audioCache.get(cacheKey) || this.audioNext;

        if (audio) {
            console.log(`🎤 💾 PLAYING CACHED: ${cacheKey}`);
            this.playAudio(audio);
        } else {
            console.log(`🎤 ⚠️ NO CACHE ${cacheKey}: Generating on-demand for ${action}`);
            this.generateAndPlayOnDemand(action, mode);
        }
    }

    private async generateText(action: string, mode: string, timeRemaining: number, nextExercise: string, currentStep: number, totalSteps: number): Promise<string> {
        const messageType = this.getMessageType(action, mode);
        
        const response = await fetch('/api/generate-pep-talk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                exerciseName: nextExercise,
                timeRemaining: timeRemaining,
                currentStep: currentStep,
                totalSteps: totalSteps,
                userName: 'Shahar',
                mode: mode,
                messageType: messageType
            }),
        });

        if (!response.ok) {
            throw new Error(`Text generation failed: ${response.status}`);
        }

        const data = await response.json();
        return data.text || this.getFallbackText(action);
    }

    private async generateSpeech(text: string, action: string): Promise<string> {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                context: {
                    exercise: this.debugInfo.exerciseName,
                    mode: this.debugInfo.mode,
                    timeRemaining: this.debugInfo.time
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`TTS generation failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        return URL.createObjectURL(audioBlob);
    }

    private playAudio(audio: HTMLAudioElement): void {
        audio.currentTime = 0;
        audio.volume = 0.8;
        audio.playbackRate = 1;
        
        audio.onended = () => {
            console.log(`🎤 ✅ PLAYBACK COMPLETE`);
            this.currentAudio = null;
        };

        audio.onerror = (error) => {
            console.error(`🎤 ❌ PLAYBACK ERROR:`, error);
            this.currentAudio = null;
        };

        audio.play().catch(error => {
            console.error(`🎤 ❌ PLAY FAILED:`, error);
        });

        this.currentAudio = audio;
    }

    private async generateAndPlayOnDemand(action: string, mode: string): Promise<void> {
        try {
            const text = await this.generateText(action, mode, this.debugInfo.time, this.debugInfo.nextExercise, this.debugInfo.currentStep, this.debugInfo.totalSteps);
            const audioUrl = await this.generateSpeech(text, action);
            const audio = new Audio(audioUrl);
            this.playAudio(audio);
        } catch (error) {
            console.error(`🎤 ❌ ON-DEMAND FAILED: ${action}`, error);
        }
    }

    private getCacheKey(action: string, mode: string): string {
        return `${mode}-${action}-${this.debugInfo.exerciseName}`.replace(/\s+/g, '-').toLowerCase();
    }

    private getMessageType(action: string, mode: string): string {
        if (action.includes('Get Started')) return 'instruction';
        if (action.includes('Start Workout')) return 'motivation';
        if (action.includes('Rest')) return 'rest-announcement';
        return 'general';
    }

    private getFallbackText(action: string): string {
        if (action.includes('Get Started')) return `Get ready for ${this.debugInfo.exerciseName}! Let's do this!`;
        if (action.includes('Start Workout')) return `Start ${this.debugInfo.exerciseName} now! You've got this!`;
        if (action.includes('Rest')) return `Take a break! Great job on ${this.debugInfo.exerciseName}!`;
        return 'Keep up the great work!';
    }
}