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
}

export class TimerVoiceCoach {
    private static instance: TimerVoiceCoach;
    private isEnabled: boolean = true;
    private debugInfo: VoiceDebugInfo;
    private debugCallbacks: ((info: VoiceDebugInfo) => void)[] = [];
    private lastLoggedAction: string = '';

    private constructor() {
        console.log(`🎤 SIMPLE VOICE COACH: Initialized`);

        this.debugInfo = {
            time: 0,
            mode: 'get-ready',
            currentAction: 'Waiting',
            nextAction: 'None',
            exerciseName: '',
            nextExercise: '',
            actionLog: []
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

        const { timeRemaining, mode, exerciseName, nextExercise = 'None' } = options;

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

        // Determine current action based on mode and time
        this.debugInfo.currentAction = this.getCurrentAction(roundedTime, mode);
        this.debugInfo.nextAction = this.getNextAction(roundedTime, mode);

        // Enhanced console log with timing check
        console.log(`🎤 DEBUG: ${roundedTime}s (raw: ${timeRemaining}) | ${mode} | Current: ${this.debugInfo.currentAction} | Next: ${this.debugInfo.nextAction}`);

        // Update debug callbacks
        this.updateDebugInfo();
    }

            private getCurrentAction(timeRemaining: number, mode: string): string {
        let currentAction = '';
        let shouldLog = false;

        // Exact timing logic as specified
        if (timeRemaining === 8) {
            if (mode === 'get-ready') {
                currentAction = 'Generate Get Started Voice';
                shouldLog = true;
            } else if (mode === 'rest') {
                currentAction = 'Generate Rest Voice';
                shouldLog = true;
            } else if (mode === 'workout') {
                currentAction = 'Generate Mid Workout Voice';
                shouldLog = true;
            }
        } else if (timeRemaining === 18) {
            currentAction = 'Generate Mid Workout Voice';
            shouldLog = true;
        } else if (timeRemaining === 10) {
            if (mode === 'get-ready') {
                currentAction = 'Play Get Started';
                shouldLog = true;
            } else if (mode === 'rest') {
                currentAction = 'Play Rest';
                shouldLog = true;
            } else if (mode === 'workout') {
                currentAction = 'Play Mid Workout';
                shouldLog = true;
            }
        } else if (timeRemaining === 20) {
            currentAction = 'Play Start Workout';
            shouldLog = true;
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

        // Add to log if it's a trigger action and we haven't logged it yet
        if (shouldLog && this.lastLoggedAction !== currentAction) {
            this.addToActionLog(timeRemaining, mode, currentAction);
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
            } else if (action === 'Generate Mid Workout Voice') {
                enhancedAction = `Generate Mid Workout Voice for ${this.debugInfo.exerciseName}`;
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
        if (timeRemaining > 18) return 'Generate Mid Workout Voice at 18s';
        if (timeRemaining > 10) {
            if (mode === 'get-ready') return 'Play Get Started at 10s';
            if (mode === 'rest') return 'Play Rest at 10s';
            if (mode === 'workout') return 'Play Mid Workout at 10s';
        }
        if (timeRemaining > 8) {
            if (mode === 'get-ready') return 'Generate Get Started Voice at 8s';
            if (mode === 'rest') return 'Generate Rest Voice at 8s';
            if (mode === 'workout') return 'Generate Mid Workout Voice at 8s';
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
        this.debugInfo.time = 0;
        this.debugInfo.currentAction = 'Waiting';
        this.debugInfo.nextAction = 'None';
        this.debugInfo.actionLog = [];
        this.lastLoggedAction = '';
        this.updateDebugInfo();
    }

    stopSpeaking(): void {
        console.log(`🎤 VOICE COACH: Stop`);
    }
}