/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, FileSpreadsheet, Award, User, ShoppingBag,
  Youtube, CheckCircle2, GraduationCap, FileText, Check, Square, CheckSquare,
  X, Play, TrendingUp, Zap, Clock, Star, ChevronRight, Lock, Unlock,
  BarChart3, Bell, Search, Menu, Crown, Flame, Target, ArrowUpRight, ArrowLeft,
  Calendar, Download, ExternalLink, Settings, LogOut, CreditCard, Shield, XCircle,
  Bot, Gamepad2, Sparkles, Palette
} from 'lucide-react';
import { Course, Certificate, ExamAttempt, Payment, User as UserType } from '../../types';
import { PremiumCertificate } from '../PremiumCertificate';

interface StudentDashboardProps {
  currentUser: UserType;
  courses: Course[];
  onStartExam: (courseId: string, courseTitle: string) => void;
  onUpgradePlan: () => void;
  onToast: (msg: string, type: 'success' | 'ref') => void;
  onRefreshUser: (updatedUser: UserType) => void;
  darkMode: boolean;
  initialTab?: 'home' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile';
  onTabChange?: (tab: 'home' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile') => void;
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
const [activeTab, setActiveTabState] = useState<'home' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile'>(initialTab || 'home');

  const setActiveTab = (tab: 'home' | 'resources' | 'exams' | 'certificates' | 'payments' | 'profile') => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

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
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');

  useEffect(() => {
    try { const s = localStorage.getItem(`completed_lectures_${currentUser.id}`); if (s) setCompletedLectures(JSON.parse(s)); } catch {}
  }, [currentUser]);

  const toggleLectureCompleted = async (courseId: string, lectureTitle: string) => {
    const cur = completedLectures[courseId] || [];
    const updated = cur.includes(lectureTitle) ? cur.filter(t => t !== lectureTitle) : [...cur, lectureTitle];
    const map = { ...completedLectures, [courseId]: updated };
    setCompletedLectures(map);
    localStorage.setItem(`completed_lectures_${currentUser.id}`, JSON.stringify(map));
    const course = courses.find(c => c.id === courseId);
    if (course && course.lectures.length > 0 && Math.round((updated.length / course.lectures.length) * 100) === 100) {
      await autoGenerateCertificate(courseId);
    }
  };

  const autoGenerateCertificate = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    if (stats.certificates.some(c => c.courseId === courseId || c.course?.id === courseId)) return;
    try {
      onToast(`Generating certificate for ${course.title}...`, 'success');
      const res = await fetch('/api/certificates/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, courseId, score: 100, grade: 'Distinction' })
      });
      if (res.ok) {
        const data = await res.json();
        setStats(p => ({ ...p, certificates: [data.certificate, ...p.certificates] }));
        setActiveCertificatePreview(data.certificate);
        setCongratsModalOpen(true);
      }
    } catch (err) { console.error(err); }
  };

  const fetchDashboardStats = async () => {
    try { const r = await fetch(`/api/student/${currentUser.id}/dashboard`); if (r.ok) setStats(await r.json()); } catch {}
  };

  useEffect(() => {
    fetchDashboardStats(); setProfileName(currentUser.name); setProfilePhone(currentUser.phone || '');
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
    try {
      const r = await fetch('/api/payments/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, type: 'exam', details: `${title} Certificate Exam Access`, amount: price })
      });
      if (r.ok) { onToast(`Payment of INR ${price} successful. "${title}" exam unlocked.`, 'success'); fetchDashboardStats(); }
    } catch {}
  };

  const isUnlocked = (courseId: string) => {
    if (currentUser.plan === 'pro' || currentUser.plan === 'popular') return true;
    const details = `${courses.find(c => c.id === courseId)?.title} Certificate Exam Access`;
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
    { id: 'resources', icon: <BookOpen className="w-[18px] h-[18px]" />, label: 'Courses' },
    { id: 'exams', icon: <FileSpreadsheet className="w-[18px] h-[18px]" />, label: 'Exams' },
    { id: 'certificates', icon: <Award className="w-[18px] h-[18px]" />, label: 'Certificates' },
    { id: 'payments', icon: <CreditCard className="w-[18px] h-[18px]" />, label: 'Billing' },
    { id: 'profile', icon: <Settings className="w-[18px] h-[18px]" />, label: 'Profile' },
  ];

  const totalLectures = courses.reduce((s, c) => s + c.lectures.length, 0);
  const totalCompleted = (Object.values(completedLectures) as string[][]).reduce((s, arr) => s + arr.length, 0);
  const overallProgress = totalLectures > 0 ? Math.round((totalCompleted / totalLectures) * 100) : 0;

  return (
    <div className={`h-screen overflow-hidden flex ${dm ? 'bg-[#0d1117] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

      {/* ═══════════════════ SIDEBAR ═══════════════════ */}
      <aside className={`w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'}`}>
        {/* Brand */}
        <div className={`h-14 flex items-center gap-2.5 px-5 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className={`font-bold text-[15px] tracking-tight ${textPrimary}`}>SkillVerse</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-widest ${textMuted}`}>Menu</p>
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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

        {/* Plan info */}
        <div className={`mx-3 mb-3 p-3 rounded-lg border ${dm ? 'border-[#30363d] bg-[#0d1117]' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold truncate ${textPrimary}`}>{currentUser.name}</p>
              <p className={`text-[10px] capitalize ${textMuted}`}>{currentUser.plan} plan</p>
            </div>
          </div>
          {currentUser.plan === 'free' && (
            <button onClick={onUpgradePlan} className="w-full py-1.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition-colors mb-2">
              Upgrade Plan
            </button>
          )}
          {onLogout && (
            <button onClick={onLogout} className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border text-[11px] font-semibold transition-colors ${dm ? 'border-[#30363d] text-red-400 hover:bg-red-500/10' : 'border-gray-200 text-red-600 hover:bg-red-50'}`}>
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          )}
        </div>
      </aside>

      {/* ═══════════════════ MAIN ═══════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top Bar */}
        <header className={`h-14 shrink-0 flex items-center justify-between px-6 border-b ${dm ? 'bg-[#161b22]/80 border-[#30363d]' : 'bg-white/80 border-gray-200'} backdrop-blur-sm sticky top-0 z-10`}>
          <h2 className={`text-sm font-semibold ${textPrimary}`}>
            {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors relative`}>
              <Bell className="w-4 h-4 text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">
            <AnimatePresence>

              {/* ═══ OVERVIEW ═══ */}
              {activeTab === 'home' && (
                <motion.div key="home">
                  {/* Greeting */}
                  <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>Welcome back, {currentUser.name}</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>Here is your learning overview and recent activity.</p>
                  </div>

                  {/* Stat cards row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
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
                          const purchased = courses.filter(c => isUnlocked(c.id));
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
                            const unlocked = isUnlocked(c.id);
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
                      const unlocked = isUnlocked(c.id);
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
                                <span className={`inline-block text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border transition-colors ${dm ? 'text-blue-400 bg-blue-900/30 border-blue-800/50' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                  {c.category} Domain
                                </span>
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
                      const unlocked = isUnlocked(c.id);
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
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                              dm ? 'text-blue-400 bg-blue-900/30 border-blue-800/50' : 'text-blue-600 bg-blue-50 border-blue-100'
                            }`}>
                              {c.category}
                            </span>
                            
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
                                onClick={() => handleSimulatedPayment(c.id, c.title, c.examPrice)}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                                  dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <Lock className="w-3.5 h-3.5" /> Unlock Exam &mdash; &#8377;{c.examPrice}
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
                            <PremiumCertificate certificate={cert} darkMode={false} />
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

                        </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ═══ COURSE DETAIL PAGE (Premium Stitch Design) ═══ */}
      <AnimatePresence>
        {selectedCourse && (() => {
          const sc = selectedCourse;
          const scUnlocked = isUnlocked(sc.id);
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

                    {/* ▸ Curriculum */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <div className={bentoTile}>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className={`text-2xl font-semibold ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>Curriculum</h2>
                          <div className="flex items-center gap-4 w-1/3">
                            <span className={`text-[11px] font-medium whitespace-nowrap ${dm ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{scProg}% Complete</span>
                            <div className={`h-2 w-full rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-blue-100'}`}>
                              <div className={`h-full rounded-full transition-all duration-500 ${scProg === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${scProg}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {sc.lectures.map((l, qi) => {
                            const isDone = scCompleted.includes(l.title);
                            return (
                              <div key={qi} className={`flex items-center justify-between p-4 rounded-lg transition-all group/row cursor-pointer border border-transparent ${dm ? 'hover:bg-white/[0.03] hover:border-slate-700/50' : 'hover:bg-blue-50/30 hover:border-blue-100'}`}>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => setWatchingLecture({ courseId: sc.id, courseTitle: sc.title, title: l.title, videoId: l.videoId })}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                      isDone
                                        ? (dm ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                        : (dm ? 'bg-slate-800 text-slate-400 group-hover/row:bg-blue-600/20 group-hover/row:text-blue-400' : 'bg-slate-100 text-slate-400 group-hover/row:bg-blue-100 group-hover/row:text-blue-600')
                                    }`}
                                  >
                                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                  </button>
                                  <div>
                                    <h3 className={`text-sm font-semibold transition-colors ${isDone ? (dm ? 'text-slate-500 line-through' : 'text-slate-400 line-through') : textPrimary} group-hover/row:text-blue-500`} style={{ fontFamily: 'Inter, sans-serif' }}>
                                      {qi + 1}. {l.title}
                                    </h3>
                                    <p className={`text-[11px] mt-0.5 ${dm ? 'text-slate-600' : 'text-slate-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>Video Lecture</p>
                                  </div>
                                </div>
                                <button onClick={() => toggleLectureCompleted(sc.id, l.title)} className={isDone ? 'text-emerald-500' : (dm ? 'text-slate-600' : 'text-slate-300')}>
                                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <div className={`w-5 h-5 rounded-full border-2 ${dm ? 'border-slate-600' : 'border-slate-300'}`} />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>

                    {/* ▸ Notes & Resources — Glass Cards */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <h2 className={`text-2xl font-semibold mb-6 ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>Notes & Resources</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: <Download className="w-5 h-5" />, title: 'Course Notes (PDF)', sub: 'Downloadable modules', color: dm ? 'text-blue-400' : 'text-blue-600', bg: dm ? 'bg-blue-500/10' : 'bg-blue-50', action: () => onToast(`Downloading notes for "${sc.title}"...`, 'success') },
                          { icon: <FileText className="w-5 h-5" />, title: 'Practice MCQs', sub: 'Interactive quizzes', color: dm ? 'text-violet-400' : 'text-violet-600', bg: dm ? 'bg-violet-500/10' : 'bg-violet-50', action: () => onToast(`Practice questions for "${sc.title}" saved.`, 'success') },
                          { icon: <FileSpreadsheet className="w-5 h-5" />, title: 'Lab Assignments', sub: `${sc.assignments?.length || 0} tasks available`, color: dm ? 'text-emerald-400' : 'text-emerald-600', bg: dm ? 'bg-emerald-500/10' : 'bg-emerald-50', action: () => onToast('Assignment section coming soon!', 'ref') },
                          { icon: <Star className="w-5 h-5" />, title: 'Formula Cheat Sheet', sub: 'Quick reference guide', color: dm ? 'text-amber-400' : 'text-amber-600', bg: dm ? 'bg-amber-500/10' : 'bg-amber-50', action: () => onToast('Cheat sheet downloaded!', 'success') },
                        ].map((r, idx) => (
                          <button
                            key={idx}
                            onClick={r.action}
                            className={`${glassPanel} p-6 rounded-xl flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left w-full`}
                          >
                            <div className={`p-3 ${r.bg} ${r.color} rounded-lg shrink-0`}>{r.icon}</div>
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
                          <button onClick={() => { onStartExam(sc.id, sc.title); setSelectedCourse(null); }} className="relative z-10 px-8 py-3.5 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Play className="w-4 h-4" /> Start Exam
                          </button>
                        ) : (
                          <button onClick={() => handleSimulatedPayment(sc.id, sc.title, sc.examPrice)} className="relative z-10 px-8 py-3.5 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Lock className="w-4 h-4" /> Unlock Exam &mdash; &#8377;{sc.examPrice}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* RIGHT COLUMN — Premium Sticky Enrollment Card */}
                  <div className="lg:col-span-4 relative">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="lg:sticky lg:top-24">
                      <div className={`${bentoTile} ${premiumShadow} flex flex-col gap-6`}>
                        {/* Video Thumbnail Preview */}
                        <div className="w-full aspect-video rounded-lg overflow-hidden relative group cursor-pointer"
                             onClick={() => { if (sc.lectures.length > 0) setWatchingLecture({ courseId: sc.id, courseTitle: sc.title, title: sc.lectures[0].title, videoId: sc.lectures[0].videoId }); }}>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-blue-600 shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                              <Play className="w-8 h-8" />
                            </div>
                          </div>
                          <img src={heroImg} alt={sc.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Pricing */}
                        <div>
                          <div className="flex items-baseline gap-3 mb-1">
                            <span className={`text-5xl font-bold ${textPrimary}`} style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>&#8377;{sc.examPrice}</span>
                            {sc.discountPrice && <span className={`text-lg line-through ${dm ? 'text-slate-600' : 'text-slate-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>&#8377;{sc.discountPrice}</span>}
                          </div>
                          <p className="text-xs font-medium text-red-500" style={{ fontFamily: 'Inter, sans-serif' }}>Limited time offer</p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3">
                          {scUnlocked ? (
                            <button onClick={() => { onStartExam(sc.id, sc.title); setSelectedCourse(null); }} className="w-full py-4 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Start Exam Now <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleSimulatedPayment(sc.id, sc.title, sc.examPrice)} className="w-full py-4 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              Enroll Now <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => { if (sc.lectures.length > 0) setWatchingLecture({ courseId: sc.id, courseTitle: sc.title, title: sc.lectures[0].title, videoId: sc.lectures[0].videoId }); }}
                            className={`w-full py-4 border-2 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${dm ? 'border-slate-700 text-blue-400 hover:bg-slate-800' : 'border-slate-200 text-blue-600 hover:bg-slate-50'}`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Preview Sample
                          </button>
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
                            <p className={`text-sm font-semibold ${textPrimary}`} style={{ fontFamily: 'Inter, sans-serif' }}>{sc.instructorName || 'SkillVerse Team'}</p>
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
                <iframe title={watchingLecture.title} src={`https://www.youtube.com/embed/${watchingLecture.videoId}?autoplay=1&modestbranding=1&rel=0`} className="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
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
              <PremiumCertificate certificate={activeCertificatePreview} darkMode={darkMode} />
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
                <PremiumCertificate certificate={activeCertificatePreview} darkMode={false} />
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

    </div>
  );
}
