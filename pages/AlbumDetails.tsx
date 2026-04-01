import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { Album, Song } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { Clock, Play, ArrowLeft, Heart, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

export const AlbumDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const { playSong } = usePlayerStore();
  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    if (id) {
      api.getAlbumDetails(id).then(setAlbum);
    }
  }, [id]);

  useEffect(() => {
    const main = document.querySelector('main');
    const handleScroll = () => {
      if (main) {
        const scrollY = main.scrollTop;
        const opacity = Math.min(scrollY / 200, 1);
        setScrollOpacity(opacity);
      }
    };

    main?.addEventListener('scroll', handleScroll);
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  if (!album) return <div className="p-8 text-center text-white/50 font-bold">Loading album...</div>;

  const imageUrl = getImageUrl(album.image);
  const songs = album.songs || [];

  return (
    <div className="min-h-full bg-transparent text-white pb-32 relative isolate">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#222] to-transparent -z-10 transition-colors duration-700" />

      {/* Sticky Header */}
      <div 
        className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-all duration-300 ${scrollOpacity > 0.1 ? 'bg-black' : 'bg-transparent'}`}
      >
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full hover:bg-[#111] flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <span 
          className="font-bold text-xl transition-opacity duration-300 truncate max-w-[60%]"
          style={{ opacity: scrollOpacity }}
        >
          {album.name}
        </span>
        <div className="w-10 h-10" /> {/* Spacer for centering */}
      </div>

      <div className="px-6 pt-4 pb-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-56 h-56 md:w-64 md:h-64 shrink-0 rounded-md overflow-hidden"
          >
            <img 
              src={imageUrl} 
              alt={album.name} 
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </motion.div>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-xs font-medium uppercase tracking-widest text-white/70 mb-2">Album</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">{album.name}</h1>
            
            <div className="flex items-center gap-3 text-sm font-medium text-white/80 flex-wrap justify-center md:justify-start">
              {album.artists?.primary?.[0] && (
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-[#222] overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                        {album.artists.primary[0].name.charAt(0)}
                      </div>
                   </div>
                   <span className="font-bold text-white hover:underline cursor-pointer">{album.artists.primary[0].name}</span>
                </div>
              )}
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span>{album.year}</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span>{songs.length} songs</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-6 mb-10">
          <button 
            onClick={() => songs.length > 0 && playSong(songs[0], songs)}
            className="w-14 h-14 rounded-full bg-accent text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <Play size={28} fill="currentColor" className="ml-1" />
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-[#111] transition-all">
            <Heart size={24} />
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-[#111] transition-all">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Song List */}
        <div className="flex flex-col gap-1">
           {/* Header */}
           <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-widest border-b border-white/5 mb-4">
              <div className="w-8 text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Album</div>
              <div className="w-12 text-center"><Clock size={16} className="mx-auto" /></div>
           </div>

           {/* Songs */}
           {songs.map((song, index) => (
             <div 
                key={song.id}
                onClick={() => playSong(song, songs)}
                className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 items-center hover:bg-[#111] rounded-md group cursor-pointer transition-colors"
             >
                <div className="w-8 text-center text-white/50 font-bold group-hover:hidden">
                  {index + 1}
                </div>
                <div className="w-8 text-center hidden group-hover:flex items-center justify-center">
                  <Play size={16} className="text-white" fill="currentColor" />
                </div>
                
                <div className="flex flex-col pr-4 truncate">
                  <span className="text-[15px] font-medium text-white truncate">{song.name}</span>
                  <span className="text-[14px] text-white/50 font-medium truncate mt-0.5">{song.artists?.primary?.[0]?.name || "Unknown"}</span>
                </div>

                <div className="hidden md:block text-[14px] text-white/50 font-medium truncate pr-4">
                  {album.name}
                </div>

                <div className="w-12 text-center text-[14px] text-white/50 font-bold">
                  {Math.floor(parseInt(song.duration) / 60)}:{(parseInt(song.duration) % 60).toString().padStart(2, '0')}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};