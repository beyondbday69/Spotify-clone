import React, { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { Song, Album } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { Bell, History, Settings, Play, UserCircle, WifiOff, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SongCard } from '../components/SongCard';
import { motion } from 'motion/react';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Skeleton Component
const SkeletonCard: React.FC<{ round?: boolean }> = ({ round = false }) => (
  <div className="bg-transparent w-[140px] md:w-[160px] shrink-0 animate-pulse">
    <div className={`w-full aspect-square mb-3 bg-[#111] ${round ? 'rounded-full' : 'rounded-md'}`}></div>
    <div className="flex flex-col gap-2">
      <div className="h-3 bg-[#222] rounded-full w-3/4"></div>
      <div className="h-2 bg-[#111] rounded-full w-1/2"></div>
    </div>
  </div>
);

const SkeletonShortcut: React.FC = () => (
  <div className="flex items-center gap-0 h-[56px] overflow-hidden rounded-md bg-[#111] animate-pulse">
     <div className="h-full w-[56px] bg-[#222] shrink-0"></div>
     <div className="flex-1 px-3">
         <div className="h-2.5 bg-[#222] rounded-full w-3/4"></div>
     </div>
  </div>
);

export const Home: React.FC = () => {
  const [daylist, setDaylist] = useState<Song[]>([]);
  const [recent, setRecent] = useState<(Song | Album)[]>([]); 
  const { history, playSong, currentUser, isOfflineMode, downloadedSongIds, likedSongs } = usePlayerStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Only fetch if online
    if (isOfflineMode) {
        setIsLoading(false);
        // Load local content for offline view
        const offlineSongs = likedSongs.filter(s => downloadedSongIds.includes(s.id));
        setDaylist(offlineSongs);
        return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const hour = new Date().getHours();
      let query = 'Top Hits 2024';
      if (hour >= 5 && hour < 12) query = 'Morning Acoustic';
      else if (hour >= 12 && hour < 17) query = 'Upbeat Pop';
      else query = 'Late Night Vibes';

      try {
        const songs = await api.searchSongs(query);
        // Artificial delay for smoothness if network is too fast (prevents flicker)
        await new Promise(r => setTimeout(r, 400));
        setDaylist(songs);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isOfflineMode]);

  useEffect(() => {
    // Populate recent with history or default items
    if (history.length > 0) {
      setRecent(history.slice(0, 6));
    } else if (!isOfflineMode) {
       // Defaults to populate the grid if empty history
       Promise.all([
         api.searchSongs("The Weeknd"),
         api.searchAlbums("Starboy"),
         api.searchSongs("Taylor Swift"),
         api.searchAlbums("1989"),
       ]).then(([songs, albums, songs2, albums2]) => {
          setRecent([...songs.slice(0,1), ...albums.slice(0,1), ...songs2.slice(0,1), ...albums2.slice(0,1)]);
       });
    }
  }, [history, isOfflineMode]);

  // Scroll listener for header effect (Attached to main container)
  useEffect(() => {
    const main = document.querySelector('main');
    const handleScroll = () => {
        if (main) setIsScrolled(main.scrollTop > 10);
    };
    main?.addEventListener('scroll', handleScroll);
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  const ShortcutCard: React.FC<{ title: string, image?: string, specialType?: 'liked', onClick?: () => void }> = ({ title, image, specialType, onClick }) => (
    <motion.div 
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-0 cursor-pointer h-[56px] overflow-hidden group rounded-md bg-[#111] transition-colors"
    >
        {specialType === 'liked' ? (
            <div className="h-full w-[56px] bg-[#450af5] flex items-center justify-center shrink-0">
                <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="white"><path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z"></path></svg>
            </div>
        ) : (
            <img src={image} className="h-full w-[56px] object-cover shrink-0" alt=""/>
        )}
        <div className="flex flex-1 items-center justify-between px-3 overflow-hidden">
             <span className="font-medium text-[13px] leading-tight line-clamp-2 text-white">{title}</span>
        </div>
    </motion.div>
  );

  const SectionTitle = ({ title, style }: { title: string, style?: React.CSSProperties }) => (
      <h2 className="text-xl font-bold mb-4 text-white px-6 tracking-tight" style={style}>{title}</h2>
  );

  const handleProfileClick = () => {
    if (currentUser) {
        navigate('/profile');
    } else {
        navigate('/login');
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col gap-8 min-h-full pb-36 relative bg-transparent`}
    >
      
      {/* Top Header */}
      <div className={`px-6 flex items-center justify-start gap-4 sticky top-0 z-50 py-4 transition-all duration-300 ${isScrolled ? 'bg-black' : 'bg-transparent'}`}>
         {/* Profile Icon */}
         <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProfileClick}
            className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center font-bold text-white text-sm shrink-0 cursor-pointer overflow-hidden"
         >
             {currentUser && currentUser.image ? (
                 <img src={currentUser.image} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                 <span className="font-bold">{currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserCircle size={20} />}</span>
             )}
         </motion.div>
         
         {/* Filter Chips - Google Style */}
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
             {!isOfflineMode && (
                <>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-1.5 bg-white text-black rounded-full text-[13px] font-medium transition-transform whitespace-nowrap">All</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-1.5 bg-[#222] text-white rounded-full text-[13px] font-medium whitespace-nowrap hover:bg-[#333]">Music</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-1.5 bg-[#222] text-white rounded-full text-[13px] font-medium whitespace-nowrap hover:bg-[#333]">Podcasts</motion.button>
                </>
             )}
             {isOfflineMode && (
                 <motion.button className="px-4 py-1.5 bg-[#222] text-white rounded-full text-[13px] font-medium flex items-center gap-2">
                     <WifiOff size={14} /> Offline Mode
                 </motion.button>
             )}
         </div>
      </div>

      {/* Grid Shortcuts */}
      <motion.div variants={itemVariants} className="px-6 mt-2">
          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">{isOfflineMode ? "Your Downloads" : "Jump back in"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <ShortcutCard title="Liked Songs" specialType="liked" onClick={() => navigate('/library')} />
            
            {!isOfflineMode && isLoading ? (
                Array(5).fill(0).map((_, i) => <SkeletonShortcut key={i} />)
            ) : !isOfflineMode ? (
                recent.slice(0, 5).map((item, idx) => (
                    <ShortcutCard 
                        key={item.id + idx} 
                        title={item.name} 
                        image={getImageUrl(item.image)}
                        onClick={() => item.type === 'song' ? playSong(item as Song, [item as Song]) : navigate(`/album/${item.id}`)}
                    />
                ))
            ) : null}
          </div>
      </motion.div>

      {/* Recommended / Downloaded Section */}
      <motion.section variants={itemVariants} className="mt-4">
        <SectionTitle title={isOfflineMode ? "Downloaded Music" : "Made For You"} />
        <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar px-6 snap-x">
            {isLoading && !isOfflineMode ? (
                 Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : daylist.length > 0 ? (
                 daylist.map((item, i) => (
                    <div key={i} className="snap-start">
                        <SongCard item={item} onPlay={() => playSong(item, daylist)} />
                    </div>
                 ))
            ) : (
                <div className="text-white/60 px-6 text-base font-medium">
                    {isOfflineMode ? "No downloaded music available." : "No recommendations yet."}
                </div>
            )}
        </div>
      </motion.section>

      {/* Hide online sections if offline */}
      {!isOfflineMode && (
          <>
            <motion.section variants={itemVariants}>
                <SectionTitle title="Your favorite artists" />
                <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar px-6 snap-x">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => <SkeletonCard key={i} round={true} />)
                    ) : (
                        daylist.slice(0,6).map((item, i) => (
                            <div key={i} className="snap-start">
                                <SongCard item={item} round={true} />
                            </div>
                        ))
                    )}
                </div>
            </motion.section>
            
            <motion.section variants={itemVariants}>
                <SectionTitle title="Recently played" />
                <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar px-6 snap-x">
                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    ) : recent.length > 0 ? (
                        recent.map((item, i) => (
                            <div key={i} className="snap-start">
                                <SongCard item={item} onPlay={() => item.type === 'song' && playSong(item as Song, [item as Song])} />
                            </div>
                        ))
                    ) : (
                        <div className="text-white/60 text-base font-medium px-6 h-[100px] flex items-center">Play some music to see it here.</div>
                    )}
                </div>
            </motion.section>
          </>
      )}
    </motion.div>
  );
};