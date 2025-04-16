"use client";

import React, { useState } from 'react';
import { Track, moods, mockTracks } from '@/components/data/mockData';
import MusicTrackCard from './MusicTrackCard';

type MusicTracksGridProps = {
  title?: string;
  subtitle?: string;
  filterByMood?: boolean;
};

const MusicTracksGrid = ({ 
  title = "Discover Music", 
  subtitle = "Find your next favorite track",
  filterByMood = true 
}: MusicTracksGridProps) => {
  const [selectedMood, setSelectedMood] = useState<string>("all");
  
  // Filter tracks based on selected mood
  const filteredTracks = selectedMood === "all" 
    ? mockTracks 
    : mockTracks.filter(track => track.mood === selectedMood);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
        <p className="text-white/70">{subtitle}</p>
      </div>
      
      {filterByMood && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedMood("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium 
              ${selectedMood === "all" 
                ? "bg-white text-blue-900" 
                : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            All Tracks
          </button>
          
          {moods.map(mood => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium 
                ${selectedMood === mood.id 
                  ? `bg-[${mood.color}] text-white` 
                  : "bg-white/10 text-white hover:bg-white/20"}`}
              style={selectedMood === mood.id ? { backgroundColor: mood.color } : {}}
            >
              {mood.name.charAt(0).toUpperCase() + mood.name.slice(1)}
            </button>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTracks.map(track => (
          <MusicTrackCard key={track.id} track={track} />
        ))}
      </div>
      
      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70">No tracks found for this mood. Try another mood!</p>
        </div>
      )}
    </div>
  );
};

export default MusicTracksGrid; 