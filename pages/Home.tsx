import React, { useEffect, useState } from 'react';
import { api, getImageUrl } from '../services/api';
import { Song, Album } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { UserCircle, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SongCard } from '../components/SongCard';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.38 } }
};

const staggerGrid = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };

const gridItem = {
  hidden: { opacity: 0, scale: 0.94, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } }
};

const SkeletonCard: React.FC<{ round?: boolean }> = ({ round = false }) => (
  <div className="bg-[#181818]/60 p-4 rounded-[20px] w-[155px] md:w-[175px] shrink-0 border border-white/5 animate-pulse">
    <div className={`w-full aspect-square mb-3 bg-white/10 ${round ? 'rounded-full' : 'rounded-[14px]'}`} />
    <div className="flex flex-col gap-2">
      <div className="h-3.5 bg-white/10 rounded-full w-3/4" />
      <div className="h-3 bg-white/5 rounded-full w-1/2" />
    </div>
  </div>
);

const SkeletonShortcut: React.FC = () => (
  <div className="flex items-center gap-0 h-[56px] overflow-hidden rounded-[12px] bg-[#1e1e1e] animate-pulse">
    <div className="h-full w-[56px] bg-white/10 shrink-0" />
    <div className="flex-1 px-3"><div className="h-3 bg-white/10 rounded-full w-3/4" /></div>
  </div>
);

const ShortcutCard: React.FC<{
  title: string; image?: string; specialType?: 'liked'; onClick?: () => void;
}> = ({ title, image, specialType, onClick }) => (
  <motion.div
    variants={gridItem}
    whileHover={{ scale: 1.025, backgroundColor: '#3a3a3a' }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex items-center gap-0 cursor-pointer h-[56px] overflow-hidden group rounded-[12px] bg-[#2a2a2a] transition-colors shadow-sm select-none"
  >
    {specialType === 'liked' ? (
      <div className="h-full w-[56px] bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0">
        <svg role="img" height="22" width="22" viewBox="0 0 24 24" fill="white">
          <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z" />
        </svg>
      </div>
    ) : (
      <img src={image} className="h-full w-[56px] object-cover shrink-0" alt="" loading="lazy" />
    )}
    <div className="flex flex-1 items-center pr-3 pl-3 overflow-hidden">
      <span className="font-bold text-[13px] leading-tight line-clamp-2 text-white">{title}</span>
    </div>
  </motion.div>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-[1.3rem] md:text-[1.45rem] font-bold mb-4 text-white px-4 tracking-tight cursor-pointer hover:underline decoration-2 underline-offset-2">
    {title}
  </h2>
);

const HScrollRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 no-scrollbar px-4 snap-x snap-mandatory">
    {children}
  </div>
);

export const Home: React.FC = () => {
  const [daylist, setDaylist] = useState<Song[]>([]);
  const [recent, setRecent] = useState<(Song | Album)[]>([]);
  const { history, playSong, currentUser, isOfflineMode, downloadedSongIds, likedSongs } = usePlayerStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Music' | 'Podcasts'>('All');

  useEffect(() => {
    if (isOfflineMode) {
      setIsLoading(false);
      setDaylist(likedSongs.filter(s => downloadedSongIds.includes(s.id)));
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
        await new Promise(r => setTimeout(r, 300));
        setDaylist(songs);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [isOfflineMode]);

  useEffect(() => {
    if (history.length > 0) {
      setRecent(history.slice(0, 8));
    } else if (!isOfflineMode) {
      Promise.all([
        api.searchSongs('The Weeknd'), api.searchAlbums('Starboy'),
        api.searchSongs('Taylor Swift'), api.searchAlbums('1989'),
      ]).then(([s1, a1, s2, a2]) => {
        setRecent([...s1.slice(0, 2), ...a1.slice(0, 2), ...s2.slice(0, 2), ...a2.slice(0, 2)]);
      });
    }
  }, [history, isOfflineMode]);

  useEffect(() => {
    const main = document.querySelector('main');
    const handleScroll = () => { if (main) setIsScrolled(main.scrollTop > 8); };
    main?.addEventListener('scroll', handleScroll, { passive: true });
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  const shortcutItems = [
    { id: 'liked', title: 'Liked Songs', specialType: 'liked' as const, onClick: () => navigate('/liked') },
    ...recent.slice(0, 7).map(item => ({
      id: item.id, title: item.name, image: getImageUrl(item.image),
      onClick: () => item.type === 'song' ? playSong(item as Song, [item as Song]) : navigate(`/album/${item.id}`),
    })),
  ];

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible"
      className="flex flex-col gap-0 min-h-full pb-40 relative bg-black"
    >
      {/* Sticky Header */}
      <div className={`px-4 flex items-center gap-3 sticky top-0 z-50 py-3 transition-all duration-200 ${
        isScrolled ? 'bg-black/95 backdrop-blur-sm border-b border-white/10 shadow-lg' : 'bg-black border-b border-transparent'
      }`}>
        <motion.div
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          onClick={() => navigate(currentUser ? '/profile' : '/login')}
          className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-black text-sm shrink-0 cursor-pointer overflow-hidden shadow-md border-2 border-black"
        >
          {currentUser?.image
            ? <img src={currentUser.image} alt="Profile" className="w-full h-full object-cover" />
            : <span className="font-bold">{currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserCircle size={20} />}</span>
          }
        </motion.div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {isOfflineMode ? (
            <motion.button className="px-5 py-2 bg-[#2a2a2a] text-white rounded-full text-[13px] font-medium flex items-center gap-2">
              <WifiOff size={14} /> Offline Mode
            </motion.button>
          ) : (
            (['All', 'Music', 'Podcasts'] as const).map(f => (
              <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-[13px] font-bold transition-colors whitespace-nowrap ${
                  activeFilter === f ? 'bg-accent text-black shadow-sm' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                }`}
              >{f}</motion.button>
            ))
          )}
        </div>
      </div>

      {/* Shortcut Grid — 2 cols mobile, 4 cols tablet+ */}
      <motion.div variants={fadeUp} className="px-4 mt-5 mb-2">
        <motion.div variants={staggerGrid} initial="hidden" animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3"
        >
          {isLoading && !isOfflineMode
            ? Array(8).fill(0).map((_, i) => <SkeletonShortcut key={i} />)
            : shortcutItems.map(item => (
                <ShortcutCard key={item.id} title={item.title}
                  image={'image' in item ? item.image : undefined}
                  specialType={'specialType' in item ? item.specialType : undefined}
                  onClick={item.onClick}
                />
              ))
          }
        </motion.div>
      </motion.div>

      {/* Jump back in */}
      <motion.section variants={fadeUp} className="mt-6">
        <SectionTitle title={isOfflineMode ? 'Downloaded Music' : 'Jump back in'} />
        <HScrollRow>
          {isLoading && !isOfflineMode
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : daylist.length > 0
              ? daylist.map((item, i) => (
                  <div key={i} className="snap-start"><SongCard item={item} onPlay={() => playSong(item, daylist)} /></div>
                ))
              : <p className="text-[#777] px-4 text-sm">{isOfflineMode ? 'No downloaded music.' : 'No recommendations yet.'}</p>
          }
        </HScrollRow>
      </motion.section>

      {/* Online-only sections */}
      <AnimatePresence>
        {!isOfflineMode && (
          <>
            <motion.section key="albums" variants={fadeUp} initial="hidden" animate="visible" className="mt-4">
              <SectionTitle title="Albums featuring songs you like" />
              <HScrollRow>
                {isLoading
                  ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
                  : daylist.slice(0, 8).map((item, i) => (
                      <div key={i} className="snap-start"><SongCard item={item} onPlay={() => playSong(item, daylist)} /></div>
                    ))
                }
              </HScrollRow>
            </motion.section>

            <motion.section key="artists" variants={fadeUp} initial="hidden" animate="visible" className="mt-4">
              <SectionTitle title="Your favourite artists" />
              <HScrollRow>
                {isLoading
                  ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} round />)
                  : daylist.slice(0, 7).map((item, i) => (
                      <div key={i} className="snap-start"><SongCard item={item} round /></div>
                    ))
                }
              </HScrollRow>
            </motion.section>

            <motion.section key="recent" variants={fadeUp} initial="hidden" animate="visible" className="mt-4">
              <SectionTitle title="Recently played" />
              <HScrollRow>
                {isLoading
                  ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                  : recent.length > 0
                    ? recent.map((item, i) => (
                        <div key={i} className="snap-start">
                          <SongCard item={item} onPlay={() => item.type === 'song' && playSong(item as Song, [item as Song])} />
                        </div>
                      ))
                    : <p className="text-[#b3b3b3] text-sm px-4 h-[100px] flex items-center">Play some music to see it here.</p>
                }
              </HScrollRow>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
