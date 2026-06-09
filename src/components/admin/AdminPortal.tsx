/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, GraduationCap, FileSpreadsheet, Award, CreditCard, Tag, RefreshCw, Search, ShieldCheck, AlertOctagon, CheckCircle2, Lock, Plus, Trash2, Calendar, TrendingUp, Sparkles, Activity, AlertTriangle, CheckCircle, Info, BookOpen, Upload, BarChart3, UserCog } from 'lucide-react';
import { Course, User, Certificate, Coupon } from '../../types';

interface AdminPortalProps {
  currentUser: User;
  courses: Course[];
  darkMode: boolean;
  onRefreshCourses: () => void;
  onToast: (msg: string, type: 'success' | 'ref') => void;
  initialTab?: 'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile';
  onTabChange?: (tab: 'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile') => void;
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
  const [activeTab, setActiveTabState] = useState<'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile'>(initialTab || 'overview');
  
  const setActiveTab = (tab: 'overview' | 'courses' | 'students' | 'exams' | 'certificates' | 'coupons' | 'notifications' | 'profile') => {
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

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      const usersRes = await fetch('/api/admin/users');
      const cpnsRes = await fetch('/api/admin/coupons');

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setStudents(await usersRes.json());
      if (cpnsRes.ok) setCoupons(await cpnsRes.json());
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
      try { lcts = JSON.parse(newCourse.lecturesText || '[]'); } catch(e) {
        onToast('Lectures list must be valid JSON format!', 'ref');
        return;
      }
      let asts = [];
      try { asts = JSON.parse(newCourse.assignmentsText || '[]'); } catch(e) {
        onToast('Assignments list must be valid JSON format!', 'ref');
        return;
      }
      let qzs = [];
      try { qzs = JSON.parse(newCourse.quizzesText || '[]'); } catch(e) {
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
    } catch(err) {
      console.error(err);
    }
  };

  const handleSaveCourseEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      let lcts = [];
      try { lcts = JSON.parse(editingCourseLecturesText || '[]'); } catch(e) {
        onToast('Lectures array must be valid JSON format!', 'ref');
        return;
      }
      let asts = [];
      try { asts = JSON.parse(editingCourseAssignmentsText || '[]'); } catch(e) {
        onToast('Assignments array must be valid JSON format!', 'ref');
        return;
      }
      let qzs = [];
      try { qzs = JSON.parse(editingCourseQuizzesText || '[]'); } catch(e) {
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
    <div className={`w-full px-4 sm:px-6 lg:px-10 py-10 flex flex-col md:flex-row gap-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      
      {/* 1. ADMIN PANEL MENU */}
      <div className="w-full md:w-[260px] shrink-0 space-y-6">
        {/* Brand/User Card */}
        <div className={`p-5 rounded-3xl border backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden transition-colors ${
          darkMode 
            ? 'bg-white/[0.03] border-white/[0.08]' 
            : 'bg-white/90 border-slate-200 shadow-xl'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-purple-500 mb-2 relative z-10">Administrative Console</span>
          <h4 className="font-extrabold text-sm truncate bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent relative z-10" style={{ fontFamily: 'Outfit, sans-serif' }}>
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
          <MenuBtn darkMode={darkMode} active={activeTab === 'notifications'} icon={<AlertOctagon />} label="Notifications" onClick={() => setActiveTab('notifications')} />
          <MenuBtn darkMode={darkMode} active={activeTab === 'profile'} icon={<Lock />} label="Profile Settings" onClick={() => setActiveTab('profile')} />
        </div>
      </div>

      {/* 2. ADMIN PORTALS WORKSPACE */}
      <div className="flex-grow min-w-0">
        
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
              <div className={`lg:col-span-2 p-6 rounded-3xl border backdrop-blur-xl transition-colors ${
                darkMode 
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
                    {[0,1,2,3].map(i => (
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
                          className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${
                            i === 4 
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
                    <span key={i} className={`text-xs font-semibold ${
                      i === 4 ? 'text-pink-400' : darkMode ? 'text-slate-500' : 'text-slate-400'
                    }`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {month}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-colors flex flex-col justify-between ${
                darkMode 
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
              <div className={`lg:col-span-2 p-6 rounded-3xl border backdrop-blur-xl transition-colors ${
                darkMode 
                  ? 'bg-white/[0.03] border-white/[0.08]' 
                  : 'bg-white/90 border-slate-200 shadow-xl'
              }`}>
                <h2 className="text-xl font-bold tracking-tight mb-6 pb-4 border-b border-white/5 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <Activity className="w-5 h-5 text-purple-400" />
                  Recent Signups
                </h2>
                
                {/* Table Header */}
                <div className={`grid grid-cols-4 gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  darkMode ? 'bg-white/[0.03] text-slate-500' : 'bg-slate-50 text-slate-400'
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
                      className={`grid grid-cols-4 gap-4 px-4 py-3.5 rounded-xl text-sm transition-colors cursor-pointer ${
                        darkMode 
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
              <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-colors ${
                darkMode 
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
                className={`w-full text-xs pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left font-sans">
                  <thead className={darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-500'}>
                    <tr className="border-b border-inherit">
                      <th className="p-4 font-bold">Student Identity</th>
                      <th className="p-4 font-bold">Current Plan Hierarchy</th>
                      <th className="p-4 font-bold">Joined Date</th>
                      <th className="p-4 font-bold">Administration Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit font-medium">
                    {filteredStudents.map((stud) => (
                      <tr key={stud.id} className={darkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50/50'}>
                        <td className="p-4">
                          <span className="font-extrabold block text-slate-100 dark:text-white">{stud.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono select-all block">{stud.email}</span>
                        </td>
                        <td className="p-4 text-xs">
                          <span className="p-1 px-2.5 rounded-lg font-mono font-bold capitalize bg-blue-500/10 text-blue-500">
                            {stud.plan}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {stud.joinedDate}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleUserPlan(stud.id, stud.plan)}
                            className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 rounded"
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
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Select Exam Assessment</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className={`text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
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
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
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
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
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
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
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
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
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
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1 max-w-xs">
                  <label className="text-slate-400">Correct Option index selector</label>
                  <select
                    value={newQ.correctIdx}
                    onChange={(e) => setNewQ({ ...newQ, correctIdx: Number(e.target.value) })}
                    className={`px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
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
                <div key={q.id} className={`p-4 rounded-xl border text-xs leading-relaxed flex justify-between gap-4 items-start ${
                  darkMode ? 'bg-slate-905 border-slate-800' : 'bg-slate-100 border-slate-200'
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

            <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="overflow-x-auto text-xs font-medium">
                <table className="w-full text-left font-sans">
                  <thead className={darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-500'}>
                    <tr className="border-b border-inherit">
                      <th className="p-4 font-bold">Student Name</th>
                      <th className="p-4 font-bold">Credential Details</th>
                      <th className="p-4 font-bold">Ledger Status</th>
                      <th className="p-4 font-bold">Compliance Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {stats.recentCertificates.map((cert: any) => (
                      <tr key={cert.id} className={darkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50/50'}>
                        <td className="p-4 font-bold text-slate-100 dark:text-white">{cert.userName}</td>
                        <td className="p-4 leading-relaxed">
                          <span className="font-bold text-slate-300 block">{cert.courseName}</span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider">{cert.certificateId}</span>
                        </td>
                        <td className="p-4">
                          {cert.valid ? (
                            <span className="p-1 px-2.5 rounded-lg text-[9px] font-bold bg-green-500/10 text-green-500">
                              Valid Ledger Certified
                            </span>
                          ) : (
                            <span className="p-1 px-2.5 rounded-lg text-[9px] font-bold bg-red-500/15 text-red-500">
                              Revoked/Suspended
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {cert.valid ? (
                            <button
                              onClick={() => handleRevokeCertificate(cert.certificateId)}
                              className="px-2.5 py-1 text-[9px] font-bold rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              Revoke validation
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReissueCertificate(cert.certificateId)}
                              className="px-2 py-1 text-[9px] font-bold rounded bg-green-600 text-white"
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
            <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5 border-b pb-2">
                <Tag className="w-4 h-4 text-blue-500" /> Formulate Promotional Coupon
              </h3>
              
              <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Coupon Code</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME50"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-wider ${
                      darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Discount Amount</label>
                  <input
                    type="number"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-950 border-slate-855' : 'bg-slate-50 border-slate-200'
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Rate Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className={`px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Price (₹)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 text-white text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 hover:scale-[1.03] active:scale-95 transition-all shadow-md"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>

            {/* Inactive Coupon checklists */}
            <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="overflow-x-auto text-xs font-medium">
                <table className="w-full text-left font-sans">
                  <thead className={darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-500'}>
                    <tr className="border-b border-inherit">
                      <th className="p-4 font-bold">Promo Code</th>
                      <th className="p-4 font-bold col-span-1">Rate Offset</th>
                      <th className="p-4 font-bold">Expiration</th>
                      <th className="p-4 font-bold">System Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {coupons.map((c) => (
                      <tr key={c.id} className={darkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50/50'}>
                        <td className="p-4">
                          <strong className="font-mono text-blue-500 tracking-wider text-[11px] block">{c.code}</strong>
                          <span className="text-[9px] text-slate-400">{c.usedCount} times used</span>
                        </td>
                        <td className="p-4 font-bold text-slate-200">
                          {c.type === 'percentage' ? `${c.discount}% Discount` : `₹${c.discount} off`}
                        </td>
                        <td className="p-4 text-slate-400">{c.expiry}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleCoupon(c.id, c.active)}
                            className={`px-2 py-1 text-[9px] font-bold rounded ${
                              c.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/15 text-red-500'
                            }`}
                          >
                            {c.active ? 'Active (Click to Toggle)' : 'Inactive (Click to Active)'}
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <option value="Tech">Tech Section</option>
                        <option value="Business">Business Section</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Original Exam Fee (₹)</label>
                      <input
                        type="number"
                        value={newCourse.examPrice}
                        onChange={(e) => setNewCourse({ ...newCourse, examPrice: Number(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <option value="Tech">Tech</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Exam Fee (₹)</label>
                      <input
                        type="number"
                        value={editingCourse.examPrice}
                        onChange={(e) => setEditingCourse({ ...editingCourse, examPrice: Number(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Banner Link</label>
                      <input
                        type="text"
                        value={editingCourse.bannerUrl}
                        onChange={(e) => setEditingCourse({ ...editingCourse, bannerUrl: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((c) => (
                  <div key={c.id} className={`group p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between relative overflow-hidden ${
                    darkMode 
                      ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80 hover:border-blue-500/30' 
                      : 'bg-white/60 backdrop-blur-md border-slate-200/60 hover:bg-white hover:border-blue-500/20 hover:shadow-blue-500/5'
                  }`}>
                    {/* Decorative Background Blob */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                          darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <BookOpen className="w-3 h-3" /> {c.category}
                        </span>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold ${
                          c.active 
                            ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                            : (darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600')
                        }`}>
                          {c.active ? <><CheckCircle2 className="w-3 h-3" /> ACTIVE</> : <><AlertOctagon className="w-3 h-3" /> DRAFT</>}
                        </div>
                      </div>
                      
                      <h3 className="font-extrabold text-lg tracking-tight mb-2 group-hover:text-blue-500 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {c.title}
                      </h3>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {c.description}
                      </p>

                      <div className={`mt-5 pt-4 pb-2 border-t flex flex-col gap-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`flex items-center gap-1.5 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Users className="w-3.5 h-3.5" /> Instructor
                          </span>
                          <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{c.instructorName}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`flex items-center gap-1.5 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <CreditCard className="w-3.5 h-3.5" /> Pricing
                          </span>
                          <div className="flex items-center gap-2 font-mono">
                            {c.discountPrice ? (
                              <>
                                <span className="line-through opacity-50 text-[10px]">₹{c.examPrice}</span>
                                <span className="text-emerald-500 font-extrabold">₹{c.discountPrice}</span>
                              </>
                            ) : (
                              <span className={`font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>₹{c.examPrice}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`flex items-center gap-1.5 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <BookOpen className="w-3.5 h-3.5" /> Curriculum
                          </span>
                          <span className="font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                            {(c.lectures || []).length} L • {(c.assignments || []).length} A
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5 relative z-10">
                      <button
                        onClick={() => {
                          setEditingCourse(c);
                          setEditingCourseLecturesText(JSON.stringify(c.lectures, null, 2));
                          setEditingCourseAssignmentsText(JSON.stringify(c.assignments || [], null, 2));
                          setEditingCourseQuizzesText(JSON.stringify(c.quizzes || [], null, 2));
                        }}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${
                          darkMode 
                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <UserCog className="w-4 h-4" /> Config Details
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
                        className={`py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center transition-all hover:scale-[1.05] active:scale-95 shadow-md ${
                          c.active 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                        }`}
                        title={c.active ? "Unpublish Course" : "Publish Course"}
                      >
                        {c.active ? <ShieldCheck className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
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

            <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'}`}>
              <h3 className="font-extrabold text-sm text-blue-500">Draft Broadcast Message</h3>
              <form onSubmit={handleSendNotification} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Broadcast Priority / Title</label>
                  <input
                    type="text"
                    value={notifyTitle}
                    onChange={(e) => setNotifyTitle(e.target.value)}
                    placeholder="e.g. Server Hash Synced, Razorpay Outage Solved"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Message Body</label>
                  <textarea
                    rows={3}
                    value={notifyMsg}
                    onChange={(e) => setNotifyMsg(e.target.value)}
                    placeholder="Write details for the live broadcast dashboard feed..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-xl transition-all shadow-md"
                >
                  Publish and Send Message to Students
                </button>
              </form>
            </div>

            <div className="space-y-3 col-span-1">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 text-slate-500">Active broadcasts stream history</h3>
              {systemAlerts.map((sa) => (
                <div key={sa.id} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800/80': 'bg-white border-slate-100 shadow-sm'} flex justify-between gap-4 items-start`}>
                  <div className="space-y-1 col-span-1">
                    <strong className="text-slate-100 dark:text-white font-extrabold text-xs block">{sa.title}</strong>
                    <p className="text-[11px] text-slate-450 leading-relaxed font-light">{sa.message}</p>
                    <span className="text-[9px] font-mono tracking-wider text-slate-400 block pt-1">{sa.timestamp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSystemAlerts(systemAlerts.filter(x => x.id !== sa.id));
                      onToast('Broadcast alert dismissed from view.', 'success');
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 font-bold text-xs"
                    title="Dismiss Notification"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 8: ADMIN PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-6 col-span-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Profile & Security Credentials</h1>
              <p className="text-xs text-slate-400 mt-1">Configure your administrative screen name and change security passwords.</p>
            </div>

            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <form onSubmit={handleUpdateAdminProfile} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Registered Email Address</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-500/10 border-slate-800 text-slate-400 cursor-not-allowed outline-none"
                    title="Emails cannot be modified once seeded in systems."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Contact Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">Change Password</label>
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    placeholder="Leave completely empty to keep current password"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs text-white bg-blue-600 font-bold rounded-xl"
                >
                  Save Administrative Settings
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

// Subcomponents helper
function MenuBtn({ active, icon, label, onClick, darkMode }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void; darkMode?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-3.5 px-4 rounded-2xl text-[13px] font-bold flex items-center gap-3.5 transition-all duration-300 relative overflow-hidden group ${
        active
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
    <div className={`relative overflow-hidden p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 group cursor-default ${
      darkMode 
        ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]' 
        : 'bg-white/90 border-slate-200 shadow-lg hover:shadow-xl'
    }`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${glowColor}/10 rounded-full blur-2xl group-hover:${glowColor}/25 transition-all duration-500 pointer-events-none`} />
      <div className="flex justify-between items-start relative z-10">
        <span className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {title}
        </span>
        <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center ${
          darkMode ? 'bg-white/[0.06]' : 'bg-slate-100'
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
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 group cursor-pointer ${
      darkMode 
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
