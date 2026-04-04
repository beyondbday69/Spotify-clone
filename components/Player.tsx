import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Download, Heart, Loader2, Shuffle, Repeat, CheckCircle2, PlusCircle, Sparkles, PanelRightClose } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useUiStore } from '../store/uiStore';
import { api, getImageUrl } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

// Smooth Tween Animation (No Spring) - Native iOS-like Slide
const transitionSpec = {
  type: "tween",
  ease: [0.32, 0.72, 0, 1],
  duration: 0.4
};

export const Player: React.FC = () => {
  const { 
    currentSong, 
    isPlaying, 
    isBuffering,
    isFullScreen,
    setFullScreen,
    togglePlay, 
    nextSong, 
    prevSong,
    likedSongs,
    toggleLike,
    shuffleMode,
    toggleShuffle,
    downloadedSongIds,
    startDownload,
    duration, 
    audioElement,
    seek
  } = usePlayerStore();

  const { navPosition } = useUiStore();

  const navigate = useNavigate();
  
  const [dominantColor, setDominantColor] = useState<string>('#121212');
  const [showArtVideo, setShowArtVideo] = useState(true);
  
  // Refs for State
  const isDragging = useRef(false);
  const isSeeking = useRef(false); 
  const seekBarRef = useRef<HTMLDivElement>(null);

  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);

  // Direct DOM Refs for High Performance UI
  const fullProgressRef = useRef<HTMLDivElement>(null);
  const fullThumbRef = useRef<HTMLDivElement>(null);
  const fullTimeRef = useRef<HTMLSpanElement>(null);
  const miniProgressRef = useRef<HTMLDivElement>(null);

  const isLiked = currentSong ? likedSongs.some(s => s.id === currentSong.id) : false;
  const isDownloaded = currentSong ? downloadedSongIds.includes(currentSong.id) : false;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "-:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const safeDuration = duration > 0 ? duration : 1;
  const isInteractive = duration > 0;

  // --- UI UPDATE LOOP ---
  useEffect(() => {
    let rafId: number;
    
    const updateUI = () => {
        if (isDragging.current || isSeeking.current) {
            if (isPlaying) rafId = requestAnimationFrame(updateUI);
            return;
        }

        if (!audioElement) return;
        
        const time = audioElement.currentTime;
        const percent = (time / safeDuration) * 100;
        
        if (fullProgressRef.current) fullProgressRef.current.style.width = `${percent}%`;
        if (fullThumbRef.current) fullThumbRef.current.style.left = `calc(${percent}% - 6px)`;
        if (fullTimeRef.current) fullTimeRef.current.innerText = formatTime(time);
        
        if (miniProgressRef.current) miniProgressRef.current.style.width = `${percent}%`;

        if (isPlaying) {
            rafId = requestAnimationFrame(updateUI);
        }
    };

    if (isPlaying) {
        rafId = requestAnimationFrame(updateUI);
    } else if (audioElement) {
        updateUI();
    }

    return () => {
        if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPlaying, audioElement, safeDuration, isFullScreen]);

  useEffect(() => {
    if (!currentSong) return;
    const imgUrl = getImageUrl(currentSong.image);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 1; canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        setDominantColor(`rgb(${Math.max(20, r - 30)},${Math.max(20, g - 30)},${Math.max(20, b - 30)})`);
      } catch (e) { setDominantColor('#181818'); }
    };
    img.onerror = () => setDominantColor('#181818');
  }, [currentSong?.id]);


  // --- CUSTOM SEEKER LOGIC (NO INPUT RANGE) ---

  const calculateProgress = (clientX: number) => {
      if (!seekBarRef.current) return 0;
      const rect = seekBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return x / rect.width;
  };

  const updateVisualsFromInteraction = (percent: number) => {
      const time = percent * safeDuration;
      if (fullProgressRef.current) fullProgressRef.current.style.width = `${percent * 100}%`;
      if (fullThumbRef.current) fullThumbRef.current.style.left = `calc(${percent * 100}% - 6px)`;
      if (fullTimeRef.current) fullTimeRef.current.innerText = formatTime(time);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isInteractive) return;
      e.stopPropagation(); // Stop background swipes
      e.preventDefault(); // Stop default browser actions
      
      isDragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);

      // Immediate visual update
      const percent = calculateProgress(e.clientX);
      updateVisualsFromInteraction(percent);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      e.stopPropagation();
      e.preventDefault();
      
      const percent = calculateProgress(e.clientX);
      updateVisualsFromInteraction(percent);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      e.stopPropagation();
      isDragging.current = false;
      isSeeking.current = true; // Lock UI updates from audio engine

      const percent = calculateProgress(e.clientX);
      const time = percent * safeDuration;
      
      if (!isNaN(time) && isFinite(time)) {
          seek(time);
      }
      
      // Release capture
      e.currentTarget.releasePointerCapture(e.pointerId);
      
      // Delay unlocking UI to prevent snap-back
      setTimeout(() => { isSeeking.current = false; }, 500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow swipe if NOT touching the slider container
    if ((e.target as HTMLElement).closest('.slider-container')) return;
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStart.x - touchEndX;
    const diffY = touchStart.y - touchEndY;

    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) nextSong(); else prevSong();
    }
    if (diffY < -80 && Math.abs(diffY) > Math.abs(diffX)) {
        setFullScreen(false);
    }
    setTouchStart(null);
  };

  if (!currentSong) return null;
  const imageUrl = getImageUrl(currentSong.image);

  return (
    <AnimatePresence>
        {isFullScreen ? (
            <motion.div 
                key="full-player"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                className="fixed z-[200] bg-black overflow-hidden flex flex-col isolate inset-0 md:inset-y-2 md:right-2 md:left-auto md:w-[350px] lg:w-[280px] xl:w-[350px] md:rounded-lg md:border md:border-white/10 shadow-2xl"
            >
                {/* Base Background */}
                <div 
                    className="absolute inset-0 z-[-3] pointer-events-none bg-black" 
                />

                {/* Gradient Overlay */}
                <div 
                    className="absolute inset-0 z-[-1] pointer-events-none bg-black/60" 
                />

                {/* Full Player Content */}
                <div 
                    className="absolute inset-0 flex flex-col h-full px-6 pt-safe-top pb-8 md:pb-12"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between h-14 shrink-0 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); setFullScreen(false); }} className="p-2 -ml-2 rounded-full hover:bg-[#222] shrink-0">
                            <ChevronDown size={28} className="text-white md:hidden" />
                            <PanelRightClose size={24} className="text-white/70 hover:text-white hidden md:block" />
                        </button>
                        <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/70">Now Playing</span>
                        <div className="w-10"></div>
                    </div>

                    {/* Art */}
                    <div 
                        className="flex-1 flex flex-col justify-center items-center min-h-0 py-1 md:py-4 -mx-6"
                        onClick={() => setShowArtVideo(!showArtVideo)}
                    >
                        <div className="relative w-full aspect-video md:max-w-[450px] rounded-2xl overflow-hidden bg-[#111] cursor-pointer shadow-2xl border border-white/5">
                            <AnimatePresence mode="wait">
                                {showArtVideo ? (
                                    <motion.div 
                                        key={`video-container-${currentSong.id}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <video 
                                            src={`/api/stream-proxy/${currentSong.id}`} 
                                            autoPlay 
                                            loop 
                                            muted 
                                            playsInline 
                                            className="w-full h-full object-cover object-center scale-[1.05]"
                                            onError={() => setShowArtVideo(false)}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.img 
                                        key={`img-${currentSong.id}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        src={imageUrl} 
                                        alt="Cover" 
                                        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.05]" 
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Info & Controls */}
                    <div className="flex flex-col shrink-0 gap-4 md:gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col overflow-hidden mr-4 min-w-0">
                                <h2 className="text-xl md:text-2xl font-bold text-white truncate leading-tight">{currentSong.name}</h2>
                                <p className="text-base md:text-lg text-white/70 truncate">{currentSong.artists?.primary?.[0]?.name}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }} className="shrink-0 p-1 rounded-full hover:bg-[#222222] transition-colors">
                                {isLiked ? <CheckCircle2 size={28} className="text-accent fill-black" /> : <PlusCircle size={28} className="text-white/70" />}
                            </button>
                        </div>

                        {/* Scrubber */}
                        <div className="flex flex-col gap-1 pt-1 slider-container" onClick={(e) => e.stopPropagation()}>
                            <div 
                                ref={seekBarRef}
                                className="relative h-4 w-full flex items-center cursor-pointer touch-none group"
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                style={{ touchAction: 'none' }} 
                            >
                                 <div className="absolute left-0 right-0 h-1 bg-[#333333] rounded-full overflow-hidden pointer-events-none group-hover:h-1.5 transition-all">
                                     <div ref={fullProgressRef} className="h-full bg-white rounded-full" style={{ width: '0%' }} />
                                 </div>
                                 <div ref={fullThumbRef} className="absolute h-3 w-3 bg-white rounded-full shadow-md z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: '-6px' }} />
                            </div>
                            <div className="flex justify-between text-[11px] text-white/50 font-mono font-medium pointer-events-none">
                                <span ref={fullTimeRef}>0:00</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex items-center justify-between px-2 mb-4" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={toggleShuffle} 
                                className={`shrink-0 relative group p-2 rounded-full transition-colors ${shuffleMode !== 'off' ? 'text-accent' : 'text-white/40 hover:text-white'}`}
                            >
                                <Shuffle size={20} />
                                {shuffleMode === 'smart' && (
                                    <div className="absolute -top-1 -right-1">
                                        <Sparkles size={8} fill="var(--theme-color)" className="text-accent" />
                                    </div>
                                )}
                            </button>
                            <button onClick={prevSong} className="shrink-0 p-2 hover:bg-[#1A1A1A] rounded-full transition-colors"><SkipBack size={32} className="text-white" fill="white" /></button>
                            <button 
                                onClick={togglePlay} 
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0"
                            >
                                {isBuffering ? <Loader2 size={32} className="animate-spin text-black" /> : isPlaying ? <Pause size={32} fill="black" className="text-black" /> : <Play size={32} fill="black" className="ml-1 text-black" />}
                            </button>
                            <button onClick={nextSong} className="shrink-0 p-2 hover:bg-[#1A1A1A] rounded-full transition-colors"><SkipForward size={32} className="text-white" fill="white" /></button>
                            <button className="text-white/40 shrink-0 p-2 hover:text-white transition-colors"><Repeat size={20} /></button>
                        </div>
                    </div>

                </div>
            </motion.div>
        ) : (
            <motion.div 
                key="mini-player"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                className={`fixed z-[200] bg-black border border-white/10 overflow-hidden flex flex-col isolate left-0 right-0 mx-auto w-[calc(100%-32px)] max-w-[400px] h-[64px] rounded-lg cursor-pointer p-1.5 transition-all duration-300 ease-out ${navPosition === 'bottom' ? 'bottom-[88px]' : 'bottom-6'}`}
                onClick={() => setFullScreen(true)}
            >
                {/* Backgrounds */}
                <div 
                    className="absolute inset-0 z-[-1] pointer-events-none bg-[#222]/50" 
                    style={{ backgroundColor: dominantColor ? `${dominantColor}40` : 'transparent' }}
                >
                    <div className="absolute inset-0 bg-[#0A0A0A]" />
                </div>

                {/* Mini Player Content */}
                <div className="relative flex items-center h-full w-full gap-3 px-2">
                    <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-[#333]">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
                        <div className="text-white font-bold text-sm truncate">{currentSong.name}</div>
                        <div className="text-white/70 text-xs truncate">{currentSong.artists.primary[0]?.name}</div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }} className="p-2 hover:bg-[#222222] rounded-md transition-colors"><Heart size={18} fill={isLiked ? "var(--theme-color)" : "none"} className={isLiked ? "text-accent" : "text-white"} /></button>
                        <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-2 hover:bg-[#222222] rounded-md transition-colors text-white">
                            {isBuffering ? <Loader2 size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                        </button>
                    </div>
                    <div className="absolute bottom-[-6px] left-[-6px] right-[-6px] h-[2px] bg-[#222222] overflow-hidden">
                        <div ref={miniProgressRef} className="h-full bg-white rounded-full" style={{ width: '0%' }}></div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};