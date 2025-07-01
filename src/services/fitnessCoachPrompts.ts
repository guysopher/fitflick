/**
 * Fitness Voice Coach AI Prompts
 * 
 * This file contains all the prompts used to generate AI coaching messages.
 * Each function returns a string prompt that will be sent to OpenAI's GPT model.
 */

export interface PromptContext {
  userName: string;
  exerciseName: string;
  timeRemaining: number;
  currentStep: number;
  totalSteps: number;
}

/**
 * Generate prompt for exercise instructions (Get Ready phase)
 * Purpose: Explain proper form, technique, and safety tips
 */
export function generateInstructionPrompt(context: PromptContext): string {
  const { userName, exerciseName, currentStep, totalSteps } = context;
  
  return `You are a professional fitness coach. Explain to ${userName} how to perform the "${exerciseName}" exercise correctly. Focus on proper form, technique, and any important safety tips. Keep it concise but informative (2-3 sentences max). Be encouraging and clear. This is exercise ${currentStep + 1} of ${totalSteps}.`;
}

/**
 * Generate prompt for mid-workout motivation (10 seconds into workout)
 * Purpose: Energetic pep talk to maintain motivation and focus
 */
export function generateMotivationPrompt(context: PromptContext): string {
  const { userName, exerciseName, timeRemaining } = context;
  
  return `You are an energetic fitness coach. Generate a motivational pep talk for ${userName} who is currently doing "${exerciseName}" with ${timeRemaining} seconds remaining. Be encouraging, energetic, and supportive. Focus on pushing through, good form, or breathing. Keep it brief and punchy (1-2 sentences max)!`;
}

/**
 * Generate prompt for rest period announcements (Start of rest)
 * Purpose: Acknowledge completion and guide recovery
 */
export function generateRestAnnouncementPrompt(context: PromptContext): string {
  const { userName, exerciseName } = context;
  
  return `You are a supportive fitness coach. Announce to ${userName} that it's time to rest after completing "${exerciseName}". Encourage them to breathe, recover, and prepare for the next exercise. Keep it calm but motivating (1-2 sentences max).`;
}

/**
 * Generate prompt for general get-ready messages (Fallback)
 * Purpose: General motivational message when starting an exercise
 */
export function generateGetReadyPrompt(context: PromptContext): string {
  const { userName, exerciseName, currentStep, totalSteps } = context;
  
  return `You are an energetic fitness coach. Generate a very short (1-2 sentences max) motivational message to get ${userName} ready for the "${exerciseName}" exercise. This is exercise ${currentStep + 1} of ${totalSteps}. Be encouraging and positive. Keep it brief and punchy!`;
}

/**
 * Generate prompt for general workout messages (Fallback)
 * Purpose: General motivational message during workout
 */
export function generateWorkoutPrompt(context: PromptContext): string {
  const { userName, exerciseName, timeRemaining } = context;
  const phase = timeRemaining > 15 ? 'beginning' : timeRemaining > 7 ? 'middle' : 'final push';
  
  return `You are an energetic fitness coach. Generate a very short (1-2 sentences max) motivational message for ${userName} who is currently doing "${exerciseName}" with ${timeRemaining} seconds remaining. This is the ${phase} phase. Be encouraging, energetic, and supportive. Focus on form, breathing, or pushing through. Keep it brief!`;
}

/**
 * Generate prompt for general rest messages (Fallback)
 * Purpose: General rest and recovery message
 */
export function generateRestPrompt(context: PromptContext): string {
  const { userName } = context;
  
  return `You are a supportive fitness coach. Generate a very short (1-2 sentences max) recovery message for ${userName} during their rest period. Encourage them to breathe, stay hydrated, and prepare for the next exercise. Keep it calm but motivating and brief!`;
}

/**
 * All prompt generators organized by message type
 */
export const promptGenerators = {
  instruction: generateInstructionPrompt,
  motivation: generateMotivationPrompt,
  'rest-announcement': generateRestAnnouncementPrompt,
  'get-ready': generateGetReadyPrompt,
  workout: generateWorkoutPrompt,
  rest: generateRestPrompt,
} as const;

/**
 * Hard-coded "Get Ready" messages for immediate playback (no AI generation delay)
 */
export function getHardCodedGetReadyMessage(context: PromptContext): string {
  const { userName, exerciseName, currentStep, totalSteps } = context;
  
  const messages = [
    `Get ready, ${userName}! Time for ${exerciseName}. This is exercise ${currentStep + 1} of ${totalSteps}. Let's do this!`,
    `${userName}, prepare for ${exerciseName}! Exercise ${currentStep + 1} of ${totalSteps}. Focus and breathe!`,
    `Ready, ${userName}? ${exerciseName} is up next. That's ${currentStep + 1} out of ${totalSteps}. You've got this!`,
    `Time to shine, ${userName}! ${exerciseName} coming up - exercise ${currentStep + 1} of ${totalSteps}. Let's go!`,
    `${userName}, gear up for ${exerciseName}! Number ${currentStep + 1} of ${totalSteps}. Show me what you've got!`
  ];
  
  return messages[currentStep % messages.length];
}

/**
 * Test prompt for voice coach testing
 */
export function generateTestPrompt(): string {
  return "Hey Shahar! Your AI fitness coach is here with a crystal-clear, natural voice. I'll explain each exercise, motivate you during your workout, and guide you through your rest periods. Ready to crush those fitness goals together?";
}

/**
 * Fallback messages when AI generation fails
 * Note: {userName} and {exerciseName} will be replaced with actual values
 */
export const fallbackMessages = {
  instruction: [
    "{userName}, focus on proper form and controlled movements. Keep your core engaged and breathe steadily throughout the exercise.",
    "Time for proper form, {userName}! Remember to maintain good posture and move with control. Quality over speed!",
    "Let's do this right, {userName}. Focus on the target muscles and keep your breathing steady."
  ],
  motivation: [
    "Push it, {userName}! You've got this!", 
    "Great form, {userName}! Keep it up!", 
    "Stay strong, {userName}! Every rep counts!",
    "Feel that burn, {userName}! That's progress happening!",
    "You're crushing it, {userName}! Keep going!"
  ],
  'rest-announcement': [
    "Great work, {userName}! Time to rest and recover.", 
    "Excellent job, {userName}! Take this time to breathe and reset.",
    "Well done, {userName}! Use this rest to prepare for what's next."
  ],
  general: [
    "Great job, {userName}! Keep pushing yourself!",
    "You're doing amazing, {userName}! Stay focused!",
    "Keep it up, {userName}! You've got this!"
  ]
} as const; 