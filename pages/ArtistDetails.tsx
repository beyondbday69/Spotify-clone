import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { Artist, Song, Album } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { Play, Pause, CheckCircle2, PlusCircle, ArrowLeft, MoreHorizontal, Disc } from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const ArtistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(location.state?.artist || null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(!artist);
  const { playSong, currentSong, isPlaying, toggleLike, likedSongs } = usePlayerStore();

  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    const main = document.querySelector('main');
    const handleScroll = () => {
        if (main) {
            const opacity = Math.min(main.scrollTop / 200, 1);
            setScrollOpacity(opacity);
        }
    };
    main?.addEventListener('scroll', handleScroll);
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let currentArtist = artist;

      // 1. Fetch Artist Info if not present
      if (!currentArtist && id) {
        try {
           const results = await api.searchArtists(id);
           if (results.length > 0) {
             currentArtist = results[0];
             setArtist(currentArtist);
           }
        } catch (e) {
           console.error("Failed to fetch artist", e);
        }
      }

      // 2. Fetch Songs and Albums
      if (currentArtist) {
        setLoading(true);
        try {
            const [trackResults, albumResults] = await Promise.all([
                api.searchSongs(currentArtist.name),
                api.searchAlbums(currentArtist.name)
            ]);
            setSongs(trackResults);
            setAlbums(albumResults);
        } catch (e) {
            console.error("Failed to fetch artist details", e);
        } finally {
            setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, artist]);

  if (loading) {
     return <div className="flex h-screen w-full items-center justify-center bg-transparent"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!artist) {
      return (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
              <span className="text-white/50 font-bold">Artist not found.</span>
              <button onClick={() => navigate('/search')} className="px-6 py-3 bg-white text-black rounded-full text-[14px] font-bold hover:scale-105 transition-transform">Go to Search</button>
          </div>
      );
  }

  const imageUrl = getImageUrl(artist.image);

  return (
    <div className="min-h-full pb-32 bg-transparent text-white relative isolate">
        
        {/* Sticky Header */}
        <div 
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex items-center justify-between px-6 py-4 ${scrollOpacity > 0.1 ? 'bg-black' : 'bg-transparent'}`}
        >
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-[#111] flex items-center justify-center text-white transition-colors">
                <ArrowLeft size={24} />
            </button>
            <span 
                className="font-bold text-xl transition-opacity duration-300"
                style={{ opacity: scrollOpacity }}
            >
                {artist.name}
            </span>
            <button className="w-10 h-10 rounded-full hover:bg-[#111] flex items-center justify-center text-white transition-colors">
                <MoreHorizontal size={24} />
            </button>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-[400px] md:h-[500px] -mt-[80px] z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#050505] z-10"></div>
            <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
                src={imageUrl} 
                alt={artist.name} 
                className="w-full h-full object-cover object-center" 
            />
            <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                 <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mb-2"
                 >
                     <CheckCircle2 size={24} className="text-[#3d91f4] fill-white bg-white rounded-full border-none" />
                     <span className="text-xs font-medium uppercase tracking-widest">Verified Artist</span>
                 </motion.div>
                 <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
                >
                    {artist.name}
                 </motion.h1>
                 <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 mt-2 font-medium text-[15px]"
                 >
                    10,230,129 monthly listeners
                 </motion.p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-6 flex items-center gap-6 relative z-20">
             <motion.button 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", delay: 0.5 }}
                 onClick={() => songs.length > 0 && playSong(songs[0], songs)}
                 className="w-14 h-14 bg-accent rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
             >
                 {isPlaying && currentSong?.artists?.primary?.[0]?.name === artist.name ? (
                     <Pause size={28} fill="black" className="text-black" />
                 ) : (
                     <Play size={28} fill="black" className="text-black ml-1" />
                 )}
             </motion.button>
             <button className="px-6 py-2 rounded-full border border-white/20 text-sm font-medium hover:border-white hover:bg-[#111] transition-all">
                 Follow
             </button>
        </div>

        {/* Popular Songs */}
        <div className="px-6 pb-10 relative z-20">
            <h2 className="text-2xl font-bold mb-6">Popular</h2>
            <motion.div 
                className="flex flex-col gap-1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {songs.length === 0 ? (
                    <div className="text-white/50 italic font-medium">No songs found.</div>
                ) : (
                    songs.slice(0, 5).map((song, index) => {
                        const isCurrent = currentSong?.id === song.id;
                        const isSongLiked = likedSongs.some(s => s.id === song.id);

                        return (
                            <motion.div 
                                key={song.id}
                                variants={itemVariants}
                                onClick={() => playSong(song, songs)}
                                className={`flex items-center gap-4 p-2 rounded-md cursor-pointer transition-colors ${isCurrent ? 'bg-[#222]' : 'hover:bg-[#111]'}`}
                            >
                                <span className={`w-6 text-center text-[14px] font-medium ${isCurrent ? 'text-accent' : 'text-white/50'}`}>
                                    {index + 1}
                                </span>

                                <img src={getImageUrl(song.image)} className="w-12 h-12 rounded-md object-cover" alt="" />

                                <div className="flex-1 min-w-0">
                                    <div className={`font-medium truncate text-[15px] ${isCurrent ? 'text-accent' : 'text-white'}`}>
                                        {song.name}
                                    </div>
                                    <div className="text-[14px] text-white/50 font-medium truncate mt-0.5">
                                        {song.downloadUrl?.some(u => u.quality.includes('320')) && (
                                            <span className="bg-[#333] text-white px-1 py-0.5 rounded text-[10px] mr-2 font-medium">E</span>
                                        )}
                                        {song.artists.primary[0]?.name}
                                    </div>
                                </div>

                                <span className="text-[14px] text-white/50 font-medium hidden md:block pr-4">
                                    {(parseInt(song.duration) / 60).toFixed(0)}:{(parseInt(song.duration) % 60).toString().padStart(2, '0')}
                                </span>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                                    className={`p-2 rounded-full transition-colors ${isSongLiked ? 'text-accent' : 'text-white/50 hover:text-white hover:bg-[#222]'}`}
                                >
                                    {isSongLiked ? <CheckCircle2 size={20} /> : <PlusCircle size={20} />}
                                </button>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>
        </div>

        {/* Albums Section */}
        {albums.length > 0 && (
            <div className="px-6 pb-8 relative z-20">
                <h2 className="text-2xl font-bold mb-6">Discography</h2>
                <div className="flex overflow-x-auto gap-6 no-scrollbar pb-4 -mx-6 px-6">
                    {albums.map((album) => (
                        <motion.div 
                            key={album.id} 
                            whileHover={{ y: -5 }}
                            className="w-[140px] md:w-[160px] shrink-0 cursor-pointer group"
                            onClick={() => navigate(`/album/${album.id}`)}
                        >
                            <div className="w-full aspect-square mb-3 relative rounded-md overflow-hidden">
                                <img src={getImageUrl(album.image)} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ">
                                    <div className="w-12 h-12 rounded-full bg-accent text-black flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <Play size={24} fill="currentColor" className="ml-1" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-[14px] font-medium text-white truncate group-hover:text-accent transition-colors">{album.name}</h3>
                            <p className="text-[13px] text-white/50 font-medium mt-1">{album.year} • Album</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};