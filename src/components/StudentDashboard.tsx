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
  BarChart3, Bell, Search, Menu, Crown, Flame, Target, ArrowUpRight,
  Calendar, Download, ExternalLink, Settings, LogOut, CreditCard, Shield
} from 'lucide-react';
import { Course, Certificate, ExamAttempt, Payment, User as UserType } from '../types';
import { PremiumCertificate } from './PremiumCertificate';

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
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } }
  };

  const navItems: { id: typeof activeTab; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: 'Overview' },
    { id: 'resources', icon: <BookOpen className="w-[18px] h-[18px]" />, label: 'My Courses' },
    { id: 'exams', icon: <FileSpreadsheet className="w-[18px] h-[18px]" />, label: 'Exams' },
    { id: 'certificates', icon: <Award className="w-[18px] h-[18px]" />, label: 'Certificates' },
    { id: 'payments', icon: <CreditCard className="w-[18px] h-[18px]" />, label: 'Billing' },
    { id: 'profile', icon: <Settings className="w-[18px] h-[18px]" />, label: 'Profile' },
  ];

  const totalLectures = courses.reduce((s, c) => s + c.lectures.length, 0);
  const totalCompleted = (Object.values(completedLectures) as string[][]).reduce((s, arr) => s + arr.length, 0);
  const overallProgress = totalLectures > 0 ? Math.round((totalCompleted / totalLectures) * 100) : 0;

  return (
    <div className={`min-h-screen flex ${dm ? 'bg-[#0d1117] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

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
            <AnimatePresence mode="wait">

              {/* ═══ OVERVIEW ═══ */}
              {activeTab === 'home' && (
                <motion.div key="home" variants={tabAnim} initial="hidden" animate="visible" exit="exit">
                  {/* Greeting */}
                  <div className="mb-6">
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
                      <div key={i} className={`${cardCls} border rounded-xl p-4`}>
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
                    <div className={`rounded-xl p-4 mb-6 flex items-center justify-between gap-4 border ${dm ? 'bg-blue-500/8 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
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

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Continue learning — takes 3 cols */}
                    <div className={`lg:col-span-3 ${cardCls} border rounded-xl`}>
                      <div className={`flex items-center justify-between px-5 py-3 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                        <h3 className={`text-sm font-semibold ${textPrimary}`}>Continue Learning</h3>
                        <button onClick={() => setActiveTab('resources')} className="text-xs text-blue-500 font-medium hover:underline">View all</button>
                      </div>
                      <div className="divide-y divide-inherit">
                        {courses.map((c) => {
                          const prog = getProgress(c.id);
                          const done = (completedLectures[c.id] || []).length;
                          return (
                            <div key={c.id} className={`flex items-center gap-4 px-5 py-3.5 ${hoverRow} transition-colors cursor-pointer`} onClick={() => setActiveTab('resources')}>
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
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
                        })}
                      </div>
                    </div>

                    {/* Right sidebar — 2 cols */}
                    <div className="lg:col-span-2 space-y-6">
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
                <motion.div key="resources" variants={tabAnim} initial="hidden" animate="visible" exit="exit">
                  <div className="mb-5">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>My Courses</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>Access lectures, study materials, and practice exams.</p>
                  </div>

                  <div className="space-y-5">
                    {courses.map((c) => {
                      const unlocked = isUnlocked(c.id);
                      const completed = completedLectures[c.id] || [];
                      const prog = getProgress(c.id);
                      return (
                        <div key={c.id} className={`${cardCls} border rounded-xl overflow-hidden`}>
                          {/* Course header bar */}
                          <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                                <BookOpen className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <h3 className={`text-sm font-semibold truncate ${textPrimary}`}>{c.title}</h3>
                                <p className={`text-[11px] ${textMuted}`}>{c.category} &middot; {c.lectures.length} lectures &middot; {c.durationMins} min exam</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <p className={`text-sm font-bold ${prog === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>{prog}%</p>
                                <p className={`text-[10px] ${textMuted}`}>{completed.length}/{c.lectures.length} done</p>
                              </div>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] ${prog === 100 ? 'border-emerald-500' : 'border-blue-500'}`}>
                                <span className={`text-[10px] font-bold ${prog === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>{prog}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar full width */}
                          <div className={`h-1 ${dm ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <div className={`h-full transition-all duration-500 ${prog === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${prog}%` }} />
                          </div>

                          {/* Lectures grid */}
                          <div className="px-5 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                              {c.lectures.map((l, qi) => {
                                const isDone = completed.includes(l.title);
                                return (
                                  <div key={qi} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${dm ? 'bg-[#0d1117] hover:bg-[#1a2030]' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                                    <button onClick={() => toggleLectureCompleted(c.id, l.title)} className={`shrink-0 ${isDone ? 'text-emerald-500' : textMuted}`}>
                                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <div className={`w-4 h-4 rounded-full border-2 ${dm ? 'border-gray-600' : 'border-gray-300'}`} />}
                                    </button>
                                    <button
                                      onClick={() => setWatchingLecture({ courseId: c.id, courseTitle: c.title, title: l.title, videoId: l.videoId })}
                                      className={`flex-1 text-left text-xs font-medium truncate ${isDone ? (dm ? 'text-gray-500 line-through' : 'text-gray-400 line-through') : textPrimary} hover:text-blue-500 transition-colors`}
                                    >
                                      {qi + 1}. {l.title}
                                    </button>
                                    <button onClick={() => setWatchingLecture({ courseId: c.id, courseTitle: c.title, title: l.title, videoId: l.videoId })} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                                      <Play className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button onClick={() => onToast(`Downloading notes for "${c.title}"...`, 'success')} className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${dm ? 'border-[#30363d] text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <Download className="w-3.5 h-3.5" /> Notes PDF
                              </button>
                              <button onClick={() => onToast(`Practice questions for "${c.title}" saved.`, 'success')} className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${dm ? 'border-[#30363d] text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <FileText className="w-3.5 h-3.5" /> Practice MCQs
                              </button>
                              <div className="flex-1" />
                              {unlocked ? (
                                <button onClick={() => onStartExam(c.id, c.title)} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                                  Take Exam
                                </button>
                              ) : (
                                <button onClick={() => handleSimulatedPayment(c.id, c.title, c.examPrice)} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                                  Unlock Exam &mdash; INR {c.examPrice}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ═══ EXAMS ═══ */}
              {activeTab === 'exams' && (
                <motion.div key="exams" variants={tabAnim} initial="hidden" animate="visible" exit="exit">
                  <div className="mb-5">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>Exams &amp; Certifications</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>Track your exam attempts and unlock new certifications.</p>
                  </div>

                  <div className={`${cardCls} border rounded-xl overflow-hidden`}>
                    <table className="w-full text-left">
                      <thead>
                        <tr className={`text-[11px] font-semibold uppercase tracking-wider ${dm ? 'text-gray-500 border-b border-[#30363d] bg-[#0d1117]' : 'text-gray-400 border-b border-gray-200 bg-gray-50'}`}>
                          <th className="px-5 py-3">Course</th>
                          <th className="px-5 py-3">Progress</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Pass Rate</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${dm ? 'divide-[#30363d]' : 'divide-gray-100'}`}>
                        {courses.map(c => {
                          const attempt = stats.attempts.find(a => a.courseId === c.id);
                          const unlocked = isUnlocked(c.id);
                          const prog = getProgress(c.id);
                          return (
                            <tr key={c.id} className={`${hoverRow} transition-colors`}>
                              <td className="px-5 py-3.5">
                                <p className={`text-sm font-medium ${textPrimary}`}>{c.title}</p>
                                <p className={`text-[11px] ${textMuted}`}>{c.category} &middot; {c.questionsCount} questions &middot; {c.durationMins} min</p>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-16 h-1.5 rounded-full ${dm ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div className={`h-full rounded-full ${prog === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${prog}%` }} />
                                  </div>
                                  <span className={`text-[11px] font-medium ${textMuted}`}>{prog}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                {attempt ? (
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${attempt.status === 'passed' ? (dm ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (dm ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600')}`}>
                                    {attempt.status === 'passed' ? 'Passed' : 'Failed'} &mdash; {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                                  </span>
                                ) : unlocked ? (
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${dm ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>Ready</span>
                                ) : (
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${dm ? 'bg-gray-500/15 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>Locked</span>
                                )}
                              </td>
                              <td className={`px-5 py-3.5 text-xs font-medium ${textSecondary}`}>{c.passPercentage}%</td>
                              <td className="px-5 py-3.5 text-right">
                                {unlocked ? (
                                  <button onClick={() => onStartExam(c.id, c.title)} className="px-3 py-1 rounded-md bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition-colors">
                                    {attempt?.status === 'failed' ? 'Retry' : attempt ? 'Review' : 'Start'}
                                  </button>
                                ) : (
                                  <button onClick={() => handleSimulatedPayment(c.id, c.title, c.examPrice)} className={`px-3 py-1 rounded-md border text-[11px] font-semibold transition-colors ${dm ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                                    Unlock &mdash; INR {c.examPrice}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* ═══ CERTIFICATES ═══ */}
              {activeTab === 'certificates' && (
                <motion.div key="certs" variants={tabAnim} initial="hidden" animate="visible" exit="exit">
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
                <motion.div key="billing" variants={tabAnim} initial="hidden" animate="visible" exit="exit">
                  <div className="mb-5">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>Billing &amp; Payments</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>View all your transactions and purchase history.</p>
                  </div>

                  <div className={`${cardCls} border rounded-xl overflow-hidden`}>
                    {stats.payments.length === 0 ? (
                      <div className="p-12 text-center">
                        <CreditCard className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
                        <p className={`text-sm font-medium ${textSecondary}`}>No transactions found.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className={`text-[11px] font-semibold uppercase tracking-wider ${dm ? 'text-gray-500 border-b border-[#30363d] bg-[#0d1117]' : 'text-gray-400 border-b border-gray-200 bg-gray-50'}`}>
                            <th className="px-5 py-3">Description</th>
                            <th className="px-5 py-3">Reference</th>
                            <th className="px-5 py-3">Amount</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${dm ? 'divide-[#30363d]' : 'divide-gray-100'}`}>
                          {stats.payments.map(p => (
                            <tr key={p.id} className={`${hoverRow} transition-colors`}>
                              <td className={`px-5 py-3 text-sm font-medium ${textPrimary}`}>{p.details}</td>
                              <td className={`px-5 py-3 text-xs font-mono ${textMuted}`}>{p.gatewayRef}</td>
                              <td className="px-5 py-3 text-sm font-semibold text-blue-500">INR {p.amount}</td>
                              <td className="px-5 py-3">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'success' ? (dm ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (dm ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600')}`}>
                                  {p.status === 'success' ? 'Paid' : 'Failed'}
                                </span>
                              </td>
                              <td className={`px-5 py-3 text-xs ${textMuted}`}>{new Date(p.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ═══ SETTINGS ═══ */}
              {activeTab === 'profile' && (
                <motion.div key="profile" variants={tabAnim} initial="hidden" animate="visible" exit="exit" className="max-w-2xl">
                  <div className="mb-5">
                    <h1 className={`text-xl font-bold ${textPrimary}`}>Account Settings</h1>
                    <p className={`text-sm mt-0.5 ${textSecondary}`}>Manage your profile and account preferences.</p>
                  </div>

                  {/* Profile card */}
                  <div className={`${cardCls} border rounded-xl mb-5`}>
                    <div className={`px-5 py-3 border-b ${dm ? 'border-[#30363d]' : 'border-gray-200'}`}>
                      <h3 className={`text-sm font-semibold ${textPrimary}`}>Profile</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                          {currentUser.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-base font-semibold ${textPrimary}`}>{currentUser.name}</p>
                          <p className={`text-sm ${textSecondary}`}>{currentUser.email}</p>
                        </div>
                      </div>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Full Name</label>
                          <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} required />
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Phone Number</label>
                          <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="+91 00000 00000" className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${inputCls}`} />
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>Subscription</label>
                          <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${dm ? 'border-[#30363d] bg-[#0d1117]' : 'border-gray-200 bg-gray-50'}`}>
                            <span className={`text-sm font-medium capitalize ${textPrimary}`}>{currentUser.plan} Plan</span>
                            <button type="button" onClick={onUpgradePlan} className="text-xs font-semibold text-blue-500 hover:underline">Change</button>
                          </div>
                        </div>
                        <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                          Save Changes
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>

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
    </div>
  );
}
