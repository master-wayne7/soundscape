"use client"

import React, { useRef, useState, useEffect } from 'react';

interface SliderProps {
  value: number[];
  max: number;
  step?: number;
  onValueChange: (values: number[]) => void;
  className?: string;
}

export const Slider = ({
  value,
  max,
  step = 1,
  onValueChange,
  className = ''
}: SliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Handler for updating value based on pointer position
  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);
    const newValue = Math.round(percentage * max / step) * step;
    
    onValueChange([newValue]);
  };
  
  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e.clientX);
  };
  
  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      updateValue(e.touches[0].clientX);
    }
  };
  
  // Set up document-level event listeners for drag operations
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        updateValue(e.touches[0].clientX);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, max, step, onValueChange]);
  
  // Compute the width percentage for the thumb
  const percentage = Math.min(100, Math.max(0, (value[0] / max) * 100));
  
  return (
    <div 
      ref={sliderRef}
      className={`h-2 relative rounded-full bg-white/20 cursor-pointer ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Track fill */}
      <div 
        className="absolute h-full rounded-full bg-white"
        style={{ width: `${percentage}%` }} 
      />
      
      {/* Thumb */}
      <div 
        className="absolute h-4 w-4 -top-1 -ml-2 rounded-full bg-white shadow"
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
};
