
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, GraduationCap, FileSpreadsheet, Award, CreditCard, Tag, RefreshCw, Search, ShieldCheck, AlertOctagon, CheckCircle2, Lock, Plus, Trash2, Calendar, TrendingUp, Sparkles, Activity, AlertTriangle, CheckCircle, Info, BookOpen, Upload, BarChart3, UserCog, LogOut, Bell, ChevronDown } from 'lucide-react';
import { Course, User, Certificate, Coupon } from '../../types';
import { clearAuth } from '../../lib/auth';
import { StaffChatWidget } from '../chat/StaffChatWidget';

interface AdminPortalProps {
  currentUser: User;
  courses: Course[];
  darkMode: boolean;
  onRefreshCourses: () => void;
  onToast: (msg: string, type: 'success' | 'ref') => void;
  initialTab?: 'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile' | 'support';
  onTabChange?: (tab: 'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile' | 'support') => void;
}

export function AdminPortal({
  currentUser,
  courses,
  darkMode,
  onRefreshCourses,
  onToast,
  initialTab,
  onTabChange
}: AdminPortalProps) {
  const [activeTab, setActiveTabState] = useState<'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile' | 'support'>(initialTab || 'overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const setActiveTab = (tab: 'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile' | 'support') => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  const hasPermission = (permission: string) => {
    if (currentUser.role === 'super_admin') return true;
    return currentUser.role === 'admin' && (currentUser.permissions || []).includes(permission);
  };

  // Simulated server states
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  // Search filter hooks
  const [studentsQuery, setStudentsQuery] = useState('');
  const [certQuery, setCertQuery] = useState('');

  // Course management states inside Admin Portal
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Tech' as 'Tech' | 'Business',
    description: '',
    examPrice: 99,
    discountPrice: 49,
    instructorName: '',
    thumbnailUrl: '',
    bannerUrl: '',
    active: true,
    durationMins: 60,
    passPercentage: 75,
    notesUrl: '#',
    lecturesText: '[]',
    assignmentsText: '[]',
    quizzesText: '[]'
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingCourseLecturesText, setEditingCourseLecturesText] = useState('[]');
  const [editingCourseAssignmentsText, setEditingCourseAssignmentsText] = useState('[]');
  const [editingCourseQuizzesText, setEditingCourseQuizzesText] = useState('[]');

  // Profile forms details settings inside Admin Portal
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  // Notifications system state
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [systemAlerts, setSystemAlerts] = useState<any[]>([
    { id: 'not-1', title: 'System Engine Sync', message: 'All assessment servers have completed syncing hashes with standard IIT ledger nodes.', timestamp: '2026-06-01' },
    { id: 'not-2', title: 'Enrollment gateway expanded', message: 'Razorpay testing webhooks have been updated with zero failure logs.', timestamp: '2026-05-30' }
  ]);

  // Creation forms states
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 10, type: 'percentage', maxUses: 100, expiry: '2026-12-31' });
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [courseQuestions, setCourseQuestions] = useState<any[]>([]);
  const [newQ, setNewQ] = useState({ question: '', optA: '', optB: '', optC: '', optD: '', correctIdx: 0 });

  const [headerMenuOpen, setHeaderMenuOpen] = useState<'none' | 'notifications' | 'profile'>('none');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      const usersRes = await fetch('/api/admin/users');
      const cpnsRes = await fetch('/api/admin/coupons');
      const tcktsRes = await fetch('/api/support/tickets');

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setStudents(await usersRes.json());
      if (cpnsRes.ok) setCoupons(await cpnsRes.json());
      if (tcktsRes.ok) setSupportTickets(await tcktsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (cId: string) => {
    try {
      const res = await fetch(`/api/courses/${cId}/questions`);
      if (res.ok) {
        setCourseQuestions(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchQuestions(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        onToast(`Promotional Coupon "${newCoupon.code.toUpperCase()}" created successfully!`, 'success');
        setNewCoupon({ code: '', discount: 10, type: 'percentage', maxUses: 100, expiry: '2026-12-31' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCoupon = async (cpnId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${cpnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });
      if (res.ok) {
        onToast(`Coupon changed to ${!currentActive ? 'Active' : 'Inactive'}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.question.trim() || !newQ.optA || !newQ.optB) {
      onToast('Provide a question and at least 2 options.', 'ref');
      return;
    }

    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQ.question,
          options: [newQ.optA, newQ.optB, newQ.optC || '', newQ.optD || ''].filter(Boolean),
          correctOptionIndex: Number(newQ.correctIdx)
        })
      });
      if (res.ok) {
        onToast('Exam MCQ Question listed successfully!', 'success');
        setNewQ({ question: '', optA: '', optB: '', optC: '', optD: '', correctIdx: 0 });
        fetchQuestions(selectedCourseId);
        onRefreshCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      const res = await fetch(`/api/questions/${qId}`, { method: 'DELETE' });
      if (res.ok) {
        onToast('Question removed from assessment curriculum.', 'success');
        fetchQuestions(selectedCourseId);
        onRefreshCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeCertificate = async (id: string) => {
    try {
      const res = await fetch('/api/admin/certificates/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId: id })
      });
      if (res.ok) {
        onToast(`Certificate ID: ${id} Revoked. Check verification banner details.`, 'ref');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReissueCertificate = async (id: string) => {
    try {
      const res = await fetch('/api/admin/certificates/reissue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId: id })
      });
      if (res.ok) {
        onToast(`Certificate ID: ${id} Re-issued with active ledger status!`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserPlan = async (studentId: string, currentPlan: string) => {
    const nextPlan = currentPlan === 'pro' ? 'free' : 'pro';
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentId, plan: nextPlan })
      });
      if (res.ok) {
        onToast(`User profile upgraded to ${nextPlan.toUpperCase()} successfully.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = {
        userId: currentUser.id,
        name: profileName,
        phone: profilePhone
      };
      if (profilePassword.trim()) {
        body.password = profilePassword;
      }
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        onToast('Administrative profile synced successfully!', 'success');
        setProfilePassword('');
      } else {
        onToast(data.message || 'Profile save failed.', 'ref');
      }
    } catch (err) {
      console.error(err);
      onToast('Network connection failed.', 'ref');
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyMsg.trim()) {
      onToast('Both title and message are required for notification.', 'ref');
      return;
    }
    const alertItem = {
      id: `not-${Date.now()}`,
      title: notifyTitle,
      message: notifyMsg,
      timestamp: new Date().toISOString().split('T')[0]
    };
    setSystemAlerts([alertItem, ...systemAlerts]);
    onToast(`Notification broadcasted: ${notifyTitle}`, 'success');
    setNotifyTitle('');
    setNotifyMsg('');
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim()) {
      onToast('Course title is required.', 'ref');
      return;
    }

    try {
      let lcts = [];
      try { lcts = JSON.parse(newCourse.lecturesText || '[]'); } catch (e) {
        onToast('Lectures list must be valid JSON format!', 'ref');
        return;
      }
      let asts = [];
      try { asts = JSON.parse(newCourse.assignmentsText || '[]'); } catch (e) {
        onToast('Assignments list must be valid JSON format!', 'ref');
        return;
      }
      let qzs = [];
      try { qzs = JSON.parse(newCourse.quizzesText || '[]'); } catch (e) {
        onToast('Quizzes list must be valid JSON format!', 'ref');
        return;
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCourse,
          lectures: lcts,
          assignments: asts,
          quizzes: qzs
        })
      });

      if (res.ok) {
        onToast(`Course: "${newCourse.title}" published successfully!`, 'success');
        setShowAddCourse(false);
        setNewCourse({
          title: '',
          category: 'Tech',
          description: '',
          examPrice: 99,
          discountPrice: 49,
          instructorName: '',
          thumbnailUrl: '',
          bannerUrl: '',
          active: true,
          durationMins: 60,
          passPercentage: 75,
          notesUrl: '#',
          lecturesText: '[]',
          assignmentsText: '[]',
          quizzesText: '[]'
        });
        onRefreshCourses();
      } else {
        onToast('Server error while saving newly proposed course.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCourseEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      let lcts = [];
      try { lcts = JSON.parse(editingCourseLecturesText || '[]'); } catch (e) {
        onToast('Lectures array must be valid JSON format!', 'ref');
        return;
      }
      let asts = [];
      try { asts = JSON.parse(editingCourseAssignmentsText || '[]'); } catch (e) {
        onToast('Assignments array must be valid JSON format!', 'ref');
        return;
      }
      let qzs = [];
      try { qzs = JSON.parse(editingCourseQuizzesText || '[]'); } catch (e) {
        onToast('Quizzes array must be valid JSON format!', 'ref');
        return;
      }

      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingCourse,
          lectures: lcts,
          assignments: asts,
          quizzes: qzs
        })
      });

      if (res.ok) {
        onToast(`Changes for ${editingCourse.title} submitted successfully!`, 'success');
        setEditingCourse(null);
        onRefreshCourses();
      } else {
        onToast('Failed to apply course edits.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center py-20 justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-4 border-slate-300 border-t-blue-500 animate-spin" />
        <span className="text-xs text-slate-400">Syncing administrative records...</span>
      </div>
    );
  }

  // Filters students and certificates
  const filteredStudents = students.filter(
    (s) =>
      s.role === 'student' &&
      (s.name.toLowerCase().includes(studentsQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(studentsQuery.toLowerCase()))
  );

  return (
    <div className={`h-screen overflow-hidden flex ${darkMode ? 'bg-[#0d1117] text-white' : 'bg-gray-50 text-slate-800'}`}>

      {/* 1. ADMIN PANEL MENU */}
      <aside className={`w-[260px] shrink-0 h-screen sticky top-0 flex flex-col border-r overflow-y-auto no-scrollbar ${darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`}>
        <div className="p-6 space-y-6 pb-10">
        {/* Brand/User Card */}
        <div className={`p-5 mt-2 rounded-[1.5rem] border flex flex-col items-start justify-center relative overflow-hidden transition-all duration-500 group ${darkMode
          ? 'bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
          : 'bg-gradient-to-br from-white via-slate-50 to-purple-50/50 border-slate-200/80 shadow-[0_8px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.08)] hover:border-purple-200'
          }`}>
          {/* Animated Glows */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-2.5 py-1 mb-3 rounded-lg text-[9px] uppercase font-extrabold tracking-widest border transition-colors relative z-10 ${
            darkMode 
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 group-hover:bg-purple-500/20' 
              : 'bg-purple-50 text-purple-700 border-purple-200/60 group-hover:bg-purple-100'
          }`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
            </span>
            Admin Console
          </div>
          
          {/* User Name/Role */}
          <h4 className={`font-black text-[17px] tracking-tight relative z-10 leading-snug transition-colors ${
            darkMode ? 'text-white group-hover:text-purple-100' : 'text-slate-800 group-hover:text-slate-900'
          }`}>
            {currentUser.name}
          </h4>
        </div>

        {/* Menu Buttons */}
        <div className="flex flex-col space-y-2">
          <MenuBtn darkMode={darkMode} active={activeTab === 'overview'} icon={<LayoutDashboard />} label="Consolidated Overview" onClick={() => setActiveTab('overview')} />
          {hasPermission('courses') && (
            <MenuBtn darkMode={darkMode} active={activeTab === 'courses'} icon={<GraduationCap />} label="Course Management" onClick={() => setActiveTab('courses')} />
          )}
          {hasPermission('students') && (
            <MenuBtn darkMode={darkMode} active={activeTab === 'students'} icon={<Users />} label="Manage Students" onClick={() => setActiveTab('students')} />
          )}
          {hasPermission('exams') && (
            <MenuBtn darkMode={darkMode} active={activeTab === 'exams'} icon={<FileSpreadsheet />} label="Exams & Questions" onClick={() => setActiveTab('exams')} />
          )}
          {hasPermission('certificates') && (
            <MenuBtn darkMode={darkMode} active={activeTab === 'certificates'} icon={<Award />} label="Audit Certificates" onClick={() => setActiveTab('certificates')} />
          )}
          {hasPermission('coupons') && (
            <MenuBtn darkMode={darkMode} active={activeTab === 'coupons'} icon={<Tag />} label="Discounts & Coupons" onClick={() => setActiveTab('coupons')} />
          )}
          <MenuBtn darkMode={darkMode} active={activeTab === 'support'} icon={<AlertOctagon />} label="Support Tickets" onClick={() => setActiveTab('support')} />
          <MenuBtn darkMode={darkMode} active={activeTab === 'notifications'} icon={<Bell />} label="Notifications" onClick={() => setActiveTab('notifications')} />
          <MenuBtn darkMode={darkMode} active={activeTab === 'profile'} icon={<Lock />} label="Profile Settings" onClick={() => setActiveTab('profile')} />
          
          <div className="pt-4 mt-2 border-t border-slate-200 dark:border-white/10">
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm
                bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-md
                hover:-translate-y-0.5
              `}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <LogOut className="w-5 h-5" />
              Secure Log Out
            </button>
          </div>
        </div>
        </div>
      </aside>

      {/* 2. ADMIN PORTALS WORKSPACE */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className={`shrink-0 z-50 flex items-center justify-end px-8 py-4 border-b relative ${darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-6 relative z-50">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setHeaderMenuOpen(prev => prev === 'notifications' ? 'none' : 'notifications')}
                className={`relative p-2.5 rounded-full transition-all focus:outline-none ${darkMode ? 'text-slate-400 hover:text-white hover:bg-[#161b22]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} ${headerMenuOpen === 'notifications' ? (darkMode ? 'bg-[#161b22] text-white' : 'bg-slate-100 text-slate-900') : ''}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0d1117]"></span>
              </button>
              
              {/* Notifications Floating UI */}
              <div className={`absolute top-full right-0 mt-4 w-80 rounded-[1.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.12)] border p-5 transition-all duration-300 origin-top-right z-50 ${darkMode ? 'bg-[#161b22] border-[#30363d] shadow-black/50' : 'bg-white border-slate-200/80'} ${headerMenuOpen === 'notifications' ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-extrabold text-sm tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h4>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">2 New</span>
                </div>
                <div className="space-y-3">
                  {systemAlerts.slice(0, 2).map((alert, i) => (
                    <div key={alert.id} className={`p-3.5 rounded-2xl border transition-all hover:-translate-y-0.5 cursor-pointer ${darkMode ? 'bg-[#0d1117]/80 border-[#30363d] hover:border-blue-500/30' : 'bg-slate-50/50 border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <p className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{alert.title}</p>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">{alert.message}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-2">{alert.timestamp}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => { setHeaderMenuOpen('none'); setActiveTab('notifications'); }}
                  className="w-full mt-4 py-2.5 text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  View Activity Logs →
                </button>
              </div>
            </div>
            
            {/* Profile Element */}
            <div className="relative">
              <div 
                onClick={() => setHeaderMenuOpen(prev => prev === 'profile' ? 'none' : 'profile')}
                className={`flex items-center gap-3 pl-6 border-l cursor-pointer group transition-all ${darkMode ? 'border-[#30363d]' : 'border-slate-200'} ${headerMenuOpen === 'profile' ? 'opacity-80' : ''}`}
              >
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-bold leading-none transition-colors ${darkMode ? 'text-white' : 'text-slate-900'} group-hover:text-purple-500 dark:group-hover:text-purple-400`}>{currentUser.name}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-purple-500 mt-1">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-transparent group-hover:ring-purple-400/50 transition-all">
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${headerMenuOpen === 'profile' ? 'rotate-180 text-purple-500' : (darkMode ? 'text-slate-500 group-hover:translate-y-0.5' : 'text-slate-400 group-hover:translate-y-0.5')}`} />
              </div>
              
              {/* Profile Floating UI */}
              <div className={`absolute top-full right-0 mt-4 w-64 rounded-[1.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.12)] border p-2 transition-all duration-300 origin-top-right z-50 ${darkMode ? 'bg-[#161b22] border-[#30363d] shadow-black/50' : 'bg-white border-slate-200/80'} ${headerMenuOpen === 'profile' ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className={`px-4 py-3 border-b mb-2 ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className={`text-sm font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{currentUser.email || 'admin@skillverse.com'}</p>
                </div>
                
                <div className="space-y-1">
                  <button onClick={() => { setHeaderMenuOpen('none'); setActiveTab('profile'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${darkMode ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <UserCog className="w-4 h-4 text-purple-500" /> My Profile
                  </button>
                  <button onClick={() => { setHeaderMenuOpen('none'); setActiveTab('overview'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${darkMode ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <LayoutDashboard className="w-4 h-4 text-blue-500" /> View Dashboard
                  </button>
                  <button onClick={() => { setHeaderMenuOpen('none'); document.documentElement.classList.toggle('dark'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${darkMode ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <Sparkles className="w-4 h-4 text-yellow-500" /> Toggle Theme
                  </button>
                </div>
                
                <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <button onClick={() => window.location.href = '/'} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Invisible overlay to click-outside and close menu */}
          {headerMenuOpen !== 'none' && (
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setHeaderMenuOpen('none')} />
          )}
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 pb-20">

        {/* VIEW 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* ─── Greeting ─── */}
            <section>
              <h1 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {currentUser.name.split(' ')[0]}
                </span>
              </h1>
              <p className={`text-base mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                Here is what's happening with your courses today.
              </p>
            </section>

            {/* ─── Stat Cards ─── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassStatCard
                darkMode={darkMode}
                title="Total Students"
                value={stats.studentsCount.toString()}
                icon={<Users className="w-5 h-5" />}
                iconColor="text-purple-400"
                glowColor="bg-purple-500"
                badge="+12%"
                badgeColor="text-emerald-400 bg-emerald-400/10"
              />
              <GlassStatCard
                darkMode={darkMode}
                title="Monthly Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                icon={<CreditCard className="w-5 h-5" />}
                iconColor="text-emerald-400"
                glowColor="bg-emerald-500"
                badge="+8.4%"
                badgeColor="text-emerald-400 bg-emerald-400/10"
              />
              <GlassStatCard
                darkMode={darkMode}
                title="Active Courses"
                value={courses.length.toString()}
                icon={<Award className="w-5 h-5" />}
                iconColor="text-pink-400"
                glowColor="bg-pink-500"
                badge="Stable"
                badgeColor={darkMode ? 'text-slate-400 bg-slate-700' : 'text-slate-500 bg-slate-200'}
              />
              <GlassStatCard
                darkMode={darkMode}
                title="Avg Pass Rate"
                value="78%"
                icon={<TrendingUp className="w-5 h-5" />}
                iconColor="text-sky-400"
                glowColor="bg-sky-500"
                badge="-2.1%"
                badgeColor="text-red-400 bg-red-400/10"
              />
            </section>

            {/* ─── Revenue Chart + AI Insights ─── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Growth */}
              <div className={`lg:col-span-2 p-6 rounded-3xl border backdrop-blur-xl transition-colors ${darkMode
                ? 'bg-white/[0.03] border-white/[0.08]'
                : 'bg-white/90 border-slate-200 shadow-xl'
                }`}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Revenue Growth
                  </h2>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full">
                    +12.5% Growth
                  </span>
                </div>

                <div className="relative min-h-[280px] flex items-end justify-around gap-3 pt-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-full h-0 border-t ${darkMode ? 'border-white/[0.04]' : 'border-slate-100'}`} />
                    ))}
                  </div>

                  {/* Bars */}
                  {[
                    { month: 'Jan', height: 40, value: 8000 },
                    { month: 'Feb', height: 55, value: 11000 },
                    { month: 'Mar', height: 30, value: 6000 },
                    { month: 'Apr', height: 70, value: 14000 },
                    { month: 'May', height: 85, value: 17000 },
                    { month: 'Jun', height: 60, value: 12000 }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 relative z-10 group">
                      <div className="relative w-full max-w-[48px]">
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-20">
                          ₹{bar.value.toLocaleString()}
                        </div>
                        <div
                          style={{ height: `${bar.height * 2.8}px` }}
                          className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${i === 4
                            ? 'bg-gradient-to-t from-pink-600/30 to-pink-500 shadow-[0_8px_24px_rgba(236,72,153,0.3)]'
                            : 'bg-gradient-to-t from-purple-600/20 to-purple-500/80 hover:from-purple-500/40 hover:to-purple-400'
                            }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-around mt-4">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                    <span key={i} className={`text-xs font-semibold ${i === 4 ? 'text-pink-400' : darkMode ? 'text-slate-500' : 'text-slate-400'
                      }`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {month}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-colors flex flex-col justify-between ${darkMode
                ? 'bg-white/[0.03] border-white/[0.08]'
                : 'bg-white/90 border-slate-200 shadow-xl'
                }`}>
                <div>
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      AI Insights
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <InsightCard
                      darkMode={darkMode}
                      icon={<AlertTriangle className="w-5 h-5" />}
                      iconColor="text-amber-400"
                      bgColor="bg-amber-400/5"
                      borderColor="border-amber-400/10"
                      title="Engagement Drop"
                      desc="70% of students failed MCQ in Lecture 3 of AI & ML course."
                    />
                    <InsightCard
                      darkMode={darkMode}
                      icon={<CheckCircle className="w-5 h-5" />}
                      iconColor="text-emerald-400"
                      bgColor="bg-emerald-400/5"
                      borderColor="border-emerald-400/10"
                      title="High Retention"
                      desc="Your latest video 'Linear Regression' has 95% retention rate."
                    />
                    <InsightCard
                      darkMode={darkMode}
                      icon={<Info className="w-5 h-5" />}
                      iconColor="text-sky-400"
                      bgColor="bg-sky-400/5"
                      borderColor="border-sky-400/10"
                      title="Q&A Backlog"
                      desc="You have 12 unanswered doubts from students this week."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Recent Activity + Quick Actions ─── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Student Activity */}
              <div className={`lg:col-span-2 p-6 rounded-3xl border backdrop-blur-xl transition-colors ${darkMode
                ? 'bg-white/[0.03] border-white/[0.08]'
                : 'bg-white/90 border-slate-200 shadow-xl'
                }`}>
                <h2 className="text-xl font-bold tracking-tight mb-6 pb-4 border-b border-white/5 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <Activity className="w-5 h-5 text-purple-400" />
                  Recent Signups
                </h2>

                {/* Table Header */}
                <div className={`grid grid-cols-4 gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-white/[0.03] text-slate-500' : 'bg-slate-50 text-slate-400'
                  }`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span>Student</span>
                  <span>Email</span>
                  <span>Plan</span>
                  <span className="text-right">Action</span>
                </div>

                {/* Table Rows */}
                <div className="mt-2 space-y-1">
                  {stats.recentSignups.map((usr: any, idx: number) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-4 gap-4 px-4 py-3.5 rounded-xl text-sm transition-colors cursor-pointer ${darkMode
                        ? 'hover:bg-white/[0.03] text-slate-300'
                        : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      <span className="font-semibold truncate">{usr.name}</span>
                      <span className={`truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{usr.email}</span>
                      <span className={`font-semibold capitalize text-emerald-400`}>{usr.plan}</span>
                      <span className={`text-right text-xs font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Joined recently</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-colors ${darkMode
                ? 'bg-white/[0.03] border-white/[0.08]'
                : 'bg-white/90 border-slate-200 shadow-xl'
                }`}>
                <h2 className="text-xl font-bold tracking-tight mb-6 pb-4 border-b border-white/5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionBtn
                    darkMode={darkMode}
                    icon={<BookOpen className="w-5 h-5" />}
                    label="Create Course"
                    gradient="from-purple-600 to-pink-500"
                    onClick={() => setActiveTab('courses')}
                  />
                  <QuickActionBtn
                    darkMode={darkMode}
                    icon={<Upload className="w-5 h-5" />}
                    label="Questions"
                    gradient="from-blue-600 to-cyan-500"
                    onClick={() => setActiveTab('exams')}
                  />
                  <QuickActionBtn
                    darkMode={darkMode}
                    icon={<BarChart3 className="w-5 h-5" />}
                    label="Certificates"
                    gradient="from-emerald-600 to-teal-500"
                    onClick={() => setActiveTab('certificates')}
                  />
                  <QuickActionBtn
                    darkMode={darkMode}
                    icon={<UserCog className="w-5 h-5" />}
                    label="Students"
                    gradient="from-amber-600 to-orange-500"
                    onClick={() => setActiveTab('students')}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: MANAGE STUDENTS */}
        {activeTab === 'students' && hasPermission('students') && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Manage Student Profiles</h1>
              <p className="text-xs text-slate-400 mt-1">Audit student plans, Joined dates and apply administrative parameter overrides.</p>
            </div>

            {/* Search Input filter */}
            <div className="max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentsQuery}
                onChange={(e) => setStudentsQuery(e.target.value)}
                placeholder="Search students by name or email..."
                className={`w-full text-xs pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
              />
            </div>

            <div className={`rounded-2xl border overflow-hidden transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left font-sans">
                  <thead className={darkMode ? 'bg-slate-950/50 text-slate-400 text-xs' : 'bg-slate-50 text-slate-500 text-xs'}>
                    <tr className={`border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <th className="p-4 font-bold uppercase tracking-wider">Student Identity</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Current Plan Hierarchy</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Joined Date</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Administration Control</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'} font-medium`}>
                    {filteredStudents.map((stud) => (
                      <tr key={stud.id} className={`transition-colors ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                        <td className="p-4">
                          <span className={`font-bold block ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stud.name}</span>
                          <span className={`text-[11px] font-mono select-all block mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stud.email}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize border ${
                            stud.plan === 'pro' 
                              ? (darkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-100')
                              : (darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100')
                          }`}>
                            {stud.plan}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Calendar className="w-4 h-4" /> 
                            {stud.joinedDate}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleUserPlan(stud.id, stud.plan)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                              stud.plan === 'pro'
                                ? (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-md'
                            }`}
                          >
                            {stud.plan === 'pro' ? 'Downgrade to Free' : 'Grant PRO Upgrade'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: MANAGE EXAMS AND QUESTIONS */}
        {activeTab === 'exams' && hasPermission('exams') && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Curriculum MCQ Builder</h1>
              <p className="text-xs text-slate-400 mt-1">Audit, modify, and append interactive MCQ question matrices for each test catalog.</p>
            </div>

            {/* Course Selector box */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Select Exam Assessment</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className={`text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs font-mono font-bold text-blue-500">
                {courseQuestions.length} Seeded Questions
              </span>
            </div>

            {/* New Question creation Form */}
            <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5 border-b pb-2">
                <Plus className="w-4 h-4 text-blue-500" /> Create Custom exam MCQ
              </h3>

              <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs font-medium">
                <div className="space-y-1">
                  <label className="text-slate-400">MCQ Query Statement</label>
                  <input
                    type="text"
                    value={newQ.question}
                    onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                    placeholder="e.g. In React, what represents a Virtual DOM?"
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
                      }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400">Choice A (Index 0)</label>
                    <input
                      type="text"
                      value={newQ.optA}
                      onChange={(e) => setNewQ({ ...newQ, optA: e.target.value })}
                      placeholder="Choice A"
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
                        }`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Choice B (Index 1)</label>
                    <input
                      type="text"
                      value={newQ.optB}
                      onChange={(e) => setNewQ({ ...newQ, optB: e.target.value })}
                      placeholder="Choice B"
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
                        }`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Choice C (Index 2)</label>
                    <input
                      type="text"
                      value={newQ.optC}
                      onChange={(e) => setNewQ({ ...newQ, optC: e.target.value })}
                      placeholder="Choice C"
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
                        }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Choice D (Index 3)</label>
                    <input
                      type="text"
                      value={newQ.optD}
                      onChange={(e) => setNewQ({ ...newQ, optD: e.target.value })}
                      placeholder="Choice D"
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
                        }`}
                    />
                  </div>
                </div>

                <div className="space-y-1 max-w-xs">
                  <label className="text-slate-400">Correct Option index selector</label>
                  <select
                    value={newQ.correctIdx}
                    onChange={(e) => setNewQ({ ...newQ, correctIdx: Number(e.target.value) })}
                    className={`px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <option value="0">Choice A (Index 0)</option>
                    <option value="1">Choice B (Index 1)</option>
                    <option value="2">Choice C (Index 2)</option>
                    <option value="3">Choice D (Index 3)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 text-white text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 hover:scale-[1.03] active:scale-95 transition-all shadow-md"
                >
                  Compile MCQ Question
                </button>
              </form>
            </div>

            {/* Questions lists catalog deletion panel */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Curriculum audit</h4>
              {courseQuestions.map((q, idx) => (
                <div key={q.id} className={`p-4 rounded-xl border text-xs leading-relaxed flex justify-between gap-4 items-start ${darkMode ? 'bg-slate-905 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                  <div>
                    <strong className="text-slate-100 dark:text-white block font-bold">Q{idx + 1}. {q.question}</strong>
                    <div className="mt-1 flex flex-wrap gap-2 pt-1 font-medium text-[10px]">
                      {q.options.map((opt: string, oIdx: number) => (
                        <span key={oIdx} className={`p-0.5 px-2 rounded ${oIdx === q.correctOptionIndex ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'}`}>
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1 px-2.5 rounded border border-red-500/20 hover:bg-red-500/15 text-red-500"
                    title="Remove assessment question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* VIEW 4: AUDIT CERTIFICATES */}
        {activeTab === 'certificates' && hasPermission('certificates') && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">System Ledger Certificates</h1>
              <p className="text-xs text-slate-400 mt-1">Audit active credentials issued. Disable or renew status parameters on the system.</p>
            </div>

            <div className={`rounded-2xl border overflow-hidden transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left font-sans">
                  <thead className={darkMode ? 'bg-slate-950/50 text-slate-400 text-xs' : 'bg-slate-50 text-slate-500 text-xs'}>
                    <tr className={`border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <th className="p-4 font-bold uppercase tracking-wider">Student Name</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Credential Details</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Ledger Status</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Compliance Control</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'} font-medium`}>
                    {stats.recentCertificates.map((cert: any) => (
                      <tr key={cert.id} className={`transition-colors ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                        <td className={`p-4 font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {cert.userName}
                        </td>
                        <td className="p-4 leading-relaxed">
                          <span className={`font-bold block ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{cert.courseName}</span>
                          <span className={`text-[11px] font-mono select-all tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{cert.certificateId}</span>
                        </td>
                        <td className="p-4">
                          {cert.valid ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                              Valid Ledger Certified
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'}`}>
                              Revoked/Suspended
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {cert.valid ? (
                            <button
                              onClick={() => handleRevokeCertificate(cert.certificateId)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${darkMode ? 'bg-slate-800 text-red-400 hover:bg-slate-700 hover:text-red-300' : 'bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200'}`}
                            >
                              Revoke validation
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReissueCertificate(cert.certificateId)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 hover:shadow-md"
                            >
                              Re-issue valid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: DISCOUNTS AND COUPONS */}
        {activeTab === 'coupons' && hasPermission('coupons') && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Active Coupons & Discounts</h1>
              <p className="text-xs text-slate-400 mt-1">Design promotional coupons to motivate candidates to buy certified tests.</p>
            </div>

            {/* Create Coupon box */}
            <div className={`p-6 rounded-3xl border space-y-5 transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`font-extrabold text-sm flex items-center gap-2 pb-3 border-b ${darkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>
                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <Tag className="w-4 h-4 text-blue-500" /> 
                </div>
                Formulate Promotional Coupon
              </h3>

              <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Coupon Code</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME50"
                    className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono tracking-wider transition-colors ${darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Discount Amount</label>
                  <input
                    type="number"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
                    className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${darkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rate Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors cursor-pointer appearance-none ${darkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Price (₹)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 text-white text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>

            {/* Inactive Coupon checklists */}
            <div className={`rounded-2xl border overflow-hidden transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left font-sans">
                  <thead className={darkMode ? 'bg-slate-950/50 text-slate-400 text-xs' : 'bg-slate-50 text-slate-500 text-xs'}>
                    <tr className={`border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <th className="p-4 font-bold uppercase tracking-wider">Promo Code</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Rate Offset</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Expiration</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">System Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'} font-medium`}>
                    {coupons.map((c) => (
                      <tr key={c.id} className={`transition-colors ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                        <td className="p-4">
                          <strong className="font-mono text-blue-500 tracking-wider text-xs block bg-blue-500/10 px-2 py-1 rounded w-fit">{c.code}</strong>
                          <span className={`text-[11px] mt-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{c.usedCount} total usages</span>
                        </td>
                        <td className={`p-4 font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          <span className={`px-2 py-1 text-xs rounded border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                            {c.type === 'percentage' ? `${c.discount}% Discount` : `₹${c.discount} Flat Off`}
                          </span>
                        </td>
                        <td className={`p-4 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{c.expiry}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleCoupon(c.id, c.active)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all shadow-sm border ${c.active 
                                ? (darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100') 
                                : (darkMode ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50')
                              }`}
                          >
                            {c.active ? 'Active' : 'Enable Promo'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 6: COURSE MANAGEMENT */}
        {activeTab === 'courses' && hasPermission('courses') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight col-span-1">Active Curriculum & Course Management</h1>
                <p className="text-xs text-slate-400 mt-1">Configure candidate materials, price vectors, lectures, video items, and quizzes.</p>
              </div>
              {!editingCourse && !showAddCourse && (
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 font-sans cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" /> Publish New Course
                </button>
              )}
            </div>

            {/* CASE A: SHOW ADDING COURSE FORM */}
            {showAddCourse && (
              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'}`}>
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-sm text-blue-500">Formulate and Publish New Course</h3>
                  <button
                    onClick={() => setShowAddCourse(false)}
                    className="text-slate-400 hover:text-slate-205 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateCourse} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Course Title</label>
                      <input
                        type="text"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        placeholder="e.g. FullStack Modern Web Apps"
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Instructor/Council Name</label>
                      <input
                        type="text"
                        value={newCourse.instructorName}
                        onChange={(e) => setNewCourse({ ...newCourse, instructorName: e.target.value })}
                        placeholder="IIT Madras Graduates Council"
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Category</label>
                      <select
                        value={newCourse.category}
                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value as any })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      >
                        <option value="Tech">Tech Section</option>
                        <option value="Business">Business Section</option>
                        <option value="Content Creator">Content Creator</option>
                        <option value="Crash Course">Crash Course</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Original Exam Fee (₹)</label>
                      <input
                        type="number"
                        value={newCourse.examPrice}
                        onChange={(e) => setNewCourse({ ...newCourse, examPrice: Number(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Discounted Price (₹)</label>
                      <input
                        type="number"
                        value={newCourse.discountPrice}
                        onChange={(e) => setNewCourse({ ...newCourse, discountPrice: Number(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Course Description</label>
                    <textarea
                      rows={3}
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      placeholder="Enter detailed prospectus guidelines..."
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Thumbnail URL</label>
                      <input
                        type="text"
                        value={newCourse.thumbnailUrl}
                        onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Banner Landscape URL</label>
                      <input
                        type="text"
                        value={newCourse.bannerUrl}
                        onChange={(e) => setNewCourse({ ...newCourse, bannerUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 col-span-1">
                    <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/10 space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-blue-500 font-bold">Curriculum Lists Input (JSON format Arrays)</span>
                      <p className="text-[9px] text-slate-400">Construct compliant course data using JSON schema formats.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400">Lectures List JSON</label>
                        <textarea
                          rows={2}
                          value={newCourse.lecturesText}
                          onChange={(e) => setNewCourse({ ...newCourse, lecturesText: e.target.value })}
                          className="w-full font-mono text-[10px] p-2 dark:bg-slate-950 border border-slate-800 rounded-lg outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Assignments JSON</label>
                        <textarea
                          rows={2}
                          value={newCourse.assignmentsText}
                          onChange={(e) => setNewCourse({ ...newCourse, assignmentsText: e.target.value })}
                          className="w-full font-mono text-[10px] p-2 dark:bg-slate-950 border border-slate-800 rounded-lg outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Quizzes list JSON</label>
                        <textarea
                          rows={2}
                          value={newCourse.quizzesText}
                          onChange={(e) => setNewCourse({ ...newCourse, quizzesText: e.target.value })}
                          className="w-full font-mono text-[10px] p-2 dark:bg-slate-950 border border-slate-800 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs text-white bg-blue-600 font-bold rounded-xl"
                  >
                    Commit & Broadcast Course Publication
                  </button>
                </form>
              </div>
            )}

            {/* CASE B: SHOW EDITING COURSE FORM */}
            {editingCourse && (
              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'}`}>
                <div className="flex justify-between items-center border-b pb-3 block">
                  <h3 className="font-extrabold text-sm text-blue-500">Editing Prospectus: {editingCourse.title}</h3>
                  <button
                    onClick={() => setEditingCourse(null)}
                    className="text-slate-400 hover:text-slate-205 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveCourseEdits} className="space-y-4 text-xs font-semibold overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Course Title</label>
                      <input
                        type="text"
                        value={editingCourse.title}
                        onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Instructor Name</label>
                      <input
                        type="text"
                        value={editingCourse.instructorName}
                        onChange={(e) => setEditingCourse({ ...editingCourse, instructorName: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Category</label>
                      <select
                        value={editingCourse.category}
                        onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      >
                        <option value="Tech">Tech</option>
                        <option value="Business">Business</option>
                        <option value="Content Creator">Content Creator</option>
                        <option value="Crash Course">Crash Course</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Exam Fee (₹)</label>
                      <input
                        type="number"
                        value={editingCourse.examPrice}
                        onChange={(e) => setEditingCourse({ ...editingCourse, examPrice: Number(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Discounted Fee (₹)</label>
                      <input
                        type="number"
                        value={editingCourse.discountPrice || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, discountPrice: Number(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Course Description</label>
                    <textarea
                      rows={3}
                      value={editingCourse.description}
                      onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Thumbnail Link</label>
                      <input
                        type="text"
                        value={editingCourse.thumbnailUrl}
                        onChange={(e) => setEditingCourse({ ...editingCourse, thumbnailUrl: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Banner Link</label>
                      <input
                        type="text"
                        value={editingCourse.bannerUrl}
                        onChange={(e) => setEditingCourse({ ...editingCourse, bannerUrl: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 block">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 block font-bold">Lectures JSON Array</label>
                        <textarea
                          rows={4}
                          value={editingCourseLecturesText}
                          onChange={(e) => setEditingCourseLecturesText(e.target.value)}
                          className="w-full font-mono text-[10px] p-2.5 dark:bg-slate-950 border border-slate-800 rounded-lg outline-none text-white focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 block font-bold">Assignments JSON Array</label>
                        <textarea
                          rows={4}
                          value={editingCourseAssignmentsText}
                          onChange={(e) => setEditingCourseAssignmentsText(e.target.value)}
                          className="w-full font-mono text-[10px] p-2.5 dark:bg-slate-950 border border-slate-800 rounded-lg outline-none text-white focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 block font-bold">Quizzes JSON Array</label>
                        <textarea
                          rows={4}
                          value={editingCourseQuizzesText}
                          onChange={(e) => setEditingCourseQuizzesText(e.target.value)}
                          className="w-full font-mono text-[10px] p-2.5 dark:bg-slate-950 border border-slate-800 rounded-lg outline-none text-white focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-grow py-2.5 text-xs text-white bg-blue-600 font-bold rounded-xl hover:bg-blue-700 font-sans cursor-pointer"
                    >
                      Save Configuration Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCourse(null)}
                      className="px-5 py-2.5 text-xs rounded-xl border border-slate-755 border-slate-700 hover:bg-slate-800 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CASE C: LIST ALL COURSES */}
            {!editingCourse && !showAddCourse && (
              <div className="space-y-10">
                {[
                  { id: 'Tech', title: 'Tech Courses', color: 'bg-blue-500' }, 
                  { id: 'Business', title: 'Business Courses', color: 'bg-purple-500' },
                  { id: 'Content Creator', title: 'Content Creator Courses', color: 'bg-pink-500' },
                  { id: 'Crash Course', title: 'Crash Courses', color: 'bg-orange-500' }
                ].map(section => {
                  const sectionCourses = courses.filter(c => c.category === section.id);
                  if (sectionCourses.length === 0) return null;
                  
                  return (
                    <div key={section.id}>
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <div className={`w-1.5 h-6 rounded-full ${section.color}`}></div>
                        {section.title}
                        <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-full">{sectionCourses.length}</span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sectionCourses.map((c) => (
                          <div key={c.id} className={`group relative p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between ${darkMode ? 'bg-[#1e232b]/80 border-[#30363d] hover:border-purple-500/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]' : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)]'}`}>
                            {/* Background Glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-500 pointer-events-none" />
                            
                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-1 px-3 rounded-full shadow-sm">
                                  {c.category}
                                </span>
                                <span className={`text-[10px] font-bold tracking-wider uppercase py-1 px-3 rounded-full flex items-center gap-1.5 shadow-sm ${c.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                  {c.active ? 'Active' : 'Draft'}
                                </span>
                              </div>
                              
                              <h3 className={`font-extrabold text-xl mb-2 tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{c.title}</h3>
                              <p className={`text-xs leading-relaxed line-clamp-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{c.description}</p>
                              
                              <div className={`mt-5 p-4 rounded-2xl space-y-3 ${darkMode ? 'bg-slate-900/50 border border-slate-800/50' : 'bg-slate-50 border border-slate-100'}`}>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={`flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Users className="w-3.5 h-3.5 text-purple-400" /> Instructor
                                  </span>
                                  <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'} truncate ml-2`}>{c.instructorName}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={`flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Tag className="w-3.5 h-3.5 text-emerald-400" /> Pricing
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-emerald-500">₹{c.discountPrice || c.examPrice}</span>
                                    {c.discountPrice && <span className="text-[10px] line-through text-slate-400">₹{c.examPrice}</span>}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={`flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Curriculum
                                  </span>
                                  <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {(c.lectures || []).length} lectures
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3 mt-6 relative z-10">
                              <button
                                onClick={() => {
                                  setEditingCourse(c);
                                  setEditingCourseLecturesText(JSON.stringify(c.lectures, null, 2));
                                  setEditingCourseAssignmentsText(JSON.stringify(c.assignments || [], null, 2));
                                  setEditingCourseQuizzesText(JSON.stringify(c.quizzes || [], null, 2));
                                }}
                                className={`flex-grow py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}
                              >
                                <UserCog className="w-3.5 h-3.5" /> Configure
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/courses/${c.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ active: !c.active })
                                    });
                                    if (res.ok) {
                                      onToast(`Course status updated dynamically!`, 'success');
                                      onRefreshCourses();
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${c.active ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}
                              >
                                {c.active ? <Trash2 className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                                {c.active ? 'Unpublish' : 'Publish'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 7: BROADCAST NOTIFICATIONS SYSTEM */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight col-span-1">Broadcast System Alerts</h1>
              <p className="text-xs text-slate-400 mt-1">Send global service briefs, maintenance alerts, or placement announcements to all students.</p>
            </div>

            <div className={`p-6 rounded-3xl border space-y-5 transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`font-extrabold text-sm flex items-center gap-2 pb-3 border-b ${darkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>
                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <AlertOctagon className="w-4 h-4 text-blue-500" /> 
                </div>
                Draft Broadcast Message
              </h3>
              
              <form onSubmit={handleSendNotification} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Broadcast Priority / Title</label>
                  <input
                    type="text"
                    value={notifyTitle}
                    onChange={(e) => setNotifyTitle(e.target.value)}
                    placeholder="e.g. Server Hash Synced, Razorpay Outage Solved"
                    className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Message Body</label>
                  <textarea
                    rows={3}
                    value={notifyMsg}
                    onChange={(e) => setNotifyMsg(e.target.value)}
                    placeholder="Write details for the live broadcast dashboard feed..."
                    className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors resize-none ${darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 text-white text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                  >
                    Publish and Send Message to Students
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className={`font-bold text-xs uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Broadcasts Stream History</h3>
              <div className="space-y-3">
                {systemAlerts.map((sa) => (
                  <div key={sa.id} className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'} flex justify-between gap-4 items-start`}>
                    <div className="space-y-1.5">
                      <strong className={`font-extrabold text-sm block ${darkMode ? 'text-white' : 'text-slate-800'}`}>{sa.title}</strong>
                      <p className={`text-[13px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{sa.message}</p>
                      <span className={`text-[10px] font-mono tracking-wider block pt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{sa.timestamp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSystemAlerts(systemAlerts.filter(x => x.id !== sa.id));
                        onToast('Broadcast alert dismissed from view.', 'success');
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100'}`}
                      title="Dismiss Notification"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: ADMIN PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-8 col-span-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Profile & Security Credentials</h1>
              <p className="text-xs text-slate-400 mt-1">Configure your administrative screen name, security passwords, and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Personal Info & Avatar */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Personal Information */}
                <div className={`p-6 rounded-3xl border transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h3 className={`font-extrabold text-sm flex items-center gap-2 pb-4 border-b ${darkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                      <UserCog className="w-4 h-4 text-blue-500" /> 
                    </div>
                    Personal Information
                  </h3>

                  <form onSubmit={handleUpdateAdminProfile} className="mt-5 space-y-5 text-xs font-semibold">
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-4">
                      <div className="relative group cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          title="Click to upload new profile photo"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setProfileAvatar(URL.createObjectURL(e.target.files[0]));
                              onToast('Profile picture updated locally. (Mock)', 'success');
                            }
                          }}
                        />
                        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-extrabold shadow-xl shadow-blue-500/10 overflow-hidden relative ${!profileAvatar ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                          {profileAvatar ? (
                            <img src={profileAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
                          ) : (
                            profileName.charAt(0).toUpperCase()
                          )}
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Upload className="w-6 h-6 text-white mb-1" />
                            <span className="text-[9px] font-bold tracking-wider text-white">UPDATE</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left space-y-3 pt-2">
                        <h4 className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Profile Photo</h4>
                        <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          We support high-resolution images. For best results, use an image at least 256x256px in .jpg or .png format.
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                          <button type="button" className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                            Upload New Photo
                            <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setProfileAvatar(URL.createObjectURL(e.target.files[0]));
                                  onToast('Profile picture updated.', 'success');
                                }
                              }}
                            />
                          </button>
                          {profileAvatar && (
                            <button 
                              type="button" 
                              onClick={() => { setProfileAvatar(null); onToast('Avatar removed.', 'success'); }} 
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400' : 'border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600'}`}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${darkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Contact Phone Number</label>
                        <input
                          type="text"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${darkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Registered Email Address <span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className={`w-full px-4 py-3 text-sm rounded-xl border cursor-not-allowed ${darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
                        title="Emails cannot be modified once seeded in systems."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block text-[11px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Change Password</label>
                      <input
                        type="password"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        placeholder="Leave empty to keep current password"
                        className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${darkMode ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3 text-white text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                      >
                        Save Administrative Settings
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Right Column: Security & Preferences */}
              <div className="space-y-6">
                
                {/* Two-Factor Authentication */}
                <div className={`p-6 rounded-3xl border transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h3 className={`font-extrabold text-sm flex items-center gap-2 pb-4 border-b ${darkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                    </div>
                    Two-Factor Auth
                  </h3>
                  <div className="mt-4 space-y-3">
                    <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Add an extra layer of security to your admin account by enabling 2FA via an authenticator app.
                    </p>
                    <button type="button" className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors ${darkMode ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
                      Enable 2FA
                    </button>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className={`p-6 rounded-3xl border transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h3 className={`font-extrabold text-sm flex items-center gap-2 pb-4 border-b ${darkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-pink-500/10' : 'bg-pink-50'}`}>
                      <AlertOctagon className="w-4 h-4 text-pink-500" /> 
                    </div>
                    Alert Preferences
                  </h3>
                  <div className="mt-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className={`text-xs font-semibold transition-colors ${darkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>Daily Revenue Summary</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className={`text-xs font-semibold transition-colors ${darkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>New Enrollments</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className={`text-xs font-semibold transition-colors ${darkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>System Error Alerts</span>
                    </label>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className={`p-6 rounded-3xl border transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h3 className={`font-extrabold text-sm flex items-center gap-2 pb-4 border-b ${darkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                      <Activity className="w-4 h-4 text-purple-500" /> 
                    </div>
                    Active Sessions
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className={`text-xs block ${darkMode ? 'text-white' : 'text-slate-800'}`}>Windows 11 • Chrome</strong>
                          <span className={`text-[10px] block mt-0.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Current Session</span>
                        </div>
                        <span className={`text-[10px] font-mono ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>192.168.1.x</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW 8: SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  <span className={`bg-gradient-to-r from-blue-400 via-sky-500 to-blue-400 bg-clip-text text-transparent`}>
                    Student Support Queries
                  </span>
                </h1>
                <p className={`text-sm mt-2 font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  View and resolve incoming queries from the student dashboards.
                </p>
              </div>
            </section>

            <div className={`rounded-[2rem] border overflow-hidden shadow-sm ${darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-[#30363d] bg-[#0d1117]' : 'border-slate-200 bg-slate-50/50'}`}>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Ref / Student</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Subject & Description</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {supportTickets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center">
                          <span className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No active support tickets found.</span>
                        </td>
                      </tr>
                    ) : (
                      supportTickets.map((t: any) => (
                        <tr key={t.id} className={`transition-all duration-200 ${darkMode ? 'hover:bg-[#0d1117]' : 'hover:bg-slate-50'}`}>
                          <td className="p-5 align-top">
                            <strong className={`block text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t.id}</strong>
                            <span className="text-xs text-slate-500">{t.userName} ({t.userEmail})</span><br/>
                            <span className="text-[10px] text-slate-400 mt-1">{new Date(t.createdAt).toLocaleString()}</span>
                          </td>
                          <td className="p-5 align-top">
                            <strong className={`block text-sm font-bold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{t.subject}</strong>
                            <p className={`text-xs whitespace-pre-wrap ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t.description}</p>
                          </td>
                          <td className="p-5 align-top">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border ${
                              t.status === 'open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-5 align-top text-right">
                            {t.status === 'open' ? (
                              <button onClick={async () => {
                                try {
                                  const res = await fetch(`/api/support/ticket/${t.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'resolved' })
                                  });
                                  if(res.ok) fetchAdminData();
                                } catch(err) {}
                              }} className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                                Resolve
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">Resolved</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        </div>
      </main>

      {/* ═══ LOGOUT CONFIRMATION MODAL ═══ */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border ${darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'} text-center`}>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 animate-pulse">
                <LogOut className="w-8 h-8 -ml-1" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Ready to leave?</h3>
              <p className={`text-sm mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Are you sure you want to log out of your session?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    clearAuth();
                    window.location.href = '/';
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

      {/* Staff Chat Integration */}
      <StaffChatWidget currentUser={currentUser} darkMode={darkMode} />
    </div>
  );
}

// Subcomponents helper
function MenuBtn({ active, icon, label, onClick, darkMode }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void; darkMode?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-3.5 px-4 rounded-2xl text-[13px] font-bold flex items-center gap-3.5 transition-all duration-300 relative overflow-hidden group ${active
        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
        : darkMode
          ? 'hover:bg-white/[0.04] text-slate-400 hover:text-white border border-transparent'
          : 'hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 border border-transparent'
        }`}
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      {active && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
      <span className={`w-5 h-5 flex items-center justify-center transition-transform duration-300 z-10 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
        {icon}
      </span>
      <span className="tracking-wide z-10">{label}</span>
    </button>
  );
}

function StatItem({ label, val, icon }: { label: string; val: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-slate-800/50 bg-slate-900/30 flex justify-between items-start transition-all hover:bg-slate-800/50 hover:border-slate-700 hover:-translate-y-1">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-xl font-extrabold mt-1 text-slate-100">{val}</p>
      </div>
      <div className="p-2.5 rounded-xl bg-slate-800 shadow-inner">{icon}</div>
    </div>
  );
}

/* ─── Premium UI Components ─── */
function GlassStatCard({ darkMode, title, value, icon, iconColor, glowColor, badge, badgeColor }: {
  darkMode: boolean;
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  glowColor: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className={`relative overflow-hidden p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 group cursor-default ${darkMode
      ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]'
      : 'bg-white/90 border-slate-200 shadow-lg hover:shadow-xl'
      }`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${glowColor}/10 rounded-full blur-2xl group-hover:${glowColor}/25 transition-all duration-500 pointer-events-none`} />
      <div className="flex justify-between items-start relative z-10">
        <span className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {title}
        </span>
        <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center ${darkMode ? 'bg-white/[0.06]' : 'bg-slate-100'
          }`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3 mt-4 relative z-10">
        <span className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {value}
        </span>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full mb-1 ${badgeColor}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

function InsightCard({ darkMode, icon, iconColor, bgColor, borderColor, title, desc }: {
  darkMode: boolean;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  title: string;
  desc: string;
}) {
  return (
    <div className={`flex gap-4 items-start p-4 rounded-2xl border transition-colors ${bgColor} ${borderColor}`}>
      <div className={`mt-0.5 ${iconColor}`}>{icon}</div>
      <div>
        <h4 className="text-sm font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h4>
        <p className={`text-[13px] leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

function QuickActionBtn({ darkMode, icon, label, gradient, onClick }: {
  darkMode: boolean;
  icon: React.ReactNode;
  label: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 group cursor-pointer ${darkMode
      ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06]'
      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}>
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <span className="text-xs font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>{label}</span>
    </button>
  );
}
