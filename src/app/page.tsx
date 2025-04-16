"use client";

import { useEffect } from "react";
import { useUserPreferences } from "@/lib/hooks";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MoodDiscovery from "@/components/MoodDiscovery";
import AlbumShowcase from "@/components/AlbumShowcase";
import TrackDetailView from "@/components/TrackDetailView";
import MusicTracksGrid from "@/components/MusicTracksGrid";
import AudioPlayer from "@/components/AudioPlayer";
import { toast } from "sonner";
import TouchHandler from "@/components/TouchHandler";

export default function Home() {
  const { preferences } = useUserPreferences();

  // Set initial dark mode on mount
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [preferences.darkMode]);

  // Welcome toast
  useEffect(() => {
    toast("Welcome to Soundscape", {
      description: "Discover music in a whole new way",
      duration: 5000,
    });
  }, []);

  return (
    <main className="min-h-screen text-white relative overflow-hidden pb-24">
      {/* Touch event handler for mobile */}
      <TouchHandler />

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* Background graphic elements */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-black via-[#0f0a1f] to-[#020617]" />

      <Navbar />

      <section id="home">
        <Hero />
      </section>

      <section id="discover" className="bg-gradient-to-b from-transparent to-black/40">
        <MoodDiscovery />
      </section>

      <section id="tracks" className="py-4">
        <MusicTracksGrid
          title="Browse All Tracks"
          subtitle="Explore our curated collection of tracks"
        />
      </section>

      <section id="trending" className="bg-gradient-to-b from-black/40 to-transparent">
        <AlbumShowcase />
      </section>

      <footer className="container mx-auto p-8 text-center text-sm text-white/50">
        <p>© {new Date().getFullYear()} Soundscape. All rights reserved.</p>
        <p className="mt-2">Created for Frontend UI Hackathon</p>
      </footer>

      {/* Detailed track view */}
      <TrackDetailView />

      {/* Audio player */}
      <AudioPlayer />
    </main>
  );
}
