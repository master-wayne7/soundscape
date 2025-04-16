"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mood, Track, moods, getTracksByMood } from '@/components/data/mockData';
import { useAudioPlayer } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { AlbumArt } from '@/components/AudioPlayer';

export default function MoodDiscovery() {
  const [selectedMood, setSelectedMood] = useState<Mood>(moods[0]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    audioContextInitialized, 
    initializeAudioContext 
  } = useAudioPlayer();
  
  // Update tracks when mood changes
  useEffect(() => {
    setTracks(getTracksByMood(selectedMood.id));
  }, [selectedMood]);

  // Handle playing a track
  const handlePlayTrack = (track: Track) => {
    // Force initialize audio context first
    initializeAudioContext();
    
    // Add a small timeout to ensure context is initialized 
    // This helps especially on mobile devices
    setTimeout(() => {
      // Play the track
      playTrack(track);
      
      // Add explicit log to confirm track is playing
      console.log("Mood discovery: track should be playing now", track.title);
      
      // Force a quick interaction with the audio element to ensure it plays on iOS
      if (document && document.body) {
        const simulateInteraction = document.createElement('button');
        simulateInteraction.style.display = 'none';
        document.body.appendChild(simulateInteraction);
        simulateInteraction.click();
        document.body.removeChild(simulateInteraction);
      }
    }, 50);
  };
  
  return (
    <div className="relative px-4 py-12 overflow-hidden">
      {/* Background Gradient */}
      <motion.div 
        className="absolute inset-0 -z-10 opacity-50 blur-2xl"
        animate={{ 
          background: `linear-gradient(135deg, ${selectedMood.gradient[0]} 0%, ${selectedMood.gradient[1]} 100%)` 
        }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Discover by Mood
        </motion.h2>
        
        {/* Mood Selector */}
        <div className="flex justify-center mb-12 gap-4 flex-wrap">
          {moods.map((mood) => (
            <motion.button
              key={mood.id}
              onClick={() => setSelectedMood(mood)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedMood.id === mood.id 
                  ? "bg-white text-black shadow-lg" 
                  : "bg-black/20 text-white backdrop-blur-md hover:bg-black/30"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mood.name.charAt(0).toUpperCase() + mood.name.slice(1)}
            </motion.button>
          ))}
        </div>
        
        {/* Mood Description */}
        <motion.p 
          className="text-center text-white/80 mb-12 max-w-lg mx-auto"
          key={selectedMood.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {selectedMood.description}
        </motion.p>
        
        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {tracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden bg-black/20 backdrop-blur-lg border-white/10 text-white">
                  <div className="p-4">
                    <div className="aspect-square mb-4 overflow-hidden rounded-md">
                      {currentTrack?.id === track.id ? (
                        <AlbumArt track={track} isPlaying={isPlaying} />
                      ) : (
                        <div 
                          className="w-full h-full bg-cover bg-center cursor-pointer"
                          style={{ backgroundImage: `url(${track.albumArt})` }}
                          onClick={() => handlePlayTrack(track)}
                        />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold truncate">{track.title}</h3>
                    <p className="text-sm text-white/70">{track.artist}</p>
                    
                    <div className="flex justify-between items-center mt-3 text-xs text-white/60">
                      <span>{track.genre}</span>
                      <span>{track.releaseYear}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    className="w-full py-3 bg-gradient-to-r from-black/30 to-black/50 hover:from-black/40 hover:to-black/60 transition-all border-t border-white/10 font-medium"
                    onClick={() => handlePlayTrack(track)}
                    whileTap={{ scale: 0.98 }}
                  >
                    {currentTrack?.id === track.id && isPlaying ? 'Now Playing' : 'Play Track'}
                  </motion.button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 