import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Sparkles, User as UserIcon, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { isLoggedIn, getUserRole, saveAuth } from '../lib/auth';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { GoogleLogin } from '@react-oauth/google';

interface LoginSectionProps {
  darkMode: boolean;
  onToast: (msg: string, type: 'success' | 'ref') => void;
  onSuccess: (user: User) => void;
}

// ----------------------------------------------------------------------
// 1. SUPER ADMIN LOGIN (Route: /super-admin/login)
// ----------------------------------------------------------------------
export function SuperAdminLoginSection({ darkMode, onToast, onSuccess }: LoginSectionProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // If already logged in as Super Admin -> redirect
    if (isLoggedIn() && getUserRole() === 'super_admin') {
      window.location.href = '/super-admin/dashboard';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user && data.user.role === 'super_admin') {
          saveAuth(data.user);
          onToast(`Super Admin Authenticated. Overriding terminal...`, 'success');
          onSuccess(data.user);
          window.location.href = '/super-admin/dashboard';
        } else {
          setErrorMsg('Invalid credentials');
        }
      } else {
        setErrorMsg('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!email) {
      setErrorMsg('Please enter your email to use Passkey.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/auth/passkey/auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) throw new Error('Passkey not found for this email.');
      const options = await resp.json();
      
      const asseResp = await startAuthentication({ optionsJSON: options });
      
      const verificationResp = await fetch('/api/auth/passkey/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: asseResp })
      });
      const verification = await verificationResp.json();
      if (verification.verified && verification.user) {
        saveAuth(verification.user);
        onToast('Biometric Login Successful!', 'success');
        onSuccess(verification.user);
        window.location.href = '/super-admin/dashboard';
      } else {
        throw new Error('Biometric verification failed.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Passkey login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!email) {
      setErrorMsg('Please enter your email to register Passkey.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) throw new Error('Cannot register passkey. User not found.');
      const options = await resp.json();
      
      const attResp = await startRegistration({ optionsJSON: options });
      
      const verificationResp = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: attResp })
      });
      const verification = await verificationResp.json();
      if (verification.verified) {
        onToast('Passkey registered successfully! You can now log in using biometrics.', 'success');
      } else {
        throw new Error('Registration verification failed.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Passkey registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex overflow-hidden selection:bg-indigo-500/30">
      
      {/* Left Decoration Panel */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-[#050505] to-slate-950/80 z-0"></div>
        
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15], rotate: [0, 90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] top-[-10%] left-[-10%]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] bottom-[-10%] right-[-10%]" 
        />

        <div className="relative z-10 p-16 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <ShieldCheck className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400 mb-6 tracking-tight">
              Executive Root Console
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed border-l-2 border-indigo-500/30 pl-5">
              Restricted access node. Authorization strictly limited to executive board members, co-founders, and core platform architects.
            </p>
            
            <div className="mt-12 flex items-center gap-4 text-xs font-mono text-indigo-300/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                SYSTEM SECURE
              </span>
              <span>•</span>
              <span>ENCRYPTION: RSA-4096</span>
              <span>•</span>
              <span>NODE: ALPHA-1</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Card Container */}
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-slate-400 text-sm">Authenticate to access the super admin interface</p>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 relative group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Executive Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="superadmin@edtech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-sm rounded-2xl border border-white/[0.05] bg-black/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all peer"
                  />
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 peer-focus:text-indigo-400 transition-colors" />
                </div>
              </div>

              <div className="space-y-2 relative group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Access Passcode</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 text-sm rounded-2xl border border-white/[0.05] bg-black/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all peer"
                  />
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 peer-focus:text-indigo-400 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-white text-black hover:bg-slate-200 active:scale-[0.98] transition-all font-bold text-sm rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Authorize Access'}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Alternative</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                type="button"
                onClick={handlePasskeyLogin}
                className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs font-semibold rounded-2xl border border-white/10 transition-all shadow-sm active:scale-95"
              >
                <span className="mr-2">🧬</span> Biometric
              </button>
              <button
                type="button"
                onClick={handleRegisterPasskey}
                className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs font-semibold rounded-2xl border border-white/10 transition-all shadow-sm active:scale-95"
              >
                Setup Passkey
              </button>
            </div>

            {/* Bypass controls removed */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. ADMIN LOGIN (Route: /admin/login)
// ----------------------------------------------------------------------
export function AdminLoginSection({ darkMode, onToast, onSuccess }: LoginSectionProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isLoggedIn() && getUserRole() === 'admin') {
      window.location.href = '/admin/dashboard';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user && data.user.role === 'admin') {
          saveAuth(data.user);
          onToast(`Faculty Clearance Authenticated. Opening workspace...`, 'success');
          onSuccess(data.user);
          window.location.href = '/admin/dashboard';
        } else {
          setErrorMsg('Invalid credentials or access denied');
        }
      } else {
        setErrorMsg('Invalid credentials or access denied');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Invalid credentials or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!email) {
      setErrorMsg('Please enter your email to use Passkey.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/auth/passkey/auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) throw new Error('Passkey not found for this email.');
      const options = await resp.json();
      
      const asseResp = await startAuthentication({ optionsJSON: options });
      
      const verificationResp = await fetch('/api/auth/passkey/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: asseResp })
      });
      const verification = await verificationResp.json();
      if (verification.verified && verification.user) {
        saveAuth(verification.user);
        onToast('Faculty Biometric Login Successful!', 'success');
        onSuccess(verification.user);
        window.location.href = '/admin/dashboard';
      } else {
        throw new Error('Biometric verification failed.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Passkey login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!email) {
      setErrorMsg('Please enter your email to register Passkey.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) throw new Error('Cannot register passkey. User not found.');
      const options = await resp.json();
      
      const attResp = await startRegistration({ optionsJSON: options });
      
      const verificationResp = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: attResp })
      });
      const verification = await verificationResp.json();
      if (verification.verified) {
        onToast('Passkey registered successfully! You can now log in using biometrics.', 'success');
      } else {
        throw new Error('Registration verification failed.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Passkey registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300 ${
      darkMode ? 'bg-[#060b14]' : 'bg-[#f0f4f8]'
    }`}>
      
      {/* LEFT COLUMN - BRANDING & INFO */}
      <div className={`hidden lg:flex flex-col justify-between p-12 relative overflow-hidden ${
        darkMode ? 'bg-[#0d1320] border-r border-slate-800/60' : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-r border-blue-800'
      }`}>
        {/* Ambient background for left side */}
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-white/10 text-white'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-white'}`}>SkillGenz</span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className={`text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight mb-6 ${darkMode ? 'text-white' : 'text-white'}`}>
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Educators</span> to shape the future.
            </h2>
            <p className={`text-sm max-w-md leading-relaxed ${darkMode ? 'text-slate-400' : 'text-blue-100'}`}>
              Access the centralized faculty workspace to manage curriculums, evaluate assessments, and guide the next generation of top-tier talent.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative z-10"
        >
          <div className={`p-6 rounded-2xl border backdrop-blur-md ${
            darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/10 border-white/20'
          }`}>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    darkMode ? 'border-slate-800 bg-slate-700 text-slate-300' : 'border-blue-700 bg-blue-500 text-white'
                  }`}>
                    {['SK', 'RJ', 'AM'][i-1]}
                  </div>
                ))}
              </div>
              <div>
                <div className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-white'}`}>Join 500+ Faculty Members</div>
                <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-blue-200'}`}>Leading institutions worldwide</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN - LOGIN FORM */}
      <div className="flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Animated Ambient Backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-cyan-500/20 to-blue-500/20 rounded-full blur-[120px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite_reverse]" />

        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            show: { 
              opacity: 1, 
              scale: 1,
              transition: { 
                type: 'spring', stiffness: 200, damping: 20,
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
          className={`w-full max-w-[420px] p-10 rounded-[2.5rem] relative z-10 backdrop-blur-2xl border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-colors ${
            darkMode 
              ? 'bg-slate-900/60 border-slate-700/50 text-white' 
              : 'bg-white/80 border-white/50 text-slate-800 shadow-blue-900/5'
          }`}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center mb-8">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 block mb-2">Workspace Login</span>
            <h1 className="text-3xl font-black tracking-tight mt-1">Welcome Back</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Enter your credentials to continue</p>
          </motion.div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="p-3 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="space-y-1.5 group">
              <label className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] ml-1 group-focus-within:text-blue-500 transition-colors">Workspace Email</label>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@skillgenz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl border-2 outline-none transition-all duration-300 ${
                    darkMode 
                      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:bg-slate-900/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]' 
                      : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  }`}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </motion.div>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="space-y-1.5 group">
              <label className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] ml-1 group-focus-within:text-blue-500 transition-colors">Private Security Key</label>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-11 py-3.5 text-sm rounded-2xl border-2 outline-none transition-all duration-300 ${
                    darkMode 
                      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:bg-slate-900/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]' 
                      : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  }`}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>
            </motion.div>

            <motion.button
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[11px] uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_-10px_rgba(59,130,246,0.6)] border border-blue-500/50 relative overflow-hidden group/btn"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer-slide_1.5s_infinite]" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
                ) : 'Authorize Entry'}
              </span>
            </motion.button>
          </form>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="grid grid-cols-2 gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handlePasskeyLogin}
              className={`w-full py-3 text-[10px] font-bold uppercase tracking-wide rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                darkMode 
                  ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/50 hover:border-blue-500/50' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 shadow-sm'
              }`}
            >
              <span className="text-base leading-none">🧬</span> Passkey
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleRegisterPasskey}
              className={`w-full py-3 text-[10px] font-bold uppercase tracking-wide rounded-xl border-2 transition-all ${
                darkMode 
                  ? 'bg-transparent hover:bg-slate-800/50 text-slate-400 border-slate-800 hover:border-slate-700' 
                  : 'bg-transparent hover:bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              Register
            </motion.button>
          </motion.div>

          {/* Bypass controls removed */}
        </motion.div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. STUDENT LOGIN (Route: /student/login)
// ----------------------------------------------------------------------
export function StudentLoginSection({ darkMode, onToast, onSuccess }: LoginSectionProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user && data.user.role === 'student') {
          saveAuth(data.user);
          onToast(`Study lobby unlocked successfully. Enjoy learning!`, 'success');
          onSuccess(data.user);
        } else {
          setErrorMsg('Invalid student credentials or profile role mismatch.');
        }
      } else {
        setErrorMsg(data.error || data.message || 'Verifications match rejected.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('A network issue occurred. Contact EdTech guides.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Confirmation security key does not match password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          role: 'student'
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onToast(`Student account registered successfully!`, 'success');
        data.user.hasCompletedOnboarding = false;
        saveAuth(data.user);
        onSuccess(data.user);
      } else {
        setErrorMsg(data.error || data.message || 'Failed to complete student registry registration.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Connection error during student account creation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter your email to receive an OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        onToast('OTP sent to your email. Check your inbox (or console if mocked).', 'success');
        setOtpSent(true);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        saveAuth(data.user);
        onToast('OTP verified! Secure access granted.', 'success');
        onSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Invalid or expired OTP.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        saveAuth(data.user);
        onToast('Google Authentication successful!', 'success');
        onSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Google login failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error during Google login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
      darkMode ? 'bg-[#0b1324]' : 'bg-[#eef6fc]'
    }`}>
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl relative z-10 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        <div className="text-center mb-6">
          <div className="inline-flex p-2.5 bg-blue-500/15 text-blue-500 rounded-2xl mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-blue-500 font-extrabold block">Student Gateway</span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">Student Login</h1>
        </div>

        {/* Custom tabs */}
        <div className="grid grid-cols-3 p-1 bg-slate-500/10 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setOtpSent(false); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => { setActiveTab('otp'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'otp' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OTP Login
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setOtpSent(false); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'register' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-400/10 text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-400">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="student@edtech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                    darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-slate-400">Security Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                    darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs hover:scale-[1.01] active:scale-95 transition-all shadow shadow-blue-500/20"
            >
              {loading ? 'Entering Academic Lobby...' : 'Proceed Authentication'}
            </button>
          </form>
        )}

        {activeTab === 'otp' && (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-400">Email Address for OTP</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setOtpSent(false); }}
                  className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                    darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  disabled={otpSent}
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {otpSent && (
              <div className="space-y-1">
                <label className="text-slate-400">Enter 6-Digit OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 tracking-widest ${
                      darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs hover:scale-[1.01] active:scale-95 transition-all shadow shadow-blue-500/20"
            >
              {loading ? 'Processing...' : otpSent ? 'Verify OTP & Login' : 'Send OTP via Email'}
            </button>
            {otpSent && (
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-[10px] text-blue-500 mt-2 hover:underline bg-transparent"
              >
                Use a different email / Resend OTP
              </button>
            )}
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-400">Graduate Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                    darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Secure Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                    darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                    darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                    darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs hover:scale-[1.01] active:scale-95 transition-all shadow shadow-blue-500/20 mt-2"
            >
              {loading ? 'Compiling Passport details...' : 'Compile Academic Registration'}
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-slate-800/10 text-center space-y-3">
          {/* Continue with Google Button */}
          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google login failed')}
              theme={darkMode ? 'filled_black' : 'outline'}
              shape="pill"
              text="continue_with"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
