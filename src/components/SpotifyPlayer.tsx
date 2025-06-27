'use client';

import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, Volume2 } from 'lucide-react';

interface SpotifyPlayerProps {
  isWorkoutActive: boolean;
  selectedGenre: 'pop' | 'dance' | 'cartoon' | 'kids';
}

interface Playlist {
  id: string;
  name: string;
  genre: 'pop' | 'dance' | 'cartoon' | 'kids';
  emoji: string;
  description: string;
  songs: string[];
}

const playlists: Playlist[] = [
  {
    id: 'kids-pop',
    name: 'Kid-Friendly Pop Hits',
    genre: 'pop',
    emoji: '🎤',
    description: 'Upbeat pop songs perfect for kids!',
    songs: ['Roar - Katy Perry', 'Shake It Off - Taylor Swift', 'What Makes You Beautiful - One Direction']
  },
  {
    id: 'dance-party',
    name: 'Dance Party Mix',
    genre: 'dance',
    emoji: '💃',
    description: 'High-energy dance tracks to get moving!',
    songs: ['Can\'t Stop the Feeling - Justin Timberlake', 'Uptown Funk - Bruno Mars', 'Happy - Pharrell Williams']
  },
  {
    id: 'cartoon-favorites',
    name: 'Cartoon Theme Songs',
    genre: 'cartoon',
    emoji: '🎬',
    description: 'Favorite songs from cartoons and movies!',
    songs: ['Let It Go - Frozen', 'Try Everything - Zootopia', 'Surface Pressure - Encanto']
  },
  {
    id: 'kids-workout',
    name: 'Kids Workout Songs',
    genre: 'kids',
    emoji: '🏃‍♀️',
    description: 'Songs made specifically for kid workouts!',
    songs: ['Banana Song', 'If You\'re Happy and You Know It', 'The Wheels on the Bus (Remix)']
  }
];

export default function SpotifyPlayer({ isWorkoutActive, selectedGenre }: SpotifyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Find playlist for selected genre
    const playlist = playlists.find(p => p.genre === selectedGenre);
    setCurrentPlaylist(playlist || playlists[0]);
  }, [selectedGenre]);

  useEffect(() => {
    // Auto-play when workout starts
    if (isWorkoutActive && isConnected) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isWorkoutActive, isConnected]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (currentPlaylist) {
      setCurrentSong((prev) => (prev + 1) % currentPlaylist.songs.length);
    }
  };

  const connectSpotify = () => {
    // In a real app, this would handle Spotify OAuth
    setIsConnected(true);
  };

  if (!isConnected) {
    return (
      <div className="bg-green-100 border border-green-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-green-800">Connect Spotify</h3>
            <p className="text-green-600 text-sm">Play energizing music during workouts!</p>
          </div>
        </div>
        <button
          onClick={connectSpotify}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-xl font-semibold"
        >
          🎵 Connect to Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl p-4 mb-4">
      {/* Playlist Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center text-xl">
          {currentPlaylist?.emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-sm">{currentPlaylist?.name}</h3>
          <p className="text-gray-600 text-xs">{currentPlaylist?.description}</p>
        </div>
        <div className="text-green-500">
          <Volume2 className="w-5 h-5" />
        </div>
      </div>

      {/* Current Song */}
      <div className="bg-gray-100 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-gray-700 text-sm font-medium">
            {isPlaying ? 'Now Playing:' : 'Paused:'}
          </span>
        </div>
        <p className="text-gray-800 font-semibold text-sm mt-1">
          {currentPlaylist?.songs[currentSong] || 'No song selected'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isPlaying ? 'bg-green-500' : 'bg-gray-400'
          } text-white shadow-lg`}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        
        <button
          onClick={nextSong}
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Genre Selection */}
      <div className="mt-4">
        <p className="text-gray-600 text-xs mb-2">Choose your workout music:</p>
        <div className="flex gap-2 overflow-x-auto">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setCurrentPlaylist(playlist)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium ${
                currentPlaylist?.id === playlist.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {playlist.emoji} {playlist.genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 