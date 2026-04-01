import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { ArrowLeft, Play, Pause, Clock3, Heart, Download, Search, ListFilter, Music, Share2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import { DownloadQualityModal } from '../components/DownloadQualityModal';
import { Song } from '../types';
import { motion, Variants } from 'motion/react';

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.2 }
  }
};

export const LikedSongs: React.FC = () => {
  const { likedSongs, playSong, currentSong, isPlaying, toggleLike } = usePlayerStore();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [downloadSong, setDownloadSong] = useState<Song | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleShare = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
          setShareFeedback(true);
          setTimeout(() => setShareFeedback(false), 2000);
      }).catch(err => console.error("Failed to copy", err));
  };

  // Scroll listener attached to MAIN container
  useEffect(() => {
    const main = document.querySelector('main');
    const handleScroll = () => {
        if (main) setIsScrolled(main.scrollTop > 200);
    };
    main?.addEventListener('scroll', handleScroll);
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  const filteredSongs = likedSongs.filter(s => 
      s.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
      s.artists.primary[0]?.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-full pb-32 bg-transparent">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[var(--theme-color)]/20 to-transparent -z-10 transition-colors duration-700" />

      {/* Sticky Header Removed */}
      
      {/* Back and Share Buttons */}
      <div className="flex items-center justify-between px-6 pt-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-[#111] flex items-center justify-center text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={handleShare}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${shareFeedback ? 'bg-green-500 text-black' : 'bg-[#111] hover:bg-[#222] text-white'}`}
        >
          {shareFeedback ? <Check size={16} strokeWidth={3} /> : <Share2 size={16} />}
          <span className="hidden sm:block">{shareFeedback ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      <div className="px-6 md:px-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8 pt-24 pb-6">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-[200px] h-[200px] md:w-[240px] md:h-[240px] bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center rounded-xl shadow-2xl shrink-0"
            >
                <Heart size={80} fill="white" className="text-white" />
            </motion.div>
            
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <span className="text-sm font-semibold tracking-wider text-white/70 uppercase">Playlist</span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter truncate">
                    Liked Songs
                </h1>
                <div className="flex items-center gap-2 text-sm text-white/80 font-medium mt-2">
                    <span className="font-bold text-white">You</span>
                    <span className="text-white/40">•</span>
                    <span>{likedSongs.length} songs</span>
                </div>
            </div>
        </div>

        {/* List Header (Simplified) */}
        <div className="relative z-20 grid grid-cols-[16px_1fr_auto] md:grid-cols-[16px_1fr_1fr_auto] gap-4 px-6 py-2 border-b border-white/10 text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="hidden md:block">Album</span>
            <div className="flex justify-end pr-4"></div>
        </div>

        {/* Songs List */}
        <motion.div 
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col pb-8"
        >
            {filteredSongs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-white/60">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Music size={32} className="opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {filterQuery ? "No matches found" : "Songs you like will appear here"}
                    </h3>
                </div>
            ) : (
                filteredSongs.map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    
                    return (
                        <motion.div
                            key={song.id}
                            variants={itemVariants}
                            onClick={() => playSong(song, likedSongs)}
                            className={`group w-full overflow-hidden grid grid-cols-[16px_1fr_auto] md:grid-cols-[16px_1fr_1fr_auto] gap-4 px-6 py-3 items-center cursor-pointer transition-all rounded-lg ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                            {/* Index / Play Icon */}
                            <div className="flex items-center justify-center w-4 text-sm font-medium text-white/50">
                                {isCurrent && isPlaying ? (
                                    <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="w-3.5 h-3.5" alt="playing" />
                                ) : (
                                    <>
                                        <span className={`block group-hover:hidden ${isCurrent ? 'text-green-500' : ''}`}>{index + 1}</span>
                                        <Play size={14} fill="white" className="hidden group-hover:block text-white" />
                                    </>
                                )}
                            </div>

                            {/* Title & Artist */}
                            <div className="flex items-center gap-4 overflow-hidden">
                                <img src={getImageUrl(song.image)} alt="" className="w-12 h-12 rounded shadow-lg object-cover shrink-0" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`truncate font-semibold text-base ${isCurrent ? 'text-green-500' : 'text-white'}`}>{song.name}</span>
                                    <span className="text-sm text-white/60 font-medium group-hover:text-white transition-colors truncate">
                                        {song.artists?.primary?.[0]?.name || "Unknown"}
                                    </span>
                                </div>
                            </div>

                            {/* Album (Desktop) */}
                            <span className="hidden md:block text-sm font-medium text-white/60 truncate group-hover:text-white transition-colors">
                                {song.album?.name || "Single"}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 min-w-[50px]">
                            </div>
                        </motion.div>
                    );
                })
            )}
        </motion.div>
        
        {/* Download Modal */}
        {downloadSong && (
            <DownloadQualityModal 
                song={downloadSong} 
                onClose={() => setDownloadSong(null)} 
            />
        )}
      </div>
    </div>
  );
};