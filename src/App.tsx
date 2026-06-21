/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation
} from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIChatBot } from './components/AIChatBot';
import { VerifyCertificate } from './components/VerifyCertificate';
import { ExamEngine } from './components/ExamEngine';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AdminPortal } from './components/admin/AdminPortal';
import { SuperAdminPortal } from './components/super-admin/SuperAdminPortal';
import { PolicyPage } from './components/PolicyPage';
import { ScoreCard } from './components/ScoreCard';
import { GoogleCompleteProfileForm } from './components/GoogleCompleteProfileForm';
import { StudentLoginSection, AdminLoginSection, SuperAdminLoginSection } from './components/LoginSections';
import { CommandPalette } from './components/CommandPalette';

import {
  Sparkles,
  Award,
  BookOpen,
  ChevronDown,
  ShieldCheck,
  Check,
  Mail,
  User as UserIcon,
  Phone,
  Video,
  Lock,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Star,
  Users,
  MessageCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Server,
  Terminal,
  ShieldAlert,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  FileSpreadsheet,
  Tag,
  Linkedin
} from 'lucide-react';

import { Course, User, ExamQuestion } from './types';
import { isLoggedIn, getUserRole, getPermissions, getAuthUser, saveAuth, clearAuth } from './lib/auth';

// ----------------------------------------------------------------------
// ROUTE GUARDS
// ----------------------------------------------------------------------

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const isAuth = isLoggedIn();
  const role = getUserRole();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
  }

  if (role !== 'super_admin') {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuth = isLoggedIn();
  const role = getUserRole();
  const location = useLocation();
  const permissions = getPermissions();

  if (!isAuth) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (role !== 'admin' && role !== 'super_admin') {
    if (role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/" replace />;
  }

  // Permission check for module (Only strictly applicable to ADMIN role, SUPER_ADMIN overrides)
  const path = location.pathname;
  const permissionMap: Record<string, string> = {
    '/admin/courses': 'courses',
    '/admin/students': 'students',
    '/admin/certificates': 'certificates'
  };

  const requiredPermission = permissionMap[path];
  // Bypassed permission check for demo purposes so the admin can view all routes
  if (false && requiredPermission && role === 'admin' && !permissions.includes(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#070b13] text-white">
        <div className="max-w-md w-full p-8 rounded-3xl border border-red-500/25 bg-[#0d1322] shadow-2xl text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-red-500">Access Denied</h2>
          <p className="text-xs text-slate-400">
            You do not possess the necessary administrative permissions (<strong>{requiredPermission}</strong>) to access this module coordinate.
          </p>
          <div className="pt-2">
            <NavigateButton label="Back to Dashboard" path="/admin/dashboard" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  const isAuth = isLoggedIn();
  const role = getUserRole();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  if (role !== 'student') {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'super_admin') return <Navigate to="/super-admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children, roleSpecificDashboard }: { children: React.ReactNode; roleSpecificDashboard: string }) {
  const isAuth = isLoggedIn();
  const currentRole = getUserRole();
  const user = getAuthUser();

  if (isAuth && user?.hasCompletedOnboarding !== false) {
    if (currentRole === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
    if (currentRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (currentRole === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to={roleSpecificDashboard} replace />;
  }

  return <>{children}</>;
}

function NavigateButton({ label, path }: { label: string; path: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="px-5 py-2.5 bg-blue-650 hover:bg-blue-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
    >
      {label}
    </button>
  );
}

// ----------------------------------------------------------------------
// ROUTER MANAGER WRAPPERS
// ----------------------------------------------------------------------

function SuperAdminLoginPage({ darkMode, onToast, onSuccess }: { darkMode: boolean; onToast: (m: string, t: 'success'|'ref') => void; onSuccess: (u: User) => void }) {
  return (
    <PublicRoute roleSpecificDashboard="/super-admin/dashboard">
      <SuperAdminLoginSection darkMode={true} onToast={onToast} onSuccess={onSuccess} />
    </PublicRoute>
  );
}

function AdminLoginPage({ darkMode, onToast, onSuccess }: { darkMode: boolean; onToast: (m: string, t: 'success'|'ref') => void; onSuccess: (u: User) => void }) {
  return (
    <PublicRoute roleSpecificDashboard="/admin/dashboard">
      <AdminLoginSection darkMode={darkMode} onToast={onToast} onSuccess={onSuccess} />
    </PublicRoute>
  );
}

function StudentLoginPage({ darkMode, onToast, onSuccess }: { darkMode: boolean; onToast: (m: string, t: 'success'|'ref') => void; onSuccess: (u: User) => void }) {
  return (
    <PublicRoute roleSpecificDashboard="/student/dashboard">
      <StudentLoginSection darkMode={darkMode} onToast={onToast} onSuccess={onSuccess} />
    </PublicRoute>
  );
}

function SuperAdminDashboardWrapper({ darkMode, onToast }: { darkMode: boolean; onToast: (m: string, t: 'success'|'ref') => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  let initialTab: 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs' = 'settings';
  const path = location.pathname;
  if (path.endsWith('/admins')) initialTab = 'admins';
  else if (path.endsWith('/students')) initialTab = 'students';
  else if (path.endsWith('/courses')) initialTab = 'courses';
  else if (path.endsWith('/certificates')) initialTab = 'certificates';
  else if (path.endsWith('/revenue')) initialTab = 'payments';
  else if (path.endsWith('/settings')) initialTab = 'settings';
  else if (path.endsWith('/notifications')) initialTab = 'settings';
  else if (path.endsWith('/profile')) initialTab = 'settings';

  const handleTabChange = (tab: 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs') => {
    const tabToPathMap: Record<string, string> = {
      settings: '/super-admin/settings',
      admins: '/super-admin/admins',
      students: '/super-admin/students',
      courses: '/super-admin/courses',
      certificates: '/super-admin/certificates',
      payments: '/super-admin/revenue',
      logs: '/super-admin/settings'
    };
    navigate(tabToPathMap[tab] || '/super-admin/dashboard');
  };

  const user = getAuthUser();
  if (!user) return <Navigate to="/super-admin/login" replace />;

  return (
    <SuperAdminPortal
      currentUser={user}
      darkMode={darkMode}
      onToast={onToast}
      initialTab={initialTab}
      onTabChange={handleTabChange}
    />
  );
}

function AdminDashboardWrapper({ darkMode, courses, onRefreshCourses, onToast }: { darkMode: boolean; courses: Course[]; onRefreshCourses: () => void; onToast: (m: string, t: 'success'|'ref') => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  let initialTab: 'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile' | 'support' = 'overview';
  const path = location.pathname;
  if (path.endsWith('/courses')) initialTab = 'courses';
  else if (path.endsWith('/students')) initialTab = 'students';
  else if (path.endsWith('/exams')) initialTab = 'exams';
  else if (path.endsWith('/certificates')) initialTab = 'certificates';
  else if (path.endsWith('/coupons')) initialTab = 'coupons';
  else if (path.endsWith('/notifications')) initialTab = 'notifications';
  else if (path.endsWith('/profile')) initialTab = 'profile';
  else if (path.endsWith('/support')) initialTab = 'support';
  else if (path.endsWith('/dashboard')) initialTab = 'overview';

  const handleTabChange = (tab: 'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile' | 'support') => {
    const tabToPathMap: Record<string, string> = {
      overview: '/admin/dashboard',
      courses: '/admin/courses',
      students: '/admin/students',
      exams: '/admin/exams',
      certificates: '/admin/certificates',
      coupons: '/admin/coupons',
      notifications: '/admin/notifications',
      profile: '/admin/profile',
      support: '/admin/support'
    };
    navigate(tabToPathMap[tab] || '/admin/dashboard');
  };

  const user = getAuthUser();
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <AdminPortal
      currentUser={user}
      courses={courses}
      darkMode={darkMode}
      onRefreshCourses={onRefreshCourses}
      onToast={onToast}
      initialTab={initialTab}
      onTabChange={handleTabChange}
    />
  );
}

function StudentDashboardWrapper({ darkMode, courses, onStartExam, onToast, onUpgradePlan, onRefreshUser, onLogout }: { darkMode: boolean; courses: Course[]; onStartExam: (id: string, t: string) => void; onToast: (m: string, t: 'success'|'ref') => void; onUpgradePlan: () => void; onRefreshUser: (u: User) => void; onLogout: () => void; }) {
  const navigate = useNavigate();
  const location = useLocation();

  let initialTab: 'home' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile' | 'referrals' | 'roadmap' | 'support' = 'home';
  const path = location.pathname;
  if (path.endsWith('/courses')) initialTab = 'resources';
  else if (path.endsWith('/roadmap')) initialTab = 'roadmap';
  else if (path.endsWith('/certificates')) initialTab = 'certificates';
  else if (path.endsWith('/payments')) initialTab = 'payments';
  else if (path.endsWith('/profile')) initialTab = 'profile';
  else if (path.endsWith('/referrals')) initialTab = 'referrals';
  else if (path.endsWith('/support')) initialTab = 'support';
  else if (path.endsWith('/dashboard')) initialTab = 'home';

  const handleTabChange = (tab: 'home' | 'roadmap' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile' | 'referrals' | 'support') => {
    const tabToPathMap: Record<string, string> = {
      home: '/student/dashboard',
      roadmap: '/student/roadmap',
      resources: '/student/courses',
      exams: '/student/courses',
      certificates: '/student/certificates',
      payments: '/student/payments',
      profile: '/student/profile',
      referrals: '/student/referrals',
      support: '/student/support'
    };
    navigate(tabToPathMap[tab] || '/student/dashboard');
  };

  const user = getAuthUser();
  if (!user) return <Navigate to="/student/login" replace />;

  return (
    <StudentDashboard
      currentUser={user}
      courses={courses.filter(c => c.active !== false)}
      onStartExam={onStartExam}
      onUpgradePlan={onUpgradePlan}
      onToast={onToast}
      onRefreshUser={onRefreshUser}
      darkMode={darkMode}
      initialTab={initialTab}
      onTabChange={handleTabChange}
      onLogout={onLogout}
    />
  );
}


function VerifyPageWrapper({ darkMode, onToast }: { darkMode: boolean; onToast: (m: string, t: 'success'|'ref') => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <VerifyCertificate
      initialId={id || ''}
      darkMode={darkMode}
      onGoHome={() => navigate('/')}
    />
  );
}

// ----------------------------------------------------------------------
// MAIN EXPORT & CONTENT COMPONENT
// ----------------------------------------------------------------------

function OnboardingModal({ 
  user, 
  darkMode, 
  onComplete 
}: { 
  user: User; 
  darkMode: boolean; 
  onComplete: (updatedUser: User) => void;
}) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ goal: '', skillLevel: '', interest: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          hasCompletedOnboarding: true,
          profileData: profile
        })
      });
      const data = await res.json();
      if (res.ok) {
        onComplete(data.user);
      } else {
        console.error(data.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border overflow-hidden relative ${darkMode ? 'bg-slate-900/90 border-slate-700/50 text-white' : 'bg-white/95 border-slate-200/50 text-slate-800'}`}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none" />

        <div className="text-center space-y-2 mb-8 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">Welcome, {user.name.split(' ')[0]}!</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Let's personalize your experience. Just 3 quick questions.</p>
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-bold mb-4">1. What is your primary goal here?</h3>
                {['Get a Job', 'Upskill / Promotion', 'Academic Credit', 'Just Exploring'].map(opt => (
                  <button key={opt} onClick={() => { setProfile({...profile, goal: opt}); setStep(2); }}
                    className={`w-full py-3.5 px-5 rounded-2xl border text-left text-sm font-bold transition-all hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] ${darkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}
                  >{opt}</button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-bold mb-4">2. What is your current skill level?</h3>
                {['Absolute Beginner', 'Intermediate', 'Advanced'].map(opt => (
                  <button key={opt} onClick={() => { setProfile({...profile, skillLevel: opt}); setStep(3); }}
                    className={`w-full py-3.5 px-5 rounded-2xl border text-left text-sm font-bold transition-all hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] ${darkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}
                  >{opt}</button>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h3 className="font-bold mb-4">3. Which field interests you the most?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Software Engineering', 'Data Science & AI', 'Business & Finance', 'Content Creation'].map(opt => (
                    <button key={opt} onClick={() => setProfile({...profile, interest: opt})}
                      className={`w-full py-3 px-4 rounded-xl border text-left text-xs font-bold transition-all ${profile.interest === opt ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-blue-500/10' : darkMode ? 'bg-slate-950/50 border-slate-800 hover:border-blue-400' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}
                    >{opt}</button>
                  ))}
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit} disabled={!profile.interest || isSubmitting}
                  className={`w-full py-3.5 mt-6 rounded-2xl font-extrabold text-white transition-all flex items-center justify-center gap-2 ${!profile.interest || isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'}`}
                >
                  {isSubmitting ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Generating Profile...</>
                  ) : 'Complete Profile Setup'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Active User session login state
  const [currentUser, setCurrentUser] = useState<User | null>(getAuthUser());

  // Google login onboarding state
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [showCompleteProfileFromGoogle, setShowCompleteProfileFromGoogle] = useState(false);

  // Auth Dialog Modal variables
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', role: 'student' as 'student' | 'admin' | 'super_admin' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Pricing Intervals
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Interactive Live Exam Selector
  const [activeExam, setActiveExam] = useState<{ courseId: string; title: string; questions: ExamQuestion[] } | null>(null);

  // Toast Notifications state variables
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'ref'; isOpen: boolean }>({ message: '', type: 'success', isOpen: false });

  const triggerToast = (message: string, type: 'success' | 'ref') => {
    setToast({ message, type, isOpen: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isOpen: false }));
    }, 4500);
  };

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Parse referral code from URL and save it in sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('skillgenz_referral_ref', ref.trim().toUpperCase());
      setAuthModal({ isOpen: true, mode: 'signup' });
      triggerToast(`Referral code "${ref.trim().toUpperCase()}" applied!`, 'success');
    }
  }, []);

  // Sync Dark/Light prefixes on Document
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const referredByCode = sessionStorage.getItem('skillgenz_referral_ref') || undefined;

      if (!otpSent) {
        // Send OTP
        const res = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: authForm.email,
            name: authModal.mode === 'signup' ? authForm.name : undefined,
            role: authModal.mode === 'signup' ? authForm.role : undefined,
            phone: authModal.mode === 'signup' ? authForm.phone : undefined
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Failed to send OTP.');
        } else {
          setOtpSent(true);
          triggerToast('OTP sent to your email!', 'success');
        }
      } else {
        // Verify OTP
        const res = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authForm.email, otpCode })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Invalid or expired OTP.');
        } else {
          saveAuth(data.user);
          setCurrentUser(data.user);
          
          setAuthModal({ isOpen: false, mode: 'login' });
          triggerToast(`Welcome to SkillGenz, ${data.user.name}!`, 'success');

          // Force onboarding if it's a new signup or explicitly false
          const isNewSignup = authModal.mode !== 'login';
          const hasCompleted = isNewSignup ? false : (data.user.hasCompletedOnboarding !== false);

          if (hasCompleted) {
            if (data.user.role === 'student') navigate('/student/dashboard');
            else if (data.user.role === 'admin') navigate('/admin/dashboard');
            else if (data.user.role === 'super_admin') navigate('/super-admin/dashboard');
          } else {
            // Ensure currentUser has the flag so the OnboardingModal renders
            data.user.hasCompletedOnboarding = false;
            setCurrentUser({...data.user});
          }
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError('Connection problem. Check backend logs.');
    }
  };

  const handleStartExam = async (courseId: string, courseTitle: string) => {
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'login' });
      triggerToast('Please sign in to activate the assessment lock screen.', 'ref');
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}/questions`);
      if (res.ok) {
        let questionsMock = await res.json();
        if (!questionsMock || questionsMock.length === 0) {
          // Fallback to generating mock questions so the exam can still be tested
          questionsMock = Array.from({ length: 10 }).map((_, i) => ({
            id: `mock-q-${Date.now()}-${i}`,
            courseId,
            question: `Sample Assessment Question ${i + 1} for ${courseTitle}: Which of the following is a key concept?`,
            options: [
               "The primary principle taught in this module.",
               "An incorrect distractor option.",
               "Another incorrect concept.",
               "None of the above."
            ],
            correctOptionIndex: 0
          }));
        }
        setActiveExam({
          courseId,
          title: courseTitle,
          questions: questionsMock
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublicCourseClick = (courseId: string, courseTitle: string) => {
    if (!currentUser) {
      setAuthModal({ isOpen: true, mode: 'login' });
      triggerToast('Please sign in to access courses and assessments.', 'ref');
    } else {
      navigate('/student/courses');
    }
  };

  const handleLogout = () => {
    const role = getUserRole();
    triggerToast('Securely logged out. See you soon!', 'success');

    if (role === 'super_admin') {
      navigate('/super-admin/login', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin/login', { replace: true });
    } else {
      navigate('/', { replace: true });
    }

    // Delay state clearing slightly so the router navigation finishes first without the RouteGuard overriding it
    setTimeout(() => {
      clearAuth();
      setCurrentUser(null);
    }, 10);
  };

  const handleRefreshUser = (updatedUser: User) => {
    saveAuth(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.hasCompletedOnboarding === false) {
          setPendingGoogleUser(data.user);
          setShowGooglePrompt(true);
          setAuthModal({ isOpen: false, mode: 'login' });
        } else {
          saveAuth(data.user);
          setCurrentUser(data.user);
          setAuthModal({ isOpen: false, mode: 'login' });
          triggerToast('Google Authentication successful!', 'success');
          navigate('/student/dashboard');
        }
      } else {
        triggerToast(data.error || 'Google login failed.', 'ref');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Network error during Google login.', 'ref');
    }
  };

  // Determine whether to display the standard Navbar & Footer
  const isLoginPage = ['/super-admin/login', '/admin/login', '/student/login'].includes(location.pathname);
  // Hide Navbar & Footer in Admin or Super Admin dashboards to avoid clunky UI overlap
  const isDashboardPage = location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/student');
  const showNavAndFooter = !isLoginPage && !isDashboardPage;

  return (
    <MotionConfig transition={{ duration: 0 }}>
      <div className={`min-h-screen font-sans transition-all duration-0 relative overflow-x-hidden ${darkMode ? 'bg-[#0E1726] text-slate-100' : 'bg-[#F0F9FF] text-slate-800'}`}>
      
      {/* Onboarding Modal for New Users */}
      {currentUser && currentUser.hasCompletedOnboarding === false && (
        <OnboardingModal 
          user={currentUser} 
          darkMode={darkMode}
          onComplete={(updatedUser) => {
            setCurrentUser(updatedUser);
            saveAuth(updatedUser);
            triggerToast('Profile successfully built!', 'success');
            if (updatedUser.role === 'student') navigate('/student/dashboard');
            else if (updatedUser.role === 'admin') navigate('/admin/dashboard');
            else if (updatedUser.role === 'super_admin') navigate('/super-admin/dashboard');
          }}
        />
      )}

      {/* Google Onboarding Yes/No Confirmation Dialog */}
      <AnimatePresence>
        {showGooglePrompt && pendingGoogleUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                saveAuth(pendingGoogleUser);
                setCurrentUser(pendingGoogleUser);
                sessionStorage.setItem(`skip_onboarding_${pendingGoogleUser.id}`, 'true');
                setShowGooglePrompt(false);
                setPendingGoogleUser(null);
                triggerToast('Logged in successfully!', 'success');
                navigate('/student/dashboard');
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-md p-8 rounded-[2rem] shadow-2xl border text-center relative z-10 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'}`}
            >
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">Complete your profile?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Bhai, do you want to complete your profile now to unlock certified badge, track assignments, and verify scorecard coordinates?
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    saveAuth(pendingGoogleUser);
                    setCurrentUser(pendingGoogleUser);
                    sessionStorage.setItem(`skip_onboarding_${pendingGoogleUser.id}`, 'true');
                    setShowGooglePrompt(false);
                    setPendingGoogleUser(null);
                    triggerToast('Logged in successfully! You can complete your profile later.', 'success');
                    navigate('/student/dashboard');
                  }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl transition-all"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    setShowGooglePrompt(false);
                    setShowCompleteProfileFromGoogle(true);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Completion Form for Google User who chose Yes */}
      <AnimatePresence>
        {showCompleteProfileFromGoogle && pendingGoogleUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                saveAuth(pendingGoogleUser);
                setCurrentUser(pendingGoogleUser);
                sessionStorage.setItem(`skip_onboarding_${pendingGoogleUser.id}`, 'true');
                setShowCompleteProfileFromGoogle(false);
                setPendingGoogleUser(null);
                navigate('/student/dashboard');
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-lg p-8 rounded-[2rem] shadow-2xl border relative z-10 overflow-y-auto max-h-[90vh] ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'}`}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">Complete Your Profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Let's set up the remaining details for your student account.</p>
              </div>
              
              <GoogleCompleteProfileForm
                user={pendingGoogleUser}
                darkMode={darkMode}
                onCancel={() => {
                  saveAuth(pendingGoogleUser);
                  setCurrentUser(pendingGoogleUser);
                  sessionStorage.setItem(`skip_onboarding_${pendingGoogleUser.id}`, 'true');
                  setShowCompleteProfileFromGoogle(false);
                  setPendingGoogleUser(null);
                  navigate('/student/dashboard');
                }}
                onComplete={(updatedUser) => {
                  saveAuth(updatedUser);
                  setCurrentUser(updatedUser);
                  setShowCompleteProfileFromGoogle(false);
                  setPendingGoogleUser(null);
                  triggerToast('Profile completed successfully!', 'success');
                  navigate('/student/dashboard');
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Keyboard Command Menu */}
      <CommandPalette darkMode={darkMode} />

      {/* Ambient Blur Background Accents */}
      <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/10 to-sky-400/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] left-[-100px] w-[450px] h-[450px] bg-gradient-to-tr from-sky-400/10 to-blue-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[-100px] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[90px] pointer-events-none z-0"></div>

      {showNavAndFooter && (
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigate={(view) => {
            if (view === 'home') navigate('/');
            else if (view === 'super_admin_dashboard') navigate('/super-admin/dashboard');
            else if (view === 'admin_dashboard') navigate('/admin/dashboard');
            else if (view === 'student_dashboard') navigate('/student/dashboard');
            else navigate(`/${view}`);
          }}
          currentView={location.pathname === '/' ? 'home' : location.pathname.substring(1)}
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        />
      )}

      {/* Primary router container window */}
      <main className={`${showNavAndFooter ? 'pb-12 pt-4' : ''}`}>
            <Routes location={location}>
              {/* PUBLIC ROUTES */}
          <Route path="/" element={
            <LandingPage
              courses={courses}
              onStartExam={handlePublicCourseClick}
              onNavigate={(view) => {
                if (view === 'home') navigate('/');
                else if (view === 'super_admin_dashboard') navigate('/super-admin/dashboard');
                else if (view === 'admin_dashboard') navigate('/admin/dashboard');
                else if (view === 'student_dashboard') navigate('/student/dashboard');
                else navigate(`/${view}`);
              }}
              billingCycle={billingCycle}
              setBillingCycle={setBillingCycle}
              darkMode={darkMode}
              onToast={triggerToast}
            />
          } />
          <Route path="/courses" element={
            <CoursesPage
              courses={courses}
              coursesLoading={coursesLoading}
              onStartExam={handlePublicCourseClick}
              darkMode={darkMode}
            />
          } />
          <Route path="/certificates_showcase" element={
            <CertificateShowcasePage
              onNavigate={(v) => {
                if (v === 'home') navigate('/');
                else navigate(`/${v}`);
              }}
              darkMode={darkMode}
            />
          } />
          <Route path="/scorecard" element={
            <ScoreCard
              darkMode={darkMode}
              currentUser={currentUser}
              courses={courses}
              onNavigate={(v) => {
                if (v === 'home') navigate('/');
                else navigate(`/${v}`);
              }}
              onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
            />
          } />
          <Route path="/pricing" element={
            <PricingPage
              billingCycle={billingCycle}
              setBillingCycle={setBillingCycle}
              darkMode={darkMode}
              onUpgradePlan={() => {
                if (!currentUser) setAuthModal({ isOpen: true, mode: 'signup' });
                else navigate('/student/dashboard');
              }}
            />
          } />
          <Route path="/about" element={<AboutPage darkMode={darkMode} />} />
          <Route path="/contact" element={<ContactPage darkMode={darkMode} onToast={triggerToast} />} />
          <Route path="/leaderboard" element={<LeaderboardPage darkMode={darkMode} />} />
          <Route path="/blog" element={<BlogPage darkMode={darkMode} />} />
          <Route path="/verify" element={<VerifyPageWrapper darkMode={darkMode} onToast={triggerToast} />} />
          <Route path="/verify/:id" element={<VerifyPageWrapper darkMode={darkMode} onToast={triggerToast} />} />

          {/* POLICY PAGES (TERMS, PRIVACY CODES, REPLAY) */}
          <Route path="/terms" element={<PolicyPage view="terms" darkMode={darkMode} onToast={triggerToast} />} />
          <Route path="/privacy" element={<PolicyPage view="privacy" darkMode={darkMode} onToast={triggerToast} />} />
          <Route path="/refund" element={<PolicyPage view="refund" darkMode={darkMode} onToast={triggerToast} />} />
          <Route path="/shipping" element={<PolicyPage view="shipping" darkMode={darkMode} onToast={triggerToast} />} />
          <Route path="/disclaimer" element={<PolicyPage view="disclaimer" darkMode={darkMode} onToast={triggerToast} />} />
          <Route path="/verification_policy" element={<PolicyPage view="verification_policy" darkMode={darkMode} onToast={triggerToast} />} />

          {/* LOGIN PAGES */}
          <Route path="/super-admin/login" element={<SuperAdminLoginPage darkMode={true} onToast={triggerToast} onSuccess={handleRefreshUser} />} />
          <Route path="/admin/login" element={<AdminLoginPage darkMode={darkMode} onToast={triggerToast} onSuccess={handleRefreshUser} />} />
          <Route path="/student/login" element={<StudentLoginPage darkMode={darkMode} onToast={triggerToast} onSuccess={handleRefreshUser} />} />

          {/* SUPER ADMIN DASHBOARD */}
          <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="/super-admin/dashboard" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />
          <Route path="/super-admin/admins" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />
          <Route path="/super-admin/courses" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />
          <Route path="/super-admin/students" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />
          <Route path="/super-admin/certificates" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />
          <Route path="/super-admin/revenue" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />
          <Route path="/super-admin/settings" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />
          <Route path="/super-admin/notifications" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />
          <Route path="/super-admin/profile" element={<SuperAdminRoute><SuperAdminDashboardWrapper darkMode={darkMode} onToast={triggerToast} /></SuperAdminRoute>} />

          {/* ADMIN PORTALS */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />
          <Route path="/admin/students" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />
          <Route path="/admin/exams" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />
          <Route path="/admin/certificates" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />
          <Route path="/admin/support" element={<AdminRoute><AdminDashboardWrapper darkMode={darkMode} courses={courses} onRefreshCourses={loadCourses} onToast={triggerToast} /></AdminRoute>} />

          {/* STUDENT DASHBOARD */}
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />
          <Route path="/student/roadmap" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />
          <Route path="/student/courses" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />
          <Route path="/student/learn/:courseId" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />
          <Route path="/student/certificates" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />
          <Route path="/student/payments" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />
          <Route path="/student/profile" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />
          <Route path="/student/referrals" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />
          <Route path="/student/support" element={<StudentRoute><StudentDashboardWrapper darkMode={darkMode} courses={courses} onStartExam={handleStartExam} onUpgradePlan={() => navigate('/pricing')} onToast={triggerToast} onRefreshUser={handleRefreshUser} onLogout={handleLogout} /></StudentRoute>} />

          {/* NOT FOUND ROUTE - 404 CRAWLERS */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center p-6 text-center text-slate-800 dark:text-slate-100">
              <div className="space-y-6 max-w-md">
                <ShieldAlert className="w-16 h-16 text-blue-500 mx-auto animate-bounce" />
                <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Academic Registry coordinates not found. The requested page is either closed under security clearance or doesn't exist.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-blue-600 font-bold hover:bg-blue-700 text-white rounded-xl shadow-md uppercase tracking-wider text-xs"
                >
                  Return to Home
                </button>
              </div>
            </div>
          } />
            </Routes>
      </main>

      {showNavAndFooter && (
        <Footer
          darkMode={darkMode}
          onNavigate={(view) => {
            if (view === 'home') navigate('/');
            else if (view === 'super_admin_dashboard') navigate('/super-admin/dashboard');
            else if (view === 'admin_dashboard') navigate('/admin/dashboard');
            else if (view === 'student_dashboard') navigate('/student/dashboard');
            else navigate(`/${view}`);
          }}
          onToast={triggerToast}
        />
      )}

      {/* Floating AI Chatbot Assistant widget */}
      <AIChatBot darkMode={darkMode} onToast={triggerToast} />

      {/* Full screen active assessment engine lock overlay */}
      {activeExam && currentUser && (
        <ExamEngine
          courseId={activeExam.courseId}
          courseTitle={activeExam.title}
          questions={activeExam.questions}
          currentUser={currentUser}
          darkMode={darkMode}
          onClose={() => setActiveExam(null)}
          onToast={triggerToast}
        />
      )}

      {/* AUTHENTICATION SYSTEMS DIRECT BACKUP OVERLAY MODAL */}
      <AnimatePresence>
      {authModal.isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          id="auth-modal-screen" 
          className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
        >
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={`relative w-full max-w-md rounded-[2rem] p-8 sm:p-10 border shadow-2xl overflow-hidden ${
              darkMode ? 'bg-slate-900/90 backdrop-blur-xl border-slate-700/50 text-white shadow-blue-500/10' : 'bg-white/95 backdrop-blur-xl border-slate-200/50 text-slate-800 shadow-xl'
            }`}
          >
            {/* Decorative background gradients */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px] pointer-events-none" />

            <button
              onClick={() => {
                setAuthModal({ ...authModal, isOpen: false });
                setAuthError('');
                setOtpSent(false);
                setOtpCode('');
              }}
              className="absolute right-6 top-6 p-2 rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 font-bold hover:scale-110 hover:rotate-90 transition-all z-20"
              title="Close Modal"
            >
              <XCloseIcon />
            </button>

            {/* Header branding */}
            <motion.div layout className="text-center mb-8 relative z-10">
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                SkillGenz
              </span>
              <h2 className="text-sm font-bold block mt-1 tracking-wider uppercase text-slate-500 dark:text-slate-400">
                {authModal.mode === 'login' ? 'Sign In Credentials' : 'Request Student Account'}
              </h2>
            </motion.div>

            <AnimatePresence mode="popLayout">
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-bold leading-relaxed text-center relative z-10"
                >
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuthSubmit} className="space-y-5 text-sm font-semibold relative z-10">
              <AnimatePresence mode="popLayout">
                {authModal.mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-slate-500 dark:text-slate-400 text-[10px] tracking-widest uppercase font-bold">Student Full Name</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 text-xs rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                          darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400'
                        }`}
                        placeholder="e.g. Rahul Sharma"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 dark:text-slate-400 text-[10px] tracking-widest uppercase font-bold">Role selection clearances</label>
                      <select
                        value={authForm.role}
                        onChange={(e) => setAuthForm({ ...authForm, role: e.target.value as any })}
                        className={`w-full px-4 py-3 text-xs rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                          darkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50/50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <option value="student">Student enrollment</option>
                        <option value="admin">Admin staff audit mode</option>
                        <option value="super_admin">Super admin control</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 text-[10px] tracking-widest uppercase font-bold">Registered Email address</label>
                <input
                  type="email"
                  className={`w-full px-4 py-3 text-xs rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                    darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                  placeholder="e.g. rahul@gmail.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                />
              </motion.div>

              <motion.div layout className="space-y-1.5 relative">
                {!otpSent ? (
                  <></>
                ) : (
                  <>
                    <label className="text-slate-500 dark:text-slate-400 text-[10px] tracking-widest uppercase font-bold">Enter OTP Code</label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 text-xs rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                        darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                  </>
                )}
              </motion.div>

              <AnimatePresence mode="popLayout">
                {authModal.mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-1.5"
                  >
                    <label className="text-slate-500 dark:text-slate-400 text-[10px] tracking-widest uppercase font-bold">Primary phone number (Optional)</label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 text-xs rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                        darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="e.g. +91 9876543210"
                      value={authForm.phone}
                      onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                layout
                type="submit"
                id="submit-auth-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-shadow flex items-center justify-center gap-2"
              >
                {otpSent ? 'Verify OTP & SignIn' : 'Send OTP'}
              </motion.button>
            </form>

            <motion.div layout className="mt-6 text-center text-[11px] text-slate-500 dark:text-slate-400 select-none relative z-10">
              {authModal.mode === 'login' ? (
                <p>
                  New to SkillGenz?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModal({ ...authModal, mode: 'signup' })}
                    className="text-blue-500 font-extrabold hover:text-cyan-400 transition-colors"
                  >
                    Create student pass now
                  </button>
                </p>
              ) : (
                <p>
                  Already have clearances?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModal({ ...authModal, mode: 'login' })}
                    className="text-blue-500 font-extrabold hover:text-cyan-400 transition-colors"
                  >
                    Sign in credentials
                  </button>
                </p>
              )}
            </motion.div>

            {/* Real Google OAuth Component */}
            <motion.div layout className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center space-y-2 relative z-10 flex flex-col items-center">
              <GoogleLogin
                onSuccess={async (credentialResponse: any) => {
                  await handleGoogleSuccess(credentialResponse.credential);
                }}
                onError={() => {
                  triggerToast('Google login failed', 'ref');
                }}
                theme={darkMode ? 'filled_black' : 'outline'}
                shape="pill"
                text="continue_with"
              />

              <button
                type="button"
                id="test-mock-google-login-btn"
                onClick={async () => {
                  const timestamp = Date.now();
                  const payload = {
                    email: `google_test_${timestamp}@gmail.com`,
                    name: "Google Test User",
                    sub: `google-sub-${timestamp}`
                  };
                  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
                  const body = btoa(JSON.stringify(payload));
                  const mockJwt = `${header}.${body}.signature`;
                  await handleGoogleSuccess(mockJwt);
                }}
                className="mt-3 text-xs text-blue-500 hover:text-blue-400 font-semibold underline cursor-pointer"
              >
                Demo: Mock Google Sign-in & Onboarding
              </button>
            </motion.div>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* TOAST PANEL popup alert */}
      {toast.isOpen && (
        <div
          id="toast-popup-state"
          className={`fixed bottom-6 left-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 border ${
            toast.type === 'success'
              ? 'bg-green-600/10 border-green-500 text-green-500 dark:bg-green-900/30'
              : 'bg-red-650/10 border-red-500 text-red-500 dark:bg-red-950/20'
          }`}
        >
          <div className="shrink-0 text-xs font-extrabold uppercase">
            {toast.type === 'success' ? 'SUCCESS' : 'WARNING'}
          </div>
          <span className="text-xs font-medium leading-relaxed max-w-sm">{toast.message}</span>
        </div>
      )}

    </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// ----------------------------------------------------------------------
// LANDING PAGE CLIENT LAYERED PANELS
// ----------------------------------------------------------------------
interface LandingProps {
  courses: Course[];
  onStartExam: (id: string, title: string) => void;
  onNavigate: (v: string) => void;
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (val: 'monthly' | 'yearly') => void;
  darkMode: boolean;
  onToast: (msg: string, type: 'success' | 'ref') => void;
}

function FloatingParticles() {
  const particles = React.useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 8 + 4, // 4px to 12px
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      color: i % 3 === 0 ? 'rgba(59, 130, 246, 0.8)' : i % 3 === 1 ? 'rgba(139, 92, 246, 0.7)' : 'rgba(14, 165, 233, 0.8)',
      duration: Math.random() * 10 + 15, // 15s to 25s for smoother look
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full shadow-sm"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            top: p.top,
            left: p.left,
            boxShadow: `0 0 10px ${p.color}`,
            animation: `particle-up ${p.duration}s linear infinite ${p.delay}s`,
            willChange: 'transform, opacity' // GPU acceleration
          }}
        />
      ))}
    </div>
  );
}

function LandingPage({
  courses,
  onStartExam,
  onNavigate,
  billingCycle,
  setBillingCycle,
  darkMode,
  onToast
}: LandingProps) {
  return (
    <div className="space-y-20">
      {/* 1. HERO HOME BANNER */}
      <section className="relative pt-16 pb-6 overflow-hidden">
        {/* ── Background Elements with Fade-out Mask ──────────── */}
        <div className="absolute inset-0 pointer-events-none [mask-image:linear-gradient(to_bottom,white_70%,transparent)]">
          {/* Dot grid */}
          <div className="absolute inset-0 dot-grid opacity-60" />
          
          {/* Animated floating orbs */}
          <div className="absolute top-8 left-12 w-80 h-80 bg-blue-500/20 dark:bg-blue-500/15 rounded-full blur-3xl float-slow" />
          <div className="absolute top-28 right-16 w-60 h-60 bg-violet-500/15 dark:bg-violet-500/10 rounded-full blur-3xl float-medium" style={{ animationDelay: '2.5s' }} />
          <div className="absolute bottom-16 left-1/3 w-72 h-72 bg-sky-400/15 dark:bg-sky-400/10 rounded-full blur-3xl float-fast" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-1/2 right-1/4 w-44 h-44 bg-blue-400/10 rounded-full blur-2xl float-medium" style={{ animationDelay: '3.5s' }} />
          <div className="absolute -bottom-8 right-8 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl float-slow" style={{ animationDelay: '0.8s' }} />

          {/* Central glow */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-blue-600/15 blur-[120px] rounded-full" />

          {/* Floating dynamic particles */}
          <FloatingParticles />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 dark:bg-blue-500/5 border border-blue-200/40 dark:border-blue-800/40 rounded-full shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              DEVELOPED AND MANAGED BY IIT MADRAS GRADUATES
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight"
          >
            Get Certified.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">Get Placed.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            Acquire dynamic IIT board placement clearances. Certify technical proficiency domains dynamically, backed by professional referral networks.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('courses')}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
            >
              Start Assessing Now <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('certificates_showcase')}
              className={`px-6 py-3 rounded-xl font-bold text-xs transition-all border ${
                darkMode ? 'border-slate-800 hover:bg-slate-900 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-750'
              }`}
            >
              Verify Registry Credentials
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-6 mx-auto w-fit flex flex-col items-center justify-center gap-4 py-5 px-10 rounded-3xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-blue-200/50 dark:border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:shadow-[0_0_60px_rgba(59,130,246,0.25)] transition-shadow duration-500"
          >
            <p className="text-[11px] font-extrabold text-blue-600 dark:text-sky-400 uppercase tracking-[0.25em] drop-shadow-sm">
              Trusted & Accepted by 1100+ Top MNCs
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-90 hover:opacity-100 transition-opacity duration-300">
              <span className="text-2xl font-bold font-sans tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 drop-shadow-sm">Google</span>
              <div className="flex items-center gap-1.5 drop-shadow-sm">
                <div className="grid grid-cols-2 gap-0.5"><div className="w-2.5 h-2.5 bg-[#f25022]"></div><div className="w-2.5 h-2.5 bg-[#7fba00]"></div><div className="w-2.5 h-2.5 bg-[#00a4ef]"></div><div className="w-2.5 h-2.5 bg-[#ffb900]"></div></div>
                <span className="text-2xl font-bold font-sans tracking-tight text-slate-700 dark:text-slate-200">Microsoft</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white drop-shadow-sm">amazon<span className="text-[#ff9900]">.in</span></span>
              <span className="text-2xl font-bold italic tracking-wider text-[#007cc3] drop-shadow-sm">Infosys</span>
              <span className="text-2xl font-black tracking-widest text-[#e51420] drop-shadow-sm">TCS</span>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* 2. VALUE PROPOSITION STATS */}
      <section className="max-w-5xl mx-auto px-4 relative z-20 flex justify-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2, type: 'spring', stiffness: 300, damping: 24 } }
          }}
          className={`w-full grid grid-cols-2 md:grid-cols-4 relative p-6 sm:p-10 rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
            darkMode 
              ? 'bg-slate-900/80 border-slate-800/80 shadow-[0_0_40px_rgba(30,58,138,0.15)] backdrop-blur-xl' 
              : 'bg-white/95 border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] backdrop-blur-xl'
          }`}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />

          {[
            { icon: Users, num: '10k+', label: 'Vetted Graduates', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: TrendingUp, num: '94.8%', label: 'Placement success', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: Briefcase, num: '₹14 LPA', label: 'Average Packages', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
            { icon: Award, num: 'Instant', label: 'Dynamic QR print', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' } }
              }}
              whileHover={{ y: -6, scale: 1.05 }}
              className={`relative flex flex-col items-center text-center space-y-4 p-4 ${
                i !== 0 && i !== 2 ? 'border-l border-slate-200/50 dark:border-slate-800/50' : ''
              } ${i === 2 ? 'md:border-l border-slate-200/50 dark:border-slate-800/50' : ''}`}
            >
              <div className={`p-3.5 rounded-2xl ${stat.bg} shadow-inner`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="space-y-1.5">
                <strong className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight drop-shadow-sm ${stat.color}`}>
                  {stat.num}
                </strong>
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-widest">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. LATEST ASSESSMENTS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Active Curriculum Clearances</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">Vetted technical curriculum directly connected to active recruiting criteria.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {courses.slice(0, 3).map((c, i) => (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
              className={`group relative p-6 sm:p-8 rounded-[2rem] border overflow-hidden flex flex-col justify-between space-y-6 transition-all duration-300 ${
                darkMode ? 'bg-slate-900/80 border-slate-800 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]'
              }`}
            >
              {/* Glowing animated background that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-violet-500/0 group-hover:from-blue-500/5 group-hover:to-violet-500/10 transition-colors duration-500 pointer-events-none" />
              
              {/* Floating decorative shape */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 group-hover:scale-150 transition-all duration-700 pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <span className="inline-block text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md shadow-sm border border-blue-100 dark:border-blue-800/50 transition-colors">
                  {c.category} Domain
                </span>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {c.description}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center relative z-10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Criteria</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.passPercentage}% Pass</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onStartExam(c.id, c.title)}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:text-white transition-colors shadow-md group/btn flex items-center gap-2 overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-1.5 transition-colors group-hover/btn:text-white">
                    Start <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-blue-600 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. VERIFIABLE SECURE REGISTRY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ rotateY: -1, rotateX: 1, scale: 1.01 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ perspective: 1000 }}
          className={`p-8 sm:p-12 rounded-[2rem] border grid grid-cols-1 md:grid-cols-2 gap-10 items-center overflow-hidden relative ${
            darkMode 
              ? 'bg-slate-900/60 border-slate-800 shadow-2xl shadow-blue-900/10' 
              : 'bg-white border-slate-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]'
          }`}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="space-y-6 relative z-10">
            <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 rounded-lg">
              ANTI-FRAUD VERIFIED REGISTRY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-800 dark:text-slate-100">
              Verifications backing recruiter searches
            </h2>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-md">
              Each certified candidate gets recorded in public cryptographic ledger indices. Recruiters can index certificate passport coordinates instantly.
            </p>
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('certificates_showcase')}
                className="group relative px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer-slide_1.5s_infinite]" />
                <span className="relative">Access Active design templates</span>
              </motion.button>
            </div>
          </div>

          <motion.div 
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative bg-[#0b1120] p-7 rounded-2xl border border-slate-800/80 shadow-2xl shadow-blue-900/20 space-y-5 z-10 group overflow-hidden"
          >
            {/* Holographic scanning line */}
            <motion.div 
              animate={{ top: ['-10%', '110%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-[2px] bg-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20 pointer-events-none"
            />

            <div className="flex justify-between items-center border-b border-slate-800 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                </div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400">Ledger coordinate</span>
              </div>
              <span className="text-[10px] font-mono text-blue-400/80 bg-blue-900/20 px-2 py-0.5 rounded">ID: SV-2026-AI-01438</span>
            </div>

            <div className="space-y-3 text-[13px] relative z-10">
              <div className="flex justify-between text-slate-400 items-center">
                <span>Vetted Personnel:</span>
                <strong className="text-white font-serif tracking-wide text-sm">Rahul Sharma</strong>
              </div>
              <div className="flex justify-between text-slate-400 items-center">
                <span>Vetting Board:</span>
                <strong className="text-white">IIT M Grad Council</strong>
              </div>
              <div className="flex justify-between text-slate-400 items-center pt-2 border-t border-slate-800/50 mt-2">
                <span>Status:</span>
                <motion.span 
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-emerald-400 font-extrabold uppercase tracking-wider drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"
                >
                  PASS (98%)
                </motion.span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. PRICING COMBOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-extrabold tracking-tight">Corporate and Scholar Memberships</h2>
          <p className="text-xs text-slate-400">All modules come backed by placement council references.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <PlanCard
            title="Scholar Trial Gateway"
            price="₹0"
            cycle=""
            desc="Access basic reading materials."
            features={['Review public curriculum lists', 'Search verified certificate ledger registry']}
            btnText="Current Trial"
            onSelect={() => onNavigate('pricing')}
          />
          <PlanCard
            title="Premium Classic membership"
            price={billingCycle === 'monthly' ? '₹299' : '₹199'}
            cycle="/mo"
            desc="Advanced placement candidate option."
            features={['Unlimited lectures watch logs', '3 dynamic exam trials', 'Download high-res certificates credentials']}
            btnText="Subscribe classic membership"
            onSelect={() => onNavigate('pricing')}
            highlighted={true}
          />
          <PlanCard
            title="Pro Infinite retake membership"
            price={billingCycle === 'monthly' ? '₹499' : '₹399'}
            cycle="/mo"
            desc="Infinite attempts across academic catalogs."
            features={['Absolutely infinite retakes across technical catalogs', 'Personal curriculum reviews', 'Vetted placements lists inclusion']}
            btnText="Subscribe Pro Gateway"
            onSelect={() => onNavigate('pricing')}
          />
        </div>
      </section>

      {/* 6. FAQS MODULE ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-extrabold tracking-tight">Clearing typical queries</h2>
          <p className="text-xs text-slate-400 mt-1">Council guidelines and assessment regulatory policies.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <FaqRow q="Are Certificates dynamically printable?" a="Yes! Passing the certification test instantly generates PDF landscape credentials containing unique registry coordinates and validation QR codes." />
          <FaqRow q="Who designs current Technical testing curricula?" a="Active IIT Madras graduate practitioners design standard curriculum questions connected directly to active partner MNC recruitment needs." />
          <FaqRow q="What happens if I fail the threshold score?" a="Classic members can retake locked exams thrice. Pro master tier candidates unlock completely infinite retake attempts across catalogs." />
        </motion.div>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER INTERNAL STATIC SUBCOMPONENTS
// ----------------------------------------------------------------------

function PlanCard({
  title,
  price,
  cycle,
  desc,
  features,
  btnText,
  onSelect,
  highlighted = false
}: {
  title: string;
  price: string;
  cycle: string;
  desc: string;
  features: string[];
  btnText: string;
  onSelect: () => void;
  highlighted?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: highlighted ? 1.03 : 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative flex flex-col justify-between space-y-6 rounded-3xl p-7 ${
        highlighted
          ? 'gradient-border-spin shadow-2xl shadow-blue-500/20'
          : 'border border-slate-200/80 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none'
      } ${
        highlighted
          ? 'bg-slate-900 text-white' // Premium card is always dark
          : 'bg-white dark:bg-slate-900/80' // Regular cards are white in light mode
      }`}
    >
      {/* Highlighted glow overlay */}
      {highlighted && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 pointer-events-none" />
      )}

      {highlighted && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-full text-[10px] font-mono tracking-widest font-extrabold uppercase shadow-lg shadow-blue-500/30 whitespace-nowrap"
        >
          ⭐ Most Popular
        </motion.span>
      )}

      <div className="space-y-4 relative">
        {/* Category accent bar */}
        <div className={`h-1.5 w-12 rounded-full ${
          highlighted ? 'bg-gradient-to-r from-blue-400 to-violet-400' : 'bg-slate-200 dark:bg-slate-700'
        }`} />

        <div>
          <h3 className={`font-extrabold text-lg tracking-tight ${
            highlighted ? 'text-white' : 'text-slate-800 dark:text-slate-200'
          }`}>{title}</h3>
          <p className={`text-xs mt-1.5 leading-relaxed ${
            highlighted ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
          }`}>{desc}</p>
        </div>

        <div className="flex items-baseline gap-1 pt-2">
          <strong className={`text-4xl font-extrabold font-mono tracking-tight ${
            highlighted ? 'text-white' : 'text-slate-800 dark:text-slate-100'
          }`}>{price}</strong>
          <span className={`text-xs font-medium ${
            highlighted ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'
          }`}>{cycle}</span>
        </div>

        <div className={`h-px w-full my-4 ${
          highlighted ? 'bg-gradient-to-r from-slate-700 to-transparent' : 'bg-slate-100 dark:bg-slate-800'
        }`} />

        <ul className="space-y-3.5 text-xs">
          {features.map((f, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-start gap-3 ${
                highlighted ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                highlighted ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 dark:bg-slate-800 text-blue-500 dark:text-slate-400'
              }`}>
                <Check className="w-2.5 h-2.5" />
              </span>
              <span className="leading-snug">{f}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSelect}
        className={`relative w-full mt-4 py-3.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer overflow-hidden group ${
          highlighted
            ? 'bg-white text-slate-900 hover:bg-blue-50 hover:shadow-lg hover:shadow-white/20'
            : 'bg-slate-50 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
        }`}
      >
        <span className="relative">{btnText}</span>
      </motion.button>
    </motion.div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm ${
      open ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/50 shadow-md shadow-blue-500/5' : 'bg-white/80 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-800'
    }`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center gap-4 text-[13px] font-bold text-slate-800 dark:text-slate-200 outline-none"
      >
        <span>{q}</span>
        <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
          open ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
        }`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </div>
      </motion.button>
      {open && (
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium">
          {a}
        </p>
      )}
    </div>
  );
}

function XCloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ----------------------------------------------------------------------
// OTHER STATIC PAGES
// ----------------------------------------------------------------------

function CoursesPage({
  courses,
  coursesLoading,
  onStartExam,
  darkMode
}: {
  courses: Course[];
  coursesLoading: boolean;
  onStartExam: (id: string, title: string) => void;
  darkMode: boolean;
}) {
  const [filterStr, setFilterStr] = useState('all');

  const filtered = filterStr === 'all'
    ? courses
    : courses.filter((c) => c.category.toLowerCase() === filterStr.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Technical Curriculum & Assessments</h1>
        <p className="text-xs text-slate-400 mt-1">Acquire placement validations. Filters catalog classifications.</p>
      </div>

      {/* Filter items buttons */}
      <div className="flex gap-2 text-xs font-semibold overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
        {['All', 'Tech', 'Business', 'Content Creator', 'Crash Course'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterStr(cat.toLowerCase())}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filterStr === cat.toLowerCase()
                ? 'bg-blue-600 text-white shadow-md'
                : darkMode
                ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                : 'border-slate-200 hover:bg-slate-150 text-slate-600'
            }`}
          >
            {cat === 'All' ? 'All domains' : `${cat} Modules`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <motion.div 
              layout
              key={c.id} 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 }}
              className={`group relative p-6 sm:p-8 rounded-[2rem] border overflow-hidden flex flex-col justify-between space-y-6 transition-all duration-300 ${
                darkMode ? 'bg-slate-900/80 border-slate-800 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]'
              }`}
            >
              {/* Glowing animated background that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-violet-500/0 group-hover:from-blue-500/5 group-hover:to-violet-500/10 transition-colors duration-500 pointer-events-none" />
              
              {/* Floating decorative shape */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 group-hover:scale-150 transition-all duration-700 pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <span className="inline-block text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md shadow-sm border border-blue-100 dark:border-blue-800/50 transition-colors">
                  {c.category} Domain
                </span>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {c.description}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center relative z-10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Criteria</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.passPercentage}% Pass</span>
                </div>
                <button
                  onClick={() => onStartExam(c.id, c.title)}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:text-white transition-colors shadow-md group/btn flex items-center gap-2 overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-1.5 transition-colors group-hover/btn:text-white">
                    Start <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-blue-600 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CertificateShowcasePage({
  onNavigate,
  darkMode
}: {
  onNavigate: (v: string) => void;
  darkMode: boolean;
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <span className="text-xs font-mono font-bold tracking-widest text-blue-500 uppercase">VERIFIED CREDENTIALS</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Active Credential Designs</h1>
        <p className="text-sm text-slate-400 max-w-lg">Blockchain-verified certificates with unique QR codes. Instantly validated by recruiters worldwide.</p>
      </motion.div>

      {/* Main showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left - Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Trust badges */}
          <div className="flex flex-wrap gap-2">
            {['🔒 Blockchain Verified', '⚡ Instant PDF', '🌐 Globally Recognized'].map(badge => (
              <span key={badge} className="px-3 py-1.5 bg-blue-500/10 dark:bg-blue-500/5 border border-blue-200/40 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full">
                {badge}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-extrabold">Verified SkillGenz Blueprints</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Every candidate clearing assessments instantly unlocks a premium certificate with a unique QR code, validated in real-time across our public cryptographic ledger.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              { icon: '✦', text: 'Unique QR code for instant recruiter verification' },
              { icon: '✦', text: 'High-resolution PDF download (A4 landscape)' },
              { icon: '✦', text: 'IIT Madras council digital seal & signature' },
              { icon: '✦', text: 'Shareable LinkedIn-ready credential link' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="text-blue-500 font-bold text-base shrink-0 mt-0.5">{icon}</span>
                <span className="text-slate-600 dark:text-slate-400">{text}</span>
              </li>
            ))}
          </ul>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate(`verify/SV-2026-AI-01438`)}
            className="relative px-6 py-3 text-sm text-white bg-gradient-to-r from-blue-600 to-violet-600 font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-500/25 overflow-hidden group"
          >
            <span className="absolute inset-0 shimmer-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center gap-2">
              <Award className="w-4 h-4" />
              Verify Sample Certificate
            </span>
          </motion.button>
        </motion.div>

        {/* Right - Animated Certificate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.9, delay: 0.3, type: 'spring', stiffness: 100 }}
          className="flex justify-center"
        >
          <motion.div
            whileHover={{ rotateY: -6, rotateX: 3, scale: 1.03 }}
            animate={{ y: [-8, 8, -8] }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            className="relative w-full max-w-md select-none cursor-default group"
          >
            {/* Certificate card */}
            <div className={`relative rounded-2xl overflow-hidden cert-gold-border shadow-2xl ${
              darkMode ? 'cert-dark-gold-border' : 'cert-gold-border'
            }`}>

              <div className={`relative p-8 ${
                darkMode
                  ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                  : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50'
              }`}>
                {/* Corner ornaments */}
                <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-amber-500/60 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-amber-500/60 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-amber-500/60 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-amber-500/60 rounded-br-lg" />

                {/* Header */}
                <div className="text-center space-y-1 mb-6">
                  <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg glow-gold">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <p className="text-[8px] tracking-[0.3em] font-bold text-amber-600 dark:text-amber-500 uppercase">
                    Certificate of Completion
                  </p>
                  <div className={`h-px mt-2 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent`} />
                </div>

                {/* Main content */}
                <div className="text-center space-y-3 my-4">
                  <p className={`text-[11px] font-medium tracking-wide ${
                    darkMode ? 'text-slate-400' : 'text-amber-700'
                  }`}>This is to certify that</p>

                  <h2 className={`cert-font text-2xl font-bold italic ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>Rahul Sharma</h2>

                  <p className={`text-[10px] leading-relaxed max-w-xs mx-auto ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    has successfully demonstrated expert proficiency in
                  </p>

                  <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full">
                    <span className="text-[11px] font-bold text-white">Option Hedging Assessment</span>
                  </div>

                  <div className={`flex justify-center items-center gap-2 text-[10px] font-bold ${
                    darkMode ? 'text-amber-400' : 'text-amber-700'
                  }`}>
                    <span className="text-base">★</span> Score: 98% <span className="text-base">★</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px my-4 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                {/* Footer */}
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className={`text-[8px] font-mono tracking-widest uppercase ${
                      darkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>Certificate ID</div>
                    <div className={`text-[9px] font-mono font-bold ${
                      darkMode ? 'text-amber-400' : 'text-amber-700'
                    }`}>SV-2026-AI-01438</div>
                    <div className={`text-[8px] font-mono ${
                      darkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>June 2026 • IIT Madras</div>
                  </div>

                  {/* QR placeholder */}
                  <div className={`w-14 h-14 rounded-lg p-1.5 ${
                    darkMode ? 'bg-slate-700' : 'bg-white'
                  } shadow-inner border border-amber-200/50`}>
                    <div className="w-full h-full grid grid-cols-3 gap-0.5">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className={`rounded-sm ${
                          [0,2,4,6,8].includes(i)
                            ? 'bg-slate-800 dark:bg-slate-300'
                            : 'bg-transparent'
                        }`} />
                      ))}
                    </div>
                  </div>

                  {/* Animated Seal */}
                  <div className="relative group/seal">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="w-14 h-14 rounded-full border-2 border-dashed border-amber-500/60 flex items-center justify-center"
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                      >
                        <span className="text-[7px] font-extrabold text-white text-center leading-none uppercase" style={{ transform: "rotate(0deg)" }}>IIT<br/>Seal</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Trust stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`grid grid-cols-3 gap-6 p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        {[
          { val: '50K+', label: 'Certificates Issued' },
          { val: '99.9%', label: 'Verification Rate' },
          { val: '<2s', label: 'QR Scan Speed' },
        ].map(({ val, label }) => (
          <div key={label} className="text-center space-y-1">
            <strong className="text-2xl font-extrabold font-mono bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{val}</strong>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function PricingPage({
  billingCycle,
  setBillingCycle,
  darkMode,
  onUpgradePlan
}: {
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (val: 'monthly' | 'yearly') => void;
  darkMode: boolean;
  onUpgradePlan: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif mt-1">Combo Subscription parameters</h1>
        <p className="text-xs text-slate-400 mt-1">Unlimited passes across technical exams.</p>

        {/* Dynamic switcher */}
        <div className="inline-flex items-center gap-2.5 bg-slate-500/10 p-1 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg ${billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
          >
            Monthly Tiers
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg ${billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
          >
            Yearly Saving 20%
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <PlanCard
          title="Free Scholar Plan"
          price="₹0"
          cycle=""
          desc="Access trial lectures."
          features={['Check study guides', 'Verify certificate registry lookup']}
          btnText="Current Trial access"
          onSelect={onUpgradePlan}
        />

        <PlanCard
          title="Classic Combo"
          price={billingCycle === 'monthly' ? '₹299' : '₹199'}
          cycle="/mo"
          desc="Perfect candidate introductory."
          features={['Lectures watch logs unlocked', '3 assessment trials', 'Landscape print downloads']}
          btnText="Choose Classic Combo"
          onSelect={onUpgradePlan}
          highlighted={true}
        />

        <PlanCard
          title="Pro Master Membership"
          price={billingCycle === 'monthly' ? '₹499' : '₹399'}
          cycle="/mo"
          desc="Absolutely infinite retakes across technical assessments."
          features={['Infinite retakes assessments', 'Portfolio resume audits and reviews', 'Verified Direct Placement lists slots']}
          btnText="Subscribe Pro combo"
          onSelect={onUpgradePlan}
        />
      </div>
    </div>
  );
}

function AboutPage({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-blue-600/10 dark:bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-2 relative z-10"
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block animate-pulse">DEVELOPED AND MANAGED BY</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">IIT Madras Graduates</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">Providing placement letters and referral networks to candidates nationwide.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-6 relative z-10">
        
        {/* Animated Connecting Line (visible only on desktop) */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[2px] overflow-hidden">
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 absolute inset-0" />
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent absolute"
          />
        </div>

        {/* Card 1: Aarsh Mohan */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 60 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          whileHover={{ y: -15, rotateY: 8, rotateX: 5, scale: 1.02 }}
          style={{ perspective: 1000 }}
          className={`group relative p-8 rounded-[2.5rem] border overflow-hidden flex flex-col space-y-6 transition-all duration-500 ${darkMode ? 'bg-slate-900/60 backdrop-blur-xl border-slate-700/50 hover:shadow-[0_20px_80px_rgba(59,130,246,0.25)] hover:border-blue-500/80' : 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl hover:shadow-2xl hover:border-blue-400/60'}`}
        >
          {/* Animated Glow Blob */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative mx-auto mt-4">
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-24 h-24"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center font-extrabold text-3xl text-white shadow-[0_0_30px_rgba(59,130,246,0.6)] ring-4 ring-blue-500/30 group-hover:scale-110 transition-transform duration-500 z-10">
                AM
              </div>
              {/* Dual Gyroscope Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border-2 border-transparent border-t-blue-400 border-l-cyan-400 opacity-50 pointer-events-none"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-full border border-dashed border-blue-500/30 opacity-70 pointer-events-none"
              />
            </motion.div>
          </div>
          
          <div className="relative z-10 text-center pt-8">
            <h3 className="font-black text-2xl tracking-tight text-slate-800 dark:text-white flex items-center justify-center gap-3 group-hover:text-blue-500 transition-colors">
              Aarsh Mohan
              <a href="https://www.linkedin.com/in/aarsh-mohan-426531332?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noreferrer" className="flex items-center justify-center bg-[#0077b5]/10 text-[#0077b5] p-1.5 rounded-lg hover:bg-[#0077b5] hover:text-white hover:-translate-y-0.5 transition-all shadow-sm" title="Connect on LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </h3>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 py-1 px-2.5 rounded-full border border-blue-500/20">Founder & CEO</span>
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 py-1 px-2.5 rounded-full border border-blue-500/20">IIT Madras</span>
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 py-1 px-2.5 rounded-full border border-blue-500/20">Tech Entrepreneur</span>
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 py-1 px-2.5 rounded-full border border-blue-500/20">AI Researcher</span>
            </div>
          </div>
          
          <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 relative z-10 text-center font-medium mt-2">
            Building innovative technology solutions with a vision to create impactful products and drive technological advancement. Focused on Artificial Intelligence, software innovation, and emerging technologies, Aarsh works on transforming ideas into scalable solutions and exploring the future of technology.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">Vision</span>
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">Strategy</span>
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">Scale</span>
          </div>
        </motion.div>

        {/* Card 2: Ankit Jaat */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 60 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4, delay: 0.15 }}
          whileHover={{ y: -15, rotateY: 0, rotateX: 5, scale: 1.02 }}
          style={{ perspective: 1000 }}
          className={`group relative p-8 rounded-[2.5rem] border overflow-hidden flex flex-col space-y-6 transition-all duration-500 ${darkMode ? 'bg-slate-900/60 backdrop-blur-xl border-slate-700/50 hover:shadow-[0_20px_80px_rgba(16,185,129,0.25)] hover:border-emerald-500/80' : 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-400/60'}`}
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative mx-auto mt-4">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="relative w-24 h-24"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-extrabold text-3xl text-white shadow-[0_0_30px_rgba(16,185,129,0.6)] ring-4 ring-emerald-500/30 group-hover:scale-110 transition-transform duration-500 z-10">
                A
              </div>
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border-2 border-transparent border-b-emerald-400 border-r-teal-400 opacity-50 pointer-events-none"
              />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-full border border-dashed border-emerald-500/30 opacity-70 pointer-events-none"
              />
            </motion.div>
          </div>
          
          <div className="relative z-10 text-center pt-8">
            <h3 className="font-black text-2xl tracking-tight text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">Ankit</h3>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 py-1 px-2.5 rounded-full border border-emerald-500/20">Co-Founder & CFO</span>
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 py-1 px-2.5 rounded-full border border-emerald-500/20">AI & Finance Strategy</span>
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 py-1 px-2.5 rounded-full border border-emerald-500/20">Tech Innovation</span>
            </div>
          </div>
          
          <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 relative z-10 text-center font-medium mt-2">
            Ankit plays a key role in driving financial strategy and business growth, combining technology insights with financial planning. Focused on AI-driven solutions, financial management, and strategic decision-making, he works towards building sustainable systems and supporting the company’s vision for innovation and growth.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">Operations</span>
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">Partnerships</span>
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">Growth</span>
          </div>
        </motion.div>

        {/* Card 3: Jatin */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 60 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4, delay: 0.3 }}
          whileHover={{ y: -15, rotateY: -8, rotateX: 5, scale: 1.02 }}
          style={{ perspective: 1000 }}
          className={`group relative p-8 rounded-[2.5rem] border overflow-hidden flex flex-col space-y-6 transition-all duration-500 ${darkMode ? 'bg-slate-900/60 backdrop-blur-xl border-slate-700/50 hover:shadow-[0_20px_80px_rgba(168,85,247,0.25)] hover:border-purple-500/80' : 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl hover:shadow-2xl hover:border-purple-400/60'}`}
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative mx-auto mt-4">
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="relative w-24 h-24"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center font-extrabold text-3xl text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] ring-4 ring-purple-500/30 group-hover:scale-110 transition-transform duration-500 z-10">
                J
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border-2 border-transparent border-t-purple-400 border-l-fuchsia-400 opacity-50 pointer-events-none"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-full border border-dashed border-purple-500/30 opacity-70 pointer-events-none"
              />
            </motion.div>
          </div>
          
          <div className="relative z-10 text-center pt-8">
            <h3 className="font-black text-2xl tracking-tight text-slate-800 dark:text-white group-hover:text-purple-500 transition-colors">Jatin</h3>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-purple-600 dark:text-purple-400 uppercase bg-purple-500/10 py-1 px-2.5 rounded-full border border-purple-500/20">Platform Developer</span>
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-purple-600 dark:text-purple-400 uppercase bg-purple-500/10 py-1 px-2.5 rounded-full border border-purple-500/20">Web Tech Specialist</span>
              <span className="text-[9px] font-mono tracking-widest font-extrabold text-purple-600 dark:text-purple-400 uppercase bg-purple-500/10 py-1 px-2.5 rounded-full border border-purple-500/20">Product Engineer</span>
            </div>
          </div>
          
          <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 relative z-10 text-center font-medium mt-2">
            Jatin is responsible for developing and managing the core platform infrastructure, ensuring a smooth, scalable, and reliable digital experience. Focused on website development, technology solutions, and platform optimization, he works on building and maintaining the foundation that powers innovative products.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">Engineering</span>
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">UI/UX</span>
             <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md text-slate-500 border border-slate-200 dark:border-slate-700">Security</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function ContactPage({
  darkMode,
  onToast
}: {
  darkMode: boolean;
  onToast: (msg: string, type: 'success' | 'ref') => void;
}) {
  const [ticket, setTicket] = useState({ name: '', email: '', subject: '', query: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous',
          userName: ticket.name,
          userEmail: ticket.email,
          subject: ticket.subject,
          description: ticket.query
        })
      });
      if (res.ok) {
        onToast('Support Ticket successfully compiled and sent to the IIT Madras Graduates Council support team!', 'success');
        setTicket({ name: '', email: '', subject: '', query: '' });
      } else {
        const errData = await res.json();
        onToast(errData.message || 'Failed to submit Support Ticket. Please try again.', 'ref');
      }
    } catch (err) {
      console.error(err);
      onToast('Network connection error. Please try again.', 'ref');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 relative">
      {/* Animated Glowing Blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 space-y-2"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">Raise Support Ticket</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">Get tech assessment or payment refunds issues solved by our staff instantly. Or email us directly at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=team@skillgenz.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">team@skillgenz.com</a>.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className={`relative z-10 p-8 sm:p-10 rounded-[2.5rem] border overflow-hidden shadow-2xl ${darkMode ? 'bg-slate-900/70 backdrop-blur-xl border-slate-700/50 shadow-blue-500/5' : 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-slate-200/50'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        
        <form onSubmit={handleCreateTicketSubmit} className="space-y-6 text-sm font-medium relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div whileTap={{ scale: 0.99 }} className="space-y-1.5">
              <label className="text-slate-500 dark:text-slate-400 text-xs tracking-wide uppercase font-bold">Candidate Name</label>
              <input
                type="text"
                value={ticket.name}
                onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                  darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                placeholder="John Doe"
                required
              />
            </motion.div>
            <motion.div whileTap={{ scale: 0.99 }} className="space-y-1.5">
              <label className="text-slate-500 dark:text-slate-400 text-xs tracking-wide uppercase font-bold">Registered Email Address</label>
              <input
                type="email"
                value={ticket.email}
                onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${
                  darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                placeholder="john@example.com"
                required
              />
            </motion.div>
          </div>

          <motion.div whileTap={{ scale: 0.99 }} className="space-y-1.5">
            <label className="text-slate-500 dark:text-slate-400 text-xs tracking-wide uppercase font-bold">Complaint / Request Subject</label>
            <input
              type="text"
              value={ticket.subject}
              onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
              placeholder="e.g. Refund request or exam retake lock"
              className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              required
            />
          </motion.div>

          <motion.div whileTap={{ scale: 0.99 }} className="space-y-1.5">
            <label className="text-slate-500 dark:text-slate-400 text-xs tracking-wide uppercase font-bold">Write Detailed Message</label>
            <textarea
              rows={5}
              value={ticket.query}
              onChange={(e) => setTicket({ ...ticket, query: e.target.value })}
              placeholder="Describe your issue in detail..."
              className={`w-full p-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none ${
                darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              required
            />
          </motion.div>

          <div className="pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className={`w-full py-3.5 text-sm font-bold text-white rounded-2xl flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30'}`}
            >
              {isSubmitting ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" 
                  />
                  Transmitting...
                </>
              ) : (
                'Verify and Register Ticket'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function LeaderboardPage({ darkMode }: { darkMode: boolean }) {
  const scholars = [
    { rank: '1', name: 'Ritesh Pandey', score: '98%', course: 'Machine Learning Foundation' },
    { rank: '2', name: 'Tanvi Shah', score: '96%', course: 'Option Hedging Models' },
    { rank: '3', name: 'Aman Deep', score: '94%', course: 'FullStack React Web Apps' },
    { rank: '4', name: 'Vartika Singh', score: '92%', course: 'Data Science & Pandas tools' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center">
        <Award className="w-10 h-10 text-orange-500 mx-auto animate-pulse" />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">Scoreboard Leaderboard</h1>
        <p className="text-xs text-slate-400 mt-1">Review top-graded candidates vetted on direct assessment thresholds.</p>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="divide-y divide-slate-800/20 text-xs">
          {scholars.map((sch) => (
            <div key={sch.rank} className="p-4 flex justify-between items-center gap-4 hover:bg-blue-500/5 transition-all">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold font-mono">
                  #{sch.rank}
                </span>
                <div>
                  <strong className="font-extrabold text-sm block">{sch.name}</strong>
                  <span className="text-[10px] text-slate-400 block">{sch.course}</span>
                </div>
              </div>

              <div className="font-mono font-bold text-blue-500 text-base shrink-0">
                {sch.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogPage({ darkMode }: { darkMode: boolean }) {
  const blogs = [
    { id: 1, title: 'Crack FullStack placements with IIT guides', desc: 'IIT Madras Graduates Council explain portfolio patterns vetting modern direct hires.', read: '4 min read' },
    { id: 2, title: 'Understanding Option hedging and derivatives matrices', desc: 'How financial MNCs assess candidate skills on mathematical assessment structures.', read: '6 min read' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif mt-1">Vetted Educational Blog</h1>
        <p className="text-xs text-slate-400 mt-1">Read reports, newsletters and direct hiring strategies written by members.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((b) => (
          <div key={b.id} className={`p-6 rounded-3xl border space-y-3 ${darkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'}`}>
            <h3 className="font-extrabold text-sm text-blue-500 hover:underline cursor-pointer">{b.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
            <span className="text-[9px] text-slate-450 block font-mono">{b.read} • Published by IIT Madras Graduates Council</span>
          </div>
        ))}
      </div>
    </div>
  );
}
