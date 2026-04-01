import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { authService } from '../services/auth';
import { getImageUrl, api } from '../services/api';
import { Play, Pause, Clock3, MoreHorizontal, Trash2, Music, ArrowLeft, Search, Heart, Share2, Check, User, X } from 'lucide-react';
import { Song, UserPlaylist } from '../types';
import { motion } from 'motion/react';

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export const PlaylistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userPlaylists, playSong, currentSong, isPlaying, removePlaylist, addSongToPlaylist, importPlaylist } = usePlayerStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [viewPlaylist, setViewPlaylist] = useState<UserPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  
  const isMyPlaylist = userPlaylists.some(p => p.id === id);

  useEffect(() => {
    const main = document.querySelector('main');
    const handleScroll = () => {
        if (main) setIsScrolled(main.scrollTop > 200);
    };
    main?.addEventListener('scroll', handleScroll);
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
      const loadPlaylist = async () => {
          setIsLoading(true);
          const localPlaylist = userPlaylists.find(p => p.id === id);
          if (localPlaylist) {
              setViewPlaylist(localPlaylist);
              setIsLoading(false);
              return;
          }
          if (id) {
              const publicPlaylist = await authService.getPublicPlaylist(id);
              if (publicPlaylist) {
                  setViewPlaylist(publicPlaylist);
              }
          }
          setIsLoading(false);
      };
      loadPlaylist();
  }, [id, userPlaylists]);

  // Debounced Search for "Add Songs"
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
           const songs = await api.searchSongs(searchQuery);
           setSearchResults(songs.slice(0, 5));
        } catch (e) { console.error(e); } 
        finally { setIsSearching(false); }
      } else {
        setSearchResults([]);
      }
    }, 500); 
    return () => clearTimeout(timer);
  }, [searchQuery]);


  if (isLoading) {
      return <div className="flex h-full w-full items-center justify-center bg-transparent"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!viewPlaylist) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-white">
              <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
              <button onClick={() => navigate('/library')} className="px-6 py-2 bg-white text-black rounded-full font-bold">Back to Library</button>
          </div>
      );
  }

  const handleDelete = () => {
      if (window.confirm("Are you sure you want to delete this playlist?")) {
          removePlaylist(viewPlaylist.id);
          navigate('/library');
      }
  };

  const handleImport = () => {
      importPlaylist(viewPlaylist);
      alert('Playlist added to your library!');
  };

  const handleShare = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
          setShareFeedback(true);
          setTimeout(() => setShareFeedback(false), 2000);
      }).catch(err => console.error("Failed to copy", err));
  };

  const handleAddSong = (song: Song) => {
      addSongToPlaylist(viewPlaylist.id, song);
      setSearchQuery(''); 
  };

  const imageUrl = getImageUrl(viewPlaylist.image);
  
  // Calculate duration
  const totalDurationSeconds = viewPlaylist.songs.reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0);
  const totalDurationHours = Math.floor(totalDurationSeconds / 3600);
  const totalDurationMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  return (
    <div className="min-h-full pb-32 bg-transparent">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#222] to-transparent -z-10 transition-colors duration-700"></div>

      {/* Sticky Header Removed */}
      
      {/* Back and Share Buttons */}
      <div className="flex items-center justify-between px-6 pt-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-[#111] flex items-center justify-center text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={handleShare}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${shareFeedback ? 'bg-green-500 text-black' : 'bg-[#111] hover:bg-[#222] text-white'}`}
        >
          {shareFeedback ? <Check size={16} strokeWidth={3} /> : <Share2 size={16} />}
          <span className="hidden sm:block">{shareFeedback ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Hero Content (Image removed) */}
      <div className="flex flex-col items-start gap-3 p-6 md:p-8 pt-8 pb-8">
        <div className="flex flex-col gap-3 mb-2 w-full min-w-0">
            <span className="uppercase text-xs font-medium tracking-widest text-white/80 hidden md:block">Playlist</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter truncate">
                {viewPlaylist.title}
            </h1>
            <p className="text-white/70 text-[15px] font-medium line-clamp-2 max-w-2xl">{viewPlaylist.description}</p>
            <div className="flex items-center flex-wrap gap-2 text-[14px] font-medium text-white mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center text-[10px] text-white">
                         <User size={14} />
                    </div>
                    <span className="hover:underline cursor-pointer text-[15px]">{isMyPlaylist ? 'You' : (viewPlaylist.creator || 'User')}</span>
                </div>
                {viewPlaylist.songs.length > 0 && (
                    <>
                        <span className="text-white/60">•</span>
                        <span>{viewPlaylist.songs.length} songs,</span>
                        <span className="text-white/70 font-medium ml-1">
                            {totalDurationHours > 0 ? `${totalDurationHours} hr ` : ''}
                            {totalDurationMinutes} min
                        </span>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="hidden px-6 md:px-8 py-6 items-center gap-6  sticky top-[72px] z-40">
         {viewPlaylist.songs.length > 0 && (
             <button 
                onClick={() => playSong(viewPlaylist.songs[0], viewPlaylist.songs)}
                className="w-14 h-14 bg-accent hover:brightness-110 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
             >
                 {isPlaying && viewPlaylist.songs.some(s => s.id === currentSong?.id) ? (
                     <Pause size={28} fill="black" className="text-black" />
                 ) : (
                     <Play size={28} fill="black" className="ml-1 text-black" />
                 )}
             </button>
         )}
         <button className="text-white/50 hover:text-white transition-colors">
             <MoreHorizontal size={32} />
         </button>
      </div>

      {/* Songs List */}
      <div className="px-6 md:px-8 bg-transparent">
        
        {/* List Header */}
        {viewPlaylist.songs.length > 0 && (
            <div className="relative z-20 grid grid-cols-[16px_1fr_auto] md:grid-cols-[16px_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/5 text-white/60 text-xs font-medium uppercase tracking-widest bg-transparent">
                <span className="text-center">#</span>
                <span></span>
                <span className="hidden md:block">Album</span>
                <div className="flex justify-end pr-4"></div>
            </div>
        )}

        {/* Empty State */}
        {viewPlaylist.songs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-white/60 mt-4 bg-[#111] rounded-xl">
                <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4">
                    <Music size={32} className="opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">It feels empty here</h3>
                <p className="max-w-xs text-center text-[15px] font-medium">Find songs you love to build your perfect playlist.</p>
            </div>
        )}
        
        <motion.div 
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col pb-8"
        >
            {viewPlaylist.songs.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                    <motion.div 
                        key={`${song.id}-${index}`}
                        variants={itemVariants}
                        onClick={() => playSong(song, viewPlaylist.songs)}
                        className={`group w-full overflow-hidden grid grid-cols-[16px_1fr_auto] md:grid-cols-[16px_1fr_1fr_auto] gap-4 items-center px-6 py-2 cursor-pointer transition-colors rounded-md ${isCurrent ? 'bg-[#222]' : 'hover:bg-[#111]'}`}
                    >
                        {/* Index */}
                        <div className="flex items-center justify-center w-4 text-[15px] font-medium text-white/60">
                            {isCurrent && isPlaying ? (
                                <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" className="w-3.5 h-3.5" alt="playing" />
                            ) : (
                                <>
                                    <span className={`block group-hover:hidden ${isCurrent ? 'text-accent' : ''}`}>{index + 1}</span>
                                    <Play size={14} fill="white" className="hidden group-hover:block text-white drop-shadow-md" />
                                </>
                            )}
                        </div>

                        {/* Title */}
                        <div className="flex items-center gap-4 overflow-hidden">
                            <img src={getImageUrl(song.image)} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
                            <div className="flex flex-col truncate">
                                <span className={`font-medium text-[15px] truncate ${isCurrent ? 'text-accent' : 'text-white'}`}>{song.name}</span>
                                <span className="text-[14px] text-white/60 font-medium group-hover:text-white truncate transition-colors">{song.artists?.primary?.[0]?.name || "Unknown"}</span>
                            </div>
                        </div>

                        {/* Album */}
                        <span className="hidden md:block text-[14px] font-medium text-white/60 truncate group-hover:text-white transition-colors">{song.album?.name || "Single"}</span>
                        
                        {/* Duration */}
                        <div className="flex items-center justify-end gap-4 min-w-[60px]">
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white hidden md:block" title="Save to Liked">
                                <Heart size={18} />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>

        {/* --- ADD SONGS SECTION --- */}
        {isMyPlaylist && (
            <div className="mt-8 mb-16 pt-8">
                <div className="flex flex-col gap-4 mb-6 bg-[#111] p-6 rounded-xl">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Let's find something for your playlist</h2>
                    <div className="relative max-w-xl">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                        <input 
                            type="text" 
                            placeholder="Search for songs" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#222] text-white pl-10 pr-10 py-3 rounded-full focus:outline-none focus:bg-[#333] transition-all placeholder-white/50 text-[14px] font-medium"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                                 {isSearching ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <X size={20} />}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {searchResults.map((song) => {
                        const isAdded = viewPlaylist.songs.some(s => s.id === song.id);
                        return (
                            <div key={song.id} className="flex items-center justify-between p-2 hover:bg-[#111] rounded-md group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <img src={getImageUrl(song.image)} className="w-10 h-10 object-cover rounded-md" alt="" />
                                    <div className="flex flex-col truncate px-1">
                                        <span className="text-white font-medium text-[15px] truncate">{song.name}</span>
                                        <span className="text-white/60 font-medium text-[14px] truncate">{song.artists?.primary?.[0]?.name}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => !isAdded && handleAddSong(song)}
                                    disabled={isAdded}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${isAdded ? 'text-white/40 bg-[#111]' : 'bg-[#222] text-white hover:bg-[#333]'}`}
                                >
                                    {isAdded ? 'Added' : 'Add'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};