import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Briefcase, ShieldAlert, Home, ArrowRight, Command } from 'lucide-react';

interface Action {
  id: string;
  name: string;
  icon: React.ReactNode;
  route: string;
  keywords: string[];
}

export function CommandPalette({ darkMode }: { darkMode: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const actions: Action[] = [
    { id: 'home', name: 'Go to Homepage', icon: <Home className="w-4 h-4" />, route: '/', keywords: ['home', 'start', 'index'] },
    { id: 'student-login', name: 'Student Portal Login', icon: <User className="w-4 h-4" />, route: '/student/login', keywords: ['login', 'student', 'sign in'] },
    { id: 'admin-login', name: 'Faculty Portal Login', icon: <Briefcase className="w-4 h-4" />, route: '/admin/login', keywords: ['faculty', 'teacher', 'admin', 'staff'] },
    { id: 'super-admin-login', name: 'Super Admin Access', icon: <ShieldAlert className="w-4 h-4 text-red-500" />, route: '/super-admin/login', keywords: ['root', 'super', 'admin', 'system'] }
  ];

  // Filter actions based on query
  const filteredActions = query === '' 
    ? actions 
    : actions.filter(action => {
        const searchTerms = query.toLowerCase().split(' ');
        const actionText = (action.name + ' ' + action.keywords.join(' ')).toLowerCase();
        return searchTerms.every(term => actionText.includes(term));
      });

  useEffect(() => {
    // Reset selected index when query changes
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    // Prevent scrolling on body when palette is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
  }, [isOpen]);

  const handleSelectAction = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions.length > 0) {
        handleSelectAction(filteredActions[selectedIndex].route);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Palette Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border ${darkMode ? 'bg-[#161b22] border-slate-700/50' : 'bg-white border-slate-200'}`}
          >
            {/* Search Input */}
            <div className={`flex items-center px-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <Search className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
                placeholder="Type a command or search..."
                className={`w-full bg-transparent border-none py-5 px-4 text-lg outline-none ${darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
              />
              <div className="flex items-center gap-1">
                <kbd className={`px-2 py-1 text-xs rounded-md border font-mono ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>ESC</kbd>
              </div>
            </div>

            {/* Actions List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredActions.length > 0 ? (
                <div className="space-y-1">
                  <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Available Actions
                  </div>
                  {filteredActions.map((action, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleSelectAction(action.route)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                          isSelected 
                            ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700')
                            : (darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50')
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                            isSelected 
                              ? (darkMode ? 'bg-white/20' : 'bg-blue-100/50')
                              : (darkMode ? 'bg-slate-800' : 'bg-slate-100')
                          }`}>
                            {action.icon}
                          </div>
                          <span className="font-semibold text-sm">{action.name}</span>
                        </div>
                        {isSelected && (
                          <ArrowRight className={`w-4 h-4 ${darkMode ? 'text-blue-200' : 'text-blue-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className={`py-12 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  No results found for "<span className="font-semibold text-slate-400">{query}</span>"
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className={`px-4 py-3 border-t text-[11px] font-medium flex items-center justify-between ${darkMode ? 'bg-[#0d1117] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><kbd className={`px-1.5 py-0.5 rounded border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>↑</kbd> <kbd className={`px-1.5 py-0.5 rounded border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>↓</kbd> to navigate</span>
                <span className="flex items-center gap-1.5"><kbd className={`px-1.5 py-0.5 rounded border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>Enter</kbd> to select</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Command className="w-3.5 h-3.5" /> SkillVerse Command OS
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
