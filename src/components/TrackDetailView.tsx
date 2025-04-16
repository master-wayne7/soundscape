"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer, useAudioVisualization } from '@/lib/hooks';
import { Track, getRecommendedTracks } from '@/components/data/mockData';
import AlbumArt from '@/components/AlbumArt';
import { Slider } from '@/components/ui/slider';
import { X, Heart, Share2, PlayCircle, PauseCircle } from 'lucide-react';

export default function TrackDetailView() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    duration, 
    currentTime, 
    seek,
    formatTime,
    audioRef,
    audioContextInitialized,
    initializeAudioContext
  } = useAudioPlayer();
  
  const [isOpen, setIsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [recommendations, setRecommendations] = useState<Track[]>([]);

  // Create ref for audio element 
  const audioElementRef = useRef<HTMLAudioElement>(null);
  
  // Set audio element reference when available
  useEffect(() => {
    if (audioRef.current) {
      audioElementRef.current = audioRef.current;
    }
  }, [audioRef]);
  
  // Get audio data for visualization
  const { audioData } = useAudioVisualization(audioElementRef);

  // Open modal when a track is playing
  useEffect(() => {
    if (currentTrack) {
      // Allow small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Get recommendations based on the current track
        setRecommendations(getRecommendedTracks(currentTrack));
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [currentTrack]);

  // Make sure to properly handle touch events
  useEffect(() => {
    // Passive event listeners improve scroll performance
    document.addEventListener('touchstart', () => {}, { passive: true });
    
    // Ensure body scrolling is disabled when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close handler
  const handleClose = () => {
    // Animate closing
    setIsOpen(false);
  };

  // Initialize audio context if not already initialized
  const ensureAudioContext = () => {
    if (!audioContextInitialized) {
      initializeAudioContext();
    }
  };

  const handleTogglePlay = () => {
    ensureAudioContext();
    togglePlayPause();
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <motion.button 
            onClick={handleClose} 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>

          <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Album art section */}
              <div className="flex justify-center">
                <div className="relative">
                  {currentTrack && (
                    <AlbumArt track={currentTrack} isPlaying={isPlaying} />
                  )}
                  
                  {/* Play/Pause overlay */}
                  <motion.button
                    className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg"
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTogglePlay}
                  >
                    {isPlaying ? (
                      <PauseCircle size={80} className="text-white opacity-90" />
                    ) : (
                      <PlayCircle size={80} className="text-white opacity-90" />
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Track info section */}
              <div>
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentTrack.title}
                </motion.h1>
                
                <motion.h2 
                  className="text-xl text-white/70 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentTrack.artist}
                </motion.h2>
                
                <motion.div 
                  className="flex items-center gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {currentTrack.genre}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {currentTrack.mood}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {currentTrack.releaseYear}
                  </div>
                </motion.div>
                
                {/* Audio controls */}
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Waveform visualization */}
                  <div 
                    ref={waveformRef} 
                    className="h-24 mb-4 bg-black/30 rounded-lg overflow-hidden flex items-end"
                  >
                    {audioData && Array.from(audioData).map((value, index) => {
                      // Create a more dense waveform
                      if (index % 2 !== 0) return null;
                      
                      const height = (value / 255) * 100;
                      // Calculate if this bar is before or after the current playback position
                      const position = (index / audioData.length) * duration;
                      const isPlayed = position <= currentTime;
                      
                      return (
                        <div 
                          key={index}
                          className="w-1 mx-[1px] rounded-t-sm transition-all duration-100"
                          style={{ 
                            height: `${Math.max(5, height)}%`,
                            backgroundColor: isPlayed ? currentTrack.color : 'rgba(255,255,255,0.2)'
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-white/70">{formatTime(currentTime)}</span>
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={(values) => seek(values[0])}
                      className="flex-1"
                    />
                    <span className="text-sm text-white/70">{formatTime(duration)}</span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-between items-center">
                    <button 
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                        liked ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      onClick={() => setLiked(!liked)}
                    >
                      <Heart size={18} fill={liked ? 'white' : 'none'} />
                      <span>{liked ? 'Liked' : 'Like'}</span>
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                  </div>
                </motion.div>
                
                {/* Album info */}
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-lg font-semibold mb-2">Album</h3>
                  <p className="text-white/70">{currentTrack.album}</p>
                </motion.div>
                
                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">You might also like</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {recommendations.map((track) => (
                        <RecommendationCard key={track.id} track={track} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RecommendationCard({ track }: { track: Track }) {
  const { playTrack, initializeAudioContext, audioContextInitialized } = useAudioPlayer();
  
  const handlePlay = () => {
    // Force initialize audio context first
    initializeAudioContext();
    
    // Add a small timeout to ensure context is initialized 
    // This helps especially on mobile devices
    setTimeout(() => {
      // Play the track
      playTrack(track);
      
      // Log for debugging
      console.log("Track detail recommendation: playing track", track.title);
    }, 50);
  };
  
  return (
    <motion.div 
      className="bg-white/5 rounded-lg overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePlay}
    >
      <div 
        className="h-32 bg-cover bg-center" 
        style={{ backgroundImage: `url(${track.albumArt})` }}
      />
      <div className="p-3">
        <h4 className="font-medium truncate">{track.title}</h4>
        <p className="text-sm text-white/70 truncate">{track.artist}</p>
      </div>
    </motion.div>
  );
}