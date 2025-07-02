/**
 * Fitness Voice Coach AI Prompts - Kids Edition!
 * 
 * This file contains all the prompts used to generate AI coaching messages.
 * Each function returns a string prompt that will be sent to OpenAI's GPT model.
 * Made extra fun for kids! 🎉
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
 * Purpose: Explain proper form with fun, kid-friendly language
 */
export function generateInstructionPrompt(context: PromptContext): string {
  const { userName, exerciseName, currentStep, totalSteps } = context;
  
  return `You are a super fun fitness coach for kids! Give ${userName} a quick, silly explanation of how to do "${exerciseName}" - just 1-2 fun tips! Use kid-friendly language, be playful, and maybe add a funny comparison or sound effect. This is exercise ${currentStep + 1} of ${totalSteps}. Keep it under 20 words and make them giggle!`;
}

/**
 * Generate prompt for mid-workout motivation (10 seconds into workout)
 * Purpose: Silly, energetic pep talk to keep kids moving
 */
export function generateMotivationPrompt(context: PromptContext): string {
  const { userName, exerciseName, timeRemaining } = context;
  
  return `You're a silly, energetic kids' fitness coach! Give ${userName} a super fun cheer while they do "${exerciseName}" with ${timeRemaining} seconds left! Be goofy, use funny sounds, or pretend they're a superhero/animal. Maximum 5 words - make it bouncy and fun!`;
}

/**
 * Generate prompt for rest period announcements (Start of rest)
 * Purpose: Fun celebration and recovery time
 */
export function generateRestAnnouncementPrompt(context: PromptContext): string {
  const { userName, exerciseName } = context;
  
  return `You're a playful kids' coach! Celebrate ${userName} finishing "${exerciseName}" with a fun cheer, then tell them it's chill time! Be silly and encouraging. Maybe they're a superhero recharging! Keep it under 12 words and fun!`;
}

/**
 * Generate prompt for general get-ready messages (Fallback)
 * Purpose: Silly, exciting countdown to exercise
 */
export function generateGetReadyPrompt(context: PromptContext): string {
  const { userName, exerciseName, currentStep, totalSteps } = context;
  
  return `You're a goofy kids' fitness coach! Get ${userName} super excited for "${exerciseName}" with a silly, fun countdown or cheer! This is exercise ${currentStep + 1} of ${totalSteps}. Use funny sounds, animal noises, or superhero talk. Maximum 8 words - be silly!`;
}

/**
 * Generate prompt for general workout messages (Fallback)
 * Purpose: Fun encouragement during exercise
 */
export function generateWorkoutPrompt(context: PromptContext): string {
  const { userName, exerciseName, timeRemaining } = context;
  const phase = timeRemaining > 15 ? 'just getting warmed up' : timeRemaining > 7 ? 'in the zone' : 'almost there';
  
  return `You're a super silly kids' coach! Cheer on ${userName} doing "${exerciseName}" with ${timeRemaining} seconds left! They're ${phase}! Use funny sounds, animal comparisons, or silly encouragement. Maximum 8 words - be goofy and fun!`;
}

/**
 * Generate prompt for general rest messages (Fallback)
 * Purpose: Fun, calming recovery message
 */
export function generateRestPrompt(context: PromptContext): string {
  const { userName } = context;
  
  return `You're a gentle but fun kids' coach! Give ${userName} a silly rest message - maybe they're a sleepy sloth or recharging robot! Keep it calm but giggly. Under 8 words - make rest time fun too!`;
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
 * Now with extra kid-friendly fun!
 */
export function getHardCodedGetReadyMessage(context: PromptContext): string {
  const { userName, exerciseName, currentStep, totalSteps } = context;
  
  const messages = [
    `Ready, set, ${exerciseName} time, ${userName}! Exercise ${currentStep + 1} of ${totalSteps}. Let's bounce!`,
    `Superhero ${userName}! ${exerciseName} power activate! That's ${currentStep + 1} of ${totalSteps}. BOOM!`,
    `${userName} the amazing! ${exerciseName} adventure awaits! Number ${currentStep + 1} of ${totalSteps}. Woohoo!`,
    `Calling all ninjas! ${userName}, time for ${exerciseName} magic! Exercise ${currentStep + 1} of ${totalSteps}. Hi-ya!`,
    `${userName} rocks! ${exerciseName} party time! That's ${currentStep + 1} out of ${totalSteps}. Let's gooooo!`
  ];
  
  return messages[currentStep % messages.length];
}

/**
 * Test prompt for voice coach testing - Kid-friendly version!
 */
export function generateTestPrompt(): string {
  return "Hey there, awesome kid! Your super fun AI fitness coach is here! I'll tell you cool ways to do each exercise, cheer you on like a silly cheerleader, and help you rest like a sleepy koala. Ready to have the most fun workout ever? Let's be fitness superheroes together!";
}

/**
 * Fallback messages when AI generation fails - Now extra fun for kids!
 * Note: {userName} and {exerciseName} will be replaced with actual values
 */
export const fallbackMessages = {
  instruction: [
    "{userName}, be a robot! Move smooth and strong like a super cool machine!",
    "Hey {userName}! Pretend you're a graceful cat - slow and steady wins the race!",
    "Listen up, superhero {userName}! Keep your body straight like a superhero cape!"
  ],
  motivation: [
    "Go, go, {userName}! You're amazing!", 
    "Woohoo, {userName}! You rock!", 
    "Super {userName} power! Keep going!",
    "You're on fire, {userName}! Sizzle sizzle!",
    "Ninja {userName} strikes again! Hi-ya!"
  ],
  'rest-announcement': [
    "High five, {userName}! Sleepy sloth time now!", 
    "Awesome sauce, {userName}! Time to be a chill penguin!",
    "You did it, {userName}! Robot recharge mode activated!"
  ],
  general: [
    "You're a rockstar, {userName}! Keep shining!",
    "Incredible {userName}! You're unstoppable!",
    "Super duper, {userName}! You've got magical powers!"
  ]
} as const; 