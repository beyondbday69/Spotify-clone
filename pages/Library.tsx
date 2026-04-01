import React, { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { Search, Plus, ArrowUpDown, Pin, Heart, Music, UserCircle, Sparkles, CheckCircle2, WifiOff } from 'lucide-react';
import { getImageUrl } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { motion, Variants } from 'motion/react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -15 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.2
    }
  }
};

export const Library: React.FC = () => {
  const { likedSongs, userPlaylists, currentUser, isOfflineMode, downloadedSongIds } = usePlayerStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Playlists' | 'Artists' | 'Downloaded'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter Logic
  const filteredPlaylists = userPlaylists.filter(() => {
     if (isOfflineMode || filter === 'Downloaded') {
         return true; 
     }
     return true;
  });

  const downloadedLikedSongsCount = likedSongs.filter(s => downloadedSongIds.includes(s.id)).length;
  
  const FilterChip = ({ label }: { label: string }) => (
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setFilter(label as any)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === label ? 'bg-accent text-black' : 'bg-[#222] text-white hover:bg-[#333]'}`}
      >
          {label}
      </motion.button>
  );

  const handleProfileClick = () => {
    if (currentUser) {
        navigate('/profile');
    } else {
        navigate('/login');
    }
  };

  return (
    <div className="min-h-full pb-32 bg-transparent pt-4 px-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-black z-20 py-4 transition-colors duration-300 -mx-6 px-6">
          <div className="flex items-center gap-4">
              <motion.div 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={handleProfileClick}
                 className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-medium text-black text-sm cursor-pointer overflow-hidden shrink-0"
              >
                  {currentUser && currentUser.image ? (
                     <img src={currentUser.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     <span className="font-bold">{currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserCircle size={24} />}</span>
                  )}
              </motion.div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Your Library</h1>
          </div>
          <div className="flex items-center gap-5 text-white">
              {!isOfflineMode && <button onClick={() => navigate('/premium')} className="hover:text-white/70 transition-colors"><Sparkles size={24} /></button>}
              <button className="hover:text-white/70 transition-colors"><Search size={24} /></button>
              <button onClick={() => setIsModalOpen(true)} className="hover:text-white/70 transition-colors"><Plus size={28} /></button>
          </div>
      </div>

      {/* Offline Banner in Library */}
      {isOfflineMode && (
         <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-[#111] rounded-xl p-4 flex items-center gap-4"
         >
             <div className="bg-[#222] p-3 rounded-full"><WifiOff size={24} className="text-white" /></div>
             <div className="flex flex-col">
                 <span className="text-[15px] font-medium text-white">You're offline</span>
                 <span className="text-[13px] text-white/60 font-medium">Showing only downloaded music.</span>
             </div>
         </motion.div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar mask-linear-fade">
          {!isOfflineMode && <FilterChip label="All" />}
          {!isOfflineMode && <FilterChip label="Playlists" />}
          {!isOfflineMode && <FilterChip label="Artists" />}
          <FilterChip label="Downloaded" />
      </div>

      {/* Sort Row */}
      <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 text-white/70 text-sm hover:text-white transition-colors cursor-pointer">
              <ArrowUpDown size={16} />
              <span className="font-bold tracking-wide">Recents</span>
          </div>
          <div className="p-1 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="grid grid-cols-2 gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-[2px]"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-[2px]"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-[2px]"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-[2px]"></div>
              </div>
          </div>
      </div>

      {/* List Content */}
      <motion.div 
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
          
          {/* Liked Songs Pin */}
          {(!isOfflineMode || downloadedLikedSongsCount > 0) && (
              <motion.div 
                variants={itemVariants}
                onClick={() => navigate('/liked')}
                className="flex items-center gap-4 p-2 hover:bg-[#111] rounded-md cursor-pointer transition-colors group"
              >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0 rounded-md">
                     <Heart size={28} fill="white" className="text-white" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 px-1">
                      <span className="text-white font-medium text-[15px] truncate">Liked Songs</span>
                      <div className="flex items-center gap-1.5 text-white/60 text-[13px] font-medium mt-0.5">
                           <Pin size={14} fill="var(--theme-color)" className="text-accent rotate-45" />
                           <span>Playlist • {isOfflineMode ? downloadedLikedSongsCount : likedSongs.length} songs</span>
                           {isOfflineMode && <CheckCircle2 size={14} className="text-accent" />}
                      </div>
                  </div>
              </motion.div>
          )}

          {/* User Playlists */}
          {filteredPlaylists.map(playlist => (
             <motion.div 
                key={playlist.id}
                variants={itemVariants}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="flex items-center gap-4 p-2 hover:bg-[#111] rounded-md cursor-pointer transition-colors group"
             >
                <div className="w-14 h-14 bg-[#222] shrink-0 rounded-md overflow-hidden">
                    {playlist.image && playlist.image[0] ? (
                        <img src={getImageUrl(playlist.image)} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#111] ">
                            <Music size={28} className="text-white/40" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col flex-1 min-w-0 px-1">
                    <span className="text-white font-medium text-[15px] truncate">{playlist.title}</span>
                    <div className="flex items-center gap-1.5 text-white/60 text-[13px] font-medium mt-0.5 truncate">
                        <span>Playlist • {playlist.subtitle}</span>
                        {isOfflineMode && <CheckCircle2 size={14} className="text-accent" />}
                    </div>
                </div>
             </motion.div>
          ))}

          {isOfflineMode && filteredPlaylists.length === 0 && downloadedLikedSongsCount === 0 && (
              <div className="text-center py-16 text-white/60 bg-[#111] rounded-xl mt-4">
                  <WifiOff size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-xl text-white">No downloaded content found.</p>
                  <p className="text-[15px] mt-2 font-medium">Go online to download music.</p>
              </div>
          )}

      </motion.div>

      {isModalOpen && <CreatePlaylistModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};