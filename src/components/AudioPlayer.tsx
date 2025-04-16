// AudioPlayer.tsx (Fixed Version)
"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useAudioPlayer } from '@/lib/hooks';
import { mockTracks } from '@/components/data/mockData';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';
import AlbumArt from './AlbumArt';
import WaveformVisualizer from './WaveformVisualizer';
import { motion, AnimatePresence } from 'framer-motion';

export { AlbumArt };

const fullscreenVariants = { hidden: { opacity: 0, y: 100, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }, exit: { opacity: 0, y: 60, scale: 0.98, transition: { duration: 0.25, ease: [0.32, 0, 0.67, 0] } } };
const compactVariants = { hidden: { y: 80, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }, exit: { y: 40, opacity: 0, transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] } } };

const AudioPlayer = () => {
    const {
        currentTrack,
        isPlaying,
        duration,
        currentTime,
        volume,
        togglePlayPause,
        seek,
        setVolume,
        formatTime,
        playTrack,
        playNextTrack,
        playPreviousTrack,
        audioRef,
        initializeAudioContext,
    } = useAudioPlayer();
    console.log("🎧 [AudioPlayer] currentTrack:", currentTrack);


    const [isFullscreen, setIsFullscreen] = useState(false);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);

    const playerCtx = useAudioPlayer();



    useEffect(() => {
        console.log('🔁 [AudioPlayer] context state:', playerCtx);
    }, [playerCtx]);


    useEffect(() => {
        const initAudio = () => {
            initializeAudioContext();
            window.removeEventListener('click', initAudio);
        };
        window.addEventListener('click', initAudio);
        return () => window.removeEventListener('click', initAudio);
    }, [initializeAudioContext]);

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !duration) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        seek(clickPosition * duration);
    };

    const toggleFullscreen = () => {
        if (playerRef.current) {
            playerRef.current.style.willChange = 'transform, opacity';
            setIsFullscreen(!isFullscreen);
            initializeAudioContext();
            setTimeout(() => {
                if (playerRef.current) playerRef.current.style.willChange = 'auto';
            }, 500);
        }
    };

    const dynamicStyles = useMemo(() => {
        if (!currentTrack) return {};
        return {
            background: isFullscreen
                ? `linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(${hexToRgb(currentTrack.color)},0.4) 100%)`
                : `linear-gradient(90deg, rgba(${hexToRgb(currentTrack.color)},0.85) 0%, rgba(0,0,0,0.75) 100%)`,
            boxShadow: isFullscreen ? 'none' : `0 -4px 20px rgba(${hexToRgb(currentTrack.color)}, 0.3)`
        };
    }, [currentTrack, isFullscreen]);

    if (!currentTrack) return null;

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={isFullscreen ? 'fullscreen' : 'compact'}
                ref={playerRef}
                className={isFullscreen
                    ? 'fixed inset-0 z-50 flex flex-col items-center justify-between p-8 text-white backdrop-blur-md will-change-transform'
                    : 'fixed bottom-0 left-0 right-0 text-white flex flex-col z-10 will-change-transform'}
                style={dynamicStyles}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={isFullscreen ? fullscreenVariants : compactVariants}
                layout
            >
                {isFullscreen ? (
                    <>
                        <div className="absolute top-4 right-4">
                            <button onClick={toggleFullscreen} className="text-white text-2xl hover:text-blue-300">
                                <FaCompress />
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-1 max-w-2xl w-full">
                            <AlbumArt track={currentTrack} isPlaying={isPlaying} size="xl" showShadow onClick={togglePlayPause} />
                            <h2 className="text-3xl font-bold mt-8 text-center">{currentTrack.title}</h2>
                            <h3 className="text-xl text-gray-300 mt-2 text-center">{currentTrack.artist}</h3>
                            <p className="text-sm text-gray-400 mt-1 text-center">{currentTrack.album} • {currentTrack.releaseYear}</p>
                            <div className="w-full mt-8">
                                {audioRef.current && (
                                    <WaveformVisualizer
                                        audioRef={audioRef as React.RefObject<HTMLAudioElement>}
                                        isFullscreen={isFullscreen}
                                        color={currentTrack.color}
                                    />
                                )}
                            </div>
                            <div className="w-full flex items-center space-x-4 mt-6">
                                <span className="text-sm">{formatTime(currentTime)}</span>
                                <div ref={progressBarRef} onClick={handleProgressBarClick} className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer">
                                    <div style={{ width: `${(currentTime / duration) * 100}%`, backgroundColor: currentTrack.color }} className="h-full rounded-full" />
                                </div>
                                <span className="text-sm">{formatTime(duration)}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-10 mt-8">
                                <button onClick={playPreviousTrack}><FaStepBackward /></button>
                                <button onClick={togglePlayPause} className="bg-white rounded-full h-16 w-16 flex items-center justify-center" style={{ color: currentTrack.color }}>
                                    {isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl ml-1" />}
                                </button>
                                <button onClick={playNextTrack}><FaStepForward /></button>
                            </div>
                            <div className="flex items-center space-x-4 mt-6">
                                <FaVolumeUp className="text-gray-300" />
                                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-48 accent-blue-400" style={{ accentColor: currentTrack.color }} />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={toggleFullscreen} className="absolute -top-10 right-4 p-2 bg-black bg-opacity-70 rounded-full">
                            <FaExpand />
                        </button>
                        <div className="px-4 pt-1 relative">
                            <WaveformVisualizer audioRef={audioRef as React.RefObject<HTMLAudioElement>} isFullscreen={false} color={currentTrack.color} />
                        </div>
                        <div className="flex items-center px-4 h-20">
                            <div className="flex items-center space-x-4 w-1/4">
                                <img src={currentTrack.albumArt} alt={currentTrack.title} className="h-14 w-14 rounded-md" />
                                <div>
                                    <h4 className="font-medium truncate">{currentTrack.title}</h4>
                                    <p className="text-sm text-gray-300 truncate">{currentTrack.artist}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center flex-1">
                                <div className="flex items-center space-x-6 mb-2">
                                    <button onClick={playPreviousTrack}><FaStepBackward /></button>
                                    <button onClick={togglePlayPause} className="bg-white rounded-full h-10 w-10 flex items-center justify-center" style={{ color: currentTrack.color }}>
                                        {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                                    </button>
                                    <button onClick={playNextTrack}><FaStepForward /></button>
                                </div>
                                <div className="w-full flex items-center space-x-2">
                                    <span className="text-xs">{formatTime(currentTime)}</span>
                                    <div ref={progressBarRef} onClick={handleProgressBarClick} className="flex-1 h-1.5 bg-gray-700 rounded-full cursor-pointer">
                                        <div style={{ width: `${(currentTime / duration) * 100}%`, backgroundColor: currentTrack.color }} className="h-full rounded-full" />
                                    </div>
                                    <span className="text-xs">{formatTime(duration)}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 w-1/4 justify-end">
                                <FaVolumeUp className="text-gray-300" />
                                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-24" style={{ accentColor: currentTrack.color }} />
                                <button onClick={toggleFullscreen} className="p-2 bg-gray-700 rounded-full">
                                    <FaExpand className="text-lg" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

function hexToRgb(hex: string) {
    if (!hex) return '128, 128, 128';
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return '128, 128, 128';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

export default AudioPlayer;
