import React from 'react';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Music } from 'lucide-react';

export const QueueSidebar: React.FC = () => {
  const { queue, currentSong, playSong } = usePlayerStore();

  if (queue.length === 0) return null;

  return (
    <motion.aside
      initial={{ x: -72 }}
      animate={{ x: 0 }}
      exit={{ x: -72 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="hidden md:flex flex-col w-[72px] bg-[#050505] border-r border-white/5 h-full shrink-0 overflow-hidden z-50"
    >
      <div className="flex flex-col items-center py-4 gap-4 overflow-y-auto no-scrollbar h-full">
        <div className="flex flex-col items-center gap-1 mb-2 group/title relative">
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#111] border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-black text-white whitespace-nowrap opacity-0 pointer-events-none group-hover/title:opacity-100 transition-opacity duration-300 z-[300] shadow-2xl tracking-widest">
              CURRENT QUEUE
            </div>
            <Music size={12} className="text-white/20 mb-1" />
            <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] vertical-text">
              QUEUE
            </div>
        </div>
        
        <AnimatePresence mode="popLayout">
          {queue.map((song, index) => {
            const isActive = currentSong?.id === song.id;
            
            return (
              <motion.div
                key={`${song.id}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playSong(song)}
                className={`relative group cursor-pointer w-12 h-12 rounded-md overflow-hidden shrink-0 transition-all duration-300 ${
                  isActive ? 'ring-2 ring-accent ring-offset-2 ring-offset-black' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {/* Tooltip */}
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#111] border border-white/10 px-3 py-1.5 rounded-md text-[11px] font-bold text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-[300] shadow-2xl">
                  {song.name}
                </div>
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
                    <div className="absolute top-0 left-0 bg-accent w-1 h-full" />
                  </div>
                )}
                <img
                  src={getImageUrl(song.image)}
                  alt={song.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {isActive ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <motion.div 
                        animate={{ height: [4, 12, 6, 10, 4] }} 
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="w-0.5 bg-accent" 
                      />
                      <motion.div 
                        animate={{ height: [8, 4, 12, 6, 8] }} 
                        transition={{ repeat: Infinity, duration: 0.7 }}
                        className="w-0.5 bg-accent" 
                      />
                      <motion.div 
                        animate={{ height: [12, 6, 8, 4, 12] }} 
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="w-0.5 bg-accent" 
                      />
                    </div>
                  ) : (
                    <Play size={16} className="text-white fill-white" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center opacity-20 mt-10">
            <Music size={24} />
          </div>
        )}
      </div>
      
      {currentSong && (
          <div className="p-4 border-t border-white/5 flex flex-col items-center gap-2 group/playing relative">
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#111] border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-black text-accent whitespace-nowrap opacity-0 pointer-events-none group-hover/playing:opacity-100 transition-opacity duration-300 z-[300] shadow-2xl tracking-widest">
                NOW PLAYING
              </div>
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping absolute inset-0" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent relative" />
              </div>
          </div>
      )}
    </motion.aside>
  );
};
