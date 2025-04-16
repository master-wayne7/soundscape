"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Track } from '@/components/data/mockData';

type AlbumArtProps = {
  track: Track;
  isPlaying: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showShadow?: boolean;
  onClick?: () => void;
};

const AlbumArt = ({
  track,
  isPlaying,
  size = 'lg',
  showShadow = true,
  onClick
}: AlbumArtProps) => {
  // Define sizes
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-40 h-40 md:w-48 md:h-48',
    lg: 'w-56 h-56 md:w-64 md:h-64',
    xl: 'w-72 h-72 md:w-80 md:h-80'
  };

  // Disk spin animation for when music is playing
  const spinAnimation = isPlaying
    ? { animate: { rotate: 360 }, transition: { duration: 20, repeat: Infinity, ease: "linear" } }
    : {};

  // Disk retraction animation for when music stops
  const diskPosition = isPlaying
    ? 'translate-x-[20%]'
    : 'translate-x-[5%]';

  return (
    <div 
      className={`relative ${sizes[size]} mx-auto cursor-pointer`}
      onClick={onClick}
    >
      {/* Album cover */}
      <motion.div
        className={`absolute z-10 ${sizes[size]} rounded-lg overflow-hidden ${showShadow ? 'shadow-xl' : ''}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          backgroundImage: `url(${track.albumArt})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Color overlay matching track mood */}
        <div 
          className="absolute inset-0 mix-blend-color opacity-20"
          style={{ backgroundColor: track.color }}
        />
      </motion.div>
      
      {/* Vinyl record behind album */}
      <motion.div 
        className={`absolute z-0 ${sizes[size]} rounded-full bg-black ${diskPosition} transition-transform duration-500`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        {...spinAnimation}
      >
        {/* Vinyl grooves */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-800 opacity-50" />
        <div className="absolute inset-[15%] rounded-full border-2 border-gray-700 opacity-50" />
        <div className="absolute inset-[30%] rounded-full border border-gray-700 opacity-50" />
        
        {/* Center hole */}
        <div className="absolute inset-[45%] rounded-full bg-gray-300" />
      </motion.div>
    </div>
  );
};

export default AlbumArt; 