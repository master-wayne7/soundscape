"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockTracks, Track } from '@/components/data/mockData';
import { useAudioPlayer } from '@/lib/hooks';

export default function AlbumShowcase() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    playTrack, 
    currentTrack, 
    isPlaying, 
    audioContextInitialized, 
    initializeAudioContext 
  } = useAudioPlayer();
  
  const currentAlbum = mockTracks[currentIndex];

  // Handle mouse move for 3D rotation effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    // Calculate mouse position relative to container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Map to rotation values (-15 to 15 degrees)
    const rotateX = 15 - (y / rect.height * 30);
    const rotateY = (x / rect.width * 30) - 15;
    
    setRotation({ x: rotateX, y: rotateY });
  };
  
  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };
  
  // Auto-rotate through albums
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlaying) { // Only auto-rotate when not playing
        setCurrentIndex((prev) => (prev + 1) % mockTracks.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
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
      console.log("Album showcase: track should be playing now", track.title);
      
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
  
  // Get unique albums (to avoid duplicates)
  const uniqueAlbums = mockTracks.reduce((acc: Track[], track) => {
    const exists = acc.find(t => t.album === track.album);
    if (!exists) {
      acc.push(track);
    }
    return acc;
  }, []);
  
  // Get all tracks for the current album
  const albumTracks = mockTracks.filter(track => track.album === currentAlbum.album);
  
  return (
    <div className="py-20">
      <motion.h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Featured Albums
      </motion.h2>
      
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* 3D Album Art */}
        <div className="lg:w-1/2 flex justify-center">
          <div
            ref={containerRef}
            className="relative h-[400px] w-[400px] perspective-1000px"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => handlePlayTrack(currentAlbum)}
          >
            {/* 3D Album with shadow */}
            <motion.div
              className="w-[300px] h-[300px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              animate={{
                rotateX: rotation.x,
                rotateY: rotation.y,
                z: 100,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              whileHover={{ scale: 1.05 }}
              style={{
                transformStyle: "preserve-3d"
              }}
            >
              {/* Album Cover - Front */}
              <motion.div
                className="absolute inset-0 rounded-lg shadow-2xl"
                style={{
                  backgroundImage: `url(${currentAlbum.albumArt})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                  transform: "translateZ(10px)",
                }}
              />
              
              {/* Album Cover - Back */}
              <motion.div
                className="absolute inset-0 rounded-lg shadow-2xl bg-gradient-to-br from-gray-800 to-black"
                style={{
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                  transform: "rotateY(180deg) translateZ(10px)",
                }}
              >
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold">{currentAlbum.album}</h3>
                  <p className="text-white/70">{currentAlbum.artist}</p>
                </div>
              </motion.div>
              
              {/* Left side of album */}
              <motion.div
                className="absolute w-[10px] h-full left-0 top-0 transform-gpu -translate-x-[5px] rotateY-90 origin-right bg-gradient-to-r from-black to-gray-900"
                style={{
                  transform: "rotateY(-90deg) translateZ(150px)",
                }}
              />
              
              {/* Right side of album */}
              <motion.div
                className="absolute w-[10px] h-full right-0 top-0 transform-gpu translate-x-[5px] rotateY-90 origin-left bg-gradient-to-r from-gray-900 to-black"
                style={{
                  transform: "rotateY(90deg) translateZ(150px)",
                }}
              />
              
              {/* Top side of album */}
              <motion.div
                className="absolute w-full h-[10px] left-0 top-0 transform-gpu -translate-y-[5px] rotateX-90 origin-bottom bg-gradient-to-b from-black to-gray-900"
                style={{
                  transform: "rotateX(90deg) translateZ(150px)",
                }}
              />
              
              {/* Bottom side of album */}
              <motion.div
                className="absolute w-full h-[10px] left-0 bottom-0 transform-gpu translate-y-[5px] rotateX-90 origin-top bg-gradient-to-t from-black to-gray-900"
                style={{
                  transform: "rotateX(-90deg) translateZ(150px)",
                }}
              />
            </motion.div>
            
            {/* Play button overlay */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10"
              animate={{
                opacity: currentTrack?.album === currentAlbum.album && isPlaying ? 0 : 0.7,
                scale: currentTrack?.album === currentAlbum.album && isPlaying ? 0.8 : 1,
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="white" 
                className="w-8 h-8"
                style={{marginLeft: "3px"}}
              >
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            </motion.div>
            
            {/* Shadow below album */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[250px] h-[30px] bg-black/30 blur-xl rounded-full" />
          </div>
        </div>
        
        {/* Album Info & Track List */}
        <div className="lg:w-1/2">
          <motion.div
            key={currentAlbum.album}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-2">{currentAlbum.album}</h3>
            <p className="text-xl text-white/70 mb-6">{currentAlbum.artist}</p>
            
            <div className="mb-8">
              <p className="text-white/60 mb-2">
                {albumTracks.length} Tracks • {currentAlbum.releaseYear} • {currentAlbum.genre}
              </p>
              
              <motion.button
                className="px-6 py-2 bg-white text-black rounded-full font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlayTrack(currentAlbum)}
              >
                {currentTrack?.album === currentAlbum.album && isPlaying ? 'Now Playing' : 'Play Album'}
              </motion.button>
            </div>
            
            {/* Track list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              {albumTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  className="p-3 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-3"
                  onClick={() => handlePlayTrack(track)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full border border-white/30 text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{track.title}</p>
                    <p className="text-xs text-white/60">{track.artist}</p>
                  </div>
                  <div className="ml-auto text-sm text-white/60">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Album Navigation */}
      <div className="flex justify-center mt-12 gap-2">
        {uniqueAlbums.map((album, index) => (
          <motion.button 
            key={album.id}
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: mockTracks[currentIndex].album === album.album 
                ? "white" 
                : "rgba(255, 255, 255, 0.3)" 
            }}
            onClick={() => setCurrentIndex(mockTracks.findIndex(t => t.album === album.album))}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </div>
  );
} 