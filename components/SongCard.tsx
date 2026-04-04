import React from 'react';
import { Play } from 'lucide-react';
import { SearchResult } from '../types';
import { getImageUrl } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SongCardProps {
  item: SearchResult;
  onPlay?: () => void;
  subtitle?: string;
  round?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ item, onPlay, subtitle, round = false }) => {
  const navigate = useNavigate();
  const imageUrl = getImageUrl(item.image);

  const handleClick = () => {
    if (item.type === 'album') {
      navigate(`/album/${item.id}`);
    } else if (item.type === 'artist') {
      navigate(`/artist/${item.id}`, { state: { artist: item } });
    } else if (item.type === 'song' && onPlay) {
      onPlay();
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) onPlay();
  };

  // Safe subtitle generation
  let safeSubtitle = subtitle;
  if (!safeSubtitle) {
      if (item.type === 'song') {
          safeSubtitle = item.artists?.primary?.[0]?.name || item.artists?.all?.[0]?.name || 'Artist';
      } else if (item.type === 'album') {
          safeSubtitle = `Album • ${item.artists?.primary?.[0]?.name || 'Artist'}`;
      } else if (item.type === 'artist') {
          safeSubtitle = 'Artist';
      } else if (item.type === 'playlist') {
          safeSubtitle = item.subtitle || 'Playlist';
      }
  }

  // Handle display title
  const displayTitle = item.type === 'playlist' ? item.title : item.name;

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        damping: 20,
        stiffness: 300,
        mass: 0.5
      }}
      onClick={handleClick}
      className="group relative bg-transparent transition-colors cursor-pointer w-[140px] md:w-[160px] shrink-0"
    >
      <div className={`relative w-full aspect-square mb-3 ${round ? 'rounded-full' : 'rounded-md'} overflow-hidden bg-[#111]`}>
        <img 
          src={imageUrl} 
          alt={displayTitle} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Play Button Overlay */}
        {!round && item.type !== 'artist' && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayClick}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-black rounded-full p-2.5 flex items-center justify-center z-20"
          >
            <Play size={18} fill="black" className="ml-0.5" />
          </motion.button>
        )}
      </div>
      <div className="flex flex-col gap-0.5 min-h-[40px]">
        <h3 className="text-white font-medium truncate text-[14px] leading-tight">
          {displayTitle}
        </h3>
        <p className="text-white/50 text-[12px] truncate">
          {safeSubtitle}
        </p>
      </div>
    </motion.div>
  );
};