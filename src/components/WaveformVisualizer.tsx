"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useAudio } from './AudioProvider';
import { useAudioVisualization } from '@/lib/hooks';

type WaveformVisualizerProps = {
  audioRef: React.RefObject<HTMLAudioElement>;
  isFullscreen?: boolean;
  color: string;
  className?: string;
};

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  isFullscreen = false, 
  color,
  className = "",
  audioRef

}) => {
  const { isPlaying, currentTrack } = useAudio();
const { audioData } = useAudioVisualization(audioRef);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [lastPlayState, setLastPlayState] = useState(false);
  
  // Convert hex to rgba with opacity
  const getRGBA = (hex: string, opacity: number = 1) => {
    try {
      // Remove # if present
      hex = hex.replace(/^#/, '');
      
      // Handle shorthand hex values (e.g., #fff)
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      // Parse the hex values
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Return rgba format
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } catch (e) {
      console.error('Error parsing color', e);
      return `rgba(255, 255, 255, ${opacity})`;
    }
  };
  
  // Draw the waveform on canvas for smoother animations
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with pixel ratio for sharpness
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      return rect;
    };
    
    const rect = setCanvasDimensions();
    
    // Add a resize listener to handle window resizing
    const resizeListener = () => {
      setCanvasDimensions();
    };
    
    window.addEventListener('resize', resizeListener);
    
    // Create offscreen canvas for better performance
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offCtx = offscreenCanvas.getContext('2d');
    
    if (!offCtx) return;
    
    // Wave animation variables
    let phase = 0;
    const baseFrequency = 0.05; // Lower value = wider waves
    
    // Track animation state to ensure proper cleanup
    let isAnimating = true;
    
    // Draw a smooth wave
    const drawWave = (ctx: CanvasRenderingContext2D, data: Uint8Array | null) => {
      const width = rect.width;
      const height = rect.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Increment phase ALWAYS for continuous animation
      // We'll just modulate the amplitude based on whether audio is playing
      phase += 0.05; // Wave speed - lower is slower
      
      // Create path for wave
      ctx.beginPath();
      
      // Get color variables
      const mainColor = getRGBA(color, 0.8);
      const gradientStart = getRGBA(color, 0.8);
      const gradientEnd = getRGBA(color, 0.1);
      
      // Create gradient for wave fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, gradientStart);
      gradient.addColorStop(1, gradientEnd);
      
      // Create multiple overlapping waves for a richer look
      const drawSingleWave = (
        amplitude: number, 
        frequency: number, 
        yOffset: number, 
        thickness: number = 2,
        opacity: number = 1
      ) => {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        // Calculate wave amplitude modifier based on playing state
        // When not playing, reduce the amplitude to make waves subtle but still moving
        const playingModifier = isPlaying ? 1.0 : 0.3;
        
        for (let x = 0; x < width; x++) {
          // Base wave movement
          let y = Math.sin(x * frequency + phase) * amplitude * playingModifier;
          
          // If we have audio data and is playing, modulate the wave amplitude
          if (data && data.length > 0 && isPlaying) {
            // Sample audio data
            const dataIndex = Math.floor((x / width) * data.length);
            const dataValue = data[dataIndex] || 0;
            
            // Normalize and apply a multiplier
            const audioAmplitude = (dataValue / 255) * (amplitude * 0.8);
            
            // Combine smooth sine wave with audio-reactive component
            y = Math.sin(x * frequency + phase) * (amplitude * 0.4 + audioAmplitude);
          }
          
          // Set y position (centered vertically) with offset
          const posY = height / 2 + y + yOffset;
          
          if (x === 0) {
            ctx.moveTo(x, posY);
          } else {
            ctx.lineTo(x, posY);
          }
        }
        
        // Complete the wave by connecting back to start
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        // Adjust opacity based on play state
        const finalOpacity = isPlaying ? opacity : opacity * 0.6;
        
        // Fill the wave
        ctx.fillStyle = getRGBA(color, finalOpacity * 0.3);
        ctx.fill();
        
        // Draw wave line
        ctx.lineWidth = thickness;
        ctx.strokeStyle = getRGBA(color, finalOpacity * 0.6);
        ctx.stroke();
      };
      
      // Draw multiple overlapping waves with different parameters
      const baseAmplitude = isFullscreen ? height * 0.25 : height * 0.4;
      
      // Adjust wave parameters based on fullscreen/compact mode
      if (isFullscreen) {
        // More detailed waves in fullscreen mode
        drawSingleWave(baseAmplitude * 0.8, baseFrequency * 1.2, 0, 2, 0.9);
        drawSingleWave(baseAmplitude * 0.6, baseFrequency * 0.8, -5, 1.5, 0.7);
        drawSingleWave(baseAmplitude * 0.4, baseFrequency * 1.5, 5, 1, 0.5);
        
        // Draw reflection
        ctx.globalAlpha = 0.3;
        ctx.scale(1, -0.3);
        ctx.translate(0, -height * 2.8);
        drawSingleWave(baseAmplitude * 0.8, baseFrequency * 1.2, 0, 1, 0.4);
        // Reset transformations
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
      } else {
        // Simpler waves in compact mode
        drawSingleWave(baseAmplitude * 0.7, baseFrequency * 1.1, 0, 1.5, 0.8);
        drawSingleWave(baseAmplitude * 0.4, baseFrequency * 1.3, -2, 1, 0.6);
      }
    };
    
    // Main animation loop
    const animate = () => {
      if (!isAnimating) return;
      
      if (offCtx) {
        // Draw to offscreen canvas first for better performance
        drawWave(offCtx, audioData);
        
        // Then copy to visible canvas
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(offscreenCanvas, 0, 0);
      }
      
      // Track play state changes - this helps with debugging
      if (lastPlayState !== isPlaying) {
        setLastPlayState(isPlaying);
        console.log("WaveformVisualizer: Playing state changed to", isPlaying);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      isAnimating = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      window.removeEventListener('resize', resizeListener);
    };
  }, [audioData, color, isFullscreen, isPlaying, currentTrack, lastPlayState]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full ${isFullscreen ? 'h-32' : 'h-16'} ${className}`}
      data-playing={isPlaying ? "true" : "false"}
    />
  );
};

export default WaveformVisualizer; 