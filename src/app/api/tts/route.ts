import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Initialize ElevenLabs client (server-side only)
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// ElevenLabs voice configuration
const VOICE_CONFIG = {
  voiceId: 'MojQmyO0sDHQNLenis1h', // Your custom recorded voice
  modelId: 'eleven_v3', // Fast, high quality
  stability: 50,
  similarityBoost: 75,
  style: 0,
  useSpeakerBoost: false,
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Generate audio with ElevenLabs TTS
    const response = await elevenlabs.textToSpeech.convert(
      VOICE_CONFIG.voiceId,
      {
        text: text,
        modelId: VOICE_CONFIG.modelId,
        voiceSettings: {
          stability: VOICE_CONFIG.stability,
          similarityBoost: VOICE_CONFIG.similarityBoost,
          style: VOICE_CONFIG.style,
          useSpeakerBoost: VOICE_CONFIG.useSpeakerBoost,
        },
        outputFormat: 'mp3_44100_128',
      }
    );

    // Convert ReadableStream to ArrayBuffer
    const reader = response.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        chunks.push(value);
      }
    }
    
    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }

    // Return the audio data as a response
    return new NextResponse(combinedArray, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedArray.length.toString(),
      },
    });

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
} 