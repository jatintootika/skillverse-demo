import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, User as UserIcon, Phone, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { isLoggedIn, getUserRole, saveAuth } from '../lib/auth';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

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
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] px-4 py-12">
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-red-800/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-800 bg-[#0c1220] text-white shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-500/10 text-red-500 rounded-2xl mb-4 border border-red-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-red-500 font-extrabold block">Root Console</span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">Super Admin Login</h1>
          <p className="text-xs text-slate-400 mt-2">For CEO, Co-Founders & Core Developers</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-slate-400 uppercase tracking-wider text-[10px]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="superadmin@edtech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 uppercase tracking-wider text-[10px]">Secret Passcode</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:scale-[1.01] active:scale-95 transition-all text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg border border-red-500/30"
          >
            {loading ? 'Initializing Interface...' : 'OVERRIDE DECRYPTION & ENTER'}
          </button>
        </form>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={handlePasskeyLogin}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-xl border border-slate-700 transition-all shadow"
          >
            🧬 Biometric Login
          </button>
          <button
            type="button"
            onClick={handleRegisterPasskey}
            className="w-full py-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700 transition-all"
          >
            Register Passkey
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/40 text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setEmail('superadmin@edtech.com');
              setPassword('SuperAdmin@123');
              onToast('Seeded Super Admin credentials loaded!', 'success');
            }}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/15 text-red-400 text-[10px] font-bold rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Auto-fill Super Admin Identity</span>
          </button>
          
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setErrorMsg('');
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: 'superadmin@edtech.com', password: 'SuperAdmin@123' }),
                });
                const data = await res.json();
                if (res.ok && data.user && data.user.role === 'super_admin') {
                  saveAuth(data.user);
                  onToast('Activated Super Admin One-Click Bypass!', 'success');
                  onSuccess(data.user);
                  window.location.href = '/super-admin/dashboard';
                } else {
                  setErrorMsg('Failed to process. Check database file.');
                }
              } catch (e) {
                setErrorMsg('Network error.');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2 text-[10px] font-mono font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>⚡ Demo Bypass: Instant Super Admin Entry</span>
          </button>

          <p className="text-[9px] text-slate-500">
            For testing: <strong className="text-slate-300 font-mono">superadmin@edtech.com</strong> / <strong className="text-slate-300 font-mono">SuperAdmin@123</strong>
          </p>
        </div>
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
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
      darkMode ? 'bg-slate-950' : 'bg-[#eef2f6]'
    }`}>
      <div className="absolute top-[15%] left-[15%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-[15%] right-[15%] w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[90px] pointer-events-none"></div>

      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl relative z-10 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-800'
      }`}>
        <div className="text-center mb-8">
          <div className={`inline-flex p-3 rounded-2xl mb-4 border ${
            darkMode ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-blue-500 font-extrabold block">Faculty & Admin Desk</span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">Faculty Portal Login</h1>
          <p className="text-xs text-slate-400 mt-2">For Educators and Administration</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-400/10 text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-slate-400 uppercase tracking-wider text-[10px]">Workspace Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@edtech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-3 py-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                  darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 uppercase tracking-wider text-[10px]">Private Security Key</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                  darkMode ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-95 transition-all text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
          >
            {loading ? 'Authenticating Personnel...' : 'Authorize Workspace Entry'}
          </button>
        </form>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={handlePasskeyLogin}
            className={`w-full py-2.5 text-[10px] font-bold rounded-xl border transition-all shadow ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'}`}
          >
            🧬 Biometric Login
          </button>
          <button
            type="button"
            onClick={handleRegisterPasskey}
            className={`w-full py-2.5 text-[10px] font-bold rounded-xl border transition-all ${darkMode ? 'bg-slate-800/50 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
          >
            Register Passkey
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/20 text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@edtech.com');
              setPassword('Admin@123');
              onToast('Seeded Admin Coordinator credentials loaded!', 'success');
            }}
            className={`w-full py-2 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
              darkMode ? 'border-blue-500/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10' : 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-105'
            }`}
          >
            <span>Auto-fill Admin Identity</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setErrorMsg('');
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: 'admin@edtech.com', password: 'Admin@123' }),
                });
                const data = await res.json();
                if (res.ok && data.user && data.user.role === 'admin') {
                  saveAuth(data.user);
                  onToast('Activated Admin One-Click Bypass!', 'success');
                  onSuccess(data.user);
                  window.location.href = '/admin/dashboard';
                } else {
                  setErrorMsg('Failed to process. Check database file.');
                }
              } catch (e) {
                setErrorMsg('Network error.');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-2 text-[10px] font-mono font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>⚡ Demo Bypass: Instant Admin Entry</span>
          </button>

          <p className="text-[9px] text-slate-500">
            For testing: <strong className="text-blue-500 font-mono">admin@edtech.com</strong> / <strong className="text-blue-500 font-mono">Admin@123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. STUDENT LOGIN (Route: /student/login)
// ----------------------------------------------------------------------
export function StudentLoginSection({ darkMode, onToast, onSuccess }: LoginSectionProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
          
          if (data.user.hasCompletedOnboarding === false) {
             onSuccess(data.user);
          } else {
             onSuccess(data.user);
          }
        } else {
          setErrorMsg('Invalid student credentials or profile role mismatch.');
        }
      } else {
        setErrorMsg(data.message || 'Verifications match rejected.');
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
        
        // Force onboarding flag for new signups if backend hasn't been reloaded
        data.user.hasCompletedOnboarding = false;
        
        saveAuth(data.user);
        onSuccess(data.user);
        // Do NOT navigate yet; OnboardingModal will handle it
      } else {
        setErrorMsg(data.message || 'Failed to complete student registry registration.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Connection error during student account creation.');
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
        <div className="grid grid-cols-2 p-1 bg-slate-500/10 rounded-xl mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Login Account
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Pass
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-400/10 text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeTab === 'login' ? (
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
                <button
                  type="button"
                  onClick={() => onToast('Password reset link is locked under simulation constraints.', 'ref')}
                  className="text-blue-500 font-bold hover:underline col-span-1 text-[10px] bg-transparent border-0"
                >
                  Forgot Password?
                </button>
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
        ) : (
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
          <button
            onClick={() => {
              const mockUser: User = {
                id: 'usr_oauth_seed',
                name: 'Guest Scholar',
                email: 'student@edtech.com',
                password: 'xxxx',
                joinedDate: '2026-06-02',
                plan: 'free',
                role: 'student',
                billingCycle: 'monthly'
              };
              saveAuth(mockUser);
              onToast('Google OAuth bypass simulation triggered!', 'success');
              onSuccess(mockUser);
            }}
            className={`w-full py-2 text-[10px] font-bold rounded-xl border hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer ${
              darkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700'
            }`}
          >
            <span>Mock Google OAuth Account Auth</span>
          </button>
          <p className="text-[10px] text-slate-500">
            For testing use: <strong className="text-blue-500 font-mono">student@edtech.com</strong> / <strong className="text-blue-500 font-mono">Student@123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
