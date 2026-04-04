import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export const ThankYou: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center">
          <Heart size={48} className="text-accent" fill="currentColor" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Thank You!</h1>
        <p className="text-lg text-white/70 max-w-md">
          We truly appreciate your support and for choosing us. It means the world to us!
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
};
