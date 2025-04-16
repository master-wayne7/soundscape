"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track, getRecommendedTracks } from '@/components/data/mockData';
import { useAudioPlayer } from '@/lib/hooks';

export default function MusicRecommendations() {
  const { currentTrack, playTrack, audioContextInitialized, initializeAudioContext } = useAudioPlayer();
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [visible, setVisible] = useState(false);
  
  // Update recommendations when current track changes
  useEffect(() => {
    if (currentTrack) {
      const recommendedTracks = getRecommendedTracks(currentTrack);
      setRecommendations(recommendedTracks);
      
      // Show recommendations after a short delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        setVisible(false);
      };
    }
  }, [currentTrack]);

  // Handle playing a track
  const handlePlayTrack = (track: Track) => {
    // Force initialize audio context first
    initializeAudioContext();
    
    // Add a small timeout to ensure context is initialized 
    // This helps especially on mobile devices
    setTimeout(() => {
      // Play the track
      playTrack(track);
      
      // Log for debugging
      console.log("Recommendations: playing track", track.title);
    }, 50);
  };
  
  if (!currentTrack || recommendations.length === 0) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <div className="bg-black/40 backdrop-blur-lg p-5 rounded-2xl border border-white/10 shadow-2xl w-64">
            <h3 className="text-lg font-semibold mb-4">Because you're listening to:</h3>
            
            {/* Current Track */}
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-md bg-cover bg-center" 
                style={{ backgroundImage: `url(${currentTrack.albumArt})` }}
              />
              <div>
                <p className="font-medium text-sm line-clamp-1">{currentTrack.title}</p>
                <p className="text-xs text-white/60">{currentTrack.artist}</p>
              </div>
            </div>
            
            <p className="text-sm mb-4 text-white/70">You might also like:</p>
            
            {/* Recommendations */}
            <div className="space-y-3">
              <AnimatePresence>
                {recommendations.map((track, index) => (
                  <motion.div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-md bg-cover bg-center flex-shrink-0" 
                      style={{ backgroundImage: `url(${track.albumArt})` }}
                    />
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{track.title}</p>
                      <p className="text-xs text-white/60">{track.artist}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Reason for recommendation */}
            <motion.div 
              className="mt-4 text-xs text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Based on {currentTrack.mood} mood
            </motion.div>
            
            {/* Visual connection to current track */}
            <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 flex items-center">
              <div 
                className="h-[2px] w-16 bg-gradient-to-r"
                style={{ 
                  backgroundImage: `linear-gradient(to right, transparent, ${currentTrack.color})` 
                }}
              />
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentTrack.color }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 