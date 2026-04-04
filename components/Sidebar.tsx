import React from 'react';
import { Home, Search, Library, Plus, Music, Sparkles, Pin, ChevronRight, ChevronLeft, Heart } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { useUiStore } from '../store/uiStore';
import { getImageUrl } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export const Sidebar: React.FC = () => {
  const { userPlaylists, currentUser } = usePlayerStore();
  const { isSidebarCollapsed, setSidebarCollapsed } = useUiStore();
  const navigate = useNavigate();

  return (
    <motion.aside 
      layout
      initial={false}
      animate={{ 
        width: isSidebarCollapsed ? 72 : 280,
        opacity: 1
      }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="flex flex-col h-full gap-2 hidden md:flex shrink-0 overflow-hidden z-20"
    >
      {/* Navigation Block */}
      <div className="bg-[#111]/80 backdrop-blur-xl border border-white/5 rounded-xl py-4 px-3 flex flex-col gap-1 shadow-2xl">
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-5'} mb-2`}>
            {!isSidebarCollapsed && (
              <motion.img 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" 
                  alt="Spotify" 
                  className="h-7 w-auto cursor-pointer" 
                  onClick={() => navigate('/')}
              />
            )}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 text-[#B3B3B3] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </motion.button>
        </div>
        
        <NavLink to="/" className={({ isActive }) => `flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-5 px-5'} py-3 rounded-xl transition-all duration-300 group relative ${isActive ? 'text-white' : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
             <>
               {isActive && (
                 <motion.div 
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
               )}
               <Home size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-accent' : ''} />
               {!isSidebarCollapsed && (
                 <motion.span 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold"
                 >
                    Home
                 </motion.span>
               )}
             </>
          )}
        </NavLink>
        
        <NavLink to="/search" className={({ isActive }) => `flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-5 px-5'} py-3 rounded-xl transition-all duration-300 group relative ${isActive ? 'text-white' : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
             <>
               {isActive && (
                 <motion.div 
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
               )}
               <Search size={24} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-accent' : ''} />
               {!isSidebarCollapsed && (
                 <motion.span 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold"
                 >
                    Search
                 </motion.span>
               )}
             </>
          )}
        </NavLink>
      </div>

      {/* Library Block */}
      <div className="bg-[#111]/80 backdrop-blur-xl border border-white/5 rounded-xl flex-1 flex flex-col overflow-hidden m-0 shadow-2xl">
        {/* Library Header */}
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-6'} py-4 z-10`}>
          <div 
             className="flex items-center gap-2 text-[#B3B3B3] hover:text-white transition-colors cursor-pointer group"
             onClick={() => navigate('/library')}
          >
             <Library size={24} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
             {!isSidebarCollapsed && <span className="font-bold text-lg">Your Library</span>}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1">
               <motion.button 
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/premium')} 
                  className="p-2 text-[#B3B3B3] hover:text-white hover:bg-white/10 rounded-full transition-colors" 
                  title="Premium"
               >
                  <Sparkles size={20} className="text-accent" />
               </motion.button>
               <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-[#B3B3B3] hover:text-white hover:bg-white/10 rounded-full transition-colors"
               >
                  <Plus size={20} />
               </motion.button>
            </div>
          )}
        </div>

        {/* Library Items */}
        <motion.div 
            className="flex-1 overflow-y-auto no-scrollbar px-3 mt-2 pb-4"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.05 } }
            }}
        >
            {/* Liked Songs */}
            <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/liked')}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4 px-3'} py-2 rounded-xl cursor-pointer group transition-all duration-300`}
            >
                <div className="w-12 h-12 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-lg flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-accent/20">
                    <Heart size={20} fill="white" className="text-white" />
                </div>
                {!isSidebarCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col overflow-hidden"
                  >
                      <span className="text-white font-medium truncate text-[15px]">Liked Songs</span>
                      <div className="flex items-center gap-1 text-sm text-[#B3B3B3] truncate">
                          <Pin size={14} className="text-accent -rotate-45" />
                          <span>Auto Playlist</span>
                      </div>
                  </motion.div>
                )}
            </motion.div>

             {/* User Playlists */}
             {userPlaylists.map((playlist) => (
                 <motion.div 
                    key={playlist.id} 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4 px-3'} py-2 rounded-xl cursor-pointer group transition-all duration-300`}
                >
                    <div className="w-12 h-12 bg-[#222] rounded-lg shrink-0 overflow-hidden flex items-center justify-center shadow-lg border border-white/5">
                        {playlist.image && playlist.image[0] ? (
                             <img src={getImageUrl(playlist.image)} className="w-full h-full object-cover" alt="" />
                        ) : (
                             <Music size={24} className="text-white/40" />
                        )}
                    </div>
                    {!isSidebarCollapsed && (
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col overflow-hidden"
                      >
                          <span className="text-white font-medium truncate text-[15px]">{playlist.title}</span>
                          <span className="text-sm text-[#B3B3B3] truncate">Playlist • {currentUser ? currentUser.name : 'Guest'}</span>
                      </motion.div>
                    )}
                </motion.div>
             ))}
        </motion.div>
        
        {/* User / Login Section */}
        <div className={`p-4 mt-auto border-t border-white/5 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
             {currentUser ? (
                 <motion.div 
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/profile')}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'} group cursor-pointer py-2 rounded-xl transition-all duration-300`}
                >
                     <div className="flex items-center gap-3">
                         {currentUser.image ? (
                             <img src={currentUser.image} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                         ) : (
                             <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-black font-bold shadow-lg">
                                {currentUser.name.charAt(0).toUpperCase()}
                             </div>
                         )}
                         {!isSidebarCollapsed && (
                           <motion.div 
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col"
                           >
                               <span className="text-sm font-bold truncate max-w-[120px] text-white">{currentUser.name}</span>
                               <span className="text-[10px] text-[#B3B3B3] truncate max-w-[120px]">View Profile</span>
                           </motion.div>
                         )}
                     </div>
                 </motion.div>
             ) : (
                 <div className={`flex flex-col gap-2 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                     <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/signup')} 
                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-accent transition-colors shadow-lg"
                    >
                         Sign Up
                     </motion.button>
                     <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/login')}
                        className="w-full border border-white/20 text-white font-bold py-3 rounded-xl hover:border-white transition-colors"
                    >
                         Log In
                     </motion.button>
                 </div>
             )}
        </div>
      </div>
    </motion.aside>
  );
};