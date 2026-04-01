import React, { useEffect, useRef, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FloatingNav } from './components/FloatingNav';
import { useUiStore } from './store/uiStore';
// import { FriendsActivity } from './components/FriendsActivity'; // MAINTENANCE
import { Player } from './components/Player';
import { AudioController } from './components/AudioController';
import { DownloadProgress } from './components/DownloadProgress';
// import { ChatWindow } from './components/ChatWindow'; // MAINTENANCE
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { AlbumDetails } from './pages/AlbumDetails';
import { ArtistDetails } from './pages/ArtistDetails';
import { LoginPromo } from './pages/LoginPromo';
import { LikedSongs } from './pages/LikedSongs';
import { PlaylistDetails } from './pages/PlaylistDetails';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { Social } from './pages/Social';
import { ArtistSelection } from './pages/ArtistSelection';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from './store/playerStore';
import { WifiOff } from 'lucide-react';

// Enhanced Page Transition
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.99 }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
      className="h-full w-full bg-black"
    >
      {children}
    </motion.div>
  );
};

// Animated Routes Component
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/library" element={<PageTransition><Library /></PageTransition>} />
        <Route path="/social" element={<PageTransition><Social /></PageTransition>} />
        <Route path="/album/:id" element={<PageTransition><AlbumDetails /></PageTransition>} />
        <Route path="/artist/:id" element={<PageTransition><ArtistDetails /></PageTransition>} />
        <Route path="/playlist/:id" element={<PageTransition><PlaylistDetails /></PageTransition>} />
        <Route path="/premium" element={<PageTransition><LoginPromo /></PageTransition>} />
        <Route path="/liked" element={<PageTransition><LikedSongs /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/artists/select" element={<PageTransition><ArtistSelection /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

// Layout wrapper to handle scroll behavior and structure
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isOfflineMode, isFullScreen } = usePlayerStore();
  const { navPosition } = useUiStore();
  // Pages that don't need sidebar/player
  const isFullScreenPage = ['/premium', '/login', '/signup', '/artists/select'].includes(location.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentNavPos = isMobile ? 'bottom' : navPosition;

  // Calculate padding based on nav position
  const getPaddingClasses = () => {
    if (isFullScreenPage) return '';
    if (currentNavPos === 'bottom') return 'pb-32 md:pb-24';
    if (currentNavPos === 'top') return 'pt-24';
    if (currentNavPos === 'left') return 'pl-24';
    if (currentNavPos === 'right') return 'pr-24';
    return '';
  };

  // Scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
    }
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] w-screen bg-black text-white overflow-hidden relative">
      <AudioController /> {/* Persistent Audio Logic */}
      
      {/* Global Offline Indicator */}
      <AnimatePresence>
          {isOfflineMode && !isFullScreenPage && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ type: "tween", duration: 0.3 }}
                className="absolute top-0 left-0 right-0 z-[100] bg-black  flex items-center justify-center p-1 border-b border-white/10"
              >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B3B3B3]">
                      <WifiOff size={12} />
                      <span>Offline Mode</span>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
      
      <motion.main 
        layout
        ref={mainRef}
        className={`flex-1 relative overflow-y-auto bg-black no-scrollbar overscroll-none ${isFullScreenPage ? 'z-50 !m-0 !rounded-none' : ''} ${isFullScreen && !isFullScreenPage ? 'md:pr-[350px] lg:pr-[280px] xl:pr-[350px]' : ''} ${getPaddingClasses()}`}
      >
         {/* Main Content */}
        {children}
      </motion.main>

      {!isFullScreenPage && <DownloadProgress />}
      {!isFullScreenPage && <Player />}
      {!isFullScreenPage && <FloatingNav />}
    </div>
  );
};

const App: React.FC = () => {
  const { setOfflineMode, themeColor } = usePlayerStore();

  useEffect(() => {
    // Update Theme Color CSS Variables
    if (themeColor) {
      document.documentElement.style.setProperty('--theme-color', themeColor);
      
      // Convert hex to rgb for opacity support
      const hex = themeColor.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--theme-color-rgb', `${r} ${g} ${b}`);
      }
    }
  }, [themeColor]);

  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setOfflineMode(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOfflineMode]);

  return (
    <HashRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </HashRouter>
  );
};

export default App;