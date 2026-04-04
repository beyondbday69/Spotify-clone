import React from 'react';
import { usePlayerStore } from '../store/playerStore';
import { UserPlus, MessageCircle, Music2, Headphones, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const FriendsActivity: React.FC = () => {
  const { friends, openChat, currentUser } = usePlayerStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <motion.aside 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="hidden xl:flex w-[300px] bg-[#111]/80 backdrop-blur-xl border border-white/5 flex-col h-full p-0 overflow-hidden rounded-xl shadow-2xl z-20"
    >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 mb-2 text-[#B3B3B3] border-b border-white/5">
            <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">Friend Activity</span>
                <Sparkles size={14} className="text-accent animate-pulse" />
            </div>
            <motion.button 
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full" 
                onClick={() => navigate('/social')}
            >
                <UserPlus size={20} />
            </motion.button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar flex-1 px-3">
            <AnimatePresence>
                {friends.map((friend, index) => (
                    <motion.div 
                        key={friend.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 group cursor-pointer p-3 rounded-xl transition-all duration-300"
                        onClick={() => openChat(friend.id)}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <img 
                                src={friend.image || `https://ui-avatars.com/api/?name=${friend.name}&background=random`} 
                                alt={friend.name} 
                                className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-lg" 
                            />
                            
                            {/* Status Indicators */}
                            {friend.status === 'listening' ? (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-accent text-black w-4 h-4 rounded-full border-2 border-black flex items-center justify-center shadow-sm"
                                >
                                    <Headphones size={8} fill="black" />
                                </motion.div>
                            ) : friend.status === 'online' && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-black shadow-sm"></div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold text-sm truncate">{friend.name}</span>
                            </div>
                            
                            {friend.status === 'listening' && friend.currentSong ? (
                                <div className="flex flex-col">
                                    <span className="text-accent text-xs truncate font-medium">{friend.currentSong.name}</span>
                                    <div className="flex items-center gap-1 text-[#B3B3B3] text-[10px] mt-0.5">
                                        <span className="truncate">• {friend.currentSong.artists.primary[0]?.name}</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-[#B3B3B3] text-xs mt-0.5 font-medium">
                                    {friend.status === 'online' ? 'Online' : 'Offline'}
                                </span>
                            )}
                        </div>
                        
                        {/* Equalizer Animation if listening */}
                        {friend.status === 'listening' && (
                            <div className="flex gap-[2px] h-3 items-end">
                                <motion.div animate={{ height: [4, 12, 6, 10, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-[3px] bg-accent rounded-full"></motion.div>
                                <motion.div animate={{ height: [8, 4, 12, 6, 8] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-[3px] bg-accent rounded-full"></motion.div>
                                <motion.div animate={{ height: [6, 10, 4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-[3px] bg-accent rounded-full"></motion.div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {friends.length === 0 && (
                <div className="text-center px-6 mt-10">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music2 size={24} className="text-white/20" />
                    </div>
                    <p className="text-[#B3B3B3] text-sm leading-relaxed">Let friends and followers see what you're listening to.</p>
                </div>
            )}
        </div>
        
        <div className="p-5 mt-auto border-t border-white/5">
             <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/social')}
                className="w-full py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-accent transition-colors shadow-lg"
            >
                Find Friends
            </motion.button>
        </div>
    </motion.aside>
  );
};