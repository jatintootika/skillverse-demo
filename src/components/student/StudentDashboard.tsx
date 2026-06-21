/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, FileSpreadsheet, Award, User, ShoppingBag,
  Youtube, CheckCircle2, GraduationCap, FileText, Check, Square, CheckSquare,
  X, Play, TrendingUp, Zap, Clock, Star, ChevronRight, Lock, Unlock,
  BarChart3, Bell, Search, Menu, Crown, Flame, Target, ArrowUpRight, ArrowLeft,
  Calendar, Download, ExternalLink, Settings, LogOut, CreditCard, Shield, XCircle,
  Bot, Gamepad2, Sparkles, Palette, Gift, Users, ChevronDown, UserCog, Headset, LifeBuoy, Map, ArrowRight, Trophy
} from 'lucide-react';
import { Course, Certificate, ExamAttempt, Payment, User as UserType } from '../../types';
import { PremiumCertificate } from '../PremiumCertificate';
import { PracticeMCQEngine } from '../PracticeMCQEngine';
import { LabAssignmentEngine } from '../LabAssignmentEngine';
import { CourseRoadmap } from './CourseRoadmap';
import { getTopPerformers, getUserRankAndStats } from '../../lib/leaderboard';
import { courseNotes } from '../../data/notes';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { CompleteProfileModal } from '../CompleteProfileModal';

const coursePdfMap: Record<string, string> = {
  "course-1": "AI & Machine Learning_Book.pdf",
  "course-2": "Full Stack Web Development_Book.pdf",
  "course-3": "Data Science & Analytics_Book.pdf",
  "course-4": "Cybersecurity & Ethical Hacking_Book.pdf",
  "course-5": "Cloud Computing (AWS-Azure)_Book.pdf",
  "course-6": "App Development (Flutter)_Book.pdf",
  "course-7": "DevOps & Automation_Book.pdf",
  "course-8": "UI-UX Design_Book.pdf",
  "course-9": "Digital Marketing & SEO_Book.pdf",
  "course-10": "Stock Market & Trading_Book.pdf",
  "course-11": "Freelancing Mastery_Book.pdf",
  "course-12": "Content Creation & Branding_Book.pdf",
  "course-13": "Entrepreneurship & Startup_Book.pdf",
  "course-14": "Communication & Soft Skills_Book.pdf",
  "course-15": "Video Editing (AI-Powered)_Book.pdf",
  "course-16": "Advanced System Design_Book.pdf",
  "course-17": "Corporate Finance & Accounting_Book.pdf",
  "course-18": "Skillgenz_YouTube_Masterclass_Premium_Book.pdf",
  "course-19": "C++ Fast Track_Book.pdf",
  "course-20": "Python for Beginners_Book.pdf",
  "course-21": "Skillgenz_Instagram_Reels_Virality_Notes_Book.pdf",
  "course-23": "Java in 3 Hours_Book.pdf",
  "course-24": "Rust Essentials_Book.pdf",
  "course-25": "Next.js Quickstart_Book.pdf"
};



interface StudentDashboardProps {
  currentUser: UserType;
  courses: Course[];
  onStartExam: (courseId: string, courseTitle: string) => void;
  onUpgradePlan: () => void;
  onToast: (msg: string, type: 'success' | 'ref') => void;
  onRefreshUser: (updatedUser: UserType) => void;
  darkMode: boolean;
  initialTab?: 'home' | 'roadmap' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile' | 'referrals' | 'support';
  onTabChange?: (tab: 'home' | 'roadmap' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile' | 'referrals' | 'support') => void;
  onLogout?: () => void;
}

export function StudentDashboard({
  currentUser,
  courses,
  onStartExam,
  onUpgradePlan,
  onToast,
  onRefreshUser,
  darkMode,
  initialTab,
  onTabChange,
  onLogout
}: StudentDashboardProps) {
  
  const [avatarConfig, setAvatarConfig] = useState({ gender: 'male', seed: 'Felix', hair: 'fonze', hairColor: '000000', skinColor: 'ffdbb4', mouth: 'smile', eyes: 'smiling', shirt: 'collared', bg: 'from-blue-500 to-indigo-600' });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState<'none' | 'notifications' | 'profile'>('none');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile completion check
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  useEffect(() => {
    const hasSkipped = sessionStorage.getItem(`skip_onboarding_${currentUser.id}`);
    if ((!currentUser.phone || !currentUser.age) && hasSkipped !== 'true') {
      setProfileIncomplete(true);
    }
  }, [currentUser]);
  
  // Support AI Chat State
  const [supportChatMsg, setSupportChatMsg] = useState('');
  const [supportChatHistory, setSupportChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [supportChatLoading, setSupportChatLoading] = useState(false);
  const supportChatRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTabState] = useState<'home' | 'roadmap' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile' | 'referrals' | 'support'>(initialTab || 'home');

  const setActiveTab = (tab: 'home' | 'roadmap' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile' | 'referrals' | 'support') => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (supportChatRef.current) {
      supportChatRef.current.scrollTop = supportChatRef.current.scrollHeight;
    }
  }, [supportChatHistory, activeTab]);

  useEffect(() => { if (initialTab) setActiveTabState(initialTab); }, [initialTab]);

  const [stats, setStats] = useState({
    certsCount: 0, examsGiven: 0, currentStreak: 3,
    certificates: [] as Certificate[], attempts: [] as ExamAttempt[], payments: [] as Payment[]
  });

  const [watchingLecture, setWatchingLecture] = useState<{ courseId: string; courseTitle: string; title: string; videoId: string } | null>(null);
  const [completedLectures, setCompletedLectures] = useState<Record<string, string[]>>({});
  const [activeCertificatePreview, setActiveCertificatePreview] = useState<any | null>(null);
  const [congratsModalOpen, setCongratsModalOpen] = useState(false);
  const [filterStr, setFilterStr] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [roadmapSelectedCourseId, setRoadmapSelectedCourseId] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [enrollConfirmationCourse, setEnrollConfirmationCourse] = useState<Course | null>(null);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');

  // Notes Viewer State
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [selectedNotesCourseId, setSelectedNotesCourseId] = useState('');
  const [notesActiveTab, setNotesActiveTab] = useState<'pdf_book' | 'overview' | 'lectures' | 'cheat_sheet'>('overview');
  const [selectedLectureIdx, setSelectedLectureIdx] = useState(0);
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [notesFontSize, setNotesFontSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const [activePracticeCourse, setActivePracticeCourse] = useState<{ id: string; title: string } | null>(null);
  const [activeLabCourse, setActiveLabCourse] = useState<{ title: string; assignments: any[] } | null>(null);
  const [embeddedViewer, setEmbeddedViewer] = useState<{ url: string; title: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    try { const s = localStorage.getItem(`completed_lectures_${currentUser.id}`); if (s) setCompletedLectures(JSON.parse(s)); } catch {}
    try { const e = localStorage.getItem(`enrolled_courses_${currentUser.id}`); if (e) setEnrolledCourses(JSON.parse(e)); } catch {}
  }, [currentUser]);

  // Profile completion modal moved to main render block

  const toggleLectureCompleted = async (courseId: string, lectureTitle: string) => {
    const cur = completedLectures[courseId] || [];
    const updated = cur.includes(lectureTitle) ? cur.filter(t => t !== lectureTitle) : [...cur, lectureTitle];
    const map = { ...completedLectures, [courseId]: updated };
    setCompletedLectures(map);
    localStorage.setItem(`completed_lectures_${currentUser.id}`, JSON.stringify(map));
    // Note: Certificate is ONLY generated when the user passes the exam, not when lectures are completed.
  };

  const fetchDashboardStats = async () => {
    try { const r = await fetch(`/api/student/${currentUser.id}/dashboard`); if (r.ok) setStats(await r.json()); } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchDashboardStats(); setProfileName(currentUser.name); setProfilePhone(currentUser.phone || '');
    fetchNotifications();
  }, [currentUser, activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await fetch('/api/auth/update-profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, name: profileName, phone: profilePhone })
      });
      const d = await r.json();
      if (r.ok) { onToast('Profile updated.', 'success'); onRefreshUser(d.user); }
      else onToast(d.message || 'Update failed.', 'ref');
    } catch { onToast('Connection failed.', 'ref'); }
  };

  const handleSimulatedPayment = async (courseId: string, title: string, price: number) => {
    // 1. Check if user has free course credits
    if (currentUser.freeCourseCredits && currentUser.freeCourseCredits > 0) {
      const useCredit = window.confirm(`You have ${currentUser.freeCourseCredits} Free Course Credit(s)!\n\nWould you like to unlock "${title}" for FREE using 1 credit?`);
      if (useCredit) {
        try {
          const r = await fetch('/api/referrals/redeem-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, courseId })
          });
          const data = await r.json();
          if (r.ok) {
            onToast(`Success: "${title}" exam unlocked using a Free Course Credit!`, 'success');
            onRefreshUser(data.user);
            fetchDashboardStats();
          } else {
            onToast(data.message || 'Failed to redeem credit.', 'ref');
          }
        } catch {
          onToast('Connection failed.', 'ref');
        }
        return;
      }
    }

    // 2. Check if user has wallet balance
    if (currentUser.walletBalance && currentUser.walletBalance >= price) {
      const useWallet = window.confirm(`You have ₹${currentUser.walletBalance} in your SkillGenz wallet!\n\nWould you like to pay ₹${price} using your wallet balance?`);
      if (useWallet) {
        try {
          const r = await fetch('/api/referrals/pay-with-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              amount: price,
              details: `${title} Certificate Exam Access`,
              courseId
            })
          });
          const data = await r.json();
          if (r.ok) {
            onToast(`Success: ₹${price} deducted from wallet. "${title}" exam unlocked!`, 'success');
            onRefreshUser(data.user);
            fetchDashboardStats();
          } else {
            onToast(data.message || 'Failed to process wallet payment.', 'ref');
          }
        } catch {
          onToast('Connection failed.', 'ref');
        }
        return;
      }
    }

    // 3. Fallback to normal checkout
    const proceed = window.confirm(`Confirm payment of INR ${price} to unlock "${title}" exam access?`);
    if (!proceed) return;

    try {
      const r = await fetch('/api/payments/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, type: 'exam', details: `${title} Certificate Access`, amount: price })
      });
      if (r.ok) {
        onToast(`Payment of INR ${price} successful. "${title}" exam unlocked.`, 'success');
        fetchDashboardStats();
      }
    } catch {}
  };

  const handleEnrollConfirm = () => {
    if (!enrollConfirmationCourse) return;
    const cid = enrollConfirmationCourse.id;
    if (!enrolledCourses.includes(cid)) {
      const updated = [...enrolledCourses, cid];
      setEnrolledCourses(updated);
      localStorage.setItem(`enrolled_courses_${currentUser.id}`, JSON.stringify(updated));
    }
    setEnrollConfirmationCourse(null);
    onToast(`Successfully enrolled in ${enrollConfirmationCourse.title}!`, 'success');
  };

  const isEnrolled = (courseId: string) => enrolledCourses.includes(courseId);

  const hasPaidForCertificate = (courseId: string) => {
    if (currentUser.plan === 'pro' || currentUser.plan === 'popular') return true;
    const details = `${courses.find(c => c.id === courseId)?.title} Certificate Access`;
    return stats.payments.some(p => p.details === details && p.status === 'success');
  };

  const getProgress = (courseId: string) => {
    const done = (completedLectures[courseId] || []).length;
    const total = courses.find(c => c.id === courseId)?.lectures.length || 1;
    return Math.round((done / total) * 100);
  };

  // ── Shared style tokens ──
  const dm = darkMode;
  const cardCls = dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200';
  const textPrimary = dm ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = dm ? 'text-gray-400' : 'text-gray-500';
  const textMuted = dm ? 'text-gray-500' : 'text-gray-400';
  const inputCls = dm ? 'bg-[#0d1117] border-[#30363d] text-gray-100 placeholder-gray-600 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500';
  const hoverRow = dm ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50';

  const tabAnim = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  const navItems: { id: typeof activeTab; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: 'Overview' },
    { id: 'roadmap', icon: <Map className="w-[18px] h-[18px]" />, label: 'Roadmap' },
    { id: 'resources', icon: <BookOpen className="w-[18px] h-[18px]" />, label: 'Courses' },
    { id: 'exams', icon: <FileSpreadsheet className="w-[18px] h-[18px]" />, label: 'Exams' },
    { id: 'certificates', icon: <Award className="w-[18px] h-[18px]" />, label: 'Certificates' },
    { id: 'payments', icon: <CreditCard className="w-[18px] h-[18px]" />, label: 'Billing' },
    { id: 'referrals', icon: <Gift className="w-[18px] h-[18px]" />, label: 'Refer & Earn' },
    { id: 'profile', icon: <Settings className="w-[18px] h-[18px]" />, label: 'Profile' },
    { id: 'support', icon: <Headset className="w-[18px] h-[18px]" />, label: 'Support' },
  ];

  const totalLectures = courses.reduce((s, c) => s + c.lectures.length, 0);
  const totalCompleted = (Object.values(completedLectures) as string[][]).reduce((s, arr) => s + arr.length, 0);
  const overallProgress = totalLectures > 0 ? Math.round((totalCompleted / totalLectures) * 100) : 0;

  return (
    <div className={`h-screen overflow-hidden flex ${dm ? 'bg-[#0d1117] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

      {/* Complete Profile Forced Modal */}
      <CompleteProfileModal
        isOpen={profileIncomplete}
        user={currentUser}
        onComplete={(updatedUser) => {
          setProfileIncomplete(false);
          onRefreshUser(updatedUser);
          onToast('Profile completed successfully!', 'success');
        }}
      />

      {/* ═══════════════════ SIDEBAR ═══════════════════ */}
      {/* Mobile Overlay Background */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={`fixed md:relative top-0 left-0 z-50 w-64 md:w-60 h-screen shrink-0 flex flex-col border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'}`}>
        {/* Brand */}
        <div className={`h-14 flex items-center justify-between px-5 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold text-[15px] tracking-tight ${textPrimary}`}>SkillGenz</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-widest ${textMuted}`}>Menu</p>
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? (dm ? 'bg-blue-600/15 text-blue-400' : 'bg-blue-50 text-blue-700')
                    : (dm ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                }`}
              >
                <span className={active ? (dm ? 'text-blue-400' : 'text-blue-600') : ''}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Plan info (Premium & Animated) */}
        <div className={`mx-3 mb-4 p-4 rounded-2xl border relative overflow-hidden transition-all duration-300 group ${dm ? 'border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#0d1117] hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-blue-200 hover:shadow-lg'}`}>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-extrabold shadow-md ring-2 ring-transparent group-hover:ring-purple-400/50 transition-all">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold truncate tracking-tight transition-colors ${dm ? 'text-white group-hover:text-purple-100' : 'text-gray-900 group-hover:text-blue-900'}`}>{currentUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${dm ? 'text-emerald-400' : 'text-emerald-600'}`}>{currentUser.plan} Plan</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            {currentUser.plan === 'free' && (
              <button 
                onClick={onUpgradePlan} 
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md hover:shadow-blue-500/25 active:scale-95 group/btn"
              >
                <Sparkles className="w-3.5 h-3.5 group-hover/btn:animate-spin" />
                Upgrade to Pro
              </button>
            )}
            {onLogout && (
              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 group/logout ${dm ? 'border-[#30363d] text-red-400 hover:bg-red-500/10 hover:border-red-500/30' : 'border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200'}`}
              >
                <LogOut className="w-3.5 h-3.5 group-hover/logout:-translate-x-1 transition-transform" /> 
                Secure Log Out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ═══════════════════ MAIN ═══════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top Bar (Advanced Header) */}
        <header className={`shrink-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b relative backdrop-blur-sm sticky top-0 ${dm ? 'bg-[#161b22]/90 border-[#30363d]' : 'bg-white/90 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-1.5 rounded-md transition-colors ${dm ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className={`text-base font-bold tracking-tight ${textPrimary}`}>
              {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 relative z-50">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setHeaderMenuOpen(prev => prev === 'notifications' ? 'none' : 'notifications')}
                className={`relative p-2.5 rounded-full transition-all focus:outline-none ${dm ? 'text-slate-400 hover:text-white hover:bg-[#30363d]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} ${headerMenuOpen === 'notifications' ? (dm ? 'bg-[#30363d] text-white' : 'bg-slate-100 text-slate-900') : ''}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && <span className={`absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 ${dm ? 'border-[#161b22]' : 'border-white'}`}></span>}
              </button>

              {/* Notifications Floating Panel */}
              <div className={`absolute top-full right-0 mt-3 w-80 rounded-[1.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.12)] border p-5 transition-all duration-300 origin-top-right z-50 ${dm ? 'bg-[#161b22] border-[#30363d] shadow-black/50' : 'bg-white border-slate-200/80'} ${headerMenuOpen === 'notifications' ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-extrabold text-sm tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>Notifications</h4>
                  {notifications.length > 0 && <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">{notifications.length} New</span>}
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <p className={`text-xs text-center p-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>No new notifications</p>
                  ) : (
                    notifications.map((notif: any) => (
                      <div key={notif.id} className={`p-3.5 rounded-2xl border transition-all hover:-translate-y-0.5 cursor-pointer ${dm ? 'bg-[#0d1117]/80 border-[#30363d] hover:border-blue-500/30' : 'bg-slate-50/50 border-slate-100 hover:border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-2 h-2 rounded-full ${notif.title.includes('Query') ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          <p className={`text-xs font-bold ${dm ? 'text-slate-200' : 'text-slate-800'}`}>{notif.title}</p>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{notif.message}</p>
                        <p className="text-[9px] text-slate-400 mt-2 text-right">{new Date(notif.timestamp).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Profile Element */}
            <div className="relative">
              <div
                onClick={() => setHeaderMenuOpen(prev => prev === 'profile' ? 'none' : 'profile')}
                className={`flex items-center gap-3 pl-4 sm:pl-6 border-l cursor-pointer group transition-all ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}
              >
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-bold leading-none transition-colors ${dm ? 'text-white' : 'text-slate-900'} group-hover:text-blue-500 dark:group-hover:text-blue-400`}>{currentUser.name}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mt-1 capitalize">{currentUser.plan} Plan</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-transparent group-hover:ring-blue-400/50 transition-all">
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${headerMenuOpen === 'profile' ? 'rotate-180 text-blue-500' : (dm ? 'text-slate-500 group-hover:translate-y-0.5' : 'text-slate-400 group-hover:translate-y-0.5')}`} />
              </div>

              {/* Profile Floating Panel */}
              <div className={`absolute top-full right-0 mt-3 w-64 rounded-[1.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.12)] border p-2 transition-all duration-300 origin-top-right z-50 ${dm ? 'bg-[#161b22] border-[#30363d] shadow-black/50' : 'bg-white border-slate-200/80'} ${headerMenuOpen === 'profile' ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className={`px-4 py-3 border-b mb-2 ${dm ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className={`text-sm font-extrabold ${dm ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{currentUser.email}</p>
                </div>
                <div className="space-y-1">
                  <button onClick={() => { setHeaderMenuOpen('none'); setActiveTab('profile'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${dm ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <UserCog className="w-4 h-4 text-blue-500" /> Account Settings
                  </button>
                  <button onClick={() => { setHeaderMenuOpen('none'); setActiveTab('payments'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${dm ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <CreditCard className="w-4 h-4 text-purple-500" /> Subscription & Billing
                  </button>
                  <button onClick={() => { setHeaderMenuOpen('none'); setActiveTab('certificates'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${dm ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <Award className="w-4 h-4 text-emerald-500" /> My Certificates
                  </button>
                </div>
                {onLogout && (
                  <div className={`mt-2 pt-2 border-t ${dm ? 'border-white/5' : 'border-slate-100'}`}>
                    <button onClick={() => { setHeaderMenuOpen('none'); setShowLogoutConfirm(true); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${dm ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Click-outside overlay */}
          {headerMenuOpen !== 'none' && (
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setHeaderMenuOpen('none')} />
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <AnimatePresence>

              {/* ═══ ROADMAP ═══ */}
              {activeTab === 'roadmap' && (
                <motion.div key="roadmap">
                  {roadmapSelectedCourseId ? (
                    <CourseRoadmap 
                      course={courses.find(c => c.id === roadmapSelectedCourseId)!}
                      completedLectures={completedLectures[roadmapSelectedCourseId] || []}
                      onPlayLecture={(lec) => {
                         const course = courses.find(c => c.id === roadmapSelectedCourseId)!;
                         setWatchingLecture({
                           courseId: course.id,
                           courseTitle: course.title,
                           title: lec.title,
                           videoId: lec.videoId
                         });
                      }}
                      darkMode={darkMode}
                      onBack={() => setRoadmapSelectedCourseId(null)}
                    />
                  ) : (
                    <div className="mb-8">
                      <div className="mb-6">
                        <h2 className={`text-2xl font-bold ${textPrimary}`}>Select a Roadmap</h2>
                        <p className={`text-sm mt-1 ${textSecondary}`}>Choose a course to view its interactive 3D learning path.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.filter(c => isEnrolled(c.id)).map(course => {
                          const prog = getProgress(course.id);
                          return (
                            <div 
                              key={course.id}
                              onClick={() => setRoadmapSelectedCourseId(course.id)}
                              className={`group cursor-pointer rounded-2xl border-2 transition-all hover:-translate-y-2 hover:shadow-xl ${dm ? 'border-slate-800 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-800' : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50'} overflow-hidden flex flex-col`}
                            >
                              <div className="h-32 relative overflow-hidden">
                                <img src={course.thumbnailUrl || course.bannerUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                                  <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                                    <Map className="w-4 h-4" />
                                  </div>
                                  <span className="text-white font-bold text-sm tracking-wide">ROADMAP</span>
                                </div>
                              </div>
                              <div className="p-5 flex-1 flex flex-col">
                                <h3 className={`font-bold text-lg mb-2 ${textPrimary} line-clamp-2 leading-snug`}>{course.title}</h3>
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                  <div className="flex-1 mr-4">
                                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${prog}%` }} />
                                    </div>
                                    <span className={`text-xs mt-1.5 block font-medium ${textSecondary}`}>{prog}% Completed</span>
                                  </div>
                                  <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${dm ? 'bg-slate-800 text-slate-300 group-hover:bg-blue-500 group-hover:text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {courses.filter(c => isEnrolled(c.id)).length === 0 && (
                          <div className={`col-span-full py-12 text-center rounded-2xl border-2 border-dashed ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
                            <Lock className={`w-12 h-12 mx-auto mb-4 ${textSecondary} opacity-50`} />
                            <h3 className={`text-lg font-bold ${textPrimary}`}>No Unlocked Courses</h3>
                            <p className={`text-sm mt-2 ${textSecondary}`}>Enroll in a course to access its roadmap.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ OVERVIEW ═══ */}
              {activeTab === 'home' && (
                <motion.div key="home">
                  {/* Greeting */}
                  <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>Welcome back, {currentUser.name}</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>Here is your learning overview and recent activity.</p>
                  </div>

                  {/* Stat cards row */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {[
                      { label: 'Global Rank', value: `#${getUserRankAndStats(currentUser.id).rank}`, sub: `Top performer`, icon: <Trophy className="w-5 h-5" />, accent: 'text-amber-500', bg: dm ? 'bg-amber-500/10' : 'bg-amber-50' },
                      { label: 'Overall Progress', value: `${overallProgress}%`, sub: `${totalCompleted} of ${totalLectures} lectures`, icon: <BarChart3 className="w-5 h-5" />, accent: 'text-blue-500', bg: dm ? 'bg-blue-500/10' : 'bg-blue-50' },
                      { label: 'Certificates', value: String(stats.certsCount), sub: 'Earned so far', icon: <Award className="w-5 h-5" />, accent: 'text-emerald-500', bg: dm ? 'bg-emerald-500/10' : 'bg-emerald-50' },
                      { label: 'Exams Taken', value: String(stats.examsGiven), sub: 'Across all courses', icon: <FileSpreadsheet className="w-5 h-5" />, accent: 'text-violet-500', bg: dm ? 'bg-violet-500/10' : 'bg-violet-50' },
                      { label: 'Current Streak', value: `${stats.currentStreak} days`, sub: 'Keep it going', icon: <Flame className="w-5 h-5" />, accent: 'text-orange-500', bg: dm ? 'bg-orange-500/10' : 'bg-orange-50' },
                    ].map((s, i) => (
                      <div key={i} className={`${cardCls} border rounded-xl p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500`} style={{ animationFillMode: 'both', animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium ${textSecondary}`}>{s.label}</span>
                          <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ${s.accent}`}>{s.icon}</div>
                        </div>
                        <p className={`text-2xl font-bold ${textPrimary}`}>{s.value}</p>
                        <p className={`text-[11px] mt-0.5 ${textMuted}`}>{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Upgrade banner */}
                  {currentUser.plan === 'free' && (
                    <div className={`rounded-xl p-4 mb-6 flex items-center justify-between gap-4 border transition-all duration-500 hover:shadow-md hover:-translate-y-1 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both ${dm ? 'bg-blue-500/8 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`} style={{ animationDelay: '200ms' }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dm ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <Crown className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${textPrimary}`}>Upgrade your plan</p>
                          <p className={`text-xs ${textSecondary}`}>Get unlimited exam attempts and access all courses for INR 499/month.</p>
                        </div>
                      </div>
                      <button onClick={onUpgradePlan} className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                        View Plans
                      </button>
                    </div>
                  )}

                  {/* Learning Activity Graph */}
                  <div className={`p-6 rounded-3xl border mb-6 space-y-4 animate-in slide-in-from-bottom-6 fade-in duration-700 fill-mode-both ${dm ? 'bg-gradient-to-b from-[#161b22] to-[#0d1117] border-[#30363d] shadow-lg shadow-black/20' : 'bg-gradient-to-b from-white to-blue-50/10 border-blue-100 shadow-xl shadow-blue-500/5'}`} style={{ animationDelay: '250ms' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className={`font-bold text-base flex items-center gap-2 ${textPrimary}`}>
                          <TrendingUp className="w-4 h-4 text-blue-500" /> Learning Activity
                        </h3>
                        <p className={`text-xs mt-0.5 ${textMuted}`}>Hours spent learning over the last 7 days</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow-sm">
                        +2.4 hrs this week
                      </span>
                    </div>

                    <div className="relative h-40 w-full pt-6">
                      <svg viewBox="0 0 500 130" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="studentGraphGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Grid Lines */}
                        <line x1="0" y1="100" x2="480" y2="100" stroke={dm ? '#334155' : '#e2e8f0'} strokeWidth="1" strokeDasharray="4 4" className="opacity-60" />
                        <line x1="0" y1="60" x2="480" y2="60" stroke={dm ? '#334155' : '#e2e8f0'} strokeWidth="1" strokeDasharray="4 4" className="opacity-60" />
                        <line x1="0" y1="20" x2="480" y2="20" stroke={dm ? '#334155' : '#e2e8f0'} strokeWidth="1" strokeDasharray="4 4" className="opacity-60" />

                        {/* Exact Spline Area */}
                        <path d="M 10 100 L 10 80 C 40 80, 50 70, 80 70 C 110 70, 130 30, 160 30 C 190 30, 210 50, 240 50 C 270 50, 290 20, 320 20 C 350 20, 370 40, 400 40 C 430 40, 450 10, 480 10 L 480 100 Z" fill="url(#studentGraphGrad)" className="animate-[fade-in_1.5s_ease-out_forwards]" />

                        {/* Glowing Line */}
                        <path d="M 10 80 C 40 80, 50 70, 80 70 C 110 70, 130 30, 160 30 C 190 30, 210 50, 240 50 C 270 50, 290 20, 320 20 C 350 20, 370 40, 400 40 C 430 40, 450 10, 480 10" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" className="animate-[dash_2s_ease-out_forwards]" strokeDasharray="1000" strokeDashoffset="1000" />
                        <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>

                        {/* Axis indicators */}
                        {[
                          {x: 10, label: 'Mon'}, {x: 80, label: 'Tue'}, {x: 160, label: 'Wed'}, 
                          {x: 240, label: 'Thu'}, {x: 320, label: 'Fri'}, {x: 400, label: 'Sat'}, {x: 480, label: 'Sun'}
                        ].map((d, i) => (
                          <text key={i} x={d.x} y="125" fill={i === 6 ? '#3b82f6' : (dm ? '#94a3b8' : '#64748b')} textAnchor="middle" className={`text-[10px] ${i === 6 ? 'font-bold' : 'font-medium'}`}>{d.label}</text>
                        ))}

                        {/* Interactive Data Points */}
                        {[ 
                          {x: 10, y: 80, val: '1.2h'},
                          {x: 80, y: 70, val: '1.5h'},
                          {x: 160, y: 30, val: '3.5h'},
                          {x: 240, y: 50, val: '2.0h'},
                          {x: 320, y: 20, val: '4.2h'},
                          {x: 400, y: 40, val: '2.8h'},
                          {x: 480, y: 10, val: '5.0h', ping: true}
                        ].map((p, i) => (
                          <g key={i} className="group cursor-pointer">
                            {/* Invisible larger circle for easier hover */}
                            <circle cx={p.x} cy={p.y} r="15" fill="transparent" />
                            {p.ping && <circle cx={p.x} cy={p.y} r="5" fill="#60a5fa" className="animate-ping opacity-75" />}
                            <circle cx={p.x} cy={p.y} r="4.5" fill={dm ? '#0d1117' : '#ffffff'} stroke="#3b82f6" strokeWidth="2" className="transition-all duration-300 group-hover:r-6 group-hover:fill-blue-500" />
                            
                            {/* Hover Tooltip Box */}
                            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <rect x={p.x - 22} y={p.y - 35} width="44" height="22" rx="4" fill={dm ? '#ffffff' : '#1e293b'} className="shadow-lg" />
                              <polygon points={`${p.x-5},${p.y-13} ${p.x+5},${p.y-13} ${p.x},${p.y-8}`} fill={dm ? '#ffffff' : '#1e293b'} />
                              <text x={p.x} y={p.y - 20} fill={dm ? '#1e293b' : '#ffffff'} fontSize="10" fontWeight="bold" textAnchor="middle">{p.val}</text>
                            </g>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* My Purchased Courses — takes 3 cols */}
                    <div className={`lg:col-span-3 ${cardCls} border rounded-xl animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both`} style={{ animationDelay: '300ms' }}>
                      <div className={`flex items-center justify-between px-5 py-3 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                        <h3 className={`text-sm font-semibold ${textPrimary}`}>My Purchased Courses</h3>
                        <button onClick={() => setActiveTab('resources')} className="text-xs text-blue-500 font-medium hover:underline">View all</button>
                      </div>
                      <div className="divide-y divide-inherit">
                        {(() => {
                          const purchased = courses.filter(c => isEnrolled(c.id));
                          if (purchased.length === 0) {
                            return (
                              <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                                  <BookOpen className="w-5 h-5 text-blue-500" />
                                </div>
                                <h4 className={`text-sm font-semibold mb-1 ${textPrimary}`}>No Courses Purchased Yet</h4>
                                <p className={`text-xs ${textSecondary} mb-4`}>Explore our catalog and unlock premium courses to start learning.</p>
                                <button onClick={() => setActiveTab('resources')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30">
                                  Explore Courses
                                </button>
                              </div>
                            );
                          }
                          return purchased.map((c) => {
                            const prog = getProgress(c.id);
                            const done = (completedLectures[c.id] || []).length;
                            return (
                              <div key={c.id} className={`flex items-center gap-4 px-5 py-3.5 ${hoverRow} transition-all duration-300 hover:pl-7 cursor-pointer border-l-2 border-transparent hover:border-blue-500`} onClick={() => setActiveTab('resources')}>
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                                  <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${textPrimary}`}>{c.title}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <div className={`flex-1 h-1.5 rounded-full max-w-[180px] ${dm ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                      <div className={`h-full rounded-full ${prog === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${prog}%` }} />
                                    </div>
                                    <span className={`text-[11px] font-medium ${textMuted}`}>{done}/{c.lectures.length} lectures</span>
                                  </div>
                                </div>
                                <span className={`text-xs font-semibold ${prog === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>{prog}%</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Right sidebar — 2 cols */}
                    <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both" style={{ animationDelay: '400ms' }}>
                      {/* Recent activity */}
                      <div className={`${cardCls} border rounded-xl`}>
                        <div className={`px-5 py-3 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold ${textPrimary}`}>Recent Transactions</h3>
                        </div>
                        <div className="p-4">
                          {stats.payments.length === 0 ? (
                            <p className={`text-xs text-center py-6 ${textMuted}`}>No transactions recorded yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {stats.payments.slice(-4).reverse().map(p => (
                                <div key={p.id} className="flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-xs font-medium truncate ${textPrimary}`}>{p.details}</p>
                                    <p className={`text-[10px] ${textMuted}`}>{new Date(p.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right ml-3">
                                    <p className="text-xs font-semibold text-blue-500">INR {p.amount}</p>
                                    <span className={`text-[9px] font-medium ${p.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{p.status === 'success' ? 'Paid' : 'Failed'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick exam status */}
                      <div className={`${cardCls} border rounded-xl`}>
                        <div className={`px-5 py-3 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                          <h3 className={`text-sm font-semibold ${textPrimary}`}>Exam Status</h3>
                        </div>
                        <div className="p-4 space-y-2.5">
                          {courses.map(c => {
                            const attempt = stats.attempts.find(a => a.courseId === c.id);
                            const unlocked = isEnrolled(c.id);
                            return (
                              <div key={c.id} className="flex items-center justify-between">
                                <p className={`text-xs font-medium truncate flex-1 min-w-0 ${textPrimary}`}>{c.title}</p>
                                {attempt ? (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${attempt.status === 'passed' ? (dm ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (dm ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600')}`}>
                                    {attempt.status === 'passed' ? 'Passed' : 'Failed'}
                                  </span>
                                ) : unlocked ? (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dm ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>Ready</span>
                                ) : (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dm ? 'bg-gray-500/15 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>Locked</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ MY COURSES ═══ */}
              {activeTab === 'resources' && (
                <motion.div key="resources">
                  <div className="mb-5">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>Courses</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>Access lectures, study materials, and practice exams.</p>
                  </div>

                  {/* Filter items buttons */}
                  <div className="flex gap-2 text-xs font-semibold overflow-x-auto whitespace-nowrap pb-4 no-scrollbar mb-2">
                    {['All', 'Tech', 'Business', 'Content Creator', 'Crash Course'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterStr(cat.toLowerCase())}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          filterStr === cat.toLowerCase()
                            ? 'bg-blue-600 text-white shadow-md'
                            : dm
                            ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                            : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat === 'All' ? 'All domains' : `${cat} Modules`}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                    {(filterStr === 'all' ? courses : courses.filter(c => c.category.toLowerCase() === filterStr.toLowerCase())).map((c, i) => {
                      const unlocked = isEnrolled(c.id);
                      const completed = completedLectures[c.id] || [];
                      const prog = getProgress(c.id);
                      return (
                        <motion.div 
                          key={c.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`group relative p-6 sm:p-8 rounded-[2rem] border overflow-hidden flex flex-col justify-between space-y-6 transition-all duration-300 ${
                            dm ? 'bg-slate-900/80 border-slate-800 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-white border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]'
                          }`}
                        >
                          {/* Glowing animated background that appears on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-violet-500/0 group-hover:from-blue-500/5 group-hover:to-violet-500/10 transition-colors duration-500 pointer-events-none" />
                          
                          {/* Floating decorative shape */}
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 group-hover:scale-150 transition-all duration-700 pointer-events-none" />

                          <div className="relative z-10 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border transition-colors ${dm ? 'text-blue-400 bg-blue-900/30 border-blue-800/50' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                    {c.category} Domain
                                  </span>
                                  <span className={`inline-block text-[10px] font-mono font-black px-2.5 py-1 rounded-md shadow-sm border transition-colors ${dm ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>
                                    ₹{c.category.toLowerCase().includes('tech') ? 199 : c.category.toLowerCase().includes('crash') ? 99 : 149}
                                  </span>
                                </div>
                                <h3 className={`font-extrabold text-lg sm:text-xl tracking-tight transition-colors ${dm ? 'text-slate-100 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>
                                  {c.title}
                                </h3>
                                <p className={`text-xs leading-relaxed line-clamp-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {c.lectures.length} lectures &middot; {c.durationMins} min exam
                                </p>
                              </div>
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] shrink-0 bg-white dark:bg-[#0d1117] ${prog === 100 ? 'border-emerald-500' : 'border-blue-500'}`}>
                                <span className={`text-[11px] font-bold ${prog === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>{prog}%</span>
                              </div>
                            </div>

                            {/* Course Description */}
                            <div className="flex-1 mb-6 mt-4">
                              <p className={`text-sm leading-relaxed line-clamp-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                                {c.description || "Comprehensive modules designed by industry experts to give you hands-on experience."}
                              </p>
                            </div>

                            {/* Actions Area */}
                            <div className={`pt-5 mt-auto border-t flex flex-wrap gap-3 items-center justify-between ${dm ? 'border-slate-800/80' : 'border-slate-100'}`}>
                              <p className={`text-[11px] font-bold tracking-widest uppercase ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                                {c.lectures.length} Lectures &middot; {c.durationMins}m Exam
                              </p>
                              
                                <button 
                                  onClick={() => setSelectedCourse(c)}
                                  className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-[10px] hover:shadow-lg transition-all flex items-center gap-2 relative overflow-hidden group/btn shadow-md uppercase tracking-wider"
                                >
                                  <span className="relative z-10 flex items-center gap-1.5 transition-colors group-hover/btn:text-white">
                                    More Details Click Here <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                  </span>
                                  <span className="absolute inset-0 bg-blue-600 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                                </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ═══ EXAMS ═══ */}
              {activeTab === 'exams' && (
                <motion.div key="exams">
                  <div className="mb-5">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>Exams &amp; Certifications</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>Track your exam attempts and unlock new certifications.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(c => {
                      const attempt = stats.attempts.find(a => a.courseId === c.id);
                      const unlocked = isEnrolled(c.id);
                      const prog = getProgress(c.id);
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`relative rounded-2xl overflow-hidden border p-5 sm:p-6 transition-all duration-300 flex flex-col hover:-translate-y-1 ${
                            dm
                              ? 'bg-[#161b22]/80 backdrop-blur-md border-[#30363d] hover:border-blue-500/50 hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)]'
                              : 'bg-white/80 backdrop-blur-md border-slate-200 hover:border-blue-400 hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)]'
                          }`}
                        >
                          {/* Top row: Category Badge & Status */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                                dm ? 'text-blue-400 bg-blue-900/30 border-blue-800/50' : 'text-blue-600 bg-blue-50 border-blue-100'
                              }`}>
                                {c.category}
                              </span>
                              <span className={`inline-block text-[10px] font-mono font-black px-2.5 py-1 rounded-md shadow-sm border transition-colors ${dm ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>
                                ₹{c.category.toLowerCase().includes('tech') ? 199 : c.category.toLowerCase().includes('crash') ? 99 : 149}
                              </span>
                            </div>
                            
                            {attempt ? (
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                                attempt.status === 'passed'
                                  ? (dm ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                                  : (dm ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600')
                              }`}>
                                {attempt.status === 'passed' ? 'Passed' : 'Failed'} &middot; {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                              </span>
                            ) : unlocked ? (
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                dm ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'
                              }`}>
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </span>
                            ) : (
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                              }`}>
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>

                          {/* Title & Description */}
                          <div className="mb-6 flex-1">
                            <h3 className={`text-lg font-bold mb-1 line-clamp-2 ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                              {c.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`text-[11px] font-medium flex items-center gap-1 ${textMuted}`}>
                                <FileSpreadsheet className="w-3.5 h-3.5" /> {c.questionsCount} Qs
                              </span>
                              <span className={`text-[11px] font-medium flex items-center gap-1 ${textMuted}`}>
                                <Clock className="w-3.5 h-3.5" /> {c.durationMins}m
                              </span>
                              <span className={`text-[11px] font-medium flex items-center gap-1 ${textMuted}`}>
                                <Target className="w-3.5 h-3.5" /> {c.passPercentage}% Pass
                              </span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondary}`}>Course Progress</span>
                              <span className={`text-[10px] font-bold ${prog === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>{prog}%</span>
                            </div>
                            <div className={`h-1.5 rounded-full overflow-hidden ${dm ? 'bg-[#30363d]' : 'bg-slate-100'}`}>
                              <div className={`h-full rounded-full transition-all duration-500 ${prog === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${prog}%` }} />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className={`pt-4 border-t ${dm ? 'border-[#30363d]' : 'border-slate-100'}`}>
                            {unlocked ? (
                              attempt?.status === 'passed' ? (
                                <button
                                  onClick={() => setActiveTab('certificates')}
                                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                                >
                                  <Award className="w-4 h-4"/> View Certificate
                                </button>
                              ) : (
                                <button
                                  onClick={() => onStartExam(c.id, c.title)}
                                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
                                >
                                  {attempt?.status === 'failed' ? <><Play className="w-4 h-4"/> Retake Exam</> : <><Play className="w-4 h-4"/> Start Exam</>}
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedCourse(c);
                                  setActiveTab('resources');
                                }}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                                  dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                                }`}
                              >
                                <Lock className="w-3.5 h-3.5" /> View Course to Enroll
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ═══ CERTIFICATES ═══ */}
              {activeTab === 'certificates' && (
                <motion.div key="certs">
                  <div className="mb-5">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>Certificates</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>Your earned credentials, verified and ready to share.</p>
                  </div>

                  {stats.certificates.length === 0 ? (
                    <div className={`${cardCls} border rounded-xl p-12 text-center`}>
                      <Award className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                      <h3 className={`text-base font-semibold mb-1 ${textPrimary}`}>No certificates yet</h3>
                      <p className={`text-sm mb-4 ${textSecondary}`}>Complete all lectures in a course and pass the exam to earn your first certificate.</p>
                      <button onClick={() => setActiveTab('resources')} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                        Go to Courses
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {stats.certificates.map(cert => (
                        <div key={cert.id} className={`${cardCls} border rounded-xl overflow-hidden`}>
                          <div className={`flex items-center justify-between px-5 py-3 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-emerald-500" />
                              <div>
                                <p className={`text-sm font-semibold ${textPrimary}`}>{cert.courseName}</p>
                                <p className={`text-[11px] ${textMuted}`}>Grade: {cert.grade || 'Distinction'} &middot; Score: {cert.score}%</p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dm ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>Verified</span>
                          </div>
                        <div className="p-5">
                          <PremiumCertificate
                            certificate={cert}
                            darkMode={false}
                            currentUser={currentUser}
                            onRefreshUser={onRefreshUser}
                            onToast={onToast}
                            onRefreshDashboard={fetchDashboardStats}
                          />
                        </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ BILLING ═══ */}
              {activeTab === 'payments' && (
                <motion.div key="billing" className="w-full animate-in fade-in duration-500">
                  <div className="mb-8">
                    <h1 className={`text-2xl font-bold tracking-tight ${textPrimary}`}>Billing &amp; Payments</h1>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Manage your subscriptions, payment methods, and billing history.</p>
                  </div>

                  {/* Top Stats & Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    
                    {/* Active Plan Card */}
                    <div className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500 ${
                      dm ? 'bg-gradient-to-br from-[#0d1117] to-[#161b22] border-[#30363d]' : 'bg-gradient-to-br from-white to-blue-50/50 border-slate-200'
                    }`} style={{ animationFillMode: 'both', animationDelay: '0ms' }}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dm ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                            <Crown className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full ${dm ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>Active</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${textSecondary}`}>Current Plan</p>
                        <h3 className={`text-2xl font-black capitalize mb-4 ${textPrimary}`}>{currentUser.plan} Tier</h3>
                        <button onClick={onUpgradePlan} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20">
                          Manage Subscription
                        </button>
                      </div>
                    </div>

                    {/* Payment Method Card */}
                    <div className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500 ${
                      dm ? 'bg-gradient-to-br from-[#0d1117] to-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'
                    }`} style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dm ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${textSecondary}`}>Primary Method</p>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-12 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
                            <span className="text-white font-bold text-[10px] italic">VISA</span>
                          </div>
                          <div>
                            <p className={`text-sm font-bold font-mono ${textPrimary}`}>•••• •••• •••• 4242</p>
                            <p className={`text-[10px] ${textSecondary}`}>Expires 12/28</p>
                          </div>
                        </div>
                        <button className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          dm ? 'border-[#30363d] text-slate-300 hover:bg-[#161b22]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}>
                          Update Payment Method
                        </button>
                      </div>
                    </div>

                    {/* Total Spent / Billing Cycle */}
                    <div className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500 ${
                      dm ? 'bg-gradient-to-br from-[#0d1117] to-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'
                    }`} style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                      <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dm ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${textSecondary}`}>Total Spent</p>
                        <h3 className={`text-3xl font-black mb-1 ${textPrimary}`}>
                          ₹{stats.payments.filter(p => p.status === 'success').reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
                        </h3>
                        <p className={`text-[10px] ${textSecondary} mt-auto`}>Across {stats.payments.filter(p => p.status === 'success').length} successful transactions</p>
                      </div>
                    </div>

                  </div>

                  {/* Transaction History Table */}
                  <div className={`rounded-[2rem] border overflow-hidden ${dm ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200'} shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500`} style={{ animationFillMode: 'both', animationDelay: '300ms' }}>
                    <div className={`px-6 py-5 border-b flex items-center justify-between ${dm ? 'border-[#30363d]' : 'border-slate-100'}`}>
                      <h3 className={`text-base font-bold ${textPrimary}`}>Transaction History</h3>
                      <button className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                        dm ? 'border-[#30363d] text-slate-300 hover:bg-[#161b22]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}>
                        <Download className="w-3.5 h-3.5" /> Download Invoice
                      </button>
                    </div>

                    {stats.payments.length === 0 ? (
                      <div className="p-16 text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${dm ? 'bg-[#161b22]' : 'bg-slate-50'}`}>
                          <CreditCard className={`w-6 h-6 ${textMuted}`} />
                        </div>
                        <p className={`text-base font-semibold mb-1 ${textPrimary}`}>No transactions yet</p>
                        <p className={`text-sm ${textSecondary}`}>Your billing history will appear here once you make a purchase.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className={`text-[10px] font-bold uppercase tracking-widest ${dm ? 'text-slate-500 bg-[#161b22]/50' : 'text-slate-400 bg-slate-50'}`}>
                              <th className="px-6 py-4 border-b border-transparent">Description</th>
                              <th className="px-6 py-4 border-b border-transparent">Reference ID</th>
                              <th className="px-6 py-4 border-b border-transparent">Date</th>
                              <th className="px-6 py-4 border-b border-transparent">Status</th>
                              <th className="px-6 py-4 border-b border-transparent text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${dm ? 'divide-[#30363d]' : 'divide-slate-100'}`}>
                            {stats.payments.map(p => (
                              <tr key={p.id} className={`group transition-colors ${dm ? 'hover:bg-[#161b22]/50' : 'hover:bg-slate-50/50'}`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                      dm ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                      <FileSpreadsheet className="w-4 h-4" />
                                    </div>
                                    <span className={`text-sm font-semibold ${textPrimary}`}>{p.details}</span>
                                  </div>
                                </td>
                                <td className={`px-6 py-4 text-xs font-mono ${textMuted}`}>{p.gatewayRef}</td>
                                <td className={`px-6 py-4 text-xs font-medium ${textSecondary}`}>{new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    p.status === 'success' 
                                      ? (dm ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100') 
                                      : (dm ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-100')
                                  }`}>
                                    {p.status === 'success' ? <><CheckCircle2 className="w-3 h-3" /> Paid</> : <><XCircle className="w-3 h-3" /> Failed</>}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 text-sm font-bold text-right ${textPrimary}`}>
                                  ₹{p.amount.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}


              {/* ═══ REFER & EARN ═══ */}
              {activeTab === 'referrals' && (
                <motion.div key="referrals" className="w-full animate-in fade-in duration-500">
                  <div className="mb-8">
                    <h1 className={`text-3xl font-black tracking-tight ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif' }}>Refer & Earn</h1>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Invite friends to SkillGenz and earn real wallet credits & premium rewards!</p>
                  </div>

                  {/* HERO BANNER CARD */}
                  <div className="relative overflow-hidden rounded-[2rem] border p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white mb-8 border-transparent shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                      <div className="text-white max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md mb-6 border border-white/30 text-xs font-bold uppercase tracking-widest shadow-sm">
                          <Gift className="w-4 h-4 text-yellow-300 animate-pulse" /> Referral Rewards
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          Unlock <span className="text-yellow-300">₹20 Cash</span> &amp; Free Courses!
                        </h2>
                        <p className="text-blue-100 font-medium text-sm sm:text-base mb-8 leading-relaxed">
                          Share your referral code. Every friend who registers earns you ₹20 instantly in your wallet. Reach milestone counts to unlock completely free courses and premium certificates!
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex-1 flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-inner">
                            <span className="font-mono text-lg font-bold tracking-wider text-yellow-300 select-all">{currentUser.referralCode || `SKILL-${currentUser.id.slice(0, 6).toUpperCase()}`}</span>
                          </div>
                          <button 
                            onClick={() => {
                              const refCode = currentUser.referralCode || `SKILL-${currentUser.id.slice(0, 6).toUpperCase()}`;
                              navigator.clipboard.writeText(`${window.location.origin}/?ref=${refCode}`);
                              onToast('Referral link copied to clipboard!', 'success');
                            }}
                            className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <ExternalLink className="w-4 h-4" /> Copy Link
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 flex items-center justify-center">
                        <motion.div 
                          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-full h-full relative"
                        >
                          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-[60px] opacity-40 mix-blend-screen animate-pulse" />
                          <div className="w-full h-full bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-3xl shadow-2xl rotate-12 flex items-center justify-center border-4 border-yellow-200">
                             <Gift className="w-24 h-24 text-white drop-shadow-md" />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* STATS BENTO GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Wallet Balance */}
                    <div className={`p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${cardCls}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Wallet Balance</span>
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                          <CreditCard className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className={`text-4xl font-black mb-1 ${textPrimary}`}>₹{currentUser.walletBalance?.toFixed(2) || '0.00'}</h3>
                      <p className={`text-[11px] leading-relaxed ${textMuted}`}>Real cash to pay for exams/certificates.</p>
                    </div>

                    {/* Friends Referred */}
                    <div className={`p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${cardCls}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Friends Referred</span>
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className={`text-4xl font-black mb-1 ${textPrimary}`}>{currentUser.referredCount || 0}</h3>
                      <p className={`text-[11px] leading-relaxed ${textMuted}`}>Total successful signups via your link.</p>
                    </div>

                    {/* Course Credits */}
                    <div className={`p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${cardCls}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Free Exam Credits</span>
                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className={`text-4xl font-black mb-1 ${textPrimary}`}>{currentUser.freeCourseCredits || 0}</h3>
                      <p className={`text-[11px] leading-relaxed ${textMuted}`}>Unlocks any exam for free (milestone at 5).</p>
                    </div>

                    {/* Cert Credits */}
                    <div className={`p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${cardCls}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Free Cert Credits</span>
                        <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
                          <Award className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className={`text-4xl font-black mb-1 ${textPrimary}`}>{currentUser.freeCertCredits || 0}</h3>
                      <p className={`text-[11px] leading-relaxed ${textMuted}`}>Unlocks certificate paywall (milestone at 10).</p>
                    </div>
                  </div>

                  {/* MILESTONES & ROADMAP */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Milestone Progress */}
                    <div className={`lg:col-span-2 p-6 sm:p-8 rounded-[2rem] border ${cardCls}`}>
                      <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 ${textPrimary}`}>
                        <Target className="w-5 h-5 text-purple-500" /> Milestone Tracker
                      </h3>
                      <div className="space-y-6">
                        {/* Milestone 1 */}
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                            (currentUser.referredCount || 0) >= 1 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                              : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-400'
                          }`}>
                            {(currentUser.referredCount || 0) >= 1 ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">1</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className={`text-sm font-bold ${textPrimary}`}>1 Referral Milestone</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (currentUser.referredCount || 0) >= 1 
                                  ? 'bg-emerald-500/10 text-emerald-500' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {(currentUser.referredCount || 0) >= 1 ? 'Unlocked' : 'Locked'}
                              </span>
                            </div>
                            <p className={`text-xs ${textSecondary}`}>Get ₹20.00 wallet credit added instantly.</p>
                          </div>
                        </div>

                        {/* Milestone 2 */}
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                            (currentUser.referredCount || 0) >= 5 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                              : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-400'
                          }`}>
                            {(currentUser.referredCount || 0) >= 5 ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">5</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className={`text-sm font-bold ${textPrimary}`}>5 Referrals Milestone</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (currentUser.referredCount || 0) >= 5 
                                  ? 'bg-emerald-500/10 text-emerald-500' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {(currentUser.referredCount || 0) >= 5 ? 'Unlocked' : 'Locked'}
                              </span>
                            </div>
                            <p className={`text-xs ${textSecondary}`}>Unlock 1 Free Course Credit for any certification exam.</p>
                          </div>
                        </div>

                        {/* Milestone 3 */}
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                            (currentUser.referredCount || 0) >= 10 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                              : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-400'
                          }`}>
                            {(currentUser.referredCount || 0) >= 10 ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">10</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className={`text-sm font-bold ${textPrimary}`}>10 Referrals Milestone</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (currentUser.referredCount || 0) >= 10 
                                  ? 'bg-emerald-500/10 text-emerald-500' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {(currentUser.referredCount || 0) >= 10 ? 'Unlocked' : 'Locked'}
                              </span>
                            </div>
                            <p className={`text-xs ${textSecondary}`}>Unlock 1 Free Premium Certificate Credit to bypass standard paywall.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* How It Works Card */}
                    <div className={`p-6 sm:p-8 rounded-[2rem] border ${cardCls}`}>
                      <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 ${textPrimary}`}>
                        <Sparkles className="w-5 h-5 text-yellow-500" /> How It Works
                      </h3>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 text-sm font-bold">1</div>
                          <div>
                            <h4 className={`text-sm font-bold mb-1 ${textPrimary}`}>Share Invite</h4>
                            <p className={`text-xs leading-relaxed ${textSecondary}`}>Send your code or registration link to your classmates or colleagues.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 text-sm font-bold">2</div>
                          <div>
                            <h4 className={`text-sm font-bold mb-1 ${textPrimary}`}>They Signup</h4>
                            <p className={`text-xs leading-relaxed ${textSecondary}`}>When they sign up for a new account using your code, the connection is linked.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 text-sm font-bold">3</div>
                          <div>
                            <h4 className={`text-sm font-bold mb-1 ${textPrimary}`}>You Collect Cash</h4>
                            <p className={`text-xs leading-relaxed ${textSecondary}`}>You instantly receive ₹20 wallet balance. Reach 5 and 10 signups to claim huge milestone bonuses!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ═══ SETTINGS / PROFILE ═══ */}
              {activeTab === 'profile' && (
                <motion.div key="profile" className="w-full animate-in fade-in duration-500">
                  <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h1 className={`text-3xl font-black tracking-tight ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif' }}>Account Settings</h1>
                      <p className={`text-sm mt-1 ${textSecondary}`}>Manage your profile, customize your avatar, and track your roadmap.</p>
                    </div>
                  </div>

                  {/* BENTO GRID LAYOUT */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Avatar & Profile ID (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className={`rounded-[2rem] border overflow-hidden shadow-sm relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500 ${dm ? 'bg-gradient-to-b from-[#0d1117] to-[#161b22] border-[#30363d]' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'}`} style={{ animationFillMode: 'both', animationDelay: '0ms' }}>
                        {/* Background Banner */}
                        <div className={`h-24 w-full bg-gradient-to-r ${avatarConfig.bg} opacity-80`} />
                        
                        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
                          {/* Avatar Display */}
                          <div className="relative -mt-12 mb-4 group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                            <div className={`w-28 h-28 rounded-full border-4 shadow-xl flex items-center justify-center text-white ${dm ? 'border-[#0d1117]' : 'border-white'} bg-gradient-to-br ${avatarConfig.bg} transition-transform duration-300 group-hover:scale-105 overflow-hidden`}>
  <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${avatarConfig.seed}&hair=${avatarConfig.hair}&hairColor=${avatarConfig.hairColor}&skinColor=${avatarConfig.skinColor}&mouth=${avatarConfig.mouth}&eyes=${avatarConfig.eyes}&shirt=${avatarConfig.shirt}`} alt="Avatar" className="w-full h-full object-cover scale-110 translate-y-2" />
</div>
                            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white dark:border-[#0d1117] shadow-lg group-hover:bg-blue-500 transition-colors">
                              <Palette className="w-4 h-4" />
                            </div>
                          </div>

                          <h2 className={`text-2xl font-bold tracking-tight mb-1 ${textPrimary}`}>{currentUser.name}</h2>
                          <p className={`text-sm mb-4 ${textSecondary}`}>{currentUser.email}</p>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${dm ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                            {currentUser.role} Account
                          </span>
                        </div>
                      </div>

                      {/* Quick Stats Bento */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500 ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`} style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
                          <Flame className="w-5 h-5 text-orange-500 mb-2" />
                          <p className={`text-2xl font-black ${textPrimary}`}>{stats.currentStreak}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${textMuted}`}>Day Streak</p>
                        </div>
                        <div className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500 ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`} style={{ animationFillMode: 'both', animationDelay: '150ms' }}>
                          <Award className="w-5 h-5 text-emerald-500 mb-2" />
                          <p className={`text-2xl font-black ${textPrimary}`}>{stats.certsCount}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${textMuted}`}>Certificates</p>
                        </div>
                      </div>
                    </div>

                    {/* MIDDLE COLUMN: Interactive Roadmap (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className={`h-full rounded-[2rem] border p-6 sm:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500 ${dm ? 'bg-gradient-to-br from-[#0d1117] to-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`} style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
                        <div className="flex items-center justify-between mb-8">
                          <h3 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                            <TrendingUp className="w-5 h-5 text-purple-500" /> Career Roadmap
                          </h3>
                        </div>

                        <div className="relative flex-1 px-2">
                          {/* Vertical Line */}
                          <div className={`absolute left-6 top-4 bottom-4 w-1 rounded-full ${dm ? 'bg-slate-800' : 'bg-slate-100'}`} />
                          
                          {/* Active Line (Glow) */}
                          <div className="absolute left-6 top-4 h-1/2 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />

                          <div className="space-y-10 relative z-10">
                            {/* Node 1: Completed */}
                            <div className="flex items-start gap-5">
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className={`text-xs font-bold uppercase tracking-widest text-blue-500 mb-1`}>Completed</p>
                                <h4 className={`text-base font-bold ${textPrimary}`}>Platform Onboarding</h4>
                                <p className={`text-[11px] mt-1 ${textSecondary}`}>Profile setup & goals defined.</p>
                              </div>
                            </div>

                            {/* Node 2: In Progress */}
                            <div className="flex items-start gap-5 group">
                              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/50 ring-4 ring-purple-500/20 animate-pulse">
                                <Zap className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className={`text-xs font-bold uppercase tracking-widest text-purple-500 mb-1`}>In Progress</p>
                                <h4 className={`text-base font-bold ${textPrimary}`}>Mastering Fundamentals</h4>
                                <p className={`text-[11px] mt-1 ${textSecondary}`}>Watching lectures & passing initial exams.</p>
                              </div>
                            </div>

                            {/* Node 3: Locked */}
                            <div className="flex items-start gap-5 opacity-60 grayscale transition-all duration-300 hover:grayscale-0 hover:opacity-100">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className={`text-xs font-bold uppercase tracking-widest ${textMuted} mb-1`}>Locked</p>
                                <h4 className={`text-base font-bold ${textPrimary}`}>Advanced Projects</h4>
                                <p className={`text-[11px] mt-1 ${textSecondary}`}>Requires 3 completed courses.</p>
                              </div>
                            </div>

                            {/* Node 4: Final Goal */}
                            <div className="flex items-start gap-5 opacity-40">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                                <Crown className="w-4 h-4" />
                              </div>
                              <div>
                                <p className={`text-xs font-bold uppercase tracking-widest ${textMuted} mb-1`}>Milestone</p>
                                <h4 className={`text-base font-bold ${textPrimary}`}>Job Ready</h4>
                                <p className={`text-[11px] mt-1 ${textSecondary}`}>Unlock exclusive career placement tools.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Personal Details Form (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className={`rounded-[2rem] border shadow-sm p-6 sm:p-8 h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-500/30 animate-in zoom-in-95 fade-in duration-500 ${dm ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200'}`} style={{ animationFillMode: 'both', animationDelay: '300ms' }}>
                        <div className="mb-8">
                          <h3 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                            <Settings className="w-5 h-5 text-blue-500" /> Account Details
                          </h3>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                          <div className="space-y-1.5">
                            <label className={`block text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Full Name</label>
                            <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className={`w-full px-5 py-3 rounded-xl border text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-blue-500/20 ${inputCls}`} required />
                          </div>

                          <div className="space-y-1.5">
                            <label className={`block text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Phone Number</label>
                            <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="+91 00000 00000" className={`w-full px-5 py-3 rounded-xl border text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-blue-500/20 ${inputCls}`} />
                          </div>
                          
                          <div className="space-y-1.5 pt-2">
                            <label className={`block text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Subscription Status</label>
                            <div className={`flex items-center justify-between px-5 py-3.5 rounded-xl border ${dm ? 'border-blue-900/30 bg-blue-500/5' : 'border-blue-100 bg-blue-50/50'}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <Crown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className={`text-sm font-bold capitalize ${textPrimary}`}>{currentUser.plan} Plan</span>
                              </div>
                              <button type="button" onClick={onUpgradePlan} className="text-xs font-bold text-blue-600 bg-blue-600/10 hover:bg-blue-600/20 px-4 py-2 rounded-lg transition-colors">Upgrade</button>
                            </div>
                          </div>

                          <div className="pt-4">
                            <button type="submit" className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black tracking-wide shadow-xl hover:-translate-y-0.5 transition-all">
                              SAVE CHANGES
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ═══ SUPPORT ═══ */}
              {activeTab === 'support' && (
                <motion.div key="support" className="w-full animate-in fade-in duration-500">
                  <div className="mb-8">
                    <h1 className={`text-2xl font-bold tracking-tight ${textPrimary}`}>Help &amp; Support</h1>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Raise a query, or talk to our intelligent AI Assistant for instant answers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Raise a Query Form */}
                    <div className={`p-6 sm:p-8 rounded-[2rem] border ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dm ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                          <LifeBuoy className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${textPrimary}`}>Raise a Query</h3>
                          <p className={`text-xs ${textSecondary}`}>We typically reply within 24 hours. You can also email us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=team@skillgenz.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">team@skillgenz.com</a>.</p>
                        </div>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const target = e.target as typeof e.target & {
                          subject: { value: string };
                          description: { value: string };
                        };
                        try {
                          const res = await fetch('/api/support/ticket', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              userId: currentUser.id, 
                              userName: currentUser.name, 
                              userEmail: currentUser.email, 
                              subject: target.subject.value, 
                              description: target.description.value 
                            })
                          });
                          if(res.ok) {
                            onToast('Your query has been raised successfully!', 'success');
                            target.subject.value = '';
                            target.description.value = '';
                          } else {
                            onToast('Failed to raise query. Please try again later.', 'ref');
                          }
                        } catch(err) {
                          onToast('Network error.', 'ref');
                        }
                      }} className="space-y-4">
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${textSecondary}`}>Subject</label>
                          <input required name="subject" type="text" placeholder="e.g., Certificate Not Generating" className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`} />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${textSecondary}`}>Description</label>
                          <textarea required name="description" rows={5} placeholder="Explain your issue in detail..." className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}></textarea>
                        </div>
                        <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/30">
                          Submit Ticket
                        </button>
                      </form>
                    </div>

                    {/* AI Support Info -> Embedded Chat */}
                    <div className={`p-6 sm:p-8 rounded-[2rem] border overflow-hidden relative group flex flex-col ${dm ? 'bg-gradient-to-br from-[#0d1117] to-[#161b22] border-[#30363d]' : 'bg-gradient-to-br from-white to-blue-50/50 border-slate-200'}`} style={{ height: '550px' }}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-700 pointer-events-none" />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-4 shrink-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Bot className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className={`text-lg font-bold ${textPrimary}`}>Support AI Chat</h3>
                            <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Dedicated Support</span>
                          </div>
                        </div>
                        
                        <div ref={supportChatRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                          {supportChatHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-70">
                              <Headset className={`w-12 h-12 mb-3 ${dm ? 'text-slate-600' : 'text-blue-200'}`} />
                              <p className={`text-sm font-semibold ${textPrimary}`}>How can we help you today?</p>
                              <p className={`text-xs mt-1 ${textSecondary}`}>Ask me about platform access, billing, certificates, or bugs.</p>
                            </div>
                          ) : (
                            supportChatHistory.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 text-sm rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : (dm ? 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700' : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200')}`}>
                                  {msg.text}
                                </div>
                              </div>
                            ))
                          )}
                          {supportChatLoading && (
                            <div className="flex justify-start">
                              <div className={`p-4 rounded-2xl rounded-tl-sm border shadow-sm ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="flex gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          if(!supportChatMsg.trim()) return;
                          const message = supportChatMsg;
                          setSupportChatMsg('');
                          const newHistory = [...supportChatHistory, { role: 'user' as const, text: message }];
                          setSupportChatHistory(newHistory);
                          setSupportChatLoading(true);
                          try {
                            const res = await fetch('/api/support/chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ message, history: supportChatHistory })
                            });
                            const data = await res.json();
                            setSupportChatHistory([...newHistory, { role: 'ai', text: data.response || "No response." }]);
                          } catch(err) {
                            setSupportChatHistory([...newHistory, { role: 'ai', text: "Connection error." }]);
                          } finally {
                            setSupportChatLoading(false);
                          }
                        }} className="relative shrink-0">
                          <input 
                            type="text" 
                            value={supportChatMsg}
                            onChange={(e) => setSupportChatMsg(e.target.value)}
                            placeholder="Type your support request..." 
                            className={`w-full p-4 pr-14 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                          />
                          <button type="submit" disabled={!supportChatMsg.trim() || supportChatLoading} className="absolute right-2 top-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ═══ COURSE DETAIL PAGE (Premium Stitch Design) ═══ */}
      <AnimatePresence>
        {selectedCourse && (() => {
          const sc = selectedCourse;
          const scUnlocked = isEnrolled(sc.id);
          const scCompleted = completedLectures[sc.id] || [];
          const scProg = getProgress(sc.id);
          const courseImages: Record<string, string> = {
            'Tech': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
            'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
            'Content Creator': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&h=600&fit=crop',
            'Crash Course': 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&h=600&fit=crop',
          };
          const heroImg = sc.bannerUrl || sc.thumbnailUrl || courseImages[sc.category] || courseImages['Tech'];

          // Stitch Design Tokens
          const glassPanel = dm
            ? 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]'
            : 'bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)]';
          const bentoTile = dm
            ? 'bg-[#161b22] border border-[#30363d] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] rounded-xl p-6'
            : 'bg-white border border-black/[0.05] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] rounded-xl p-6';
          const premiumShadow = dm
            ? 'shadow-[0_10px_40px_-10px_rgba(37,99,235,0.2)]'
            : 'shadow-[0_10px_40px_-10px_rgba(0,74,198,0.15)]';
          const pageBg = dm ? '#0d1117' : '#f8f9ff';

          return (
            <motion.div
              key="course-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
              style={{ background: pageBg, fontFamily: 'Inter, sans-serif' }}
            >
              {/* ── Sticky Glass Navigation ── */}
              <nav className={`sticky top-0 z-30 border-b ${dm ? 'bg-[#0d1117]/80 border-white/[0.06]' : 'bg-[#f8f9ff]/80 border-black/[0.06]'} backdrop-blur-xl`}
                   style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-center h-16 px-4 md:px-16 w-full max-w-[1440px] mx-auto">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className={`flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors ${dm ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Courses
                  </button>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold tracking-wider uppercase ${dm ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      Professional Certification
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full ${dm ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-600 text-white'}`}>
                      {sc.category}
                    </span>
                  </div>
                </div>
              </nav>

              {/* ── Cinematic Hero Section ── */}
              <section className="relative w-full min-h-[400px] h-[55vh] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img src={heroImg} alt={sc.title} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30] via-[#0b1c30]/80 to-transparent" />
                </div>
                <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-16 pb-12">
                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-semibold tracking-wider uppercase rounded-full">Best Seller</span>
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold tracking-wider uppercase rounded-full">Expert Level</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-lg mb-5" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                      {sc.title}
                    </h1>
                    <div className="flex flex-wrap gap-6 text-base text-blue-200" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <div className="flex items-center gap-2"><BookOpen className="w-5 h-5" /><span>{sc.lectures.length} Lectures</span></div>
                      <div className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /><span>{sc.questionsCount} Questions</span></div>
                      <div className="flex items-center gap-2"><Clock className="w-5 h-5" /><span>{sc.durationMins} min Exam</span></div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* ── Main Content Grid (8+4 col) ── */}
              <section className="px-4 md:px-16 mt-12 max-w-[1440px] mx-auto pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* LEFT COLUMN — Content */}
                  <div className="lg:col-span-8 flex flex-col gap-12">

                    {/* ▸ About Course — Bento Stats */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      <h2 className={`text-2xl font-semibold mb-6 tracking-tight ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>About Course</h2>
                      <p className={`text-base leading-relaxed mb-8 ${dm ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                        {sc.description || 'This comprehensive course is designed by industry experts to give you hands-on experience with real-world projects. Master cutting-edge concepts, gain practical skills, and earn a verified certificate upon completion.'}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { icon: <Clock className="w-7 h-7" />, value: `${sc.durationMins}+`, label: 'Minutes' },
                          { icon: <Target className="w-7 h-7" />, value: `${sc.passPercentage}%`, label: 'Pass Rate' },
                          { icon: <BookOpen className="w-7 h-7" />, value: `${sc.lectures.length}`, label: 'Lectures' },
                          { icon: <Shield className="w-7 h-7" />, value: 'Lifetime', label: 'Access' },
                        ].map(s => (
                          <div key={s.label} className={`${bentoTile} flex flex-col justify-center items-center text-center`}>
                            <div className="text-blue-500 mb-2.5">{s.icon}</div>
                            <div className={`text-2xl font-semibold ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                            <div className={`text-[11px] font-medium tracking-wide mt-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* ▸ Interactive Digital Roadmap */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <div className={`${bentoTile} relative overflow-hidden`}>
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex justify-between items-center mb-8 relative z-10">
                          <div>
                            <h2 className={`text-2xl font-semibold flex items-center gap-3 ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>
                              <TrendingUp className="w-6 h-6 text-blue-500" /> Course Roadmap
                            </h2>
                            <p className={`text-[11px] mt-1 tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: 'Inter, sans-serif' }}>Your learning journey for {sc.title}</p>
                          </div>
                          <div className="flex items-center gap-4 w-1/3 max-w-[150px]">
                            <span className={`text-[11px] font-bold whitespace-nowrap text-blue-500`} style={{ fontFamily: 'Inter, sans-serif' }}>{scProg}% Complete</span>
                            <div className={`h-2 w-full rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-blue-100'} shadow-inner`}>
                              <div className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${scProg === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`} style={{ width: `${scProg}%` }}>
                                <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 animate-[shimmer_2s_infinite]" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative pl-2 sm:pl-6 pt-4 pb-8 z-10">
                          {/* Vertical Track Line */}
                          <div className={`absolute left-[1.375rem] sm:left-[2.875rem] top-8 bottom-12 w-1 rounded-full ${dm ? 'bg-slate-800/80' : 'bg-slate-100'} shadow-inner`} />
                          
                          {/* Active Progress Line */}
                          <div 
                            className="absolute left-[1.375rem] sm:left-[2.875rem] top-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out" 
                            style={{ height: sc.lectures.length > 0 ? `calc(${Math.min(scProg, 100)}% - 2rem)` : '0%' }}
                          />

                          <div className="space-y-12">
                            {sc.lectures.map((l, qi) => {
                              const isDone = scCompleted.includes(l.title);
                              
                              // Determine if this is the "next up" lecture
                              let isNextUp = false;
                              if (!isDone) {
                                // It's next up if it's the first one, or if the previous one is done
                                if (qi === 0) isNextUp = true;
                                else {
                                  const prevDone = scCompleted.includes(sc.lectures[qi-1].title);
                                  if (prevDone) isNextUp = true;
                                }
                              }

                              const isLocked = !isDone && !isNextUp;

                              return (
                                <motion.div 
                                  key={qi} 
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true, margin: "-50px" }}
                                  whileHover={{ y: -5, scale: 1.02 }}
                                  transition={{ duration: 0.5, delay: qi * 0.1, type: "spring", stiffness: 100 }}
                                  className={`relative flex items-start gap-6 group cursor-pointer transition-all duration-300 ${isLocked ? 'opacity-50 hover:opacity-100' : ''}`}
                                >
                                  {/* Milestone Node */}
                                  <motion.div 
                                    className="relative z-10 shrink-0 mt-1"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: qi * 0.2 }}
                                  >
                                    {isDone ? (
                                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-4 ring-emerald-500/20">
                                        <Check className="w-5 h-5 text-white" />
                                      </div>
                                    ) : isNextUp ? (
                                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.6)] ring-4 ring-blue-500/30 animate-pulse">
                                        <Play className="w-4 h-4 text-white ml-0.5" />
                                      </div>
                                    ) : (
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed ${dm ? 'bg-[#0d1117] border-slate-700 text-slate-500' : 'bg-white border-slate-300 text-slate-400'}`}>
                                        <Lock className="w-4 h-4" />
                                      </div>
                                    )}
                                  </motion.div>

                                  {/* Content Card */}
                                  <div 
                                    className={`flex-1 flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 transform group-hover:-translate-y-1 ${
                                      isNextUp 
                                        ? (dm ? 'bg-blue-900/10 border-blue-500/30 shadow-[0_4px_20px_-5px_rgba(37,99,235,0.15)]' : 'bg-blue-50/50 border-blue-200 shadow-lg shadow-blue-100') 
                                        : (dm ? 'bg-[#0d1117]/50 border-[#30363d] group-hover:border-slate-600' : 'bg-slate-50 border-slate-200 group-hover:bg-white group-hover:shadow-md')
                                    } ${!scUnlocked ? 'opacity-80 cursor-pointer' : 'cursor-pointer'}`}
                                    onClick={() => {
                                      if (scUnlocked) {
                                        setWatchingLecture({ courseId: sc.id, courseTitle: sc.title, title: l.title, videoId: l.videoId });
                                      } else {
                                        onToast('Please enroll first to watch lectures', 'ref');
                                        setEnrollConfirmationCourse(sc);
                                      }
                                    }}
                                  >
                                    <div className="mb-4 sm:mb-0">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                          isDone ? 'bg-emerald-500/10 text-emerald-500' : isNextUp ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'
                                        }`}>
                                          Module {qi + 1}
                                        </span>
                                        {isNextUp && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                                      </div>
                                      <h3 className={`text-base font-bold transition-colors ${isDone ? (dm ? 'text-slate-400' : 'text-slate-500') : textPrimary} group-hover:text-blue-500`} style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {l.title}
                                      </h3>
                                      <p className={`text-xs mt-1 max-w-sm ${dm ? 'text-slate-500' : 'text-slate-500'}`}>Interactive video lecture with practical examples and code walkthroughs.</p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2.5 mt-4 sm:mt-0 shrink-0">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (scUnlocked) {
                                            setWatchingLecture({ courseId: sc.id, courseTitle: sc.title, title: l.title, videoId: l.videoId });
                                          } else {
                                            onToast('Please enroll first to watch lectures', 'ref');
                                            setEnrollConfirmationCourse(sc);
                                          }
                                        }}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg ${
                                          isDone 
                                            ? (dm ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50') 
                                            : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 shadow-blue-500/20'
                                        }`}
                                      >
                                        <Play className="w-4 h-4" /> {isNextUp && !isDone ? 'Start Learning' : 'Watch Video'}
                                      </button>
                                      
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          if (!scUnlocked) {
                                            onToast('Please enroll first to complete lectures', 'ref');
                                            setEnrollConfirmationCourse(sc);
                                            return;
                                          }
                                          toggleLectureCompleted(sc.id, l.title); 
                                        }} 
                                        className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                                          isDone 
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                                            : (dm ? 'bg-[#0d1117] text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-700')
                                        }`}
                                      >
                                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-current opacity-70" />}
                                        {isDone ? 'Completed' : 'Mark as Completed'}
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                            
                            {/* Final Goal Node */}
                            <div className="relative flex items-center gap-6 opacity-80 pt-4">
                              <div className="relative z-10 shrink-0 ml-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${scProg === 100 ? 'bg-yellow-400 border-yellow-200 text-white shadow-[0_0_20px_rgba(250,204,21,0.6)]' : (dm ? 'bg-[#161b22] border-[#30363d] text-slate-600' : 'bg-white border-slate-200 text-slate-300')}`}>
                                  <Award className="w-4 h-4" />
                                </div>
                              </div>
                              <div>
                                <h3 className={`text-sm font-bold ${scProg === 100 ? 'text-yellow-500' : (dm ? 'text-slate-600' : 'text-slate-400')}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                                  Course Certification
                                </h3>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* ▸ Notes & Resources — Glass Cards */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <h2 className={`text-2xl font-semibold mb-6 ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>Notes & Resources</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: <Download className="w-5 h-5" />, title: 'Course Notes (PDF)', sub: 'Downloadable modules', color: dm ? 'text-blue-400' : 'text-blue-600', bg: dm ? 'bg-blue-500/10' : 'bg-blue-50', action: () => { if(!scUnlocked) return onToast('Please enroll first to access notes', 'ref'); if (sc.notesUrl && sc.notesUrl !== '#') { const embedUrl = sc.notesUrl.includes('drive.google.com/file/d/') ? sc.notesUrl.replace('/view', '/preview').replace('?usp=sharing', '') : sc.notesUrl; setEmbeddedViewer({ url: embedUrl, title: `${sc.title} — Notes` }); return; } setSelectedNotesCourseId(sc.id); setNotesActiveTab(coursePdfMap[sc.id] ? 'pdf_book' : 'overview'); setIsNotesOpen(true); } },
                          { icon: <FileText className="w-5 h-5" />, title: 'Practice MCQs', sub: 'Interactive quizzes', color: dm ? 'text-violet-400' : 'text-violet-600', bg: dm ? 'bg-violet-500/10' : 'bg-violet-50', action: () => { if(!scUnlocked) return onToast('Please enroll first to access practice MCQs', 'ref'); if (sc.practiceMcqsUrl) { const embedUrl = sc.practiceMcqsUrl.includes('drive.google.com/file/d/') ? sc.practiceMcqsUrl.replace('/view', '/preview').replace('?usp=sharing', '') : sc.practiceMcqsUrl; setEmbeddedViewer({ url: embedUrl, title: `${sc.title} — Practice MCQs` }); return; } setActivePracticeCourse({ id: sc.id, title: sc.title }); } },
                          { icon: <FileSpreadsheet className="w-5 h-5" />, title: 'Lab Assignments', sub: `${sc.assignments?.length || 0} tasks available`, color: dm ? 'text-emerald-400' : 'text-emerald-600', bg: dm ? 'bg-emerald-500/10' : 'bg-emerald-50', action: () => { if(!scUnlocked) return onToast('Please enroll first to access labs', 'ref'); if (sc.labManualUrl) { const embedUrl = sc.labManualUrl.includes('drive.google.com/file/d/') ? sc.labManualUrl.replace('/view', '/preview').replace('?usp=sharing', '') : sc.labManualUrl; setEmbeddedViewer({ url: embedUrl, title: `${sc.title} — Lab Manual` }); return; } if(sc.assignments && sc.assignments.length > 0) setActiveLabCourse({ title: sc.title, assignments: sc.assignments }); else onToast('No lab assignments available', 'ref'); } },
                          { icon: <Star className="w-5 h-5" />, title: 'Formula Cheat Sheet', sub: 'Quick reference guide', color: dm ? 'text-amber-400' : 'text-amber-600', bg: dm ? 'bg-amber-500/10' : 'bg-amber-50', action: () => { if(!scUnlocked) return onToast('Please enroll first to access cheat sheet', 'ref'); setSelectedNotesCourseId(sc.id); setNotesActiveTab('cheat_sheet'); setIsNotesOpen(true); } },
                        ].map((r, idx) => (
                          <button
                            key={idx}
                            onClick={r.action}
                            className={`${glassPanel} p-6 rounded-xl flex items-center gap-4 transition-all duration-300 w-full text-left ${scUnlocked ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                          >
                            <div className={`p-3 ${r.bg} ${r.color} rounded-lg shrink-0`}>
                              {!scUnlocked ? <Lock className="w-5 h-5" /> : r.icon}
                            </div>
                            <div>
                              <h3 className={`text-sm font-semibold ${textPrimary}`} style={{ fontFamily: 'Inter, sans-serif' }}>{r.title}</h3>
                              <p className={`text-[11px] mt-0.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{r.sub}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* ▸ Certification Exam — Gradient Banner */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                      <div className={`rounded-xl overflow-hidden relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between ${dm ? 'bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-blue-800/40' : 'bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200/60'}`}>
                        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMwMDAiLz48L3N2Zz4=\")", maskImage: 'linear-gradient(to bottom, white, transparent)' }} />
                        <div className="relative z-10 mb-6 md:mb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-6 h-6 text-blue-500" />
                            <h2 className={`text-2xl font-semibold ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif' }}>Certification Exam</h2>
                          </div>
                          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                            {sc.questionsCount} MCQs &middot; {sc.durationMins} minutes &middot; {sc.passPercentage}% to pass
                          </p>
                          {(() => {
                            const attempt = stats.attempts.find(a => a.courseId === sc.id);
                            if (attempt) return <p className={`text-xs font-semibold mt-1.5 ${attempt.status === 'passed' ? 'text-emerald-500' : 'text-red-500'}`}>Last: {attempt.score}/{attempt.totalQuestions} ({attempt.status === 'passed' ? 'Passed' : 'Failed'})</p>;
                            return null;
                          })()}
                        </div>
                        {scUnlocked ? (
                          <button onClick={() => { onStartExam(sc.id, sc.title); }} className="relative z-10 px-8 py-3.5 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Play className="w-4 h-4" /> Start Exam
                          </button>
                        ) : (
                          <button onClick={() => setEnrollConfirmationCourse(sc)} className="relative z-10 px-8 py-3.5 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Lock className="w-4 h-4" /> Enroll to Start Exam
                          </button>
                        )}
                      </div>
                    </motion.div>

                    {/* ▸ Test Analysis & Certificate (Visible only after passing the exam) */}
                    {stats.attempts.find(a => a.courseId === sc.id && a.status === 'passed') && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                        <div className="mt-4 relative">
                          <h2 className={`text-2xl font-semibold mb-6 ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>Test Analysis & Certificate</h2>
                          
                          <div className={`relative rounded-xl overflow-hidden ${dm ? 'bg-[#161b22] border border-[#30363d]' : 'bg-white border border-slate-200'}`}>
                            
                            {/* Blur Overlay if not paid */}
                            {!hasPaidForCertificate(sc.id) && (
                              <div className="absolute inset-0 z-20 backdrop-blur-xl bg-black/20 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl mb-4">
                                  <Lock className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white drop-shadow-md mb-2">Certificate Locked</h3>
                                <p className="text-sm text-slate-200 mb-6 max-w-md drop-shadow-sm">
                                  You have successfully passed the exam! Pay the certification fee to unlock your verifiable digital certificate and detailed test analysis.
                                </p>
                                <button 
                                  onClick={() => handleSimulatedPayment(sc.id, sc.title, sc.examPrice)}
                                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                                >
                                  Unlock Now - &#8377;{sc.examPrice}
                                </button>
                              </div>
                            )}

                            <div className="p-8">
                              {/* Content visible when unlocked */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <h3 className={`text-lg font-bold mb-4 ${textPrimary}`}>Detailed Analysis</h3>
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <span className={dm ? 'text-slate-400' : 'text-slate-600'}>Accuracy</span>
                                      <span className={`font-bold ${textPrimary}`}>95%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className={dm ? 'text-slate-400' : 'text-slate-600'}>Time Taken</span>
                                      <span className={`font-bold ${textPrimary}`}>{sc.durationMins - 2} mins</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className={dm ? 'text-slate-400' : 'text-slate-600'}>Percentile</span>
                                      <span className={`font-bold ${textPrimary}`}>Top 5%</span>
                                    </div>
                                  </div>
                                </div>
                                <div className={`flex flex-col items-center justify-center border-l border-dashed border-slate-300 dark:border-slate-700 relative ${!hasPaidForCertificate(sc.id) ? 'blur-md pointer-events-none opacity-60' : ''}`}>
                                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                    <Award className="w-10 h-10" />
                                  </div>
                                  <button
                                    onClick={() => {
                                      const cert = stats.certificates.find(c => c.courseId === sc.id);
                                      if (cert) setActiveCertificatePreview(cert);
                                      else onToast('Certificate is being generated...', 'ref');
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    View Official Certificate
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* RIGHT COLUMN — Premium Sticky Enrollment Card */}
                  <div className="lg:col-span-4 relative">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }} 
                      animate={{ y: 0, opacity: 1 }} 
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 25 }} 
                      className="lg:sticky lg:top-24"
                    >
                      <div className={`${bentoTile} ${premiumShadow} flex flex-col gap-6`}>
                        {/* Video Thumbnail Preview */}
                        {/* Video Thumbnail Preview */}
                        <div className={`w-full aspect-video rounded-lg overflow-hidden relative group cursor-pointer ${!scUnlocked ? 'opacity-80' : ''}`}
                             onClick={() => { 
                               if (scUnlocked && sc.lectures.length > 0) {
                                 setWatchingLecture({ courseId: sc.id, courseTitle: sc.title, title: sc.lectures[0].title, videoId: sc.lectures[0].videoId }); 
                               } else {
                                 onToast('Please enroll first to watch lectures', 'ref');
                                 setEnrollConfirmationCourse(sc);
                               }
                             }}>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            {scUnlocked ? (
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-blue-600 shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-white shadow-lg backdrop-blur-sm">
                                <Lock className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <img src={heroImg} alt={sc.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Pricing / Status */}
                        <div>
                          {scUnlocked ? (
                             <div className="flex items-center gap-2 mb-1 text-emerald-500 font-bold text-lg">
                               <CheckCircle2 className="w-6 h-6" /> Free Lifetime Access Activated
                             </div>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-3 mb-1">
                                <span className={`text-4xl font-bold ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>Free</span>
                                <span className={`text-lg line-through ${dm ? 'text-slate-600' : 'text-slate-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>&#8377;{sc.examPrice}</span>
                              </div>
                              <p className="text-xs font-medium text-blue-500" style={{ fontFamily: 'Inter, sans-serif' }}>Enrollment is completely free</p>
                            </>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3">
                          {scUnlocked ? (
                            <>
                              <button disabled className="w-full py-4 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-sm rounded-lg flex items-center justify-center gap-2 cursor-default" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <CheckCircle2 className="w-5 h-5" /> Successfully Enrolled
                              </button>
                              <button onClick={() => { onStartExam(sc.id, sc.title); }} className="w-full py-4 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Start Exam Now <ChevronRight className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => setEnrollConfirmationCourse(sc)} className="w-full py-4 bg-blue-600 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Enroll Now - Free <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <hr className={dm ? 'border-slate-800' : 'border-slate-100'} />

                        {/* Feature Checklist */}
                        <div className="flex flex-col gap-3">
                          <h3 className={`text-sm font-semibold mb-1 ${textPrimary}`} style={{ fontFamily: 'Inter, sans-serif' }}>This course includes:</h3>
                          {[
                            { icon: <BookOpen className="w-5 h-5" />, text: `${sc.lectures.length} Video Lectures` },
                            { icon: <Award className="w-5 h-5" />, text: 'Verified Certificate' },
                            { icon: <FileText className="w-5 h-5" />, text: 'Downloadable Notes' },
                            { icon: <Clock className="w-5 h-5" />, text: `${sc.durationMins} min Exam` },
                            { icon: <Shield className="w-5 h-5" />, text: 'Lifetime Access' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="text-blue-500">{item.icon}</span>
                              <span className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{item.text}</span>
                            </div>
                          ))}
                        </div>

                        {/* Progress */}
                        {scProg > 0 && (
                          <>
                            <hr className={dm ? 'border-slate-800' : 'border-slate-100'} />
                            <div>
                              <div className="flex justify-between mb-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${textMuted}`}>Your Progress</span>
                                <span className={`text-[10px] font-bold ${scProg === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>{scProg}%</span>
                              </div>
                              <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-blue-100'}`}>
                                <div className={`h-full rounded-full transition-all duration-500 ${scProg === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${scProg}%` }} />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Instructor */}
                        <div className={`mt-1 p-4 rounded-lg flex items-center gap-4 ${dm ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${dm ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                            {(sc.instructorName || 'SV').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-[10px] font-medium mb-0.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>Instructed by</p>
                            <p className={`text-sm font-semibold ${textPrimary}`} style={{ fontFamily: 'Inter, sans-serif' }}>{sc.instructorName || 'SkillGenz Team'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ═══ VIDEO MODAL ═══ */}
      <AnimatePresence>
        {watchingLecture && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`relative w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl ${dm ? 'bg-[#161b22] border border-[#30363d]' : 'bg-white border border-gray-200'}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                <div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide text-blue-500`}>{watchingLecture.courseTitle}</p>
                  <h4 className={`text-sm font-semibold ${textPrimary}`}>{watchingLecture.title}</h4>
                </div>
                <button onClick={() => setWatchingLecture(null)} className={`p-1.5 rounded-lg ${dm ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <iframe title={watchingLecture.title} src={`https://www.youtube.com/embed/${watchingLecture.videoId}?modestbranding=1&rel=0`} className="w-full h-full border-none" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 px-4 py-2 rounded-lg backdrop-blur-sm z-50">
                  <a href={`https://www.youtube.com/watch?v=${watchingLecture.videoId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    Watch on YouTube
                  </a>
                </div>
              </div>
              <div className={`flex items-center justify-between px-4 py-3 border-t ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                <span className={`text-xs ${textMuted}`}>Mark this lecture as completed:</span>
                <button
                  onClick={() => toggleLectureCompleted(watchingLecture.courseId, watchingLecture.title)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    (completedLectures[watchingLecture.courseId] || []).includes(watchingLecture.title)
                      ? (dm ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {(completedLectures[watchingLecture.courseId] || []).includes(watchingLecture.title) ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CERTIFICATE PREVIEW ═══ */}
      <AnimatePresence>
        {activeCertificatePreview && !congratsModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`relative w-full max-w-4xl rounded-xl p-6 shadow-2xl ${dm ? 'bg-[#161b22] border border-[#30363d]' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-lg font-bold ${textPrimary}`}>Certificate Preview</h3>
                <button onClick={() => setActiveCertificatePreview(null)} className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">Close</button>
              </div>
              <PremiumCertificate
                certificate={activeCertificatePreview}
                darkMode={darkMode}
                currentUser={currentUser}
                onRefreshUser={onRefreshUser}
                onToast={onToast}
                onRefreshDashboard={fetchDashboardStats}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CONGRATS ═══ */}
      <AnimatePresence>
        {congratsModalOpen && activeCertificatePreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative w-full max-w-4xl rounded-xl p-8 bg-[#0d1117] border border-[#30363d] text-center space-y-5">
              <div>
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-[10px] tracking-[3px] uppercase text-emerald-400 font-semibold">Course Completed</p>
                <h2 className="text-2xl font-bold text-white mt-1">Congratulations!</h2>
                <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">You have completed all lectures. Your certificate has been issued.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200">
                <PremiumCertificate
                  certificate={activeCertificatePreview}
                  darkMode={false}
                  currentUser={currentUser}
                  onRefreshUser={onRefreshUser}
                  onToast={onToast}
                  onRefreshDashboard={fetchDashboardStats}
                />
              </div>
              <button
                onClick={() => { setCongratsModalOpen(false); setActiveCertificatePreview(null); setActiveTab('certificates'); }}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                View Certificates
              </button>
            </motion.div>
          </motion.div>
        )}


      </AnimatePresence>

      {/* ═══ AVATAR CUSTOMIZER MODAL ═══ */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border ${dm ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200'}`}
            >
              <div className={`p-6 border-b flex items-center justify-between ${dm ? 'border-[#30363d] bg-[#161b22]' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}>
                  <Palette className="w-5 h-5 text-blue-500" /> Customize Your Avatar
                </h3>
                <button onClick={() => setShowAvatarModal(false)} className={`p-2 rounded-full transition-colors ${dm ? 'hover:bg-[#30363d] text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
  {/* Live Preview */}
  <div className="flex flex-col items-center justify-center">
    <div
      style={{ 
        borderColor: dm ? '#161b22' : '#ffffff'
      }}
      className={`relative w-56 h-56 rounded-full border-[6px] shadow-2xl flex items-center justify-center text-white transition-all duration-500 bg-gradient-to-br ${avatarConfig.bg} ${dm ? 'border-[#161b22]' : 'border-white'} overflow-hidden`}
    >
      <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${avatarConfig.seed}&hair=${avatarConfig.hair}&hairColor=${avatarConfig.hairColor}&skinColor=${avatarConfig.skinColor}&mouth=${avatarConfig.mouth}&eyes=${avatarConfig.eyes}&shirt=${avatarConfig.shirt}`} alt="Live Preview" className="w-full h-full object-cover scale-110 translate-y-3" />
    </div>
    <p className={`mt-6 text-sm font-bold tracking-widest uppercase ${textSecondary}`}>Snapchat Style Avatar</p>
  </div>

  {/* Controls (Scrollable) */}
  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
    
    {/* Gender Toggle */}
    <div>
      <div className="flex bg-slate-100 dark:bg-[#161b22] p-1 rounded-xl w-full max-w-xs">
        <button 
          onClick={() => setAvatarConfig(prev => ({ ...prev, gender: 'male', hair: 'fonze' }))}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${avatarConfig.gender === 'male' ? 'bg-white dark:bg-[#30363d] text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Masculine
        </button>
        <button 
          onClick={() => setAvatarConfig(prev => ({ ...prev, gender: 'female', hair: 'pixie' }))}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${avatarConfig.gender === 'female' ? 'bg-white dark:bg-[#30363d] text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Feminine
        </button>
      </div>
    </div>
    
    {/* Hair Style */}
    <div>
      <label className={`block text-[11px] font-bold uppercase tracking-widest mb-3 ${textSecondary}`}>Hair Style</label>
      <div className="flex flex-wrap gap-2">
        {(avatarConfig.gender === 'male' ? ['fonze', 'mrT', 'dougFunny', 'mrClean', 'dannyPhantom', 'turban'] : ['pixie', 'full']).map(style => (
          <button 
            key={style}
            onClick={() => setAvatarConfig(prev => ({ ...prev, hair: style }))}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all capitalize ${
              avatarConfig.hair === style 
                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                : (dm ? 'border-[#30363d] bg-[#161b22] text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300')
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>

    {/* Hair Color */}
    <div>
      <label className={`block text-[11px] font-bold uppercase tracking-widest mb-3 ${textSecondary}`}>Hair Color</label>
      <div className="flex flex-wrap gap-2">
        {['000000', '4a312c', '70463b', 'd6b370', 'f59e0b', 'ef4444', 'eab308', 'ffffff'].map(color => (
          <button 
            key={color}
            onClick={() => setAvatarConfig(prev => ({ ...prev, hairColor: color }))}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${avatarConfig.hairColor === color ? 'scale-125 border-blue-500' : 'border-transparent hover:scale-110'}`}
            style={{ backgroundColor: `#${color}` }}
          />
        ))}
      </div>
    </div>

    {/* Skin Tone */}
    <div>
      <label className={`block text-[11px] font-bold uppercase tracking-widest mb-3 ${textSecondary}`}>Skin Tone</label>
      <div className="flex flex-wrap gap-2">
        {['ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '734129', '3a2318'].map(color => (
          <button 
            key={color}
            onClick={() => setAvatarConfig(prev => ({ ...prev, skinColor: color }))}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${avatarConfig.skinColor === color ? 'scale-125 border-blue-500' : 'border-transparent hover:scale-110'}`}
            style={{ backgroundColor: `#${color}` }}
          />
        ))}
      </div>
    </div>

    {/* Mouth Expression */}
    <div>
      <label className={`block text-[11px] font-bold uppercase tracking-widest mb-3 ${textSecondary}`}>Expression</label>
      <div className="flex flex-wrap gap-2">
        {['smile', 'pucker', 'smirk', 'laughing', 'surprised'].map(exp => (
          <button 
            key={exp}
            onClick={() => setAvatarConfig(prev => ({ ...prev, mouth: exp }))}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all capitalize ${
              avatarConfig.mouth === exp 
                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                : (dm ? 'border-[#30363d] bg-[#161b22] text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300')
            }`}
          >
            {exp}
          </button>
        ))}
      </div>
    </div>

    {/* Clothing */}
    <div>
      <label className={`block text-[11px] font-bold uppercase tracking-widest mb-3 ${textSecondary}`}>Clothing</label>
      <div className="flex flex-wrap gap-2">
        {['collared', 'crew', 'open'].map(shirt => (
          <button 
            key={shirt}
            onClick={() => setAvatarConfig(prev => ({ ...prev, shirt: shirt }))}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all capitalize ${
              avatarConfig.shirt === shirt 
                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                : (dm ? 'border-[#30363d] bg-[#161b22] text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300')
            }`}
          >
            {shirt}
          </button>
        ))}
      </div>
    </div>

    {/* Gradient Background */}
    <div>
      <label className={`block text-[11px] font-bold uppercase tracking-widest mb-3 ${textSecondary}`}>Backdrop</label>
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'blue', cls: 'from-blue-500 to-indigo-600' },
          { id: 'purple', cls: 'from-purple-500 to-fuchsia-600' },
          { id: 'orange', cls: 'from-orange-400 to-rose-500' },
          { id: 'emerald', cls: 'from-emerald-400 to-teal-600' },
          { id: 'dark', cls: 'from-slate-700 to-slate-900' },
        ].map(theme => (
          <button 
            key={theme.id}
            onClick={() => setAvatarConfig(prev => ({ ...prev, bg: theme.cls }))}
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.cls} transition-all border-2 ${
              avatarConfig.bg === theme.cls ? 'scale-125 border-blue-500' : 'border-transparent hover:scale-110'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
</div>

<div className={`p-6 border-t flex justify-end gap-3 ${dm ? 'border-[#30363d] bg-[#161b22]' : 'border-slate-100 bg-slate-50'}`}>
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${dm ? 'hover:bg-[#30363d] text-slate-300' : 'hover:bg-slate-200 text-slate-600'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                >
                  Save Avatar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ LOGOUT CONFIRMATION MODAL ═══ */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'} text-center`}>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 animate-pulse">
                <LogOut className="w-8 h-8 -ml-1" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Ready to leave?</h3>
              <p className={`text-sm mb-8 ${textSecondary}`}>Are you sure you want to log out of your session?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/25 transition-all active:scale-95"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PREMIUM COURSE NOTES VIEWER MODAL ═══ */}
      <AnimatePresence>
        {isNotesOpen && (() => {
          const activeNotes = selectedNotesCourseId ? courseNotes[selectedNotesCourseId] : null;
          if (!activeNotes) return null;

          const handleDownloadMarkdown = (notes: typeof activeNotes) => {
            let md = `# ${notes.title} - Complete Study Notes\n\n`;
            md += `## Course Overview\n${notes.overview}\n\n`;
            md += `## Key Concepts\n`;
            notes.keyConcepts.forEach(c => {
              md += `* **${c.term}**: ${c.definition}\n`;
            });
            md += `\n## Lecture Chapters\n\n`;
            notes.lectures.forEach((l, idx) => {
              md += `### Module ${idx + 1}: ${l.title}\n${l.content}\n\n`;
            });
            md += `## Formula Cheat Sheet & Reference\n\n${notes.cheatSheet}\n\n`;
            md += `*Generated by SkillGenz Platform*`;

            const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${notes.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onToast(`Notes for "${notes.title}" downloaded as Markdown!`, 'success');
          };

          const handlePrintNotes = () => {
            window.print();
          };

          const highlightText = (text: string, search: string) => {
            if (!search) return text;
            const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
            return (
              <>
                {parts.map((part, i) => 
                  part.toLowerCase() === search.toLowerCase() 
                    ? <mark key={i} className="bg-yellow-200 text-black px-0.5 rounded">{part}</mark> 
                    : part
                )}
              </>
            );
          };

          const renderInlineMarkdown = (text: string, search: string) => {
            const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);
            return parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={idx} className={dm ? 'text-white font-extrabold' : 'text-slate-900 font-extrabold'}>
                    {highlightText(part.slice(2, -2), search)}
                  </strong>
                );
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={idx} className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${dm ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-amber-700'}`}>
                    {highlightText(part.slice(1, -1), search)}
                  </code>
                );
              }
              if (part.startsWith('$') && part.endsWith('$')) {
                const math = part.slice(1, -1);
                try {
                  return (
                    <span 
                      key={idx}
                      className="mx-0.5 inline-block"
                      dangerouslySetInnerHTML={{ 
                        __html: katex.renderToString(math, { throwOnError: false, displayMode: false }) 
                      }} 
                    />
                  );
                } catch (e) {
                  console.error("KaTeX inline error:", e);
                }
                return (
                  <span key={idx} className="font-serif italic bg-slate-500/10 px-1 py-0.5 rounded text-blue-500 font-bold mx-0.5">
                    {highlightText(math, search)}
                  </span>
                );
              }
              return highlightText(part, search);
            });
          };

          const renderSubElements = (text: string, search: string) => {
            const lines = text.split('\n');
            return lines.map((line, lineIdx) => {
              if (line.trim().startsWith('$$') && line.trim().endsWith('$$')) {
                const equation = line.trim().slice(2, -2).trim();
                try {
                  return (
                    <div 
                      key={lineIdx} 
                      className={`my-4 py-4 px-6 text-center overflow-x-auto ${
                        dm ? 'bg-slate-900/40 text-blue-300' : 'bg-slate-50 text-blue-800'
                      } rounded-2xl shadow-sm`}
                      dangerouslySetInnerHTML={{ 
                        __html: katex.renderToString(equation, { throwOnError: false, displayMode: true }) 
                      }}
                    />
                  );
                } catch (e) {
                  console.error("KaTeX block error:", e);
                }
                return (
                  <div 
                    key={lineIdx} 
                    className={`my-4 py-3 px-6 text-center font-serif italic text-base md:text-lg border-y border-dashed ${
                      dm ? 'border-slate-800 bg-slate-900/60 text-blue-400' : 'border-slate-200 bg-slate-50 text-blue-700'
                    } rounded-2xl shadow-sm font-bold tracking-wide`}
                  >
                    {equation}
                  </div>
                );
              }
              if (line.startsWith('###')) {
                return (
                  <h5 key={lineIdx} className={`text-sm font-bold mt-4 mb-2 tracking-tight ${dm ? 'text-white' : 'text-slate-800'}`}>
                    {highlightText(line.replace('###', '').trim(), search)}
                  </h5>
                );
              }
              if (line.startsWith('##')) {
                return (
                  <h4 key={lineIdx} className="text-base font-extrabold mt-6 mb-3 tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    {highlightText(line.replace('##', '').trim(), search)}
                  </h4>
                );
              }
              if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                const cleanLine = line.trim().replace(/^[\*\-]\s+/, '');
                return (
                  <div key={lineIdx} className="flex items-start gap-2.5 my-1.5 pl-4">
                    <span className="text-blue-500 mt-1 shrink-0 text-sm">•</span>
                    <span className="text-xs leading-relaxed">
                      {renderInlineMarkdown(cleanLine, search)}
                    </span>
                  </div>
                );
              }
              if (!line.trim()) return <div key={lineIdx} className="h-2" />;
              return (
                <p key={lineIdx} className="text-xs leading-relaxed my-1.5">
                  {renderInlineMarkdown(line, search)}
                </p>
              );
            });
          };

          const renderRichContent = (content: string, search: string) => {
            if (!content) return null;
            const codeParts = content.split(/(```[\s\S]*?```)/g);
            
            return codeParts.map((codePart, codeIdx) => {
              if (codePart.startsWith('```')) {
                const lines = codePart.split('\n');
                const header = lines[0].replace('```', '').trim();
                const code = lines.slice(1, -1).join('\n');
                
                return (
                  <div key={`code-${codeIdx}`} className="my-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 font-mono text-sm relative group">
                    {header && (
                      <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 border-b border-slate-700 flex justify-between items-center">
                        <span>{header}</span>
                      </div>
                    )}
                    <pre className="p-4 overflow-x-auto"><code>{code}</code></pre>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        onToast("Code copied to clipboard!", "success");
                      }}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Copy
                    </button>
                  </div>
                );
              }

              const calloutParts = codePart.split(/(:::(?:info|success|warning|danger)[\s\S]*?:::)/gi);

              return calloutParts.map((part, partIdx) => {
                const calloutMatch = part.match(/^:::(info|success|warning|danger)\n?([\s\S]*?)\n?:::/i);
                
                if (calloutMatch) {
                  const type = calloutMatch[1].toLowerCase();
                  const innerContent = calloutMatch[2].trim();

                  let containerClass = '';
                  let icon = null;
                  let titleText = '';

                  if (type === 'info') {
                    containerClass = dm 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                      : 'bg-blue-50 border-blue-200 text-blue-800';
                    icon = <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;
                    titleText = 'Key Concept / Information';
                  } else if (type === 'success') {
                    containerClass = dm 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800';
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
                    titleText = 'Pro-Tip / Practical Advice';
                  } else if (type === 'warning') {
                    containerClass = dm 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                      : 'bg-amber-50 border-amber-200 text-amber-800';
                    icon = <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
                    titleText = 'Common Pitfall / Warning';
                  } else if (type === 'danger') {
                    containerClass = dm 
                      ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                      : 'bg-red-50 border-red-200 text-red-800';
                    icon = <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />;
                    titleText = 'Critical Concept / Danger';
                  }

                  return (
                    <div 
                      key={`callout-${partIdx}`} 
                      className={`my-5 p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${containerClass}`}
                    >
                      {icon}
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1.5 opacity-90">{titleText}</p>
                        <div className="text-xs leading-relaxed">
                          {renderSubElements(innerContent, search)}
                        </div>
                      </div>
                    </div>
                  );
                }

                return renderSubElements(part, search);
              });
            });
          };

          return (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 md:p-6"
            >
              <motion.div 
                initial={{ scale: 0.97, y: 10 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.97, y: 10 }} 
                className={`w-full max-w-6xl h-[88vh] rounded-[2rem] border overflow-hidden flex flex-col shadow-2xl ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`}
              >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 ${dm ? 'border-[#30363d] bg-[#161b22]' : 'border-slate-150 bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${textPrimary}`}>{activeNotes.title} Study Notes</h3>
                      <p className={`text-xs ${textSecondary}`}>{activeNotes.category} Module Handouts</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Font Size controls */}
                    <div className={`flex items-center rounded-xl p-0.5 border ${dm ? 'border-[#30363d] bg-[#0d1117]' : 'border-slate-200 bg-white'}`}>
                      {[
                        { label: 'A-', size: 'text-sm' as const },
                        { label: 'A', size: 'text-base' as const },
                        { label: 'A+', size: 'text-lg' as const },
                      ].map((item) => (
                        <button
                          key={item.size}
                          onClick={() => setNotesFontSize(item.size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            notesFontSize === item.size
                              ? 'bg-blue-600 text-white shadow-sm'
                              : `${dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleDownloadMarkdown(activeNotes)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5 ${
                        dm 
                          ? 'border-[#30363d] bg-slate-800 hover:bg-slate-700 text-slate-200' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Markdown (.md)
                    </button>

                    <button
                      onClick={handlePrintNotes}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 hover:-translate-y-0.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Print / PDF
                    </button>

                    <button 
                      onClick={() => setIsNotesOpen(false)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        dm ? 'border-[#30363d] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Body Layout */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left Navigation Panel */}
                  <div className={`w-64 border-r hidden md:flex flex-col shrink-0 overflow-y-auto ${dm ? 'border-[#30363d] bg-[#0d1117]/30' : 'border-slate-150 bg-slate-50/50'}`}>
                    <div className="p-4 space-y-6">
                      <div>
                        <p className={`px-3 text-[10px] font-bold uppercase tracking-widest mb-2.5 ${textMuted}`}>General</p>
                        <div className="space-y-1">
                          {[
                            ...(coursePdfMap[selectedNotesCourseId] ? [{ id: 'pdf_book', label: 'Official PDF Book', icon: <FileText className="w-4 h-4" /> }] : []),
                            { id: 'overview', label: 'Course Overview', icon: <BookOpen className="w-4 h-4" /> },
                            { id: 'cheat_sheet', label: 'Cheat Sheet', icon: <Sparkles className="w-4 h-4" /> },
                          ].map(item => {
                            const active = notesActiveTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => setNotesActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-left ${
                                  active
                                    ? (dm ? 'bg-blue-600/15 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-700')
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                {item.icon}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className={`px-3 text-[10px] font-bold uppercase tracking-widest mb-2.5 ${textMuted}`}>Lecture Chapters</p>
                        <div className="space-y-1">
                          {activeNotes.lectures.map((l, idx) => {
                            const active = notesActiveTab === 'lectures' && selectedLectureIdx === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => { setNotesActiveTab('lectures'); setSelectedLectureIdx(idx); }}
                                className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left ${
                                  active
                                    ? (dm ? 'bg-blue-600/15 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-700')
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                                  active ? 'bg-blue-600 text-white' : (dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className="line-clamp-2">{l.title.replace(/Lecture \d+:\s*/i, '')}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content Panel */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Inline Search Bar */}
                    <div className={`px-6 py-3 border-b flex items-center justify-between gap-4 shrink-0 ${dm ? 'border-[#30363d] bg-[#161b22]/50' : 'border-slate-100 bg-white'}`}>
                      <div className="relative flex-1 max-w-sm">
                        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          placeholder="Search in this section..."
                          value={notesSearchQuery}
                          onChange={(e) => setNotesSearchQuery(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                        />
                        {notesSearchQuery && (
                          <button 
                            onClick={() => setNotesSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Small screens helper layout selectors */}
                      <div className="flex md:hidden items-center gap-1.5">
                        <select
                          value={notesActiveTab === 'lectures' ? `lecture-${selectedLectureIdx}` : notesActiveTab}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.startsWith('lecture-')) {
                              setNotesActiveTab('lectures');
                              setSelectedLectureIdx(Number(val.split('-')[1]));
                            } else {
                              setNotesActiveTab(val as any);
                            }
                          }}
                          className={`p-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                        >
                          {coursePdfMap[selectedNotesCourseId] && <option value="pdf_book">Official PDF Book</option>}
                          <option value="overview">Overview</option>
                          <option value="cheat_sheet">Cheat Sheet</option>
                          {activeNotes.lectures.map((l, idx) => (
                            <option key={idx} value={`lecture-${idx}`}>Chapter {idx + 1}: {l.title.replace(/Lecture \d+:\s*/i, '')}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className={`flex-1 ${notesActiveTab === 'pdf_book' ? 'overflow-hidden flex flex-col p-4 md:p-6' : 'overflow-y-auto p-6 md:p-8'} ${notesFontSize} ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                      {notesActiveTab === 'pdf_book' && (() => {
                        const pdfFile = coursePdfMap[selectedNotesCourseId];
                        if (!pdfFile) {
                          return (
                            <div className="flex flex-col items-center justify-center text-center h-full py-12 px-4">
                              <XCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
                              <h4 className={`text-base font-bold ${textPrimary}`}>No PDF Available</h4>
                              <p className={`text-xs mt-2 max-w-sm ${textMuted}`}>
                                The official PDF book is currently being prepared for this course. In the meantime, please read the interactive Online Textbook chapters from the left navigation panel.
                              </p>
                            </div>
                          );
                        }
                        return (
                          <div className="flex flex-col h-full w-full gap-4 overflow-hidden">
                            <div className={`flex items-center justify-between p-4 rounded-2xl border ${dm ? 'bg-slate-800/20 border-slate-700/50' : 'bg-slate-50 border-slate-200'} shrink-0`}>
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-500" />
                                <div>
                                  <h4 className={`text-xs font-bold ${textPrimary}`}>{pdfFile}</h4>
                                  <p className={`text-[10px] ${textMuted}`}>Official Textbook & Course Material</p>
                                </div>
                              </div>
                              <a 
                                href={`/books/${encodeURIComponent(pdfFile)}`} 
                                download={pdfFile}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download PDF
                              </a>
                            </div>
                            <div className="flex-1 w-full min-h-[450px] relative rounded-2xl overflow-hidden border border-slate-700/30 shadow-inner bg-slate-900/10">
                              <iframe 
                                src={`/books/${encodeURIComponent(pdfFile)}`}
                                className="w-full h-full absolute inset-0 border-none rounded-2xl" 
                                title={`${activeNotes.title} PDF Book`}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {notesActiveTab === 'overview' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className={`text-lg font-bold mb-3 ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif' }}>Course Overview</h4>
                            <p className="leading-relaxed">{highlightText(activeNotes.overview, notesSearchQuery)}</p>
                          </div>

                          <div className={`p-6 rounded-[1.5rem] border ${dm ? 'bg-slate-800/25 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                            <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textPrimary}`} style={{ fontFamily: 'Inter, sans-serif' }}>Key Terms & Concepts</h4>
                            <div className="grid grid-cols-1 gap-4">
                              {activeNotes.keyConcepts.map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                  <span className={`text-xs font-bold ${dm ? 'text-blue-400' : 'text-blue-600'}`}>{highlightText(item.term, notesSearchQuery)}</span>
                                  <span className="text-xs leading-relaxed">{highlightText(item.definition, notesSearchQuery)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {notesActiveTab === 'cheat_sheet' && (
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-5 h-5 text-amber-500" />
                              <h4 className={`text-lg font-bold ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif' }}>Cheat Sheet & Code References</h4>
                            </div>
                            <div className="prose max-w-none">
                              {renderRichContent(activeNotes.cheatSheet, notesSearchQuery)}
                            </div>
                          </div>
                        </div>
                      )}

                      {notesActiveTab === 'lectures' && (() => {
                        const lecture = activeNotes.lectures[selectedLectureIdx];
                        if (!lecture) return null;
                        return (
                          <div className="space-y-6">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Module {selectedLectureIdx + 1}</span>
                              <h4 className={`text-lg font-bold mt-1 mb-4 ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{lecture.title}</h4>
                              <div className="prose max-w-none">
                                {renderRichContent(lecture.content, notesSearchQuery)}
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-dashed border-slate-700/30">
                              <button
                                disabled={selectedLectureIdx === 0}
                                onClick={() => setSelectedLectureIdx(p => p - 1)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                  dm ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                                }`}
                              >
                                Previous Module
                              </button>

                              <button
                                disabled={selectedLectureIdx === activeNotes.lectures.length - 1}
                                onClick={() => setSelectedLectureIdx(p => p + 1)}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10"
                              >
                                Next Module
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ═══ PRINTABLE NOTES CONTAINER (Hidden by default, visible during window.print()) ═══ */}
      {(() => {
        const activeNotes = selectedNotesCourseId ? courseNotes[selectedNotesCourseId] : null;
        if (!activeNotes) return null;
        return (
          <div id="printable-notes-area" className="hidden">
            <div style={{ fontFamily: 'Georgia, serif', color: '#111', lineHeight: '1.6' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                {activeNotes.title} - Complete Study Guide
              </h1>
              <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '24px' }}>
                Category: {activeNotes.category} | Generated by SkillGenz Platform
              </p>

              <h2 style={{ fontSize: '22px', marginTop: '24px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                1. Course Overview
              </h2>
              <p style={{ marginBottom: '20px' }}>{activeNotes.overview}</p>

              <h2 style={{ fontSize: '22px', marginTop: '24px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                2. Key Concepts & Definitions
              </h2>
              <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                {activeNotes.keyConcepts.map((c, idx) => (
                  <li key={idx} style={{ marginBottom: '10px' }}>
                    <strong>{c.term}</strong>: {c.definition}
                  </li>
                ))}
              </ul>

              <h2 style={{ fontSize: '22px', marginTop: '24px', borderBottom: '1px solid #ddd', paddingBottom: '5px', pageBreakBefore: 'always' }}>
                3. Detailed Lecture Chapters
              </h2>
              {activeNotes.lectures.map((l, idx) => (
                <div key={idx} style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                  <h3 style={{ fontSize: '18px', color: '#222', borderBottom: '1px dashed #eee', paddingBottom: '3px' }}>
                    Module {idx + 1}: {l.title}
                  </h3>
                  <p style={{ whiteSpace: 'pre-line', fontSize: '14px', marginTop: '8px' }}>{l.content}</p>
                </div>
              ))}

              <h2 style={{ fontSize: '22px', marginTop: '30px', borderBottom: '1px solid #ddd', paddingBottom: '5px', pageBreakBefore: 'always' }}>
                4. Formulas & Reference Code
              </h2>
              <pre style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '15px', borderRadius: '5px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px', marginTop: '10px' }}>
                {activeNotes.cheatSheet.replace(/```[a-z]*\n|```/g, '')}
              </pre>
            </div>
          </div>
        );
      })()}

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-notes-area, #printable-notes-area * {
            visibility: visible !important;
          }
          #printable-notes-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            display: block !important;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            margin: 0 !important;
          }
        }
      `}</style>
      {/* ═══ ENROLLMENT CONFIRMATION MODAL ═══ */}
      <AnimatePresence>
        {enrollConfirmationCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCog className="w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold text-center mb-2 ${textPrimary}`}>Confirm Enrollment</h3>
                <p className={`text-center text-sm ${textSecondary} mb-6`}>
                  Are you sure you want to enroll in <strong>{enrollConfirmationCourse.title}</strong>? This will give you free lifetime access to the learning materials.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleEnrollConfirm}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Yes, Enroll Me
                  </button>
                  <button 
                    onClick={() => setEnrollConfirmationCourse(null)}
                    className={`w-full py-3 font-bold rounded-xl transition-all ${dm ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {activePracticeCourse && (
        <PracticeMCQEngine
          courseId={activePracticeCourse.id}
          courseTitle={activePracticeCourse.title}
          darkMode={darkMode}
          onClose={() => setActivePracticeCourse(null)}
          onToast={onToast}
        />
      )}

      {activeLabCourse && (
        <LabAssignmentEngine
          courseTitle={activeLabCourse.title}
          assignments={activeLabCourse.assignments}
          darkMode={darkMode}
          onClose={() => setActiveLabCourse(null)}
          onToast={onToast}
        />
      )}

      {/* ═══════ EMBEDDED RESOURCE VIEWER MODAL ═══════ */}
      <AnimatePresence>
        {embeddedViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEmbeddedViewer(null)} />

            {/* Content */}
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 flex flex-col h-full m-3 md:m-6 rounded-2xl overflow-hidden border shadow-2xl"
              style={{ background: dm ? '#0d1117' : '#fff', borderColor: dm ? '#30363d' : '#e2e8f0' }}
            >
              {/* Header Bar */}
              <div className={`flex items-center justify-between px-5 py-3 border-b shrink-0 ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dm ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-sm font-bold truncate ${dm ? 'text-white' : 'text-slate-800'}`}>{embeddedViewer.title}</h3>
                    <p className={`text-[10px] truncate ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{embeddedViewer.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => window.open(embeddedViewer.url, '_blank')}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Open in New Tab ↗
                  </button>
                  <button
                    onClick={() => setEmbeddedViewer(null)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dm ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Iframe Content */}
              <div className="flex-1 relative">
                <iframe
                  src={embeddedViewer.url}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                  title={embeddedViewer.title}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
