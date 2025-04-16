"use client";

import React, { createContext, useContext } from 'react';
import { useAudioPlayer } from '@/lib/hooks';
import { Track } from '@/components/data/mockData';
import AudioPlayer from '@/components/AudioPlayer';
import MusicRecommendations from '@/components/MusicRecommendations';

// Create context types
type AudioContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  playTrack: (track: Track, createNewQueue?: boolean) => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  formatTime: (time: number) => string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioContextInitialized: boolean;
  initializeAudioContext: () => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  trackQueue: Track[];
  queueIndex: number;
  playRequestPending?: boolean;
};

// Create the context with default values
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Custom hook to use the audio context
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

// Audio Provider component
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false);
  const audioPlayerState = useAudioPlayer();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return children without audio functionality until client is ready
    return <>{children}</>;
  }

  return (
    <AudioContext.Provider value={audioPlayerState}>
      {children}
      <AudioPlayer />
      <MusicRecommendations />
    </AudioContext.Provider>
  );
} 