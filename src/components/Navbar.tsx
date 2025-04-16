"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserPreferences } from '@/lib/hooks';
import { moods } from '@/components/data/mockData';

export default function Navbar() {
  const { preferences, updatePreference } = useUserPreferences();
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    updatePreference('darkMode', !preferences.darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/70 backdrop-blur-lg shadow-md' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="text-xl font-bold flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="black" 
              className="w-5 h-5"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
            </motion.svg>
          </div>
          <span>Soundscape</span>
        </motion.div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#home" label="Home" />
          <NavLink href="#discover" label="Discover" />
          <NavLink href="#trending" label="Trending" />
          <NavLink href="#artists" label="Artists" />
        </div>
        
        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <motion.button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            onClick={toggleDarkMode}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            {preferences.darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </motion.button>
          
          <motion.button
            className="hidden md:block px-4 py-2 rounded-full bg-white text-black font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
          
          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            whileTap={{ scale: 0.9 }}
          >
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <motion.a 
      href={href}
      className="relative text-sm font-medium hover:text-white"
      whileHover={{ scale: 1.05 }}
    >
      {label}
      <motion.span 
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  );
} 