import React from 'react';
import { Home, Search, Library, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[150] md:hidden flex justify-center pointer-events-none">
      <div className="flex items-center gap-1 p-1.5 bg-[#111] rounded-xl pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="outline-none">
              <motion.div
                layout
                className={`relative flex items-center justify-center px-4 py-2.5 transition-colors z-10 cursor-pointer ${isActive ? 'text-black' : 'text-white/60 hover:text-white'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 bg-white rounded-md -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <motion.div layout className="shrink-0">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <AnimatePresence>
                  {isActive && (
                    <motion.span 
                      key="label"
                      layout
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="ml-2 text-sm font-bold overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
