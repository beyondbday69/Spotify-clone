import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Play, CheckCircle2, PlusCircle, Camera } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { Song, Album, Artist, SearchResult } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Browse categories ────────────────────────────────────────────────────────

const TOP_CATEGORIES = [
  { title: 'Music',       color: 'from-[#E8115B] to-[#c4186c]',  emoji: '🎵' },
  { title: 'Podcasts',    color: 'from-[#006450] to-[#27856a]',  emoji: '🎙️' },
  { title: 'Live Events', color: 'from-[#8400E7] to-[#a32ed1]',  emoji: '🎤' },
  { title: 'Home of I-Pop', color: 'from-[#0D73EC] to-[#2b8cf4]', emoji: '🎶' },
];

const DISCOVER_CATEGORIES = [
  { title: '#krushfunk',  img: 'https://i.scdn.co/image/ab67706f00000002d84f785a4fd1d3a4c5fea9a8' },
  { title: '#clean girl', img: 'https://i.scdn.co/image/ab67706f000000027f17cf5a9b2e4c3a45dd0e7e' },
  { title: '#surf crush', img: 'https://i.scdn.co/image/ab67706f000000028b7aca09bf70c9c0a8c0ac12' },
  { title: '#jirai kei',  img: 'https://i.scdn.co/image/ab67706f00000002a19deeff8c5a7f95c5ef82b3' },
  { title: '#ventcore',   img: 'https://i.scdn.co/image/ab67706f00000002ae02f64e025d2b49c5cccd2e' },
];

const BROWSE_ALL = [
  { title: 'Made For You', color: 'bg-[#1E3264]' },
  { title: 'Upcoming',     color: 'bg-[#E8115B]' },
  { title: 'New',          color: 'bg-[#148A08]' },
  { title: 'Hindi',        color: 'bg-[#E13300]' },
  { title: 'Punjabi',      color: 'bg-[#B02897]' },
  { title: 'Tamil',        color: 'bg-[#503750]' },
  { title: 'Charts',       color: 'bg-[#8D67AB]' },
  { title: 'Pop',          color: 'bg-[#148A08]' },
  { title: 'Indie',        color: 'bg-[#E91429]' },
  { title: 'Trending',     color: 'bg-[#B02897]' },
  { title: 'Love',         color: 'bg-[#FF0090]' },
  { title: 'Discover',     color: 'bg-[#8D67AB]' },
  { title: 'Radio',        color: 'bg-[#7358FF]' },
  { title: 'Mood',         color: 'bg-[#E1118C]' },
  { title: 'Party',        color: 'bg-[#537AA1]' },
  { title: 'Devotional',   color: 'bg-[#148A08]' },
  { title: 'Decades',      color: 'bg-[#BA5D07]' },
  { title: 'Hip-Hop',      color: 'bg-[#BC5900]' },
  { title: 'Dance / Electronic', color: 'bg-[#D84000]' },
  { title: 'Gaming',       color: 'bg-[#E8115B]' },
  { title: 'K-Pop',        color: 'bg-[#148A08]' },
  { title: 'Chill',        color: 'bg-[#D84000]' },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const pageEnter = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};

const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.35 } }
};

const scaleIn = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

const listStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04 } }
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

const ResultSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    <div className="w-14 h-14 bg-white/10 rounded-md shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-white/10 rounded-full w-1/3" />
      <div className="h-3 bg-white/5  rounded-full w-1/4" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ songs: Song[], albums: Album[], artists: Artist[] }>
    ({ songs: [], albums: [], artists: [] });
  const [isLoading, setIsLoading] = useState(false);

  const { playSong, likedSongs, toggleLike, musicSource } = usePlayerStore();
  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    if (!query.trim()) { setResults({ songs: [], albums: [], artists: [] }); setIsLoading(false); return; }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current = new AbortController();
      try {
        const [songs, albums, artists] = await Promise.all([
          api.searchSongs(query, musicSource),
          api.searchAlbums(query),
          api.searchArtists(query),
        ]);
        if (!abortRef.current?.signal.aborted)
          setResults({ songs, albums, artists });
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error(e);
      } finally {
        if (!abortRef.current?.signal.aborted) setIsLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [query, musicSource]);

  const clearSearch = () => {
    setQuery('');
    setResults({ songs: [], albums: [], artists: [] });
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleResultClick = (item: SearchResult) => {
    if (item.type === 'artist')      navigate(`/artist/${item.id}`, { state: { artist: item } });
    else if (item.type === 'album')  navigate(`/album/${item.id}`);
    else if (item.type === 'song')   playSong(item as Song, results.songs.length > 0 ? results.songs : [item as Song]);
  };

  const hasResults = results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  return (
    <motion.div
      variants={pageEnter} initial="hidden" animate="visible"
      className="flex flex-col min-h-full pb-36 bg-black"
    >
      {/* ── Sticky Search Bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 bg-black z-30 px-4 pt-4 pb-3 border-b border-transparent transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={22} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              placeholder="What do you want to listen to?"
              className="w-full bg-white text-black pl-12 pr-12 py-3.5 rounded-full font-bold text-base placeholder-black/60 focus:outline-none focus:ring-4 focus:ring-accent/40 transition-all shadow-md"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:bg-black/10 p-1 rounded-full"
                >
                  <X size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          {/* Camera icon (tablet only, like screenshot) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="hidden md:flex shrink-0 w-11 h-11 rounded-full bg-[#2a2a2a] items-center justify-center text-white hover:bg-[#3a3a3a] transition-colors"
          >
            <Camera size={20} />
          </motion.button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-2">

        {/* VIEW 1: Browse (no query) */}
        <AnimatePresence mode="wait">
          {!query && (
            <motion.div key="browse" variants={pageEnter} initial="hidden" animate="visible" exit={{ opacity: 0 }}
              className="px-4 pb-8 pt-2"
            >
              {/* Start browsing — top 4 categories row */}
              <motion.div variants={fadeUp} className="mb-6">
                <h2 className="text-white font-bold text-xl mb-3">Start browsing</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TOP_CATEGORIES.map(cat => (
                    <motion.div
                      key={cat.title}
                      variants={scaleIn}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setQuery(cat.title)}
                      className={`bg-gradient-to-br ${cat.color} h-[90px] md:h-[100px] rounded-[16px] p-4 relative overflow-hidden cursor-pointer shadow-lg flex items-end`}
                    >
                      <span className="text-white font-bold text-base md:text-lg leading-tight z-10">{cat.title}</span>
                      <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-white/15 rotate-[25deg] rounded-md" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Discover something new */}
              <motion.div variants={fadeUp} className="mb-6">
                <h2 className="text-white font-bold text-xl mb-3">Discover something new</h2>
                <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
                  {DISCOVER_CATEGORIES.map(cat => (
                    <motion.div
                      key={cat.title}
                      variants={scaleIn}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setQuery(cat.title.replace('#', ''))}
                      className="shrink-0 w-[150px] md:w-[170px] cursor-pointer group"
                    >
                      <div className="w-full aspect-square rounded-[14px] overflow-hidden mb-2 shadow-lg bg-[#2a2a2a]">
                        <img
                          src={cat.img}
                          alt={cat.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <span className="text-white/80 text-sm font-medium">{cat.title}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Browse all grid */}
              <motion.div variants={fadeUp}>
                <h2 className="text-white font-bold text-xl mb-3">Browse all</h2>
                <motion.div
                  variants={listStagger} initial="hidden" animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                >
                  {BROWSE_ALL.map(cat => (
                    <motion.div
                      key={cat.title}
                      variants={scaleIn}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQuery(cat.title)}
                      className={`${cat.color} h-[90px] md:h-[108px] rounded-[16px] p-4 relative overflow-hidden cursor-pointer shadow-md`}
                    >
                      <span className="text-white font-bold text-base md:text-lg absolute top-4 left-4 max-w-[70%] leading-tight">{cat.title}</span>
                      <div className="absolute -bottom-2 -right-4 w-20 h-20 bg-white/20 rotate-[25deg] rounded-md transform translate-x-2 translate-y-2" />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* VIEW 2: Loading */}
          {query && isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-1 pt-2"
            >
              {Array(6).fill(0).map((_, i) => <ResultSkeleton key={i} />)}
            </motion.div>
          )}

          {/* VIEW 3: No results */}
          {query && !isLoading && !hasResults && (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="px-4 text-center py-20 text-[#777]"
            >
              <p className="text-lg font-semibold">No results for "{query}"</p>
              <p className="text-sm mt-2">Try searching for artists, songs, or albums.</p>
            </motion.div>
          )}

          {/* VIEW 4: Results */}
          {query && !isLoading && hasResults && (
            <motion.div key="results" variants={pageEnter} initial="hidden" animate="visible" exit={{ opacity: 0 }}
              className="flex flex-col gap-8 pb-8"
            >
              {/* Top Result */}
              {results.artists.length > 0 && (
                <motion.div variants={fadeUp} className="px-4">
                  <h2 className="text-white font-bold text-xl mb-4">Top Result</h2>
                  <motion.div
                    whileHover={{ backgroundColor: '#282828', scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => handleResultClick(results.artists[0])}
                    className="bg-[#181818] p-5 rounded-[20px] flex flex-col items-start gap-4 transition-colors cursor-pointer group shadow-lg border border-white/5"
                  >
                    <img src={getImageUrl(results.artists[0].image)}
                      className="w-24 h-24 rounded-full shadow-lg object-cover group-hover:scale-105 transition-transform" alt="" />
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white font-bold text-2xl md:text-3xl">{results.artists[0].name}</h3>
                      <span className="bg-[#121212] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Artist</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Songs */}
              {results.songs.length > 0 && (
                <motion.div variants={fadeUp} className="px-4">
                  <h2 className="text-white font-bold text-xl mb-2">Songs</h2>
                  <motion.div variants={listStagger} initial="hidden" animate="visible" className="flex flex-col gap-0.5">
                    {results.songs.map(song => {
                      const isLiked = likedSongs.some(s => s.id === song.id);
                      return (
                        <motion.div key={song.id} variants={scaleIn}
                          onClick={() => handleResultClick(song)}
                          className="group flex items-center gap-4 p-3 rounded-[12px] hover:bg-[#2a2a2a] cursor-pointer transition-colors"
                        >
                          <div className="relative w-14 h-14 shrink-0">
                            <img src={getImageUrl(song.image)} alt={song.name}
                              className="w-full h-full object-cover rounded-md shadow-sm group-hover:opacity-60 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={22} fill="white" className="text-white" />
                            </div>
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className={`font-bold text-[15px] truncate ${isLiked ? 'text-accent' : 'text-white'}`}>{song.name}</span>
                            <span className="text-sm text-[#b3b3b3] truncate">{song.artists.primary[0]?.name}</span>
                          </div>
                          <button onClick={e => { e.stopPropagation(); toggleLike(song); }}
                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isLiked
                              ? <CheckCircle2 size={22} className="text-accent" />
                              : <PlusCircle size={22} className="text-[#b3b3b3] hover:text-white" />
                            }
                          </button>
                          <div className="text-xs text-[#b3b3b3] font-mono w-10 text-right">
                            {(parseInt(song.duration) / 60).toFixed(0)}:{(parseInt(song.duration) % 60).toString().padStart(2, '0')}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              )}

              {/* Artists */}
              {results.artists.length > 0 && (
                <motion.div variants={fadeUp} className="px-4">
                  <h2 className="text-white font-bold text-xl mb-4">Artists</h2>
                  <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4">
                    {results.artists.map(artist => (
                      <motion.div key={artist.id} variants={scaleIn}
                        onClick={() => handleResultClick(artist)}
                        className="flex flex-col items-center gap-3 w-[140px] shrink-0 cursor-pointer group"
                      >
                        <div className="w-[140px] h-[140px] rounded-full overflow-hidden shadow-lg">
                          <img src={getImageUrl(artist.image)} alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <span className="text-white font-bold text-center text-sm truncate w-full group-hover:underline">{artist.name}</span>
                        <span className="text-[#b3b3b3] text-xs -mt-2">Artist</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Albums */}
              {results.albums.length > 0 && (
                <motion.div variants={fadeUp} className="px-4">
                  <h2 className="text-white font-bold text-xl mb-4">Albums</h2>
                  <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4">
                    {results.albums.map(album => (
                      <motion.div key={album.id} variants={scaleIn}
                        onClick={() => handleResultClick(album)}
                        className="flex flex-col gap-3 w-[160px] shrink-0 cursor-pointer group"
                      >
                        <div className="w-[160px] h-[160px] rounded-[16px] overflow-hidden shadow-lg">
                          <img src={getImageUrl(album.image)} alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-white font-bold text-sm truncate group-hover:underline">{album.name}</span>
                          <span className="text-[#b3b3b3] text-xs">{album.year} • Album</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
