"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { mockTracks, Track } from '@/components/data/mockData';
import { useAudioPlayer } from '@/lib/hooks';

export default function Hero() {
  const { playTrack, audioContextInitialized, initializeAudioContext } = useAudioPlayer();
  const [activeCircle, setActiveCircle] = useState(0);
  
  // Rotate through circles automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCircle(prev => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Featured tracks for the hero section
  const featuredTracks = [
    mockTracks[0], // energetic
    mockTracks[1], // chill
    mockTracks[4], // upbeat
  ];

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
      console.log("Hero section: track should be playing now", track.title);
      
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
    <div 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" 
      id="home"
    >
      {/* Background animation circles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ 
            duration: 8, 
            ease: "easeInOut", 
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[120px]"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ 
            duration: 10, 
            ease: "easeInOut", 
            repeat: Infinity,
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[120px]"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ 
            duration: 6, 
            ease: "easeInOut", 
            repeat: Infinity,
            delay: 1
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div>
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Discover Music <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              For Every Mood
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-white/70 mb-8 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Immerse yourself in a world of sound with our mood-based music discovery platform. Find the perfect soundtrack for any moment.
          </motion.p>
          
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <motion.button
              className="px-8 py-3 rounded-full bg-white text-black font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Music
            </motion.button>
            
            <motion.button
              className="px-8 py-3 rounded-full bg-transparent border border-white/30 font-medium hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePlayTrack(featuredTracks[activeCircle])}
            >
              Try Now
            </motion.button>
          </motion.div>
        </div>
        
        {/* Visual Elements */}
        <div className="relative h-[500px]">
          {/* Orbital circles with album arts */}
          <div className="absolute inset-0 flex items-center justify-center">
            {featuredTracks.map((track, index) => (
              <motion.div
                key={track.id}
                className="absolute rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  width: index === activeCircle ? "220px" : "180px",
                  height: index === activeCircle ? "220px" : "180px",
                  zIndex: index === activeCircle ? 10 : 5,
                }}
                animate={{
                  rotate: 120 * index,
                  scale: index === activeCircle ? 1 : 0.8,
                }}
                transition={{
                  rotate: { duration: 20, ease: "linear", repeat: Infinity },
                  scale: { duration: 0.5, ease: "easeInOut" }
                }}
                onClick={() => {
                  setActiveCircle(index);
                  handlePlayTrack(track);
                }}
              >
                <motion.div
                  className="w-full h-full rounded-full overflow-hidden p-1 bg-gradient-to-tr from-white/30 via-white/10 to-transparent backdrop-blur-sm"
                  style={{ 
                    boxShadow: index === activeCircle 
                      ? `0 0 30px 5px ${track.color}80` 
                      : "none"
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div 
                    className="w-full h-full rounded-full bg-cover bg-center" 
                    style={{ backgroundImage: `url(${track.albumArt})` }}
                  />
                </motion.div>
              </motion.div>
            ))}
            
            {/* Center orbit point */}
            <motion.div 
              className="absolute w-16 h-16 rounded-full bg-white flex items-center justify-center" 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-8 h-8">
                <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" clipRule="evenodd" />
              </svg>
            </motion.div>
            
            {/* Orbital paths */}
            <div className="absolute w-[450px] h-[450px] rounded-full border border-white/10 animate-spin-slow" />
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p className="text-sm text-white/60 mb-2">Scroll to explore</p>
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1"
          initial={{ y: 0 }}
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <motion.div className="w-1.5 h-1.5 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
} 