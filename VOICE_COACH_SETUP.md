# Fitness Voice Coach Setup Guide

## Overview
The Fitness Voice Coach uses OpenAI's GPT-4o-mini model to generate personalized motivational messages for Shahar during workouts, and uses OpenAI's high-quality Text-to-Speech API to deliver them with natural, professional-sounding voice.

## Features
- **Lag-Free Performance**: Smart pre-generation system eliminates voice delays
- **Structured Coaching**: Four-phase coaching system with specific timing and messaging
- **Instant Get-Ready**: Hard-coded messages for immediate feedback (zero lag)
- **Pre-Generated Audio**: Instructions and motivation pre-created during get-ready phase
- **Exercise Instructions**: Detailed form and technique guidance at the start of each exercise
- **Motivational Support**: Mid-workout pep talks delivered 10 seconds into each exercise
- **Rest Guidance**: Supportive rest announcements when break periods begin
- **Professional Voice Quality**: Uses OpenAI's TTS API with "Nova" voice for natural, energetic coaching tone
- **Voice Control**: Toggle the voice coach on/off with the microphone button in the workout player
- **Intelligent Fallback**: Falls back to browser speech synthesis if OpenAI TTS fails, ensuring continuous motivation
- **Smart Caching**: Audio caching system prevents repeated generation of the same messages

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the API key (starts with `sk-`)

### 2. Configure Environment Variables
Create a `.env.local` file in the `fitflick/` directory and add:

```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_actual_api_key_here
```

**Important Security Notes:**
- Never commit your API key to version control
- The `NEXT_PUBLIC_` prefix makes this available in the browser
- For production apps, consider using server-side API routes instead

### 3. Install Dependencies
```bash
cd fitflick
npm install
```

### 4. Run the Application
```bash
npm run dev
```

## Coaching Structure

The voice coach follows a structured three-phase approach for each exercise:

### 📋 **Phase 1: Get Ready (Instant)**
- **When**: At the beginning of each exercise during the "Get Ready" countdown
- **Purpose**: Quick motivation to prepare for the exercise (hard-coded for zero lag)
- **Example**: *"Get ready, Shahar! Time for Push Ups. This is exercise 3 of 12. Let's do this!"*

### 🎯 **Phase 2: Exercise Instructions (Start of Workout)**
- **When**: Immediately when workout begins (pre-generated during get-ready phase)
- **Purpose**: Explains proper form, technique, and safety tips
- **Example**: *"Shahar, for Push Ups: Keep your core engaged, lower your chest to the floor with control, and push back up. Focus on quality over speed!"*

### 💪 **Phase 3: Mid-Workout Motivation (10 seconds in)**
- **When**: Exactly 10 seconds into each exercise (pre-generated during get-ready phase)
- **Purpose**: Energetic pep talk to keep you motivated
- **Example**: *"Great form, Shahar! Feel that strength building - you've got this!"*

### 😌 **Phase 4: Rest Announcement (Rest Period)**
- **When**: At the start of each rest period
- **Purpose**: Acknowledge completion and guide recovery
- **Example**: *"Excellent work, Shahar! Time to breathe and recover. Get ready for what's next!"*

## Performance Optimization

### 🚀 **Zero-Lag System**
The voice coach uses an intelligent pre-generation system to eliminate delays:

1. **🏃‍♂️ Instant Get-Ready**: Hard-coded messages play immediately
2. **⚡ Background Generation**: While get-ready plays, AI generates upcoming messages
3. **📦 Smart Caching**: Generated audio is cached for instant playback
4. **🎯 Perfect Timing**: All voice coaching happens at the exact right moment

### 🔄 **Pre-Generation Timeline**
```
Get-Ready Phase (10s):  [Play hard-coded message] + [Generate instruction] + [Generate motivation]
Workout Start (0s):     [Play pre-generated instruction]
Workout 10s:            [Play pre-generated motivation]
Rest Phase:             [Play rest announcement]
```

This system ensures that every voice message plays instantly without any lag!

## Usage

1. **Start a Workout**: Navigate to the workout of the day and start any exercise
2. **Voice Coach Controls**: 
   - 🎤 Green microphone icon = Voice coach is ON
   - 🔇 Muted icon = Voice coach is OFF
   - Click the microphone button to toggle
3. **First Time Setup**: Your browser may ask for permission to use text-to-speech
4. **Experience the Structure**: Each exercise will follow the three-phase coaching pattern above

## Customization

### Customizing AI Prompts
All AI prompts are centralized in `src/services/fitnessCoachPrompts.ts` for easy review and modification:

```typescript
// Edit these functions to customize the AI coaching style
export function generateInstructionPrompt(context: PromptContext): string {
  // Modify this prompt for exercise instructions
}

export function generateMotivationPrompt(context: PromptContext): string {
  // Modify this prompt for mid-workout motivation
}

export function generateRestAnnouncementPrompt(context: PromptContext): string {
  // Modify this prompt for rest period announcements
}
```

### Changing the User Name
Edit the `userName` parameter in the `PepTalkOptions` calls in `FitnessCalendarApp.tsx`:

```typescript
const pepTalkOptions: PepTalkOptions = {
  // ... other options
  userName: 'YourName', // Change from 'Shahar' to your preferred name
  // ... other options
};
```

### Adjusting Motivation Timing
In `FitnessCalendarApp.tsx`, modify the motivation delay:

```typescript
}, 10000); // 10 seconds delay - change this value to adjust timing
```

### Voice Settings
In `fitnessVoiceCoach.ts`, adjust OpenAI TTS parameters:

```typescript
const response = await openai.audio.speech.create({
  model: 'tts-1', // Use 'tts-1-hd' for higher quality (slower)
  voice: 'nova', // Options: alloy, echo, fable, onyx, nova, shimmer
  speed: 1.1, // Speech speed (0.25 to 4.0)
});
```

Voice personality guide:
- **alloy**: Neutral, balanced
- **echo**: Male, clear
- **fable**: British accent, expressive
- **onyx**: Male, deep, authoritative
- **nova**: Female, energetic (current choice)
- **shimmer**: Female, soft, gentle

## Troubleshooting

### No Voice Output
- Check if your browser supports Speech Synthesis API
- Ensure your device volume is turned up
- Try clicking the microphone button to toggle off and on
- Check browser console for any error messages

### API Errors
- Verify your OpenAI API key is correct
- Check that you have credits in your OpenAI account
- Ensure the `.env.local` file is in the correct location
- Restart the development server after adding environment variables

### Voice Quality
- Uses OpenAI's "Nova" voice for natural, energetic coaching tone
- Falls back to browser's built-in speech synthesis if OpenAI TTS fails
- You can change the voice by modifying the `voice` parameter in the `speakText()` method
- Available OpenAI voices: alloy, echo, fable, onyx, nova, shimmer

## Cost Considerations
- Each pep talk uses two OpenAI API calls:
  - Text generation: ~500 tokens (GPT-4o-mini)
  - Text-to-speech: ~1-2 sentences of audio
- A typical 20-minute workout might generate 40-60 pep talks
- Estimated cost: ~$0.05-0.10 per workout (very affordable)
- Fallback to free browser speech synthesis if API is unavailable

## Browser Compatibility
- **Chrome/Edge**: Full support with high-quality voices
- **Safari**: Good support with system voices
- **Firefox**: Basic support, may have limited voice options
- **Mobile**: Works on iOS Safari and Android Chrome 