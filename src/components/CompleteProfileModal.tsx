import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, Lock, Calendar, AlertCircle } from 'lucide-react';


export const CompleteProfileModal = ({ 
  isOpen, 
  user,
  onComplete 
}: { 
  isOpen: boolean; 
  user: any;
  onComplete: (updatedUser: any) => void;
}) => {
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !age || !password) {
      setError('Please fill out all fields to continue.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          phone, 
          age, 
          password 
        })
      });

      const data = await res.json();
      if (res.ok) {
        onComplete(data.user);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Complete Your Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                  Welcome aboard! We need a few more details to set up your SkillGenz account securely.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2 border border-red-100 dark:border-red-500/20">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <Phone size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="10"
                      max="100"
                      placeholder="e.g. 21"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <Calendar size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Set Account Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">Needed for non-Google future logins.</p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving Profile...' : 'Complete Profile & Continue'}
                  </button>

                  {error && (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                      }}
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium rounded-xl transition-all text-sm"
                    >
                      Reset Account & Start Over
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
