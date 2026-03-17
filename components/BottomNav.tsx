import React from 'react';
import { Home, Search, Library, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';

export const BottomNav: React.FC = () => {
  const { isFullScreen, currentSong } = usePlayerStore();
  
  // Offset the dock if the player is visible so it stays centered in the remaining space
  const rightOffset = isFullScreen 
    ? 'md:right-[416px] xl:right-[466px]' 
    : currentSong 
      ? 'md:right-[380px] xl:right-[420px]' 
      : 'right-0';

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
      className={`xl:hidden fixed bottom-2 md:bottom-6 left-0 right-0 mx-auto z-[160] pointer-events-none transition-all duration-300 w-[calc(100%-16px)] max-w-[400px] ${rightOffset}`}
    >
       <div 
          className="bg-[#282828]/95 backdrop-blur-md pointer-events-auto rounded-xl flex items-center justify-around shadow-2xl border border-white/10 w-full py-2 px-2"
       >
          <NavLink to="/" className="flex flex-col items-center gap-1 min-w-[64px] py-1">
            {({ isActive }) => (
              <>
                <Home size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-[#B3B3B3]'} fill={isActive ? "white" : "none"} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-[#B3B3B3]'}`}>Home</span>
              </>
            )}
          </NavLink>

          <NavLink to="/search" className="flex flex-col items-center gap-1 min-w-[64px] py-1">
            {({ isActive }) => (
              <>
                <Search size={24} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-white' : 'text-[#B3B3B3]'} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-[#B3B3B3]'}`}>Search</span>
              </>
            )}
          </NavLink>

          <NavLink to="/library" className="flex flex-col items-center gap-1 min-w-[64px] py-1">
            {({ isActive }) => (
              <>
                <Library size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-[#B3B3B3]'} fill={isActive ? "white" : "none"} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-[#B3B3B3]'}`}>Library</span>
              </>
            )}
          </NavLink>

           <NavLink to="/social" className="flex flex-col items-center gap-1 min-w-[64px] py-1">
            {({ isActive }) => (
              <>
                <Users size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-[#B3B3B3]'} fill={isActive ? "white" : "none"} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-[#B3B3B3]'}`}>Social</span>
              </>
            )}
          </NavLink>
      </div>
    </motion.div>
  );
};