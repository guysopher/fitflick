import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  promptGenerators, 
  fallbackMessages, 
  getHardCodedGetReadyMessage,
  type PromptContext 
} from '@/services/fitnessCoachPrompts';

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PepTalkRequest {
  exerciseName: string;
  timeRemaining: number;
  currentStep: number;
  totalSteps: number;
  userName?: string;
  mode: 'workout' | 'rest' | 'get-ready';
  messageType?: 'instruction' | 'motivation' | 'rest-announcement' | 'general';
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const options: PepTalkRequest = await request.json();
    
    const { 
      exerciseName, 
      timeRemaining, 
      currentStep, 
      totalSteps, 
      userName = 'Shahar', 
      mode, 
      messageType = 'general' 
    } = options;

    // Use hard-coded messages for get-ready to eliminate lag
    if (mode === 'get-ready') {
      const text = getHardCodedGetReadyMessage({
        userName,
        exerciseName,
        timeRemaining,
        currentStep,
        totalSteps,
      });
      return NextResponse.json({ text });
    }

    // Determine message type based on context if not explicitly provided
    let actualMessageType = messageType;
    if (messageType === 'general') {
      if (mode === 'workout') {
        actualMessageType = 'instruction';
      } else if (mode === 'rest') {
        actualMessageType = 'rest-announcement';
      } else {
        actualMessageType = 'motivation';
      }
    }
    
    // Create context for prompt generation
    const promptContext: PromptContext = {
      userName,
      exerciseName,
      timeRemaining,
      currentStep,
      totalSteps,
    };

    // Get the appropriate prompt generator
    const promptGenerator = promptGenerators[actualMessageType as keyof typeof promptGenerators];
    let prompt = '';
    
    if (promptGenerator) {
      prompt = promptGenerator(promptContext);
    } else {
      // Fallback to mode-based prompts
      switch (mode) {
        case 'workout':
          prompt = promptGenerators.workout(promptContext);
          break;
        case 'rest':
          prompt = promptGenerators.rest(promptContext);
          break;
        default:
          prompt = promptGenerators.motivation(promptContext);
      }
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 1,
      });

      const text = completion.choices[0]?.message?.content?.trim() || 'Great job, keep going!';
      return NextResponse.json({ text });
      
    } catch (error) {
      console.error('Error generating pep talk:', error);
      
      // Use centralized fallback messages
      const messages = fallbackMessages[actualMessageType as keyof typeof fallbackMessages] || fallbackMessages['motivation'];
      const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
      
      // Personalize the fallback message with dynamic replacements
      const text = selectedMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{exerciseName\}/g, exerciseName);
        
      return NextResponse.json({ text });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pep talk' },
      { status: 500 }
    );
  }
} 