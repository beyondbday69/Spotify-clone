import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { uploadToCloudinary } from '../services/api';
import { ArrowLeft, Camera, Loader2, LogOut, Cloud, SignalHigh, SignalMedium, SignalLow, Music2, Users, ChevronRight, Mail, Shield, RotateCcw, Youtube, Library, Globe, Layers, DownloadCloud, Palette, Sparkles, Settings } from 'lucide-react';
import { motion, Variants } from 'motion/react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const heroVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const Profile: React.FC = () => {
  const { currentUser, updateUserProfile, logoutUser, streamingQuality, setStreamingQuality, favoriteArtists, musicSource, setMusicSource, themeColor, setThemeColor } = usePlayerStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  
  // App Update State
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const currentVersion = "2.4.0";
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setImagePreview(currentUser.image || null);
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }
      updateUserProfile(name, imageUrl || undefined);
      await new Promise(r => setTimeout(r, 800)); // UX delay
      alert('Profile updated');
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if(window.confirm('Are you sure you want to log out?')) {
        logoutUser();
        navigate('/');
    }
  };

  const handleCheckUpdate = () => {
      setCheckingUpdate(true);
      setTimeout(() => {
          setCheckingUpdate(false);
          // Simulate 50/50 chance of update for demo
          const isAvailable = Math.random() > 0.5;
          setUpdateAvailable(isAvailable);
          if (!isAvailable) {
              alert("You are already on the latest version.");
          }
      }, 2000);
  };

  const handleUpdate = () => {
      if (confirm("Install update and restart?")) {
          window.location.reload();
      }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-full bg-transparent text-white pb-32 relative isolate">
       
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[var(--theme-color)]/20 to-transparent -z-10 transition-colors duration-700" />

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
            className="font-bold text-xl transition-opacity duration-300"
            style={{ opacity: scrollOpacity }}
          >
            {name}
          </span>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => window.location.reload()}
                className="w-10 h-10 rounded-full hover:bg-[#111] flex items-center justify-center text-white transition-colors"
                title="Restart App"
            >
                <RotateCcw size={20} />
            </button>
            <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center text-white transition-colors"
                title="Log Out"
            >
                <LogOut size={20} />
            </button>
          </div>
      </div>

      <motion.div 
        className="max-w-3xl mx-auto px-6 flex flex-col gap-8 pt-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
          
          {/* Hero Profile Section */}
          <motion.div 
            variants={heroVariants}
            className="flex flex-col items-center gap-6"
          >
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-48 h-48 md:w-56 md:h-56 rounded-full group cursor-pointer"
              >
                 {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                 ) : (
                    <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center text-6xl font-bold text-white/20">
                        {name.charAt(0).toUpperCase()}
                    </div>
                 )}
                 
                 <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Camera size={32} className="text-white mb-2" />
                     <span className="text-xs font-medium uppercase tracking-widest">Edit Photo</span>
                 </div>
                 <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "tween", ease: "backOut" }}
                    className="absolute bottom-2 right-4 bg-accent text-black p-3 rounded-full"
                 >
                    <Cloud size={20} />
                 </motion.div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />

              <div className="flex flex-col items-center gap-2 w-full">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent text-center text-5xl md:text-7xl font-bold text-white outline-none border-b-2 border-transparent focus:border-white/20 pb-2 w-full max-w-md transition-all placeholder-white/20"
                    placeholder="Name"
                  />
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-8 text-[14px] font-medium text-white/70 mt-4"
                  >
                      <div className="flex flex-col items-center">
                          <span className="text-white text-lg font-bold">12</span>
                          <span className="text-[11px] uppercase tracking-widest">Playlists</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-white text-lg font-bold">148</span>
                          <span className="text-[11px] uppercase tracking-widest">Followers</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-white text-lg font-bold">23</span>
                          <span className="text-[11px] uppercase tracking-widest">Following</span>
                      </div>
                  </motion.div>
              </div>
          </motion.div>

          <form onSubmit={handleSave} className="flex flex-col gap-6 mt-8">
              
              {/* Account Card */}
              <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-xl">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <Shield size={24} className="text-accent"/> Account
                   </h3>
                   <div className="flex items-center gap-4 text-sm">
                      <div className="p-4 bg-[#222] rounded-full text-white">
                          <Mail size={24} />
                      </div>
                      <div className="flex flex-col flex-1">
                          <span className="text-xs text-white/60 font-medium uppercase tracking-widest">Email</span>
                          <span className="text-white font-medium text-[15px]">{currentUser.email}</span>
                      </div>
                      <span className="px-4 py-1.5 bg-[#222] rounded-full text-[11px] font-medium text-white">PRIVATE</span>
                   </div>
              </motion.div>

              {/* Taste Profile */}
              <motion.div 
                  variants={itemVariants}
                  onClick={() => navigate('/artists/select')}
                  className="bg-[#111] p-6 rounded-xl cursor-pointer hover:bg-[#1a1a1a] transition-colors group"
              >
                   <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold flex items-center gap-3">
                            <Users size={24} className="text-accent"/> Taste Profile
                        </h3>
                        <ChevronRight className="text-white/50 group-hover:text-white transition-colors" size={24} />
                   </div>
                   <p className="text-[14px] font-medium text-white/60 mb-6">Manage the artists you follow to improve recommendations.</p>
                   
                   <div className="flex items-center gap-2 overflow-hidden">
                       {favoriteArtists.slice(0, 5).map((artist, i) => (
                           <div key={artist.id} className="w-12 h-12 rounded-full bg-[#222] overflow-hidden relative" style={{ zIndex: 5 - i }}>
                               <img src={artist.image[0]?.url} className="w-full h-full object-cover" alt=""/>
                           </div>
                       ))}
                       {favoriteArtists.length > 5 && (
                           <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-[14px] font-medium text-white z-0">
                               +{favoriteArtists.length - 5}
                           </div>
                       )}
                       {favoriteArtists.length === 0 && <span className="text-[14px] font-medium text-accent">Select Artists</span>}
                   </div>
              </motion.div>

               {/* Music Source Selection */}
               <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-xl">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <Globe size={24} className="text-accent"/> Music Source
                   </h3>
                   <div className="flex flex-col gap-3">
                      {[
                          { val: 'both', label: 'Hybrid (Recommended)', sub: 'Results from both sources', Icon: Layers },
                          { val: 'youtube', label: 'YouTube Music', sub: 'Extensive library from YT', Icon: Youtube },
                          { val: 'local', label: 'Local Library', sub: 'High quality official tracks', Icon: Library },
                      ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setMusicSource(opt.val as any)}
                            className={`flex items-center p-4 rounded-lg transition-all ${
                                musicSource === opt.val 
                                ? 'bg-[#222]' 
                                : 'bg-transparent hover:bg-[#1a1a1a]'
                            }`}
                          >
                              <div className={`p-3 rounded-full mr-5 ${musicSource === opt.val ? 'text-accent bg-[#111]' : 'text-white/50 bg-transparent'}`}>
                                  <opt.Icon size={24} />
                              </div>
                              <div className="flex flex-col items-start flex-1">
                                  <span className={`text-[15px] font-medium ${musicSource === opt.val ? 'text-white' : 'text-white/70'}`}>{opt.label}</span>
                                  <span className="text-[13px] font-medium text-white/50">{opt.sub}</span>
                              </div>
                              {musicSource === opt.val && <div className="w-3 h-3 bg-accent rounded-full"></div>}
                          </button>
                      ))}
                   </div>
              </motion.div>

              {/* Audio Quality */}
              <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-xl">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <Music2 size={24} className="text-accent"/> Audio Quality
                   </h3>
                   <div className="flex flex-col gap-3">
                      {[
                          { val: 'low', label: 'Low (48kbps)', sub: 'Best for saving data', Icon: SignalLow },
                          { val: 'normal', label: 'Normal (96kbps)', sub: 'Standard balance', Icon: SignalMedium },
                          { val: 'high', label: 'High (320kbps)', sub: 'Best listening experience', Icon: SignalHigh },
                      ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setStreamingQuality(opt.val as any)}
                            className={`flex items-center p-4 rounded-lg transition-all ${
                                streamingQuality === opt.val 
                                ? 'bg-[#222]' 
                                : 'bg-transparent hover:bg-[#1a1a1a]'
                            }`}
                          >
                              <div className={`p-3 rounded-full mr-5 ${streamingQuality === opt.val ? 'text-accent bg-[#111]' : 'text-white/50 bg-transparent'}`}>
                                  <opt.Icon size={24} />
                              </div>
                              <div className="flex flex-col items-start flex-1">
                                  <span className={`text-[15px] font-medium ${streamingQuality === opt.val ? 'text-white' : 'text-white/70'}`}>{opt.label}</span>
                                  <span className="text-[13px] font-medium text-white/50">{opt.sub}</span>
                              </div>
                              {streamingQuality === opt.val && <div className="w-3 h-3 bg-accent rounded-full"></div>}
                          </button>
                      ))}
                   </div>
              </motion.div>

              {/* Theme Color */}
              <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-xl">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <Palette size={24} className="text-accent"/> Theme Color
                   </h3>
                   <div className="flex flex-wrap gap-4">
                      {[
                          { color: '#1DB954', name: 'Spotify Green' },
                          { color: '#1D4ED8', name: 'Blue' },
                          { color: '#E11D48', name: 'Rose' },
                          { color: '#D97706', name: 'Amber' },
                          { color: '#7C3AED', name: 'Purple' },
                          { color: '#06B6D4', name: 'Cyan' },
                          { color: '#EC4899', name: 'Pink' },
                          { color: '#F97316', name: 'Orange' },
                      ].map((theme) => (
                          <button
                            key={theme.color}
                            type="button"
                            onClick={() => setThemeColor(theme.color)}
                            className={`w-12 h-12 rounded-full transition-all flex items-center justify-center ${
                                themeColor === theme.color 
                                ? 'ring-2 ring-white scale-110' 
                                : 'hover:scale-110 hover:ring-2 hover:ring-white/50'
                            }`}
                            style={{ backgroundColor: theme.color }}
                            title={theme.name}
                          >
                              {themeColor === theme.color && <div className="w-4 h-4 bg-white rounded-full"></div>}
                          </button>
                      ))}
                   </div>
              </motion.div>
              
              {/* How Things Work Section */}
              <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-xl">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <Settings size={24} className="text-accent"/> How Things Work
                   </h3>
                   <div className="text-[14px] font-medium text-white/70 bg-[#222] p-5 rounded-lg">
                       <p>This app uses <strong>yt-dlp</strong> to fetch song data and audio streams directly from YouTube. This allows us to provide a vast library of music. Because we are fetching and processing this data in real-time, you might notice that songs take a moment to start playing. We are constantly working to improve this!</p>
                   </div>
              </motion.div>

              {/* App Updates Section */}
              <motion.div variants={itemVariants} className="bg-[#111] p-6 rounded-xl">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <DownloadCloud size={24} className="text-accent"/> App Updates
                   </h3>
                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#222] p-5 rounded-lg gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-white font-bold text-[15px]">Version {currentVersion}</span>
                            <span className={`text-[13px] font-medium flex items-center gap-2 ${updateAvailable ? 'text-accent' : 'text-white/60'}`}>
                                {updateAvailable ? <><Sparkles size={16} /> New version 2.5.0 available</> : 'You are up to date'}
                            </span>
                        </div>
                        <button 
                            type="button"
                            onClick={updateAvailable ? handleUpdate : handleCheckUpdate}
                            disabled={checkingUpdate}
                            className={`px-6 py-2 rounded-full font-medium text-[14px] transition-all flex items-center gap-2 ${
                                updateAvailable 
                                ? 'bg-accent text-black hover:scale-105' 
                                : 'bg-[#333] text-white hover:bg-[#444]'
                            }`}
                        >
                            {checkingUpdate ? (
                                <><Loader2 size={18} className="animate-spin" /> Checking...</>
                            ) : updateAvailable ? (
                                'Update Now'
                            ) : (
                                'Check for Updates'
                            )}
                        </button>
                   </div>
                   {updateAvailable && (
                       <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-6 text-[13px] font-medium text-white/70 bg-[#222] p-5 rounded-lg"
                       >
                           <p className="font-bold text-white mb-3 text-[14px]">What's New in 2.5.0:</p>
                           <ul className="list-disc pl-5 space-y-2">
                               <li>Improved audio engine for cleaner bass</li>
                               <li>New "Sleep Timer" feature in player</li>
                               <li>Bug fixes and performance improvements</li>
                           </ul>
                       </motion.div>
                   )}
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-center pt-8 pb-12">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-white text-black font-bold py-3 px-12 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-[15px]"
                  >
                     {loading ? <Loader2 size={24} className="animate-spin" /> : 'Save Changes'}
                  </button>
              </motion.div>

          </form>

      </motion.div>
    </div>
  );
};