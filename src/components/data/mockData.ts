export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  audioSrc: string;
  duration: number;
  mood: "energetic" | "chill" | "focus" | "melancholy" | "upbeat";
  color: string;
  genre: string;
  releaseYear: number;
};

export type Artist = {
  id: string;
  name: string;
  image: string;
  genres: string[];
  bio: string;
};

export type Mood = {
  id: string;
  name: "energetic" | "chill" | "focus" | "melancholy" | "upbeat";
  color: string;
  gradient: string[];
  description: string;
};

export const moods: Mood[] = [
  {
    id: "energetic",
    name: "energetic",
    color: "#FF4500",
    gradient: ["#FF4500", "#FF8C00"],
    description: "High-energy tracks to boost your motivation"
  },
  {
    id: "chill",
    name: "chill",
    color: "#4A90E2",
    gradient: ["#4A90E2", "#87CEFA"],
    description: "Relaxing beats for unwinding and relaxation"
  },
  {
    id: "focus",
    name: "focus",
    color: "#8A2BE2",
    gradient: ["#8A2BE2", "#9370DB"],
    description: "Concentration-enhancing music for deep work"
  },
  {
    id: "melancholy",
    name: "melancholy",
    color: "#483D8B",
    gradient: ["#483D8B", "#6A5ACD"],
    description: "Emotional tracks for introspective moments"
  },
  {
    id: "upbeat",
    name: "upbeat",
    color: "#32CD32",
    gradient: ["#32CD32", "#7CFC00"],
    description: "Feel-good music to brighten your day"
  }
];

// Since we don't have real audio files, we'll use placeholders
// In a real app, you would use actual file paths or URLs
export const mockTracks: Track[] = [
  {
    id: "track-1",
    title: "Electric Dreams",
    artist: "Synth Collective",
    album: "Neon Horizons",
    albumArt: "https://picsum.photos/seed/neon1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 245,
    mood: "energetic",
    color: "#FF4500",
    genre: "Synthwave",
    releaseYear: 2022
  },
  {
    id: "track-2",
    title: "Ocean Waves",
    artist: "Ambient Tides",
    album: "Coastal Serenity",
    albumArt: "https://picsum.photos/seed/coastal1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 312,
    mood: "chill",
    color: "#4A90E2",
    genre: "Ambient",
    releaseYear: 2021
  },
  {
    id: "track-3",
    title: "Deep Focus",
    artist: "Mind Architects",
    album: "Concentration",
    albumArt: "https://picsum.photos/seed/focus1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 278,
    mood: "focus",
    color: "#8A2BE2",
    genre: "Electronic",
    releaseYear: 2023
  },
  {
    id: "track-4",
    title: "Rainy Day",
    artist: "The Melancholics",
    album: "Grey Skies",
    albumArt: "https://picsum.photos/seed/grey1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 265,
    mood: "melancholy",
    color: "#483D8B",
    genre: "Indie",
    releaseYear: 2020
  },
  {
    id: "track-5",
    title: "Summer Vibes",
    artist: "Happy Beats",
    album: "Sunshine",
    albumArt: "https://picsum.photos/seed/sunshine1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: 198,
    mood: "upbeat",
    color: "#32CD32",
    genre: "Pop",
    releaseYear: 2023
  },
  {
    id: "track-6",
    title: "Midnight Run",
    artist: "Synth Collective",
    album: "Neon Horizons",
    albumArt: "https://picsum.photos/seed/neon1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: 223,
    mood: "energetic",
    color: "#FF4500",
    genre: "Synthwave",
    releaseYear: 2022
  },
  {
    id: "track-7",
    title: "Gentle Rain",
    artist: "Ambient Tides",
    album: "Coastal Serenity",
    albumArt: "https://picsum.photos/seed/coastal1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    duration: 325,
    mood: "chill",
    color: "#4A90E2",
    genre: "Ambient",
    releaseYear: 2021
  },
  {
    id: "track-8",
    title: "Laser Focus",
    artist: "Mind Architects",
    album: "Concentration",
    albumArt: "https://picsum.photos/seed/focus1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 290,
    mood: "focus",
    color: "#8A2BE2",
    genre: "Electronic",
    releaseYear: 2023
  },
  {
    id: "track-9",
    title: "Nostalgia",
    artist: "The Melancholics",
    album: "Grey Skies",
    albumArt: "https://picsum.photos/seed/grey1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    duration: 275,
    mood: "melancholy",
    color: "#483D8B",
    genre: "Indie",
    releaseYear: 2020
  },
  {
    id: "track-10",
    title: "Dancing Lights",
    artist: "Happy Beats",
    album: "Sunshine",
    albumArt: "https://picsum.photos/seed/sunshine1/400",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    duration: 210,
    mood: "upbeat",
    color: "#32CD32",
    genre: "Pop",
    releaseYear: 2023
  }
];

export const mockArtists: Artist[] = [
  {
    id: "artist-1",
    name: "Synth Collective",
    image: "https://picsum.photos/seed/artist1/400",
    genres: ["Synthwave", "Electronic"],
    bio: "A forward-thinking electronic music group known for their nostalgic 80s-inspired soundscapes and futuristic themes."
  },
  {
    id: "artist-2",
    name: "Ambient Tides",
    image: "https://picsum.photos/seed/artist2/400",
    genres: ["Ambient", "Chillout"],
    bio: "Creating serene soundscapes inspired by nature, Ambient Tides specializes in calming compositions perfect for relaxation and meditation."
  },
  {
    id: "artist-3",
    name: "Mind Architects",
    image: "https://picsum.photos/seed/artist3/400",
    genres: ["Electronic", "Minimal"],
    bio: "Experimental electronic duo crafting intricate sound designs and rhythmic patterns that enhance concentration and productivity."
  },
  {
    id: "artist-4",
    name: "The Melancholics",
    image: "https://picsum.photos/seed/artist4/400",
    genres: ["Indie", "Alternative"],
    bio: "An indie band known for their emotional depth and introspective lyrics, The Melancholics capture the beauty in sadness through their music."
  },
  {
    id: "artist-5",
    name: "Happy Beats",
    image: "https://picsum.photos/seed/artist5/400",
    genres: ["Pop", "Dance"],
    bio: "Producing infectious feel-good music, Happy Beats combines catchy melodies with uplifting rhythms guaranteed to brighten any mood."
  }
];

// For recommendation system
export const getRecommendedTracks = (track: Track): Track[] => {
  // Simple recommendation based on the same mood
  return mockTracks
    .filter(t => t.mood === track.mood && t.id !== track.id)
    .slice(0, 3);
};

// For mood-based filtering
export const getTracksByMood = (mood: string): Track[] => {
  return mockTracks.filter(track => track.mood === mood);
};

// User preferences to be stored in localStorage
export interface UserPreferences {
  favoriteArtists: string[];
  recentlyPlayed: string[];
  favoriteGenres: string[];
  preferredMood: string;
  darkMode: boolean;
}

export const defaultUserPreferences: UserPreferences = {
  favoriteArtists: [],
  recentlyPlayed: [],
  favoriteGenres: [],
  preferredMood: "chill",
  darkMode: true
}; 