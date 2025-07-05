/**
 * Timer-Based Voice Coach System
 * 
 * This system watches the workout timer and plays/caches voice clips at specific intervals.
 * - Plays cached voice immediately when timer hits multiples of 10
 * - Generates next voice clip in background and caches it
 * - Uses pre-recorded audio files as fallback
 * - Provides detailed debug information
 */

export interface TimerVoiceOptions {
    exerciseName: string;
    mode: 'get-ready' | 'workout' | 'rest';
    currentStep: number;
    totalSteps: number;
    timeRemaining: number;
}

export interface VoiceDebugInfo {
    currentAction: string;
    nextAction: string;
    cacheStatus: 'empty' | 'loading' | 'ready';
    lastTriggerTime: number;
    audioStatus: 'idle' | 'playing' | 'error';
    generationStatus: 'idle' | 'generating' | 'ready' | 'error';
    queueSize: number;
}

export class TimerVoiceCoach {
    private static instance: TimerVoiceCoach;
    private isEnabled: boolean = true;
    private currentAudio: HTMLAudioElement | null = null;
    private cachedAudio: HTMLAudioElement | null = null;
    private isGenerating: boolean = false;
    private lastTriggerTime: number = -1;
    private debugInfo: VoiceDebugInfo;
    private debugCallbacks: ((info: VoiceDebugInfo) => void)[] = [];
    private isVoiceTriggered: boolean = false;

    // Pre-recorded audio files
    private audioFiles = {
        getReady: '/audio/Get Ready.mp3',
        // backgroundMusic: '/audio/Music2.mp3'
    };

    // Messages for different scenarios
    private motivationalMessages = {
        rest: [
            "Get ready for {exercise}! You've got this!",
            "Prepare yourself for {exercise}! Show your strength!",
            "Time for {exercise}! Let's make it count!",
            "Ready to rock {exercise}? Here we go!"
        ],
        midWorkout: [
            "Keep pushing! {seconds} seconds left!",
            "You're doing amazing! {seconds} more seconds!",
            "Strong work! Push through these {seconds} seconds!",
            "Don't stop now! {seconds} seconds to go!",
            "Perfect form! {seconds} seconds left!"
        ],
        startWorkout: [
            "Start {exercise}, let's go!",
            "It's {exercise} time, let's go!",
        ]
    };

    private constructor() {
        console.log(`🎤 INITIALIZATION: Creating TimerVoiceCoach instance`);

        this.debugInfo = {
            currentAction: 'Initializing',
            nextAction: 'Waiting for timer',
            cacheStatus: 'empty',
            lastTriggerTime: -1,
            audioStatus: 'idle',
            generationStatus: 'idle',
            queueSize: 0
        };

        console.log(`🎤 INITIALIZATION: Debug info initialized`);
        console.log(`🎤 INITIALIZATION: Pre-recorded audio files configured:`, this.audioFiles);

        this.updateDebugInfo();

        console.log(`🎤 INITIALIZATION: TimerVoiceCoach ready for use`);
    }

    static getInstance(): TimerVoiceCoach {
        if (!TimerVoiceCoach.instance) {
            console.log(`🎤 SINGLETON: Creating new TimerVoiceCoach instance`);
            TimerVoiceCoach.instance = new TimerVoiceCoach();
        } else {
            console.log(`🎤 SINGLETON: Returning existing TimerVoiceCoach instance`);
        }
        return TimerVoiceCoach.instance;
    }

    setEnabled(enabled: boolean): void {
        const previousState = this.isEnabled;
        this.isEnabled = enabled;

        console.log(`🎤 STATE CHANGE: Voice Coach ${enabled ? 'ENABLED' : 'DISABLED'} (was ${previousState ? 'enabled' : 'disabled'})`);

        if (!enabled) {
            console.log(`🎤 DISABLE: Stopping all audio activities`);
            this.stopCurrentAudio();
            this.debugInfo.currentAction = 'Disabled';
            this.debugInfo.nextAction = 'Waiting to be enabled';
            this.updateDebugInfo();
        } else {
            console.log(`🎤 ENABLE: Voice Coach ready to watch timer`);
            this.debugInfo.currentAction = 'Enabled';
            this.debugInfo.nextAction = 'Watching timer';
            this.updateDebugInfo();
        }
    }

    // Main timer watching function - called every second
    onTimerUpdate(options: TimerVoiceOptions): void {
        if (!this.isEnabled) return;

        const { timeRemaining, mode, exerciseName } = options;

        // Check if we should trigger voice (every 10 seconds)
        if (this.shouldTriggerVoice(timeRemaining)) {
            this.isVoiceTriggered = true;
            console.log(`🎤 TIMER TRIGGER: ${timeRemaining} seconds remaining for ${exerciseName} in ${mode} mode`);
            this.triggerVoice(options);
            setTimeout(() => {
                this.isVoiceTriggered = false;
            }, 8000);
        }

        // Update debug info
        // this.debugInfo.nextAction = this.getNextAction(timeRemaining);
        this.updateDebugInfo();
    }

    private shouldTriggerVoice(timeRemaining: number): boolean {
        // Trigger at multiples of 10 (10, 20, 30, etc.) but not if we just triggered
        if (this.isVoiceTriggered) {
            return false;
        }
        const isMultipleOf10 = timeRemaining % 10 === 0 && timeRemaining > 0;
        const isDifferentFromLast = timeRemaining !== this.lastTriggerTime;

        if (isMultipleOf10 && isDifferentFromLast) {
            console.log(`🎤 TRIGGER CONDITIONS MET: ${timeRemaining}s is multiple of 10, different from last trigger (${this.lastTriggerTime}s)`);
        }

        return isMultipleOf10 && isDifferentFromLast;
    }

    private triggerVoice(options: TimerVoiceOptions): void {
        this.lastTriggerTime = options.timeRemaining;
        this.debugInfo.lastTriggerTime = options.timeRemaining;

        console.log(`🎤 ===============================================`);
        console.log(`🎤 VOICE TRIGGER EVENT`);
        console.log(`🎤 Exercise: ${options.exerciseName}`);
        console.log(`🎤 Mode: ${options.mode}`);
        console.log(`🎤 Time Remaining: ${options.timeRemaining} seconds`);
        console.log(`🎤 Current Step: ${options.currentStep}/${options.totalSteps}`);
        console.log(`🎤 ===============================================`);

        // Step 1: Play cached audio immediately (or fallback to pre-recorded)
        console.log(`🎤 STEP 1: Playing current audio for ${options.exerciseName}`);
        this.playCurrentAudio(options);

        // Step 2: Generate next voice clip in background
        console.log(`🎤 STEP 2: Starting background generation for next voice clip`);
        this.generateNextVoiceClip(options);
    }

    private playCurrentAudio(options: TimerVoiceOptions): void {
        console.log(`🎤 AUDIO PLAYBACK: Starting playback for ${options.exerciseName} in ${options.mode} mode`);

        // Stop any currently playing audio
        this.stopCurrentAudio();

        this.debugInfo.currentAction = `Playing audio for ${options.exerciseName}`;
        this.debugInfo.audioStatus = 'playing';
        this.updateDebugInfo();

        // Use cached audio if available, otherwise use pre-recorded
        const audioToPlay = this.cachedAudio || this.getPreRecordedAudio(options);

        if (audioToPlay) {
            const audioType = this.cachedAudio ? 'CACHED GENERATED' : 'PRE-RECORDED FALLBACK';
            console.log(`🎤 AUDIO SOURCE: Using ${audioType} audio for ${options.exerciseName}`);

            audioToPlay.currentTime = 0;
            audioToPlay.volume = 0.8;

            audioToPlay.onended = () => {
                console.log(`🎤 AUDIO COMPLETED: Finished playing audio for ${options.exerciseName}`);
                this.debugInfo.audioStatus = 'idle';
                this.updateDebugInfo();
            };

            audioToPlay.onerror = (error) => {
                console.error(`🎤 AUDIO ERROR: Failed to play audio for ${options.exerciseName}:`, error);
                this.debugInfo.audioStatus = 'error';
                this.updateDebugInfo();
            };

            console.log(`🎤 AUDIO STARTED: Playing ${audioType} audio for ${options.exerciseName}`);
            audioToPlay.play().catch(error => {
                console.error(`🎤 AUDIO PLAY ERROR: Could not start audio for ${options.exerciseName}:`, error);
                this.debugInfo.audioStatus = 'error';
                this.updateDebugInfo();
            });

            this.currentAudio = audioToPlay;
        } else {
            console.error(`🎤 AUDIO ERROR: No audio available for ${options.exerciseName} in ${options.mode} mode`);
            this.debugInfo.audioStatus = 'error';
            this.updateDebugInfo();
        }
    }

    private getPreRecordedAudio(options: TimerVoiceOptions): HTMLAudioElement | null {
        console.log(`🎤 PRE-RECORDED AUDIO: Loading fallback audio for ${options.exerciseName} in ${options.mode} mode`);

        let audioFile: string;

        switch (options.mode) {
            case 'get-ready':
                audioFile = this.audioFiles.getReady;
                console.log(`🎤 AUDIO SELECTION: Using "Get Ready" audio for ${options.exerciseName}`);
                break;
            default:
                console.log(`🎤 AUDIO SELECTION: Using default "Get Ready" audio for ${options.exerciseName}`);
                return null
        }

        try {
            const audio = new Audio(audioFile);
            console.log(`🎤 AUDIO LOADED: Successfully loaded ${audioFile} for ${options.exerciseName}`);
            return audio;
        } catch (error) {
            console.error(`🎤 AUDIO LOAD ERROR: Failed to load ${audioFile} for ${options.exerciseName}:`, error);
            return null;
        }
    }

    private generateNextVoiceClip(options: TimerVoiceOptions): void {
        if (this.isGenerating) {
            // console.log(`🎤 GENERATION SKIP: Already generating voice clip for ${options.exerciseName}, skipping new generation`);
            return;
        }

        console.log(`🎤 GENERATION START: Beginning voice generation for ${options.exerciseName} in ${options.mode} mode`);
        console.log(`🎤 GENERATION CONTEXT: ${options.timeRemaining} seconds remaining, step ${options.currentStep}/${options.totalSteps}`);

        this.isGenerating = true;
        this.debugInfo.generationStatus = 'generating';
        this.debugInfo.cacheStatus = 'loading';
        this.debugInfo.currentAction = `Generating voice for ${options.exerciseName}`;
        this.updateDebugInfo();

        // Generate text for next voice clip
        console.log(`🎤 TEXT GENERATION: Creating motivational text for ${options.exerciseName}`);
        this.generateNextText(options).then(async (nextText) => {
            console.log(`🎤 TEXT GENERATED: "${nextText}"`);
            console.log(`🎤 TEXT CONTEXT: Generated for ${options.exerciseName} in ${options.mode} mode with ${options.timeRemaining}s remaining`);
            
            await this.generateVoiceFromText(nextText, options);
        }).catch(error => {
            console.error(`🎤 TEXT GENERATION FAILED: Error in text generation pipeline for ${options.exerciseName}:`, error);
            this.isGenerating = false;
            this.debugInfo.generationStatus = 'error';
            this.debugInfo.cacheStatus = 'empty';
            this.debugInfo.currentAction = `Text generation failed for ${options.exerciseName}`;
            this.updateDebugInfo();
        });
    }

    private async generateNextText(options: TimerVoiceOptions): Promise<string> {
        const { mode, exerciseName, timeRemaining } = options;

        console.log(`🎤 TEXT CREATION: Generating AI text for ${exerciseName} in ${mode} mode`);

        const messageType = this.getMessageType(mode);
        console.log(`🎤 AI API CALL: Using messageType "${messageType}" for ${exerciseName}`);
        console.log(`🎤 AI API CONTEXT: ${exerciseName}, ${timeRemaining}s remaining, step ${options.currentStep}/${options.totalSteps}`);

        try {
            // Call OpenAI API using existing endpoint structure
            const response = await fetch('/api/generate-pep-talk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exerciseName: exerciseName,
                    timeRemaining: timeRemaining,
                    currentStep: options.currentStep,
                    totalSteps: options.totalSteps,
                    userName: 'Athlete', // Generic name for voice coaching
                    mode: mode,
                    messageType: messageType
                }),
            });

            console.log(`🎤 AI API RESPONSE: Status ${response.status} for ${exerciseName}`);

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const generatedText = data.text || '';

            if (!generatedText) {
                throw new Error('No text generated from OpenAI');
            }

            console.log(`🎤 AI TEXT GENERATED: "${generatedText}"`);
            console.log(`🎤 AI TEXT SUCCESS: Generated ${messageType} message for ${exerciseName} in ${mode} mode`);

            return generatedText;

        } catch (error) {
            console.error(`🎤 AI TEXT ERROR: Failed to generate text for ${exerciseName}:`, error);
            console.log(`🎤 AI TEXT FALLBACK: Using pre-defined message for ${exerciseName}`);

            // Fallback to pre-defined messages
            return this.getFallbackText(options);
        }
    }

    private getMessageType(mode: 'get-ready' | 'workout' | 'rest'): 'instruction' | 'motivation' | 'rest-announcement' | 'general' {
        switch (mode) {
            case 'get-ready':
            case 'rest':
                return 'instruction';
            case 'workout':
                return 'rest-announcement';
                // return 'motivation';
            default:
                return 'general';
        }
    }

    private getFallbackText(options: TimerVoiceOptions): string {
        const { mode, exerciseName, timeRemaining } = options;

        console.log(`🎤 FALLBACK TEXT: Using pre-defined message for ${exerciseName} in ${mode} mode`);

        let messages: string[];
        let messageCategory: string;

        switch (mode) {
            case 'get-ready':
                messages = this.motivationalMessages.rest; // Using 'rest' as renamed to 'get-ready' messages
                messageCategory = 'Get Ready';
                break;
            case 'workout':
                messages = this.motivationalMessages.midWorkout; // Using 'midWorkout' as renamed
                messageCategory = 'Workout Motivation';
                break;
            case 'rest':
                messages = this.motivationalMessages.startWorkout; // Using 'startWorkout' as renamed
                messageCategory = 'Rest Period';
                break;
            default:
                messages = this.motivationalMessages.midWorkout;
                messageCategory = 'Default Workout';
        }

        console.log(`🎤 FALLBACK CATEGORY: Selected ${messageCategory} messages for ${exerciseName}`);

        // Pick a random message
        const template = messages[Math.floor(Math.random() * messages.length)];
        console.log(`🎤 FALLBACK TEMPLATE: Selected template "${template}" for ${exerciseName}`);

        // Replace placeholders
        const nextTriggerTime = Math.max(0, timeRemaining - 10);
        const text = template
            .replace('{exercise}', exerciseName)
            .replace('{seconds}', String(nextTriggerTime));

        console.log(`🎤 FALLBACK PROCESSING: Replaced {exercise} with "${exerciseName}" and {seconds} with "${nextTriggerTime}"`);
        console.log(`🎤 FALLBACK FINAL: "${text}"`);

        return text;
    }

    private async generateVoiceFromText(text: string, options: TimerVoiceOptions): Promise<void> {
        console.log(`🎤 ===============================================`);
        console.log(`🎤 VOICE GENERATION START`);
        console.log(`🎤 Exercise: ${options.exerciseName}`);
        console.log(`🎤 Mode: ${options.mode}`);
        console.log(`🎤 Text: "${text}"`);
        console.log(`🎤 Context: ${options.mode} voice for ${options.exerciseName}`);
        console.log(`🎤 ===============================================`);
        
        try {
            // ElevenLabs API call
            console.log(`🎤 ELEVENLABS API: Starting TTS generation for "${text}"`);
            
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    context: {
                        exercise: options.exerciseName,
                        mode: options.mode,
                        timeRemaining: options.timeRemaining
                    }
                }),
            });
            
            console.log(`🎤 ELEVENLABS API: Response status ${response.status} for "${text}"`);
            
            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
            }
            
            // Get the audio blob from the response
            const audioBlob = await response.blob();
            console.log(`🎤 ELEVENLABS SUCCESS: Generated audio blob (${audioBlob.size} bytes) for "${text}"`);
            
            // Convert blob to audio URL
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log(`🎤 AUDIO URL: Created audio URL for "${text}"`);
            
            // Create audio element from the generated voice
            const generatedAudio = new Audio(audioUrl);
            
            // Set up audio event handlers
            generatedAudio.onloadeddata = () => {
                console.log(`🎤 AUDIO LOADED: Generated audio ready for "${text}"`);
            };
            
            generatedAudio.onerror = (error) => {
                console.error(`🎤 AUDIO LOAD ERROR: Failed to load generated audio for "${text}":`, error);
            };
            
            // Cache the generated audio
            this.cachedAudio = generatedAudio;
            
            console.log(`🎤 CACHE SUCCESS: ElevenLabs voice cached for ${options.exerciseName}`);
            console.log(`🎤 CACHE READY: Next trigger will use ElevenLabs generated voice for ${options.exerciseName}`);
            
            this.debugInfo.cacheStatus = 'ready';
            this.debugInfo.generationStatus = 'ready';
            this.debugInfo.currentAction = `ElevenLabs voice ready for ${options.exerciseName}`;
            
        } catch (error) {
            console.error(`🎤 ELEVENLABS ERROR: Failed to generate voice for "${text}":`, error);
            console.log(`🎤 ELEVENLABS FALLBACK: Using pre-recorded audio for ${options.exerciseName}`);
            
            // Fallback to pre-recorded audio
            const fallbackAudio = this.getPreRecordedAudio(options);
            
            if (fallbackAudio) {
                this.cachedAudio = fallbackAudio;
                
                console.log(`🎤 FALLBACK SUCCESS: Pre-recorded audio cached for ${options.exerciseName}`);
                this.debugInfo.cacheStatus = 'ready';
                this.debugInfo.generationStatus = 'ready';
                this.debugInfo.currentAction = `Fallback audio ready for ${options.exerciseName}`;
            } else {
                console.error(`🎤 FALLBACK FAILED: No fallback audio available for ${options.exerciseName}`);
                this.debugInfo.cacheStatus = 'empty';
                this.debugInfo.generationStatus = 'error';
                this.debugInfo.currentAction = `Generation failed for ${options.exerciseName}`;
            }
        }
        
        this.isGenerating = false;
        this.updateDebugInfo();
        
        console.log(`🎤 GENERATION CYCLE COMPLETE: Ready for next trigger for ${options.exerciseName}`);
    }

    private stopCurrentAudio(): void {
        if (this.currentAudio) {
            console.log(`🎤 AUDIO STOP: Stopping currently playing audio`);
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
            console.log(`🎤 AUDIO STOP: Audio stopped and cleared`);
        } else {
            console.log(`🎤 AUDIO STOP: No audio currently playing`);
        }
    }

    private getNextAction(timeRemaining: number): string {
        if (!this.isEnabled) {
            console.log(`🎤 NEXT ACTION: Voice Coach disabled`);
            return 'Disabled';
        }

        const nextTrigger = Math.floor(timeRemaining / 10) * 10;
        let action: string;

        if (nextTrigger === timeRemaining) {
            action = 'Triggering now';
            console.log(`🎤 NEXT ACTION: Triggering now at ${timeRemaining}s`);
        } else if (nextTrigger > 0) {
            action = `Next trigger at ${nextTrigger}s`;
            console.log(`🎤 NEXT ACTION: Next trigger scheduled for ${nextTrigger}s (currently ${timeRemaining}s)`);
        } else {
            action = 'Waiting for next workout';
            console.log(`🎤 NEXT ACTION: Waiting for next workout (timer at ${timeRemaining}s)`);
        }

        return action;
    }

    // Debug information management
    private updateDebugInfo(): void {
        // console.log(`🎤 DEBUG UPDATE: Broadcasting debug info to ${this.debugCallbacks.length} callbacks`);
        this.debugCallbacks.forEach(callback => callback(this.debugInfo));
    }

    onDebugUpdate(callback: (info: VoiceDebugInfo) => void): void {
        this.debugCallbacks.push(callback);
        // console.log(`🎤 DEBUG CALLBACK: Added debug callback (total: ${this.debugCallbacks.length})`);
    }

    getDebugInfo(): VoiceDebugInfo {
        // console.log(`🎤 DEBUG INFO: Returning current debug info:`, this.debugInfo);
        return { ...this.debugInfo };
    }

    // Public methods for external control
    stopSpeaking(): void {
        console.error(`🎤 CONTROL: stopSpeaking() called`);
        console.log(`🎤 CONTROL: Stopping all voice activities`);

        this.stopCurrentAudio();

        this.debugInfo.currentAction = 'Stopped';
        this.debugInfo.audioStatus = 'idle';
        this.updateDebugInfo();

        console.log(`🎤 CONTROL: All voice activities stopped`);
    }

    reset(): void {
        console.log(`🎤 CONTROL: reset() called`);
        console.log(`🎤 RESET: Resetting voice coach to initial state`);

        this.stopCurrentAudio();

        if (this.cachedAudio) {
            console.log(`🎤 RESET: Clearing cached audio`);
            this.cachedAudio = null;
        }

        this.isGenerating = false;
        this.lastTriggerTime = -1;

        this.debugInfo = {
            currentAction: 'Reset',
            nextAction: 'Waiting for timer',
            cacheStatus: 'empty',
            lastTriggerTime: -1,
            audioStatus: 'idle',
            generationStatus: 'idle',
            queueSize: 0
        };

        this.updateDebugInfo();

        console.log(`🎤 RESET: Voice coach reset complete`);
    }
}

export default TimerVoiceCoach; 