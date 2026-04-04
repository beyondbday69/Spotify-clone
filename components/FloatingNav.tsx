import React, { useState, useEffect } from 'react';
import { Home, Search, Library, User, Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useUiStore, NavPosition } from '../store/uiStore';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const transitionSpec = {
  type: "spring",
  damping: 30,
  stiffness: 300,
  mass: 0.8
} as const;

export const FloatingNav: React.FC = () => {
  const location = useLocation();
  const { navPosition, setNavPosition } = useUiStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force bottom on mobile
  const currentPos = isMobile ? 'bottom' : navPosition;

  const isVertical = currentPos === 'left' || currentPos === 'right';

  const positionClasses = {
    bottom: "bottom-6 left-1/2 -translate-x-1/2 flex-row",
    top: "top-6 left-1/2 -translate-x-1/2 flex-row",
    left: "left-6 top-1/2 -translate-y-1/2 flex-col",
    right: "right-6 top-1/2 -translate-y-1/2 flex-col"
  };

  const handlePositionChange = (pos: NavPosition) => {
    setNavPosition(pos);
    setShowSettings(false);
  };

  return (
    <motion.div 
      layout
      transition={transitionSpec}
      className={`fixed z-[150] flex justify-center pointer-events-none ${positionClasses[currentPos]}`}
    >
      <div className={`flex items-center gap-1 p-1.5 bg-[#111] rounded-2xl border border-white/10 pointer-events-auto ${isVertical ? 'flex-col' : 'flex-row'}`}>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="outline-none">
              <motion.div
                layout="position"
                className={`relative flex items-center justify-center px-4 py-2.5 transition-colors z-10 cursor-pointer rounded-md ${isActive ? 'text-black' : 'text-white/60 hover:text-white'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-md -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
                  />
                )}
                <motion.div layout="position" className="shrink-0">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <AnimatePresence>
                  {isActive && (
                    <motion.span 
                      key="label"
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                      exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="text-sm font-bold overflow-hidden whitespace-nowrap block"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}

        {/* Settings Toggle (Desktop/Tablet Only) */}
        {!isMobile && (
          <div className="relative ml-1">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-md transition-colors ${showSettings ? 'bg-[#333333] text-white' : 'text-white/60 hover:text-white hover:bg-[#222222]'}`}
            >
              <Settings size={20} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: currentPos === 'bottom' ? 10 : currentPos === 'top' ? -10 : 0, x: currentPos === 'left' ? -10 : currentPos === 'right' ? 10 : 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`absolute bg-[#222] rounded-lg p-2 flex gap-1 z-50 ${
                    currentPos === 'bottom' ? 'bottom-full mb-4 left-1/2 -translate-x-1/2 flex-row' :
                    currentPos === 'top' ? 'top-full mt-4 left-1/2 -translate-x-1/2 flex-row' :
                    currentPos === 'left' ? 'left-full ml-4 top-1/2 -translate-y-1/2 flex-col' :
                    'right-full mr-4 top-1/2 -translate-y-1/2 flex-col'
                  }`}
                >
                  <button onClick={() => handlePositionChange('top')} className={`p-2 rounded-md hover:bg-[#333] ${currentPos === 'top' ? 'text-accent' : 'text-white'}`}><ArrowUp size={18} /></button>
                  <button onClick={() => handlePositionChange('bottom')} className={`p-2 rounded-md hover:bg-[#333] ${currentPos === 'bottom' ? 'text-accent' : 'text-white'}`}><ArrowDown size={18} /></button>
                  <button onClick={() => handlePositionChange('left')} className={`p-2 rounded-md hover:bg-[#333] ${currentPos === 'left' ? 'text-accent' : 'text-white'}`}><ArrowLeft size={18} /></button>
                  <button onClick={() => handlePositionChange('right')} className={`p-2 rounded-md hover:bg-[#333] ${currentPos === 'right' ? 'text-accent' : 'text-white'}`}><ArrowRight size={18} /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </motion.div>
  );
};
