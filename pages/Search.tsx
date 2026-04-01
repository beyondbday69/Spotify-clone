import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, ArrowLeft, X, Play, CheckCircle2, PlusCircle } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { Song, Album, Artist, SearchResult } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const BROWSE_CATEGORIES = [
  { title: "Podcasts", color: "bg-[#006450]" },
  { title: "Live Events", color: "bg-[#8400E7]" },
  { title: "Made For You", color: "bg-[#1E3264]" },
  { title: "New Releases", color: "bg-[#E8115B]" },
  { title: "Hindi", color: "bg-[#E13300]" },
  { title: "Punjabi", color: "bg-[#B02897]" },
  { title: "Tamil", color: "bg-[#503750]" },
  { title: "Charts", color: "bg-[#8D67AB]" },
  { title: "Pop", color: "bg-[#148A08]" },
  { title: "Indie", color: "bg-[#E91429]" },
  { title: "Trending", color: "bg-[#B02897]" },
  { title: "Love", color: "bg-[#FF0090]" },
  { title: "Discover", color: "bg-[#8D67AB]" },
  { title: "Radio", color: "bg-[#7358FF]" },
  { title: "Mood", color: "bg-[#E1118C]" },
  { title: "Party", color: "bg-[#537AA1]" },
  { title: "Devotional", color: "bg-[#148A08]" },
  { title: "Decades", color: "bg-[#BA5D07]" },
  { title: "Hip-Hop", color: "bg-[#BC5900]" },
  { title: "Dance / Electronic", color: "bg-[#D84000]" },
  { title: "Student", color: "bg-[#AF2896]" },
  { title: "Chill", color: "bg-[#D84000]" },
  { title: "Gaming", color: "bg-[#E8115B]" },
  { title: "K-Pop", color: "bg-[#148A08]" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ songs: Song[], albums: Album[], artists: Artist[] }>({ songs: [], albums: [], artists: [] });
  const [isLoading, setIsLoading] = useState(false);
  
  const { playSong, likedSongs, toggleLike, musicSource } = usePlayerStore();
  const navigate = useNavigate();

  // AbortController to handle race conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any ongoing fetch if query changes
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }

    if (!query.trim()) {
        setResults({ songs: [], albums: [], artists: [] });
        setIsLoading(false);
        return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
        abortControllerRef.current = new AbortController();
        try {
           const [songs, albums, artists] = await Promise.all([
              api.searchSongs(query, musicSource),
              api.searchAlbums(query),
              api.searchArtists(query)
           ]);

           // Only update if not aborted
           if (!abortControllerRef.current?.signal.aborted) {
               setResults({ songs, albums, artists });
           }
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error(e);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, musicSource]);

  const clearSearch = () => {
    setQuery('');
    setResults({ songs: [], albums: [], artists: [] });
    setIsLoading(false);
  };

  const handleResultClick = (item: SearchResult) => {
      if (item.type === 'artist') {
          navigate(`/artist/${item.id}`, { state: { artist: item } });
      } else if (item.type === 'album') {
          navigate(`/album/${item.id}`);
      } else if (item.type === 'song') {
          playSong(item as Song, results.songs.length > 0 ? results.songs : [item as Song]);
      }
  };

  const handleKeywordSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && query.trim()) {
          (e.target as HTMLInputElement).blur();
      }
  };

  const ResultSkeleton = () => (
      <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className="w-14 h-14 bg-[#222222] rounded-md shrink-0"></div>
          <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-[#222222] rounded w-1/3"></div>
              <div className="h-3 bg-[#1A1A1A] rounded w-1/4"></div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col min-h-full pb-32 bg-black">
      
      {/* Search Header - Material 3 Style */}
      <div className="sticky top-0 bg-black z-30 px-6 py-4">
         <div className="relative flex-1">
                 <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={24} />
                 <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeywordSearch}
                    placeholder="What do you want to listen to?" 
                    className="w-full bg-[#111] text-white pl-12 pr-12 py-3 rounded-full font-medium text-base placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-[#111] active:bg-[#111]"
                    autoFocus={false}
                 />
                 {query && (
                     <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-[#222] p-1 rounded-full transition-colors">
                         <X size={20} />
                     </button>
                 )}
             </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
          
          {/* VIEW 1: Browse Categories (Only when no query) */}
          {!query && (
              <div className="px-6 pb-8 animate-in fade-in duration-500">
                  <h2 className="text-white font-bold text-2xl mb-6 tracking-tight">Browse all</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {BROWSE_CATEGORIES.map((cat, idx) => (
                          <motion.div 
                              key={cat.title}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className={`${cat.color} h-[100px] md:h-[120px] rounded-md p-4 relative overflow-hidden cursor-pointer`}
                              onClick={() => setQuery(cat.title)}
                          >
                              <span className="text-white font-bold text-lg md:text-xl absolute top-4 left-4 max-w-[70%] leading-tight">{cat.title}</span>
                              {/* Decorative rotated box */}
                              <div className="absolute -bottom-2 -right-4 w-20 h-20 bg-black/20 rotate-[25deg] rounded-md transform translate-x-2 translate-y-2 "></div>
                          </motion.div>
                      ))}
                  </div>
              </div>
          )}

          {/* VIEW 2: No Results State */}
          {query && !isLoading && results.songs.length === 0 && results.artists.length === 0 && (
              <div className="px-6 text-center py-20 text-white/60">
                  <p className="text-lg font-medium">No results found for "{query}"</p>
                  <p className="text-sm mt-2">Try searching for artists, songs, or albums.</p>
              </div>
          )}

          {/* VIEW 3: Loading Skeletons */}
          {isLoading && (
              <div className="flex flex-col gap-2 pt-2 px-6">
                  <ResultSkeleton />
                  <ResultSkeleton />
                  <ResultSkeleton />
                  <ResultSkeleton />
                  <ResultSkeleton />
              </div>
          )}

          {/* VIEW 4: Search Results List */}
          {(results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0) && (
              <motion.div 
                 variants={containerVariants}
                 initial="hidden"
                 animate="visible"
                 className="flex flex-col gap-8 pb-8"
              >
                  {/* Top Result (Best Match) */}
                  {results.artists.length > 0 && (
                      <div className="px-6">
                          <h2 className="text-white font-bold text-2xl mb-4 tracking-tight">Top Result</h2>
                          <motion.div 
                              variants={itemVariants}
                              onClick={() => handleResultClick(results.artists[0])}
                              className="bg-[#111] hover:bg-[#222] p-4 rounded-xl flex flex-col items-start gap-4 transition-colors cursor-pointer group"
                          >
                              <img src={getImageUrl(results.artists[0].image)} className="w-24 h-24 rounded-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/>
                              <div className="flex flex-col gap-1">
                                  <h3 className="text-white font-bold text-3xl md:text-4xl">{results.artists[0].name}</h3>
                                  <div className="flex items-center gap-2 mt-2">
                                      <span className="bg-[#222] text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">Artist</span>
                                  </div>
                              </div>
                          </motion.div>
                      </div>
                  )}

                  {/* Songs Section */}
                  {results.songs.length > 0 && (
                      <div className="px-6">
                          <h2 className="text-white font-bold text-2xl mb-4 tracking-tight">Songs</h2>
                          <div className="flex flex-col gap-1">
                              {results.songs.map((song, i) => {
                                  const isLiked = likedSongs.some(s => s.id === song.id);
                                  return (
                                    <motion.div 
                                        key={song.id} 
                                        variants={itemVariants}
                                        onClick={() => handleResultClick(song)}
                                        className="group flex items-center gap-4 p-2 rounded-md hover:bg-[#111] cursor-pointer transition-colors"
                                    >
                                        <div className="relative w-12 h-12 shrink-0">
                                            <img src={getImageUrl(song.image)} alt={song.name} className="w-full h-full object-cover rounded-md group-hover:opacity-60 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play size={24} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className={`font-medium text-[15px] truncate ${isLiked ? 'text-accent' : 'text-white'}`}>{song.name}</span>
                                            <span className="text-sm text-white/60 truncate font-medium">{song.artists.primary[0]?.name}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {isLiked ? <CheckCircle2 size={24} className="text-accent" /> : <PlusCircle size={24} className="text-white/60 hover:text-white" />}
                                        </button>
                                        <div className="text-xs text-white/60 font-mono w-10 text-right font-medium">
                                            {(parseInt(song.duration) / 60).toFixed(0)}:{(parseInt(song.duration) % 60).toString().padStart(2, '0')}
                                        </div>
                                    </motion.div>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {/* Artists Section */}
                  {results.artists.length > 0 && (
                       <div className="px-6">
                           <h2 className="text-white font-bold text-2xl mb-4 tracking-tight">Artists</h2>
                           <div className="flex overflow-x-auto gap-6 no-scrollbar pb-6 snap-x">
                               {results.artists.map(artist => (
                                   <motion.div 
                                       key={artist.id}
                                       variants={itemVariants}
                                       onClick={() => handleResultClick(artist)}
                                       className="flex flex-col items-center gap-3 w-[120px] shrink-0 cursor-pointer group snap-start"
                                   >
                                       <div className="w-[120px] h-[120px] rounded-full overflow-hidden">
                                           <img src={getImageUrl(artist.image)} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                       </div>
                                       <span className="text-white font-medium text-center text-[14px] truncate w-full group-hover:underline">{artist.name}</span>
                                       <span className="text-white/60 text-xs font-medium">Artist</span>
                                   </motion.div>
                               ))}
                           </div>
                       </div>
                  )}

                  {/* Albums Section */}
                  {results.albums.length > 0 && (
                       <div className="px-6">
                           <h2 className="text-white font-bold text-2xl mb-4 tracking-tight">Albums</h2>
                           <div className="flex overflow-x-auto gap-6 no-scrollbar pb-6 snap-x">
                               {results.albums.map(album => (
                                   <motion.div 
                                       key={album.id}
                                       variants={itemVariants}
                                       onClick={() => handleResultClick(album)}
                                       className="flex flex-col gap-3 w-[140px] shrink-0 cursor-pointer group snap-start"
                                   >
                                       <div className="w-[140px] h-[140px] rounded-md overflow-hidden relative">
                                           <img src={getImageUrl(album.image)} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                       </div>
                                       <div className="flex flex-col gap-1 px-1">
                                            <span className="text-white font-medium text-[14px] truncate w-full group-hover:underline">{album.name}</span>
                                            <span className="text-white/60 text-xs truncate font-medium">{album.year} • Album</span>
                                       </div>
                                   </motion.div>
                               ))}
                           </div>
                       </div>
                  )}

              </motion.div>
          )}
      </div>
    </div>
  );
};