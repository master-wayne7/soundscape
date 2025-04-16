"use client";

import { useEffect } from 'react';
import { useAudioPlayer } from '@/lib/hooks';

export default function TouchHandler() {
  const { initializeAudioContext } = useAudioPlayer();

  useEffect(() => {
    // This helps mobile devices handle touch events properly
    // Setting passive:true improves scroll performance
    document.addEventListener('touchstart', () => {}, { passive: true });
    
    // Use the AudioContext global object to check if exists on page load
    if (typeof window !== 'undefined' && (window as any).AudioContext) {
      // Create a temporary audio context just to enable audio on page load
      // This helps with mobile browsers that require user interaction
      try {
        const tempContext = new (window as any).AudioContext();
        
        // Suspend it immediately to save resources
        if (tempContext && tempContext.state !== 'closed') {
          tempContext.suspend();
        }
        
        // Add a touch event listener to resume it on first interaction
        const resumeOnInteraction = () => {
          // Resume the audio context when the user interacts with the page
          if (tempContext && tempContext.state === 'suspended') {
            tempContext.resume().then(() => {
              console.log('AudioContext enabled on user interaction');
              // Also initialize our app's audio context
              initializeAudioContext();
            }).catch((err: Error) => {
              console.error('Failed to resume AudioContext:', err);
            });
          }
          
          // Remove the event listeners after first interaction
          document.removeEventListener('touchstart', resumeOnInteraction);
          document.removeEventListener('touchend', resumeOnInteraction);
          document.removeEventListener('click', resumeOnInteraction);
        };
        
        // Add event listeners for various interaction types
        document.addEventListener('touchstart', resumeOnInteraction);
        document.addEventListener('touchend', resumeOnInteraction);
        document.addEventListener('click', resumeOnInteraction);
        
        // Try to auto-initialize for some browsers
        setTimeout(() => {
          try {
            initializeAudioContext();
            console.log('Auto-initialized audio context');
          } catch (e) {
            console.error('Failed to auto-initialize audio context:', e);
          }
        }, 500);
      } catch (err) {
        console.error('AudioContext initialization failed:', err);
      }
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('touchstart', () => {});
    };
  }, [initializeAudioContext]);

  // This component doesn't render anything
  return null;
} 