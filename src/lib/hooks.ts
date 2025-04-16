"use client";

import { useState, useEffect, useRef } from 'react';
import { UserPreferences, defaultUserPreferences, Track, mockTracks } from '@/components/data/mockData';

// Custom hook for audio player
export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [trackQueue, setTrackQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playRequestPending, setPlayRequestPending] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context - has to be triggered by user interaction
  const initializeAudioContext = () => {
    if (typeof window === 'undefined') return;
    
    try {
      if (!audioContextRef.current) {
        if (window.AudioContext) {
          audioContextRef.current = new window.AudioContext();
        } else if ((window as any).webkitAudioContext) {
          audioContextRef.current = new (window as any).webkitAudioContext();
        }
      }
      
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      setAudioContextInitialized(true);
      
      console.log("Audio context initialized successfully");
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  };

  // Ensure audio element is created only once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      // Important: Explicitly set these attributes for mobile browsers
      audioRef.current.preload = 'metadata';
      audioRef.current.autoplay = false; // Must be false initially to work on iOS
      // Set playsInline attribute (important for iOS)
      audioRef.current.setAttribute('playsinline', 'true');
    }

    // Handle unloading and cleanup
    const handleBeforeUnload = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [volume]);

  // Configure event listeners separately to avoid recreating them
  useEffect(() => {
    // Return if audio element doesn't exist
    if (!audioRef.current) return;
    
    // Set up event listeners
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
        console.log("Metadata loaded:", audioRef.current.duration);
        
        // If there was a pending play request, try to fulfill it now
        if (playRequestPending && isPlaying) {
          console.log("Executing pending play request after metadata loaded");
          const playPromise = audioRef.current.play();
          handlePlayPromise(playPromise);
          setPlayRequestPending(false);
        }
      }
    };

    const handleEnded = () => {
      // Play next track if available
      if (trackQueue.length > 0 && queueIndex < trackQueue.length - 1) {
        playNextTrack();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    
    // Handle play errors
    const handlePlayError = (e: Event) => {
      console.error('Audio play error:', e);
      setIsPlaying(false);
      setPlayRequestPending(false);
    };
    
    // Attach listeners
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handlePlayError);

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handlePlayError);
      }
    };
  }, [trackQueue, queueIndex, isPlaying, playRequestPending]);

  // Helper function to handle play promises
  const handlePlayPromise = (playPromise: Promise<void> | undefined) => {
    if (playPromise === undefined) return;
    
    playPromise
      .then(() => {
        console.log("Playback started successfully");
        setPlayRequestPending(false);
      })
      .catch(error => {
        console.error("Play error:", error);
        
        if (error.name === "NotAllowedError") {
          console.log("Play not allowed - need user interaction first");
          setIsPlaying(false);
          setPlayRequestPending(false);
        } else if (error.name === "AbortError") {
          console.log("Play request was interrupted - will retry later automatically");
          // The play() request was interrupted by a new load request
          // We'll handle this by setting a flag and trying again when metadata is loaded
          setPlayRequestPending(true);
        } else {
          setIsPlaying(false);
          setPlayRequestPending(false);
        }
      });
  };

  // Update audio source when current track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      console.log("Track changed to:", currentTrack.title);
      
      // Ensure we initialize the audio context
      if (!audioContextInitialized) {
        console.log("Initializing audio context for new track");
        initializeAudioContext();
      }

      // Always pause current playback before loading a new track
      audioRef.current.pause();
      
      // Clear the old source and cancel any pending requests
      setPlayRequestPending(false);
      
      // Set new source and load
      audioRef.current.src = currentTrack.audioSrc;
      audioRef.current.load();
      
      console.log("Loading track source:", currentTrack.audioSrc);
    }
  }, [currentTrack, audioContextInitialized]);

  // Handle play/pause state changes separately
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    console.log("Play state changed:", isPlaying);
    
    if (isPlaying) {
      // Make sure audio context is initialized before playing
      if (!audioContextInitialized) {
        console.log("Initializing audio context before playing");
        initializeAudioContext();
      }
      
      // Play with error handling
      const playPromise = audioRef.current.play();
      handlePlayPromise(playPromise);
    } else {
      if (!playRequestPending) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioContextInitialized, currentTrack, playRequestPending]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Function to play a track - key function for opening player from tiles
  const playTrack = (track: Track, createNewQueue = true) => {
    console.log("PlayTrack called for:", track.title);
    
    // Always make sure to initialize audio context first before any other audio operations
    initializeAudioContext();
    
    // If we're already playing this track, just toggle play/pause
    if (currentTrack && track.id === currentTrack.id) {
      togglePlayPause();
      return;
    }
    
    // Pause any currently playing audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Update track queue if needed
    if (createNewQueue) {
      // Create a new queue with all tracks of the same mood
      const tracksOfSameMood = mockTracks.filter(t => t.mood === track.mood);
      
      // Find the index of selected track in mood-filtered tracks
      const trackIndex = tracksOfSameMood.findIndex(t => t.id === track.id);
      
      console.log(`Creating queue with ${tracksOfSameMood.length} tracks of ${track.mood} mood`);
      setTrackQueue(tracksOfSameMood);
      setQueueIndex(trackIndex >= 0 ? trackIndex : 0);
    }
    
    setCurrentTrack(track);

// Wait one tick before playing, so `currentTrack` is reactive before `isPlaying` triggers a render
setTimeout(() => {
  setIsPlaying(true);
  setPlayRequestPending(false);
}, 0);

    
    // Force audio context initialization again just to be safe
    if (!audioContextInitialized) {
      initializeAudioContext();
      
      // On Safari/iOS we sometimes need to trigger context after a small delay
      setTimeout(() => {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(err => 
            console.warn('Error resuming audio context:', err)
          );
        }
      }, 100);
    }
  };

  const playNextTrack = () => {
    console.log("Attempting to play next track");
    console.log("Current queue:", trackQueue.map(t => t.title), "Current index:", queueIndex);
    
    // If we don't have enough tracks in queue, populate it with all tracks
    if (trackQueue.length <= 1) {
      console.log("Queue is empty or has only one track, using all mock tracks");
      setTrackQueue(mockTracks);
      
      // Find the index of the current track in all tracks
      const currentIndex = currentTrack 
        ? mockTracks.findIndex(t => t.id === currentTrack.id)
        : -1;
      
      // Play the next track or the first track if current not found
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % mockTracks.length : 0;
      setQueueIndex(nextIndex);
      
      // Play the track without creating a new queue
      console.log("Playing next track:", mockTracks[nextIndex].title);
      setCurrentTrack(mockTracks[nextIndex]);
      setIsPlaying(true);
      return;
    }
    
    // If we have a queue, move to the next track
    if (queueIndex < trackQueue.length - 1) {
      const nextIndex = queueIndex + 1;
      console.log("Playing next track in queue:", trackQueue[nextIndex].title);
      setQueueIndex(nextIndex);
      setCurrentTrack(trackQueue[nextIndex]);
      setIsPlaying(true);
    } else {
      // Loop back to the first track if we're at the end
      console.log("Reached end of queue, looping to first track");
      setQueueIndex(0);
      setCurrentTrack(trackQueue[0]);
      setIsPlaying(true);
    }
  };

  const playPreviousTrack = () => {
    console.log("Attempting to play previous track");
    console.log("Current queue:", trackQueue.map(t => t.title), "Current index:", queueIndex);
    
    // If we're past 3 seconds in the current track, restart it instead of going to previous
    if (currentTime > 3 && audioRef.current) {
      console.log("Restarting current track");
      audioRef.current.currentTime = 0;
      return;
    }
    
    // If we don't have enough tracks in queue, populate it with all tracks
    if (trackQueue.length <= 1) {
      console.log("Queue is empty or has only one track, using all mock tracks");
      setTrackQueue(mockTracks);
      
      // Find the index of the current track in all tracks
      const currentIndex = currentTrack 
        ? mockTracks.findIndex(t => t.id === currentTrack.id)
        : -1;
      
      // Play the previous track or the last track if current not found or at beginning
      const prevIndex = currentIndex > 0 
        ? currentIndex - 1 
        : mockTracks.length - 1;
      
      setQueueIndex(prevIndex);
      
      // Play the track without creating a new queue
      console.log("Playing previous track:", mockTracks[prevIndex].title);
      setCurrentTrack(mockTracks[prevIndex]);
      setIsPlaying(true);
      return;
    }
    
    // If we have a queue, move to the previous track
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      console.log("Playing previous track in queue:", trackQueue[prevIndex].title);
      setQueueIndex(prevIndex);
      setCurrentTrack(trackQueue[prevIndex]);
      setIsPlaying(true);
    } else {
      // Loop to the last track if we're at the beginning
      console.log("At beginning of queue, looping to last track");
      const lastIndex = trackQueue.length - 1;
      setQueueIndex(lastIndex);
      setCurrentTrack(trackQueue[lastIndex]);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    // Ensure audio context is initialized
    if (!audioContextInitialized) {
      initializeAudioContext();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    volume,
    playTrack,
    togglePlayPause,
    seek,
    setVolume,
    formatTime,
    audioRef,
    audioContextInitialized,
    initializeAudioContext,
    playNextTrack,
    playPreviousTrack,
    trackQueue,
    queueIndex,
    playRequestPending
  };
}

// Custom hook for user preferences with localStorage
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const storedPreferences = localStorage.getItem('userPreferences');
    
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch (error) {
        console.error('Error parsing user preferences:', error);
        setPreferences(defaultUserPreferences);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }
  }, [preferences, isLoaded]);

  // Update specific preference
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Add a track to recently played
  const addRecentlyPlayed = (trackId: string) => {
    setPreferences(prev => {
      const newRecent = [trackId, ...prev.recentlyPlayed.filter(id => id !== trackId)].slice(0, 10);
      return {
        ...prev,
        recentlyPlayed: newRecent
      };
    });
  };

  // Toggle favorite artist
  const toggleFavoriteArtist = (artistId: string) => {
    setPreferences(prev => {
      const isFavorite = prev.favoriteArtists.includes(artistId);
      return {
        ...prev,
        favoriteArtists: isFavorite
          ? prev.favoriteArtists.filter(id => id !== artistId)
          : [...prev.favoriteArtists, artistId]
      };
    });
  };

  return {
    preferences,
    updatePreference,
    addRecentlyPlayed,
    toggleFavoriteArtist
  };
}

// Custom hook for audio frequency data for visualizations
export function useAudioVisualization(audioRef: React.RefObject<HTMLAudioElement | null>) {
    const [audioData, setAudioData] = useState<Uint8Array | null>(null);
    const [isEnabled, setIsEnabled] = useState(true);
  
    // Global singleton to track shared audio graph
    if (typeof window !== 'undefined' && !window.hasOwnProperty('__audioVisualizationRefs')) {
      Object.defineProperty(window, '__audioVisualizationRefs', {
        value: {
          audioContext: null,
          analyser: null,
          dataArray: null,
          source: null,
          connected: false,
          audioElement: null,
          visualizers: new WeakMap()
        },
        writable: false
      });
    }
  
    const staticRefs = typeof window !== 'undefined'
      ? (window as any).__audioVisualizationRefs
      : {
          audioContext: null,
          analyser: null,
          dataArray: null,
          source: null,
          connected: false,
          audioElement: null,
          visualizers: new WeakMap()
        };
  
    const rafIdRef = useRef<number | null>(null);
    const mockDataRef = useRef<Uint8Array | null>(null);
    const lastTimeRef = useRef<number>(0);
  
    useEffect(() => {
      if (!mockDataRef.current) {
        mockDataRef.current = new Uint8Array(128);
        for (let i = 0; i < mockDataRef.current.length; i++) {
          const dist = Math.abs(i - mockDataRef.current.length / 2) / (mockDataRef.current.length / 2);
          mockDataRef.current[i] = 255 * Math.pow(1 - dist, 2) * 0.5;
        }
      }
    }, []);
  
    useEffect(() => {
      if (typeof window === 'undefined' || !audioRef.current || !isEnabled) return;
  
      staticRefs.visualizers.set(audioRef.current, true);
  
      if (staticRefs.connected && staticRefs.audioElement !== audioRef.current) {
        staticRefs.source?.disconnect();
        staticRefs.connected = false;
        staticRefs.source = null;
        staticRefs.audioElement = null;
      }
  
      const createAudioContext = () => {
        if (staticRefs.audioContext) return staticRefs.audioContext;
        try {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)({ latencyHint: 'playback' });
          staticRefs.audioContext = context;
          return context;
        } catch (e) {
          console.error('Failed to create AudioContext:', e);
          return null;
        }
      };
  
      const setupVisualization = async () => {
        const context = createAudioContext();
        if (!context) return false;
  
        if (context.state === 'suspended') {
          try {
            await context.resume();
          } catch (e) {
            console.warn('Error resuming audio context:', e);
          }
        }
  
        if (!staticRefs.analyser) {
          staticRefs.analyser = context.createAnalyser();
          staticRefs.analyser.fftSize = 256;
          staticRefs.analyser.smoothingTimeConstant = 0.7;
          staticRefs.dataArray = new Uint8Array(staticRefs.analyser.frequencyBinCount);
        }
  
        if (!staticRefs.connected || staticRefs.audioElement !== audioRef.current) {
          try {
            staticRefs.source = context.createMediaElementSource(audioRef.current);
            staticRefs.source.connect(staticRefs.analyser);
            staticRefs.analyser.connect(context.destination);
            staticRefs.connected = true;
            staticRefs.audioElement = audioRef.current;
            return true;
          } catch (e: any) {
            if (e.toString().includes('already connected')) {
              console.log('Audio source already connected');
              staticRefs.connected = true;
              staticRefs.audioElement = audioRef.current;
              return true;
            }
            console.error('Visualizer connection error:', e);
            return false;
          }
        }
  
        return true;
      };
  
      let isActive = false;
      const promise = setupVisualization().then((result) => (isActive = result));
  
      const animate = (timestamp: number) => {
        const timePassed = timestamp - lastTimeRef.current;
        const shouldUpdate = timePassed > 16;
  
        if (shouldUpdate) {
          lastTimeRef.current = timestamp;
          const playing = audioRef.current && !audioRef.current.paused;
  
          if (isActive && staticRefs.analyser && staticRefs.dataArray && playing) {
            staticRefs.analyser.getByteFrequencyData(staticRefs.dataArray);
            setAudioData(new Uint8Array(staticRefs.dataArray));
          } else {
            generateMock(playing==true);
          }
        }
  
        rafIdRef.current = requestAnimationFrame(animate);
      };
  
      const generateMock = (isPlaying: boolean) => {
        if (!mockDataRef.current) return;
        const time = Date.now() / 1000;
  
        for (let i = 0; i < mockDataRef.current.length; i++) {
          const indexNorm = i / mockDataRef.current.length;
          const phase = isPlaying ? time * 1.2 : time * 0.2;
          const wave1 = Math.sin(indexNorm * 5 + phase) * 0.5;
          const wave2 = Math.sin(indexNorm * 10 + phase * 0.7) * 0.3;
          const wave3 = Math.sin(indexNorm * 3 - phase * 0.5) * 0.2;
          const bell = Math.pow(Math.sin(indexNorm * Math.PI), 0.5);
          const composite = (wave1 + wave2 + wave3) * bell;
          const base = isPlaying ? 70 : 40;
          const amp = isPlaying ? 120 : 60;
          const value = base + amp * (composite + 1) / 2;
          const jitter = isPlaying ? (Math.random() * 15 - 7.5) : 0;
          const current = mockDataRef.current[i];
          const target = Math.min(255, Math.max(0, Math.floor(value + jitter)));
          const speed = isPlaying ? 0.15 : 0.05;
          mockDataRef.current[i] = Math.floor(current * (1 - speed) + target * speed);
        }
  
        setAudioData(new Uint8Array(mockDataRef.current));
      };
  
      rafIdRef.current = requestAnimationFrame(animate);
  
      return () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (audioRef.current && staticRefs.visualizers) {
          staticRefs.visualizers.delete(audioRef.current);
        }
  
        if (staticRefs.visualizers?.size === 0 && staticRefs.connected) {
          try {
            staticRefs.source?.disconnect();
          } catch (e) {
            console.warn('Cleanup disconnect failed:', e);
          }
          staticRefs.connected = false;
          staticRefs.source = null;
          staticRefs.audioElement = null;
        }
      };
    }, [audioRef, isEnabled]);
  
    return {
      audioData,
      isEnabled,
      setIsEnabled,
    };
  }