"use client";

import React, { useEffect } from 'react';
import { Track } from '@/components/data/mockData';
import { useAudioPlayer } from '@/lib/hooks';

type MusicTrackCardProps = {
  track: Track;
  isCompact?: boolean;
};

const MusicTrackCard = ({ track, isCompact = false }: MusicTrackCardProps) => {
  const { playTrack, currentTrack, isPlaying, initializeAudioContext } = useAudioPlayer();

  const isCurrentTrack = currentTrack?.id === track.id;

  const cardCtx = useAudioPlayer();

  useEffect(() => {
    console.log('🎵 [MusicTrackCard] context state:', cardCtx);
  }, [cardCtx]);


  // Initialize audio context on first render
  useEffect(() => {
    // Try to initialize audio context when component mounts
    const initContext = () => {
      initializeAudioContext();
    };

    // Initialize on first user interaction
    window.addEventListener('click', initContext, { once: true });

    return () => {
      window.removeEventListener('click', initContext);
    };
  }, [initializeAudioContext]);

  const handlePlayTrack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Always initialize audio context before playing
    initializeAudioContext();

    // Play track immediately and forcefully
    console.log(`Playing track: ${track.title}`);
    playTrack(track);
  };

  if (isCompact) {
    return (
      <div
        className="flex items-center p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
        onClick={handlePlayTrack}
      >
        <div
          className="w-10 h-10 rounded overflow-hidden bg-cover flex-shrink-0 mr-3"
          style={{ backgroundImage: `url(${track.albumArt})` }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{track.title}</h4>
          <p className="text-xs text-white/70 truncate">{track.artist}</p>
        </div>
        <div
          className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
          style={{ backgroundColor: isCurrentTrack && isPlaying ? track.color : 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div
      className="bg-white/5 hover:bg-white/10 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
      onClick={handlePlayTrack}
    >
      <div className="relative">
        <img
          src={track.albumArt}
          alt={`${track.title} album art`}
          className="w-full aspect-square object-cover"
        />
        {isCurrentTrack && isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${track.color}40` }} // Add alpha transparency
          >
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: track.color }}
        />
      </div>

      <div className="p-3">
        <h4 className="font-medium truncate">{track.title}</h4>
        <p className="text-sm text-white/70 truncate">{track.artist}</p>
      </div>
    </div>
  );
};

export default MusicTrackCard; 