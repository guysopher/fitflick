# Fitness Voice Coach Setup Guide

## Overview
The Fitness Voice Coach uses OpenAI's GPT-4o-mini model to generate personalized motivational messages for Shahar during workouts, and uses OpenAI's high-quality Text-to-Speech API to deliver them with natural, professional-sounding voice.

## Features
- **Personalized Pep Talks**: AI-generated motivational messages tailored to the current exercise, time remaining, and workout phase
- **Professional Voice Quality**: Uses OpenAI's TTS API with "Nova" voice for natural, energetic coaching tone
- **Smart Timing**: Delivers pep talks every 6-8 seconds during workouts, with immediate encouragement during transitions
- **Voice Control**: Toggle the voice coach on/off with the microphone button in the workout player
- **Intelligent Fallback**: Falls back to browser speech synthesis if OpenAI TTS fails, ensuring continuous motivation
- **Adaptive Messaging**: Different message styles for get-ready, workout, and rest phases

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

## Usage

1. **Start a Workout**: Navigate to the workout of the day and start any exercise
2. **Voice Coach Controls**: 
   - 🎤 Green microphone icon = Voice coach is ON
   - 🔇 Muted icon = Voice coach is OFF
   - Click the microphone button to toggle
3. **First Time Setup**: Your browser may ask for permission to use text-to-speech
4. **Voice Selection**: The system automatically selects the best available English voice

## Customization

### Changing the User Name
Edit the `userName` parameter in the `PepTalkOptions` calls in `FitnessCalendarApp.tsx`:

```typescript
const pepTalkOptions: PepTalkOptions = {
  // ... other options
  userName: 'YourName', // Change from 'Shahar' to your preferred name
  // ... other options
};
```

### Adjusting Pep Talk Frequency
In `fitnessVoiceCoach.ts`, modify the `pepTalkInterval`:

```typescript
private pepTalkInterval: number = 8000; // 8 seconds (adjust as needed)
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