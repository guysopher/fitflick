#!/bin/bash

# Setup script for Fitness Voice Coach
echo "🎯 Fitness Voice Coach Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists."
    echo "   Please manually add your OpenAI API key to it:"
    echo "   NEXT_PUBLIC_OPENAI_API_KEY=your_actual_api_key_here"
    echo ""
else
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# OpenAI API Configuration for Fitness Voice Coach
NEXT_PUBLIC_OPENAI_API_KEY=your_actual_api_key_here

# Replace 'your_actual_api_key_here' with your real OpenAI API key
# Get your key from: https://platform.openai.com/account/api-keys
EOF
    echo "✅ .env.local file created!"
    echo ""
fi

echo "🔧 Next Steps:"
echo "1. Get your OpenAI API key from: https://platform.openai.com/account/api-keys"
echo "2. Replace 'your_actual_api_key_here' in .env.local with your actual API key"
echo "3. Restart the development server: npm run dev"
echo "4. Test the voice coach using the green voice button in the workout screen"
echo ""
echo "💡 Tips:"
echo "   - The voice coach works even without an API key (uses fallback messages)"
echo "   - Make sure your browser volume is turned up"
echo "   - Grant microphone permissions if prompted (for speech synthesis)"
echo ""
echo "🎉 Setup complete! Happy workouts, Shahar!" 