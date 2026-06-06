/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, GraduationCap, FileSpreadsheet, Award, CreditCard, Tag, RefreshCw, Search, ShieldCheck, AlertOctagon, CheckCircle2, Lock, Plus, Trash2, Calendar } from 'lucide-react';
import { Course, User, Certificate, Coupon } from '../types';

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
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      
      {/* 1. ADMIN PANEL MENU */}
      <div className="w-full md:w-[220px] shrink-0 space-y-2">
        <div className="p-4 rounded-2xl border text-center border-blue-500/10 bg-blue-500/5 col-span-1">
          <span className="text-[9px] uppercase font-mono tracking-widest block text-blue-500 font-extrabold mb-1">Administrative Console</span>
          <h4 className="font-extrabold text-xs truncate text-slate-300">{currentUser.name}</h4>
        </div>

        <div className="flex flex-col space-y-1">
          <MenuBtn active={activeTab === 'overview'} icon={<LayoutDashboard />} label="Consolidated Overview" onClick={() => setActiveTab('overview')} />
          {hasPermission('courses') && (
            <MenuBtn active={activeTab === 'courses'} icon={<GraduationCap />} label="Course Management" onClick={() => setActiveTab('courses')} />
          )}
          {hasPermission('students') && (
            <MenuBtn active={activeTab === 'students'} icon={<Users />} label="Manage Students" onClick={() => setActiveTab('students')} />
          )}
          {hasPermission('exams') && (
            <MenuBtn active={activeTab === 'exams'} icon={<FileSpreadsheet />} label="Exams & Questions" onClick={() => setActiveTab('exams')} />
          )}
          {hasPermission('certificates') && (
            <MenuBtn active={activeTab === 'certificates'} icon={<Award />} label="Audit Certificates" onClick={() => setActiveTab('certificates')} />
          )}
          {hasPermission('coupons') && (
            <MenuBtn active={activeTab === 'coupons'} icon={<Tag />} label="Discounts & Coupons" onClick={() => setActiveTab('coupons')} />
          )}
          <MenuBtn active={activeTab === 'notifications'} icon={<AlertOctagon />} label="Notifications" onClick={() => setActiveTab('notifications')} />
          <MenuBtn active={activeTab === 'profile'} icon={<Lock />} label="Profile Settings" onClick={() => setActiveTab('profile')} />
        </div>
      </div>

      {/* 2. ADMIN PORTALS WORKSPACE */}
      <div className="flex-grow space-y-8 min-w-0">
        
        {/* VIEW 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Console Overview</h1>
              <p className="text-xs text-slate-400 mt-1">Grooming India&apos;s most affordable certification gateway. Sync trends dynamically.</p>
            </div>

            {/* Admin Stats widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatItem label="Seeded Students" val={stats.studentsCount} icon={<Users className="text-blue-500" />} />
              <StatItem label="Total Revenue Audits" val={`₹${stats.totalRevenue}`} icon={<CreditCard className="text-green-500" />} />
              <StatItem label="Certificates Issued" val={stats.certificatesCount} icon={<Award className="text-sky-500" />} />
              <StatItem label="Daily Payments" val={`₹${stats.todayRevenue}`} icon={<RefreshCw className="text-orange-500" />} />
            </div>

            {/* Custom Interactive SVG Line Plot represent charts */}
            <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm">Monthly Platform Revenue Scale</h3>
                  <p className="text-[10px] text-slate-400">Interactive path analysis of transactional billing catalogs</p>
                </div>
                <span className="text-[10px] font-bold text-green-500 bg-green-500/15 p-1 px-2.5 rounded-full">
                  +42.5% Growth
                </span>
              </div>

              {/* Pure SVG Line Chart */}
              <div className="relative h-44 w-full pt-4">
                <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="3" className="opacity-20" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="3" className="opacity-20" />
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="3" className="opacity-20" />

                  {/* Gradient Area under the path */}
                  <path
                    d="M 10 120 L 90 90 L 170 70 L 250 50 L 330 30 L 415 15 L 490 10 L 490 120 Z"
                    fill="url(#blueGrad)"
                    className="opacity-15"
                  />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Line Path */}
                  <path
                    d="M 10 120 Q 90 90, 170 80 T 250 55 T 330 35 T 415 15 T 490 10"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />

                  {/* Axis indicators */}
                  <text x="10" y="140" fill="#64748B" className="text-[9px] font-mono tracking-tight text-center">Jan</text>
                  <text x="90" y="140" fill="#64748B" className="text-[9px] font-mono tracking-tight">Feb</text>
                  <text x="170" y="140" fill="#64748B" className="text-[9px] font-mono tracking-tight">Mar</text>
                  <text x="250" y="140" fill="#64748B" className="text-[9px] font-mono tracking-tight">Apr</text>
                  <text x="330" y="140" fill="#64748B" className="text-[9px] font-mono tracking-tight">May</text>
                  <text x="415" y="140" fill="#64748B" className="text-[9px] font-mono tracking-tight">Today</text>

                  {/* Data Point Dots */}
                  <circle cx="490" cy="10" r="5" fill="#38BDF8" stroke="#ffffff" strokeWidth="2" className="animate-ping" />
                  <circle cx="490" cy="10" r="4.5" fill="#2563EB" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Split feeds: Recent signups and recent payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent signups table */}
              <div className={`p-5 rounded-2xl border space-y-3.5 leading-relaxed text-xs overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Recent Signups Audit
                </h3>
                <div className="divide-y divide-slate-800 max-h-[220px] overflow-y-auto pr-1">
                  {stats.recentSignups.map((usr: any) => (
                    <div key={usr.id} className="py-2.5 flex justify-between items-center gap-3">
                      <div className="truncate">
                        <strong className="block text-slate-100 dark:text-white truncate">{usr.name}</strong>
                        <span className="text-[10px] text-slate-400 truncate block">{usr.email}</span>
                      </div>
                      <span className="text-[8px] font-mono capitalize p-1 px-2.5 rounded-lg bg-slate-500/10 font-bold border border-slate-500/15">
                        {usr.plan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent ledger events */}
              <div className={`p-5 rounded-2xl border space-y-3.5 leading-relaxed text-xs overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Recent Platform Payments
                </h3>
                <div className="divide-y divide-slate-800 max-h-[220px] overflow-y-auto pr-1">
                  {stats.recentPayments.map((pay: any) => (
                    <div key={pay.id} className="py-2.5 flex justify-between items-center gap-3">
                      <div className="truncate">
                        <strong className="block text-slate-100 dark:text-white truncate">{pay.details}</strong>
                        <span className="text-[10px] text-slate-400 truncate block">{pay.gatewayRef}</span>
                      </div>
                      <span className="font-mono font-bold text-green-500">
                        ₹{pay.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: MANAGE STUDENTS */}
        {activeTab === 'students' && hasPermission('students') && (
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200">
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
                  <div key={c.id} className={`p-5 rounded-3xl border flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-extrabold uppercase bg-blue-500/10 text-blue-500 p-1 px-2.5 rounded-full">{c.category}</span>
                        <span className={`text-[9px] font-mono tracking-widest font-extrabold p-1 px-2 rounded-full ${c.active ? 'bg-green-500/10 text-green-500': 'bg-red-500/10 text-red-500'}`}>
                          {c.active ? 'PUBLICLY ACTIVE' : 'DRAFT INACTIVE'}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm mt-3">{c.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed truncate-2-lines">{c.description}</p>
                      <div className="my-4 divide-y border-t border-b border-inherit space-y-2 py-2">
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                          <span>Instructor:</span>
                          <span className="font-bold text-slate-200">{c.instructorName}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                          <span>Exam price / discount:</span>
                          <span className="font-bold font-mono text-blue-500">₹{c.examPrice} / ₹{c.discountPrice || 'none'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                          <span>Curriculum elements:</span>
                          <span className="font-bold text-slate-300">{(c.lectures || []).length} lectures, {(c.assignments || []).length} assignments</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCourse(c);
                          setEditingCourseLecturesText(JSON.stringify(c.lectures, null, 2));
                          setEditingCourseAssignmentsText(JSON.stringify(c.assignments || [], null, 2));
                          setEditingCourseQuizzesText(JSON.stringify(c.quizzes || [], null, 2));
                        }}
                        className="flex-grow py-2 text-[11px] bg-slate-500/10 hover:bg-slate-500/20 text-slate-200 rounded-lg font-bold"
                      >
                        Configure Course Details
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
                        className={`px-3 py-2 text-[11px] font-bold rounded-lg ${c.active ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}
                      >
                        {c.active ? 'Unpublish' : 'Publish'}
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
          <div className="space-y-6 animate-in fade-in duration-200">
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
          <div className="space-y-6 animate-in fade-in duration-200 col-span-1">
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
function MenuBtn({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
          : 'hover:bg-slate-500/5 text-slate-400 hover:text-slate-100'
      }`}
    >
      <span className="w-4 h-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StatItem({ label, val, icon }: { label: string; val: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-500/10 bg-slate-505/5 bg-slate-500/5 col-span-1">
      <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <span className="text-[10px] text-slate-400 block font-light">{label}</span>
        <strong className="text-base font-extrabold font-mono text-blue-500">{val}</strong>
      </div>
    </div>
  );
}
