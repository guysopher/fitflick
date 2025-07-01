#!/bin/bash

# Setup script for Fitness Voice Coach with ElevenLabs TTS
echo "🎯 Fitness Voice Coach Setup (OpenAI + ElevenLabs)"
echo "================================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists."
    echo "   Please manually add your API keys to it:"
    echo "   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here"
    echo "   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here"
    echo ""
else
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# OpenAI API Configuration for text generation
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Configuration for premium voice synthesis
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Replace the placeholder values with your actual API keys:
# OpenAI key from: https://platform.openai.com/account/api-keys
# ElevenLabs key from: https://elevenlabs.io/app/speech-synthesis/text-to-speech
EOF
    echo "✅ .env.local file created!"
    echo ""
fi

echo "🔧 Next Steps:"
echo "1. Get your OpenAI API key from: https://platform.openai.com/account/api-keys"
echo "2. Get your ElevenLabs API key from: https://elevenlabs.io/app/speech-synthesis/text-to-speech"
echo "3. Replace the placeholder values in .env.local with your actual API keys"
echo "4. Restart the development server: npm run dev"
echo "5. Test the voice coach using the green voice button in the workout screen"
echo ""
echo "💡 Tips:"
echo "   - ElevenLabs provides superior voice quality compared to OpenAI TTS"
echo "   - You can customize the voice by changing the voiceId in fitnessVoiceCoach.ts"
echo "   - Make sure your browser volume is turned up"
echo "   - Both APIs are required for full functionality"
echo ""
echo "🎙️ Voice Options (you can change these in the code):"
echo "   - Adam (pNInz6obpgDQGcFmaJgB): Energetic male - great for fitness!"
echo "   - Bella (EXAVITQu4vr4xnSDxMaL): Friendly female"
echo "   - Rachel (21m00Tcm4TlvDq8ikWAM): Professional female"
echo "   - Josh (VR6AewLTigWG4xSOukaG): Deep male voice"
echo ""
echo "🎉 Setup complete! Happy workouts, Shahar!" 