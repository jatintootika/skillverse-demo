/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Server,
  ShieldCheck,
  Mail,
  Lock,
  Trash2,
  Key,
  RefreshCw,
  AlertTriangle,
  Users,
  Terminal,
  BookOpen,
  Plus,
  Award,
  CreditCard,
  Calendar,
  Search,
  Settings,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  BadgeAlert,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Bell,
  LogOut,
  LayoutDashboard,
  UserCog,
  Sparkles,
  Crown,
  Activity,
  TrendingUp,
  GraduationCap,
  BarChart3,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clearAuth } from '../../lib/auth';
import { User, PlatformSettings, AdminActivityLog, Course } from '../../types';
import { PremiumCertificate } from '../PremiumCertificate';
import { StaffChatWidget } from '../chat/StaffChatWidget';

interface SuperAdminPortalProps {
  currentUser: User;
  darkMode: boolean;
  onToast: (msg: string, type: 'success' | 'ref') => void;
  initialTab?: 'dashboard' | 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs' | 'support' | 'profile';
  onTabChange?: (tab: 'dashboard' | 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs' | 'support' | 'profile') => void;
}

// Global caching container to prevent unmount refetch latency during route changes
const globalSuperAdminCache: {
  settings?: PlatformSettings;
  adminsList?: User[];
  studentsList?: User[];
  courses?: Course[];
  logsList?: AdminActivityLog[];
  supportTickets?: any[];
  stats?: any;
  initialLoaded?: boolean;
} = {};

export function SuperAdminPortal({
  currentUser,
  darkMode,
  onToast,
  initialTab,
  onTabChange
}: SuperAdminPortalProps) {
  const [activeTab, setActiveTabState] = useState<'dashboard' | 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs' | 'support' | 'profile'>(initialTab || 'dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const setActiveTab = (tab: 'dashboard' | 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs' | 'support' | 'profile') => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  // Platform settings state variables
  const [settings, setSettings] = useState<PlatformSettings>(globalSuperAdminCache.settings || {
    smtpHost: '',
    smtpPort: 465,
    smtpUser: '',
    razorpayKeyId: '',
    stripePublicKey: '',
    sandboxMode: true,
    maintenanceMode: false,
    termsOfService: '',
    privacyPolicy: '',
    refundPolicy: '',
    disclaimer: '',
    verificationPolicy: ''
  });

  const [adminsList, setAdminsList] = useState<User[]>(globalSuperAdminCache.adminsList || []);
  const [studentsList, setStudentsList] = useState<User[]>(globalSuperAdminCache.studentsList || []);
  const [courses, setCourses] = useState<Course[]>(globalSuperAdminCache.courses || []);
  const [logsList, setLogsList] = useState<AdminActivityLog[]>(globalSuperAdminCache.logsList || []);
  const [supportTickets, setSupportTickets] = useState<any[]>(globalSuperAdminCache.supportTickets || []);

  // Analytics and statistics state variables
  const [stats, setStats] = useState<any>(globalSuperAdminCache.stats || {
    studentsCount: 0,
    certificatesCount: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    allCertificates: [],
    allPayments: []
  });

  const [loading, setLoading] = useState(false);

  // Promoting user email form state
  const [promoteEmail, setPromoteEmail] = useState('');

  // Profile state variables
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const handleUpdateSuperAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = { name: profileName, phone: profilePhone };
      if (profilePassword.trim()) body.password = profilePassword;
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        onToast('Super Administrative profile synced successfully!', 'success');
        setProfilePassword('');
      } else {
        onToast('Failed to update profile.', 'ref');
      }
    } catch (err) {
      onToast('Network error while saving profile.', 'ref');
    }
  };

  // Active Admin being configured in detail
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [adminAssignedCourses, setAdminAssignedCourses] = useState<string[]>([]);
  const [adminSuspended, setAdminSuspended] = useState<boolean>(false);

  // Active Student being modified in detail
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentPlan, setStudentPlan] = useState<'free' | 'starter' | 'popular' | 'pro'>('free');
  const [studentSuspended, setStudentSuspended] = useState<boolean>(false);

  // Course Management states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Tech' as 'Tech' | 'Business',
    description: '',
    examPrice: 199,
    discountPrice: 99,
    instructorName: 'IIT Madras Graduates Council',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    notesUrl: '',
    durationMins: 60,
    passPercentage: 70,
    active: true,
    assignmentsText: '[]',
    quizzesText: '[]'
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingCourseLecturesText, setEditingCourseLecturesText] = useState('');
  const [editingCourseAssignmentsText, setEditingCourseAssignmentsText] = useState('');
  const [editingCourseQuizzesText, setEditingCourseQuizzesText] = useState('');

  // Filter queries
  const [adminQuery, setAdminQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [courseQuery, setCourseQuery] = useState('');
  const [certificateQuery, setCertificateQuery] = useState('');
  const [paymentQuery, setPaymentQuery] = useState('');

  // Super Admin Certificates System configurations
  const [showManualIssueModal, setShowManualIssueModal] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualCourseId, setManualCourseId] = useState('');
  const [manualScore, setManualScore] = useState(100);
  const [manualGrade, setManualGrade] = useState('Distinction');

  const [previewAdminCert, setPreviewAdminCert] = useState<any | null>(null);

  const [revokingCertId, setRevokingCertId] = useState<string | null>(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState('');

  const [initialLoaded, setInitialLoaded] = useState(globalSuperAdminCache.initialLoaded || false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState<'none' | 'notifications' | 'profile'>('none');

  const fetchAllSuperAdminData = async () => {
    try {
      const endpoints: Record<string, { url: string; setter: (data: any) => void }> = {
        settings: {
          url: '/api/superadmin/settings',
          setter: (data: any) => {
            setSettings(data);
            globalSuperAdminCache.settings = data;
          }
        },
        admins: {
          url: '/api/superadmin/admins',
          setter: (data: any) => {
            setAdminsList(data);
            globalSuperAdminCache.adminsList = data;
          }
        },
        stats: {
          url: '/api/admin/stats',
          setter: (data: any) => {
            setStats(data);
            globalSuperAdminCache.stats = data;
          }
        },
        courses: {
          url: '/api/courses',
          setter: (data: any) => {
            setCourses(data);
            globalSuperAdminCache.courses = data;
          }
        },
        logs: {
          url: '/api/superadmin/audit-logs',
          setter: (data: any) => {
            setLogsList(data);
            globalSuperAdminCache.logsList = data;
          }
        },
        support: {
          url: '/api/support/tickets',
          setter: (data: any) => {
            setSupportTickets(data);
            globalSuperAdminCache.supportTickets = data;
          }
        },
        users: {
          url: '/api/admin/users',
          setter: (data: any) => {
            const students = Array.isArray(data) ? data.filter((u: any) => u?.role === 'student') : [];
            setStudentsList(students);
            globalSuperAdminCache.studentsList = students;
          }
        }
      };

      // Concurrent non-blocking fetches to maximize speed and responsive slide-ins
      await Promise.all(
        Object.keys(endpoints).map(async (key) => {
          try {
            const res = await fetch(endpoints[key].url);
            if (res.ok) {
              const data = await res.json();
              endpoints[key].setter(data);
            }
          } catch (e) {
            console.error(`Error loading database coordinate for: ${key}`, e);
          }
        })
      );

      setInitialLoaded(true);
      globalSuperAdminCache.initialLoaded = true;
    } catch (err) {
      console.error('Failed to resolve administrative records', err);
    }
  };

  useEffect(() => {
    fetchAllSuperAdminData();
  }, [activeTab]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        onToast('System parameters and policy guidelines saved successfully.', 'success');
        fetchAllSuperAdminData();
      } else {
        onToast('System parameters failed to save.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;

    try {
      const res = await fetch('/api/superadmin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: promoteEmail.split('@')[0],
          email: promoteEmail,
          role: 'admin'
        })
      });
      const data = await res.json();
      if (res.ok) {
        onToast('Elevated administrative staff role successfully.', 'success');
        setPromoteEmail('');
        fetchAllSuperAdminData();
      } else {
        onToast(data.message || 'Promotion index entry failed.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startConfiguringAdmin = (adm: User) => {
    setEditingAdmin(adm);
    setAdminPermissions(adm.permissions || ['courses', 'exams', 'students']);
    setAdminAssignedCourses(adm.assignedCourses || []);
    setAdminSuspended(!!adm.suspended);
  };

  const handleSaveAdminClearances = async () => {
    if (!editingAdmin) return;
    try {
      const res = await fetch(`/api/superadmin/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: adminPermissions,
          assignedCourses: adminAssignedCourses,
          suspended: adminSuspended
        })
      });
      if (res.ok) {
        onToast('Saved modified administrative staff clearances.', 'success');
        setEditingAdmin(null);
        fetchAllSuperAdminData();
      } else {
        const d = await res.json();
        onToast(d.message || 'Save clearance aborted.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startConfiguringStudent = (stud: User) => {
    setEditingStudent(stud);
    setStudentPlan(stud.plan || 'free');
    setStudentSuspended(!!stud.suspended);
  };

  const handleSaveStudentParameters = async () => {
    if (!editingStudent) return;
    try {
      const res = await fetch(`/api/admin/users/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: studentPlan,
          suspended: studentSuspended
        })
      });
      if (res.ok) {
        onToast('Student configurations saved successfully', 'success');
        setEditingStudent(null);
        fetchAllSuperAdminData();
      } else {
        const d = await res.json();
        onToast(d.message || 'Save configurations failed', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    let assignmentsParsed = [];
    let quizzesParsed = [];
    try {
      if (newCourse.assignmentsText.trim()) {
        assignmentsParsed = JSON.parse(newCourse.assignmentsText);
      }
    } catch (err) {
      onToast('Assignments format must be A valid JSON list.', 'ref');
      return;
    }
    try {
      if (newCourse.quizzesText.trim()) {
        quizzesParsed = JSON.parse(newCourse.quizzesText);
      }
    } catch (err) {
      onToast('Quizzes format must be A valid JSON list.', 'ref');
      return;
    }

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourse.title,
          category: newCourse.category,
          description: newCourse.description,
          examPrice: Number(newCourse.examPrice),
          discountPrice: Number(newCourse.discountPrice),
          instructorName: newCourse.instructorName,
          thumbnailUrl: newCourse.thumbnailUrl,
          bannerUrl: newCourse.bannerUrl,
          notesUrl: newCourse.notesUrl,
          durationMins: Number(newCourse.durationMins),
          passPercentage: Number(newCourse.passPercentage),
          active: newCourse.active,
          assignments: assignmentsParsed,
          quizzes: quizzesParsed
        })
      });
      if (res.ok) {
        onToast('Course added to directory catalog.', 'success');
        setShowAddCourse(false);
        setNewCourse({
          title: '',
          category: 'Tech' as 'Tech' | 'Business',
          description: '',
          examPrice: 199,
          discountPrice: 99,
          instructorName: 'IIT Madras Graduates Council',
          thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
          bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
          notesUrl: '',
          durationMins: 60,
          passPercentage: 70,
          active: true,
          assignmentsText: '[]',
          quizzesText: '[]'
        });
        fetchAllSuperAdminData();
      } else {
        onToast('Add course failed.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCourseEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    let lecturesList = [];
    try {
      if (editingCourseLecturesText.trim()) {
        lecturesList = JSON.parse(editingCourseLecturesText);
      }
    } catch (err) {
      onToast('Lecture checklist format must be valid sequential JSON array.', 'ref');
      return;
    }

    let assignmentsList = [];
    try {
      if (editingCourseAssignmentsText.trim()) {
        assignmentsList = JSON.parse(editingCourseAssignmentsText);
      }
    } catch (err) {
      onToast('Assignments format must be valid JSON list.', 'ref');
      return;
    }

    let quizzesList = [];
    try {
      if (editingCourseQuizzesText.trim()) {
        quizzesList = JSON.parse(editingCourseQuizzesText);
      }
    } catch (err) {
      onToast('Quizzes must be valid JSON list.', 'ref');
      return;
    }

    try {
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingCourse.title,
          category: editingCourse.category,
          description: editingCourse.description,
          examPrice: Number(editingCourse.examPrice),
          discountPrice: Number(editingCourse.discountPrice),
          instructorName: editingCourse.instructorName,
          thumbnailUrl: editingCourse.thumbnailUrl,
          bannerUrl: editingCourse.bannerUrl,
          notesUrl: editingCourse.notesUrl,
          durationMins: Number(editingCourse.durationMins || 60),
          passPercentage: Number(editingCourse.passPercentage || 70),
          active: editingCourse.active,
          lectures: lecturesList,
          assignments: assignmentsList,
          quizzes: quizzesList
        })
      });
      if (res.ok) {
        onToast('Updated course modifications.', 'success');
        setEditingCourse(null);
        fetchAllSuperAdminData();
      } else {
        onToast('Failed updating course specifications.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete: ${name}?`)) return;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onToast('Course successfully purged from catalog database.', 'success');
        setEditingCourse(null);
        fetchAllSuperAdminData();
      } else {
        onToast('Purging course was rejected by system.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuperAdminRevoke = async () => {
    if (!revokingCertId) return;
    try {
      const res = await fetch(`/api/super-admin/certificates/${revokingCertId}/revoke`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: revokeReasonInput })
      });
      if (res.ok) {
        onToast('Certificate successfully voided from public ledger.', 'success');
        setRevokingCertId(null);
        setRevokeReasonInput('');
        fetchAllSuperAdminData();
      } else {
        onToast('Failed to void certificate credential.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuperAdminReactivate = async (certId: string) => {
    try {
      const res = await fetch(`/api/super-admin/certificates/${certId}/reactivate`, {
        method: 'PUT'
      });
      if (res.ok) {
        onToast('Certificate successfully reactivated.', 'success');
        fetchAllSuperAdminData();
      } else {
        onToast('Failed to reactivate credential record.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuperAdminDelete = async (certId: string) => {
    if (!confirm('Are you ABSOLUTELY sure you want to PERMANENTLY DELETE this certificate? This action is completely irreversible.')) return;
    try {
      const res = await fetch(`/api/super-admin/certificates/${certId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onToast('Certificate permanently purged from system records.', 'success');
        fetchAllSuperAdminData();
      } else {
        onToast('System rejected delete directive.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentId || !manualCourseId) {
      onToast('Please specify both student and course targets.', 'ref');
      return;
    }
    try {
      const res = await fetch(`/api/certificates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: manualStudentId,
          courseId: manualCourseId,
          score: manualScore,
          grade: manualGrade
        })
      });
      if (res.ok) {
        onToast('Syllabus certificate registered successfully!', 'success');
        setShowManualIssueModal(false);
        setManualStudentId('');
        setManualCourseId('');
        fetchAllSuperAdminData();
      } else {
        const d = await res.json();
        onToast(d.message || 'Error executing manual certification.', 'ref');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = (perm: string) => {
    if (adminPermissions.includes(perm)) {
      setAdminPermissions(adminPermissions.filter(p => p !== perm));
    } else {
      setAdminPermissions([...adminPermissions, perm]);
    }
  };

  const toggleAssignedCourse = (courseId: string) => {
    if (adminAssignedCourses.includes(courseId)) {
      setAdminAssignedCourses(adminAssignedCourses.filter(id => id !== courseId));
    } else {
      setAdminAssignedCourses([...adminAssignedCourses, courseId]);
    }
  };

  // Safe search logic
  const filteredAdmins = adminsList.filter(adm =>
    (adm?.name || '').toLowerCase().includes((adminQuery || '').toLowerCase()) ||
    (adm?.email || '').toLowerCase().includes((adminQuery || '').toLowerCase())
  );

  const filteredStudents = studentsList.filter(stud =>
    (stud?.name || '').toLowerCase().includes((studentQuery || '').toLowerCase()) ||
    (stud?.email || '').toLowerCase().includes((studentQuery || '').toLowerCase())
  );

  const filteredCoursesList = courses.filter(crs =>
    (crs?.title || '').toLowerCase().includes((courseQuery || '').toLowerCase()) ||
    (crs?.category || '').toLowerCase().includes((courseQuery || '').toLowerCase())
  );

  const filteredCertificates = (stats?.allCertificates || []).filter((c: any) => {
    const certId = c?.id || c?.certificateId || '';
    const name = c?.userName || '';
    const title = c?.courseTitle || c?.courseName || '';
    const q = certificateQuery || '';
    return certId.toLowerCase().includes(q.toLowerCase()) ||
      name.toLowerCase().includes(q.toLowerCase()) ||
      title.toLowerCase().includes(q.toLowerCase());
  });

  const filteredPayments = (stats?.allPayments || []).filter((p: any) => {
    const userName = p?.userName || '';
    const details = p?.details || '';
    const gatewayRef = p?.gatewayRef || '';
    const q = paymentQuery || '';
    return userName.toLowerCase().includes(q.toLowerCase()) ||
      details.toLowerCase().includes(q.toLowerCase()) ||
      gatewayRef.toLowerCase().includes(q.toLowerCase());
  });

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 rounded-full border-4 border-slate-300 border-t-blue-500 animate-spin" />
          <span className="text-xs text-slate-400 font-mono tracking-wider">Initializing SuperAdmin Console...</span>
        </div>
      </div>
    );
  }

  const dm = darkMode;

  return (
    <div className={`h-screen overflow-hidden flex ${dm ? 'bg-[#0d1117] text-white' : 'bg-gray-50 text-slate-800'}`}>

      {/* ═══════════════════════════════════════════════ */}
      {/* SIDEBAR */}
      {/* ═══════════════════════════════════════════════ */}
      <aside className={`w-[260px] shrink-0 h-screen sticky top-0 flex flex-col border-r overflow-y-auto no-scrollbar ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`}>
        <div className="p-6 space-y-6 pb-10">

          {/* Brand Card */}
          <div className={`p-5 mt-2 rounded-[1.5rem] border flex flex-col items-start justify-center relative overflow-hidden transition-all duration-500 group ${dm
            ? 'bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
            : 'bg-gradient-to-br from-white via-slate-50 to-blue-50/50 border-slate-200/80 shadow-[0_8px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.08)] hover:border-blue-200'
            }`}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />

            <div className={`inline-flex items-center gap-2 px-2.5 py-1 mb-3 rounded-lg text-[9px] uppercase font-extrabold tracking-widest border transition-colors relative z-10 ${dm
              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 group-hover:bg-blue-500/20'
              : 'bg-blue-50 text-blue-700 border-blue-200/60 group-hover:bg-blue-100'
              }`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              Super Admin
            </div>

            <h4 className={`font-black text-[17px] tracking-tight relative z-10 leading-snug transition-colors ${dm ? 'text-white group-hover:text-blue-100' : 'text-slate-800 group-hover:text-slate-900'
              }`}>
              {currentUser.name}
            </h4>
          </div>

          {/* Menu Buttons */}
          <div className="flex flex-col space-y-1.5">
            {([
              { id: 'dashboard' as const, icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard Overview' },
              { id: 'settings' as const, icon: <Server className="w-4 h-4" />, label: 'Parameters & Policies' },
              { id: 'admins' as const, icon: <ShieldCheck className="w-4 h-4" />, label: 'Staff Clearances' },
              { id: 'students' as const, icon: <Users className="w-4 h-4" />, label: 'Student Directory' },
              { id: 'courses' as const, icon: <BookOpen className="w-4 h-4" />, label: 'Course Catalogs' },
              { id: 'certificates' as const, icon: <Award className="w-4 h-4" />, label: 'Certificate Ledger' },
              { id: 'payments' as const, icon: <CreditCard className="w-4 h-4" />, label: 'Revenues & Billing' },
              { id: 'support' as const, icon: <BookOpen className="w-4 h-4" />, label: 'Support Tickets' },
              { id: 'logs' as const, icon: <Terminal className="w-4 h-4" />, label: 'System Audit Logs' },
              { id: 'profile' as const, icon: <Lock className="w-4 h-4" />, label: 'Profile Settings' },
            ]).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-[13px] font-semibold transition-all duration-200 ${activeTab === item.id
                    ? (dm ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/25')
                    : (dm ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80')
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <div className={`pt-4 mt-3 border-t ${dm ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-md hover:-translate-y-0.5"
              >
                <LogOut className="w-5 h-5" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA */}
      {/* ═══════════════════════════════════════════════ */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">

        {/* Sticky Header Bar */}
        <header className={`shrink-0 z-50 flex items-center justify-end px-8 py-4 border-b relative ${dm ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-6 relative z-50">

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setHeaderMenuOpen(prev => prev === 'notifications' ? 'none' : 'notifications')}
                className={`relative p-2.5 rounded-full transition-all focus:outline-none ${dm ? 'text-slate-400 hover:text-white hover:bg-[#161b22]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} ${headerMenuOpen === 'notifications' ? (dm ? 'bg-[#161b22] text-white' : 'bg-slate-100 text-slate-900') : ''}`}
              >
                <Bell className="w-5 h-5" />
                <span className={`absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 ${dm ? 'border-[#0d1117]' : 'border-white'}`}></span>
              </button>

              {/* Notifications Floating Panel */}
              <div className={`absolute top-full right-0 mt-4 w-80 rounded-[1.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.12)] border p-5 transition-all duration-300 origin-top-right z-50 ${dm ? 'bg-[#161b22] border-[#30363d] shadow-black/50' : 'bg-white border-slate-200/80'} ${headerMenuOpen === 'notifications' ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-extrabold text-sm tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>System Alerts</h4>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">{logsList.length} Logs</span>
                </div>
                <div className="space-y-3">
                  {logsList.slice(-2).reverse().map((log) => (
                    <div key={log.id} className={`p-3.5 rounded-2xl border transition-all hover:-translate-y-0.5 cursor-pointer ${dm ? 'bg-[#0d1117]/80 border-[#30363d] hover:border-blue-500/30' : 'bg-slate-50/50 border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <p className={`text-xs font-bold ${dm ? 'text-slate-200' : 'text-slate-800'}`}>{log.action}</p>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">{log.details}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-2">{log.timestamp}</p>
                    </div>
                  ))}
                  {logsList.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>
                  )}
                </div>
                <button
                  onClick={() => { setHeaderMenuOpen('none'); setActiveTab('logs'); }}
                  className="w-full mt-4 py-2.5 text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  View All Audit Logs →
                </button>
              </div>
            </div>

            {/* Profile Element */}
            <div className="relative">
              <div
                onClick={() => setHeaderMenuOpen(prev => prev === 'profile' ? 'none' : 'profile')}
                className={`flex items-center gap-3 pl-6 border-l cursor-pointer group transition-all ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}
              >
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-bold leading-none transition-colors ${dm ? 'text-white' : 'text-slate-900'} group-hover:text-blue-500 dark:group-hover:text-blue-400`}>{currentUser.name}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mt-1">Super Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-transparent group-hover:ring-blue-400/50 transition-all">
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${headerMenuOpen === 'profile' ? 'rotate-180 text-blue-500' : (dm ? 'text-slate-500 group-hover:translate-y-0.5' : 'text-slate-400 group-hover:translate-y-0.5')}`} />
              </div>

              {/* Profile Floating Panel */}
              <div className={`absolute top-full right-0 mt-4 w-64 rounded-[1.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.12)] border p-2 transition-all duration-300 origin-top-right z-50 ${dm ? 'bg-[#161b22] border-[#30363d] shadow-black/50' : 'bg-white border-slate-200/80'} ${headerMenuOpen === 'profile' ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className={`px-4 py-3 border-b mb-2 ${dm ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className={`text-sm font-extrabold ${dm ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{currentUser.email || 'superadmin@skillverse.com'}</p>
                </div>
                <div className="space-y-1">
                  <button onClick={() => { setHeaderMenuOpen('none'); setActiveTab('settings'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${dm ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <UserCog className="w-4 h-4 text-blue-500" /> System Settings
                  </button>
                  <button onClick={() => { setHeaderMenuOpen('none'); setActiveTab('dashboard'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${dm ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <LayoutDashboard className="w-4 h-4 text-purple-500" /> View Dashboard
                  </button>
                  <button onClick={() => { setHeaderMenuOpen('none'); setActiveTab('logs'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${dm ? 'text-slate-300 hover:bg-[#0d1117] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <Terminal className="w-4 h-4 text-emerald-500" /> Audit Logs
                  </button>
                </div>
                <div className={`mt-2 pt-2 border-t ${dm ? 'border-white/5' : 'border-slate-100'}`}>
                  <button onClick={() => { setHeaderMenuOpen('none'); setShowLogoutConfirm(true); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${dm ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Click-outside overlay */}
          {headerMenuOpen !== 'none' && (
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setHeaderMenuOpen('none')} />
          )}
        </header>

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 pb-20 relative ${dm ? 'bg-transparent' : 'bg-slate-50/50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]'}`}>
          <div className="space-y-6 min-w-0 relative z-10">

            {/* ═══ TAB: DASHBOARD OVERVIEW ═══ */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-4">
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>
                      Overview
                    </h1>
                    <p className={`text-sm mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Welcome back, <span className="font-semibold text-blue-500">{currentUser.name.split(' ')[0]}</span>. Here's what's happening today.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dm ? 'bg-[#161b22] border border-[#30363d] text-slate-300 hover:text-white hover:bg-[#21262d]' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'}`}>
                      Download Report
                    </button>
                  </div>
                </section>

                {/* Stat Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {[
                    { title: 'Total Students', value: stats.studentsCount?.toString() || '0', icon: <Users className="w-5 h-5" />, color: 'text-blue-500', glow: 'bg-blue-500', badge: '+12%', borderHighlight: 'border-blue-500/20' },
                    { title: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-500', glow: 'bg-emerald-500', badge: '+8%', borderHighlight: 'border-emerald-500/20' },
                    { title: 'Certificates Issued', value: (stats.allCertificates?.length || stats.certificatesCount || 0).toString(), icon: <Award className="w-5 h-5" />, color: 'text-amber-500', glow: 'bg-amber-500', badge: 'Active', borderHighlight: 'border-amber-500/20' },
                    { title: 'Active Courses', value: courses.filter(c => c.active).length.toString(), icon: <GraduationCap className="w-5 h-5" />, color: 'text-purple-500', glow: 'bg-purple-500', badge: `${courses.length} Total`, borderHighlight: 'border-purple-500/20' },
                  ].map((card, idx) => (
                    <div key={idx} className={`group relative p-5 rounded-2xl border overflow-hidden transition-all duration-300 ${dm ? `bg-[#161b22] border-[#30363d] hover:${card.borderHighlight} hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]` : `bg-white border-slate-200/80 shadow-sm hover:shadow-md hover:${card.borderHighlight}`
                      }`}>
                      <div className={`absolute -top-12 -right-12 w-28 h-28 ${card.glow}/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none`} />
                      <div className="relative z-10 flex items-start justify-between mb-3">
                        <p className={`text-xs font-semibold tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{card.title}</p>
                        {card.badge.includes('+') ? (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${dm ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>{card.badge}</span>
                        ) : (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${dm ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{card.badge}</span>
                        )}
                      </div>
                      <div className="relative z-10 flex items-center justify-between mt-1">
                        <p className={`text-2xl font-black tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                        <div className={`p-1.5 rounded-lg ${dm ? `${card.glow}/10` : `${card.glow}/5`} ${card.color}`}>
                          {card.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Revenue Trend Chart */}
                <section className={`p-6 rounded-2xl border ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200/80 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className={`font-bold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>Revenue Growth Trend</h3>
                      <p className={`text-xs mt-0.5 ${dm ? 'text-slate-500' : 'text-slate-500'}`}>Quarter-over-quarter financial performance</p>
                    </div>
                    <span className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-md ${dm ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      ↑ Trending Up
                    </span>
                  </div>
                  <div className="relative h-64 w-full mt-4">
                    <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible preserve-3d">
                      {/* Grid Lines */}
                      {[10, 60, 110, 160].map((y, i) => (
                        <line key={`h-${i}`} x1="20" y1={y} x2="580" y2={y} stroke={dm ? '#334155' : '#f1f5f9'} strokeWidth="1.5" strokeDasharray="4 4" />
                      ))}

                      {/* Gradients */}
                      <defs>
                        <linearGradient id="blueGradSuperDash" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Smooth Area Fill */}
                      <path
                        d="M 20 160 C 76 160, 76 110, 132 110 C 188 110, 188 120, 244 120 C 300 120, 300 70, 356 70 C 412 70, 412 35, 468 35 C 524 35, 524 10, 580 10 L 580 200 L 20 200 Z"
                        fill="url(#blueGradSuperDash)"
                        className="transition-all duration-1000 animate-in fade-in fill-mode-forwards"
                      />

                      {/* Smooth Stroke Line */}
                      <path
                        d="M 20 160 C 76 160, 76 110, 132 110 C 188 110, 188 120, 244 120 C 300 120, 300 70, 356 70 C 412 70, 412 35, 468 35 C 524 35, 524 10, 580 10"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />

                      {/* Interactive Points & Guides */}
                      {[
                        { x: 20, y: 160, v: '₹12k', l: 'Jan' },
                        { x: 132, y: 110, v: '₹34k', l: 'Feb' },
                        { x: 244, y: 120, v: '₹29k', l: 'Mar' },
                        { x: 356, y: 70, v: '₹58k', l: 'Apr' },
                        { x: 468, y: 35, v: '₹82k', l: 'May' },
                        { x: 580, y: 10, v: '₹105k', l: 'Jun' }
                      ].map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                          {/* Vertical Hover Guide */}
                          <line x1={p.x} y1={p.y} x2={p.x} y2="160" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Node Circle */}
                          <circle cx={p.x} cy={p.y} r="5" fill="#3B82F6" stroke={dm ? '#161b22' : '#fff'} strokeWidth="2.5" className="group-hover:r-[7px] group-hover:fill-blue-400 transition-all duration-200" />

                          {/* Floating Tooltip */}
                          <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <rect x={p.x - 28} y={p.y - 36} width="56" height="24" rx="6" fill={dm ? '#30363d' : '#1e293b'} className="shadow-2xl" />
                            <text x={p.x} y={p.y - 20} fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">{p.v}</text>
                          </g>

                          {/* X-Axis Label */}
                          <text x={p.x} y="185" fill={dm ? '#64748B' : '#94a3b8'} className="text-[11px] font-bold" textAnchor="middle">{p.l}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </section>

                {/* Quick Stats Row */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  <div className={`p-5 rounded-2xl border flex items-center justify-between ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200/80 shadow-sm'}`}>
                    <div>
                      <p className={`text-xs font-semibold mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Admin Staff</p>
                      <p className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{adminsList.length}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dm ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className={`p-5 rounded-2xl border flex items-center justify-between ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200/80 shadow-sm'}`}>
                    <div>
                      <p className={`text-xs font-semibold mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Today Revenue</p>
                      <p className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>₹{stats.todayRevenue || 0}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dm ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className={`p-5 rounded-2xl border flex items-center justify-between ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200/80 shadow-sm'}`}>
                    <div>
                      <p className={`text-xs font-semibold mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Audit Events</p>
                      <p className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{logsList.length}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dm ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ═══ TAB 1: PARAMETERS & POLICIES ═══ */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    <span className={`bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600 bg-clip-text text-transparent`}>
                      System Parameters Integration
                    </span>
                  </h1>
                  <p className={`text-sm mt-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    Configure SMTP relays, Payment Credentials, and regulatory legal compliance page parameters.
                  </p>
                </section>

                <form onSubmit={handleUpdateSettings} className="space-y-6 text-xs font-medium">
                  <div className={`p-6 md:p-8 rounded-[2rem] border relative overflow-hidden ${dm ? 'bg-[#161b22]/80 border-[#30363d] shadow-sm' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)]'} space-y-8`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                    {/* SMTP Configs */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-blue-500 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" /> SMTP Email Server Configs
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-mono tracking-tight">SMTP Host Server</label>
                          <input
                            type="text"
                            value={settings.smtpHost || ''}
                            onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-mono tracking-tight">SMTP Port</label>
                          <input
                            type="number"
                            value={settings.smtpPort || 465}
                            onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) || 0 })}
                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-mono tracking-tight">SMTP User Account</label>
                          <input
                            type="text"
                            value={settings.smtpUser || ''}
                            onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                          />
                        </div>
                      </div>
                    </div>

                    <hr className={darkMode ? 'border-slate-800' : 'border-slate-100'} />

                    {/* Secure Gateway Keys */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-500" /> Payment Sandbox & Production Keys
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-mono tracking-tight">Razorpay Key ID</label>
                          <input
                            type="text"
                            value={settings.razorpayKeyId || ''}
                            onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-mono tracking-tight">Stripe Public Key</label>
                          <input
                            type="text"
                            value={settings.stripePublicKey || ''}
                            onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                          />
                        </div>
                      </div>
                    </div>

                    <hr className={darkMode ? 'border-slate-800' : 'border-slate-100'} />

                    {/* Operations Toggles */}
                    <div className="flex flex-col sm:flex-row gap-6">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!settings.sandboxMode}
                          onChange={(e) => setSettings({ ...settings, sandboxMode: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 h-4 w-4"
                        />
                        <span>Active Sandbox/Mock transaction simulations (Razorpay gateway overrides with simulated success checks)</span>
                      </label>
                    </div>
                  </div>

                  {/* Legal Policies Configuration Panels */}
                  <div className={`p-6 md:p-8 rounded-[2rem] border relative overflow-hidden ${dm ? 'bg-[#161b22]/80 border-[#30363d] shadow-sm' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)]'} space-y-6`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                      <h3 className="font-bold text-sm text-blue-500 flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-blue-500" /> Website Policies Configuration Content
                      </h3>
                      <p className="text-[10px] text-slate-400">Content here is rendered live inside separate terms pages and refund references across the application.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Terms and Conditions</label>
                        <textarea
                          rows={3}
                          value={settings.termsOfService || ''}
                          onChange={(e) => setSettings({ ...settings, termsOfService: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Privacy Policy</label>
                        <textarea
                          rows={3}
                          value={settings.privacyPolicy || ''}
                          onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Refund Policy</label>
                        <textarea
                          rows={3}
                          value={settings.refundPolicy || ''}
                          onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Platform Disclaimer</label>
                        <textarea
                          rows={3}
                          value={settings.disclaimer || ''}
                          onChange={(e) => setSettings({ ...settings, disclaimer: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Certificate Verification Policy</label>
                        <textarea
                          rows={3}
                          value={settings.verificationPolicy || ''}
                          onChange={(e) => setSettings({ ...settings, verificationPolicy: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3.5 text-white text-sm font-extrabold rounded-[1rem] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 transition-all cursor-pointer"
                  >
                    Apply System and Policies parameters
                  </button>
                </form>
              </div>
            )}

            {/* ═══ TAB 2: STAFF CLEARANCES ═══ */}
            {activeTab === 'admins' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                      <span className={`bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 bg-clip-text text-transparent`}>
                        Access Staff Privileges
                      </span>
                    </h1>
                    <p className={`text-sm mt-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Configure permissions level flags, Course Assignments, suspension parameters, or demote staff clearances.
                    </p>
                  </div>
                </section>

                {/* Promote Staff Form */}
                <div className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden transition-all duration-500 ${dm ? 'bg-gradient-to-br from-[#161b22] to-[#0d1117] border-[#30363d] shadow-[0_8px_30px_rgba(0,0,0,0.4)]' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)]'} space-y-6 group`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/20 transition-all duration-700" />

                  <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-end justify-between">
                    <div className="flex-1 max-w-xl">
                      <h3 className="font-extrabold text-sm text-emerald-500 flex items-center gap-2 mb-4 drop-shadow-sm">
                        <UserCog className="w-5 h-5 text-emerald-500" /> Promote Student Email to Admin Staff
                      </h3>
                      <form onSubmit={handlePromoteAdmin} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className={`h-4 w-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            value={promoteEmail}
                            onChange={(e) => setPromoteEmail(e.target.value)}
                            placeholder="Enter registered student email (e.g. name@student.in)"
                            className={`pl-9 pr-4 py-3 w-full text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 ${dm ? 'bg-[#0d1117]/80 border-[#30363d] text-white placeholder-slate-500 hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 shadow-sm'
                              }`}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Promote to Staff</span>
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                    <div className={`hidden lg:flex items-center gap-3 p-4 rounded-xl border ${dm ? 'bg-[#0d1117]/50 border-[#30363d]' : 'bg-slate-50/50 border-slate-200'}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dm ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-600'}`}>
                        <BadgeAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Warning</p>
                        <p className={`text-xs font-medium ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Staff have critical access</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admins Table */}
                <div className={`rounded-3xl border overflow-hidden transition-all duration-500 ${dm ? 'bg-[#161b22] border-[#30363d] shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.05)]'}`}>
                  <div className={`p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b ${dm ? 'border-[#30363d] bg-[#0d1117]/30' : 'border-slate-100 bg-slate-50/30'}`}>
                    <div className="relative w-full max-w-md group">
                      <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${dm ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                      <input
                        type="text"
                        value={adminQuery}
                        onChange={(e) => setAdminQuery(e.target.value)}
                        placeholder="Search staff accounts by name or email..."
                        className={`pl-9 pr-4 py-2.5 w-full text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${dm ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-slate-500 hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 shadow-sm'
                          }`}
                      />
                    </div>
                    <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${dm ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {filteredAdmins.length} Staff Members
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead className={dm ? 'bg-[#0d1117]/80 text-slate-400' : 'bg-slate-50 text-slate-500'}>
                        <tr>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Identity</th>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Clearances</th>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Status</th>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Manage clearances</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {filteredAdmins.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                              No staff members found matching your search.
                            </td>
                          </tr>
                        ) : null}
                        {filteredAdmins.map((adm) => {
                          const isPrimarySysAdmin = adm.id === 'usr-1';
                          const isEditing = editingAdmin?.id === adm.id;

                          return (
                            <React.Fragment key={adm.id}>
                              <tr className={`transition-all duration-300 ${isEditing ? (dm ? 'bg-[#1e2430]' : 'bg-blue-50/50') : (dm ? 'hover:bg-[#1c212b]' : 'hover:bg-slate-50')}`}>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-gradient-to-br ${isPrimarySysAdmin ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-indigo-600'}`}>
                                      {adm.name.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="font-extrabold block text-sm text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{adm.name}</span>
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tight">{adm.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-md font-mono text-[9px] uppercase font-bold tracking-widest border ${isPrimarySysAdmin ? (dm ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200') : (dm ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200')}`}>
                                    {adm.role.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {adm.suspended ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 text-[10px] font-bold uppercase tracking-wide">
                                      <BadgeAlert className="w-3.5 h-3.5" /> Suspended
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-wide">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                    </span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <button
                                    onClick={() => isEditing ? setEditingAdmin(null) : startConfiguringAdmin(adm)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${isEditing
                                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 shadow-inner'
                                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:translate-y-0'
                                      }`}
                                  >
                                    {isEditing ? 'Close Settings' : 'Edit Scope'}
                                    {!isEditing && <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                </td>
                              </tr>

                              {/* INLINE clearance configuration form - Animated expansion */}
                              <tr className={`transition-all duration-500 ease-in-out ${isEditing ? 'opacity-100 table-row' : 'opacity-0 hidden'}`}>
                                <td colSpan={4} className="p-0 border-0">
                                  <div className={`overflow-hidden transition-all duration-500 ${isEditing ? 'max-h-[1000px] border-b' : 'max-h-0'} ${dm ? 'bg-[#0d1117]/80 border-[#30363d]' : 'bg-slate-50/50 border-slate-200'}`}>
                                    <div className="p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-500">
                                      <div className={`p-6 rounded-3xl border ${dm ? 'bg-[#161b22] border-[#30363d] shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'bg-white border-blue-100 shadow-[0_10px_40px_rgba(59,130,246,0.1)]'} space-y-6 w-full font-sans relative overflow-hidden ring-1 ring-black/5`}>
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

                                        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 ${dm ? 'border-[#30363d]' : 'border-slate-100'}`}>
                                          <div>
                                            <h4 className={`font-black text-lg ${dm ? 'text-white' : 'text-slate-900'}`}>Configure Clearances</h4>
                                            <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Modifying privileges for <span className="font-bold text-blue-500">{adm.name}</span></p>
                                          </div>
                                          {isPrimarySysAdmin && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                                              <ShieldCheck className="w-3.5 h-3.5" /> Primary Admin Locked
                                            </span>
                                          )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm relative z-10">
                                          {/* Permissions module permissions */}
                                          <div className={`p-5 rounded-2xl border ${dm ? 'bg-[#0d1117]/50 border-[#30363d]' : 'bg-slate-50 border-slate-200/60'}`}>
                                            <label className="block text-blue-500 font-extrabold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                              <Server className="w-4 h-4" /> Administrative Modules
                                            </label>
                                            <div className="space-y-3">
                                              {['courses', 'exams', 'students', 'certificates', 'coupons'].map((perm) => (
                                                <label key={perm} className={`flex items-center gap-3 cursor-pointer select-none p-2 rounded-xl transition-all ${isPrimarySysAdmin ? 'opacity-60 cursor-not-allowed' : (dm ? 'hover:bg-[#1c212b]' : 'hover:bg-white hover:shadow-sm')}`}>
                                                  <div className="relative flex items-center justify-center">
                                                    <input
                                                      type="checkbox"
                                                      disabled={isPrimarySysAdmin}
                                                      checked={adminPermissions.includes(perm)}
                                                      onChange={() => togglePermission(perm)}
                                                      className="peer appearance-none w-5 h-5 rounded-[6px] border-2 border-slate-300 checked:bg-blue-600 checked:border-blue-600 transition-all dark:border-slate-600 dark:checked:bg-blue-500 dark:checked:border-blue-500"
                                                    />
                                                    <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                                                  </div>
                                                  <span className={`font-semibold text-xs ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {perm === 'courses' ? 'Course Catalog Management' : perm === 'exams' ? 'Exam MCQs Builder' : perm === 'students' ? 'Students Upgrades' : perm === 'certificates' ? 'Revoke and Reissue Certificate' : 'Discounts and Coupons Management'}
                                                  </span>
                                                </label>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Assigned Course Scope */}
                                          <div className={`p-5 rounded-2xl border flex flex-col ${dm ? 'bg-[#0d1117]/50 border-[#30363d]' : 'bg-slate-50 border-slate-200/60'}`}>
                                            <label className="block text-indigo-500 font-extrabold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                              <BookOpen className="w-4 h-4" /> Assigned Course Scope
                                            </label>
                                            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[220px]">
                                              {courses.length === 0 ? (
                                                <p className="text-xs text-slate-500 italic">No courses available.</p>
                                              ) : courses.map((crs) => (
                                                <label key={crs.id} className={`flex items-start gap-3 cursor-pointer select-none p-2.5 rounded-xl transition-all ${isPrimarySysAdmin ? 'opacity-60 cursor-not-allowed' : (dm ? 'hover:bg-[#1c212b]' : 'hover:bg-white hover:shadow-sm')}`}>
                                                  <div className="relative flex items-center justify-center mt-0.5">
                                                    <input
                                                      type="checkbox"
                                                      disabled={isPrimarySysAdmin}
                                                      checked={adminAssignedCourses.includes(crs.id)}
                                                      onChange={() => toggleAssignedCourse(crs.id)}
                                                      className="peer appearance-none w-5 h-5 rounded-[6px] border-2 border-slate-300 checked:bg-indigo-600 checked:border-indigo-600 transition-all dark:border-slate-600 dark:checked:bg-indigo-500 dark:checked:border-indigo-500"
                                                    />
                                                    <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                                                  </div>
                                                  <span className={`font-semibold text-xs leading-tight ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{crs.title}</span>
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        </div>

                                        <div className={`p-4 rounded-2xl border transition-all ${adminSuspended ? (dm ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200') : (dm ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200')}`}>
                                          <label className={`flex items-center gap-3 cursor-pointer select-none text-xs ${isPrimarySysAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <div className="relative flex items-center justify-center">
                                              <input
                                                type="checkbox"
                                                disabled={isPrimarySysAdmin}
                                                checked={adminSuspended}
                                                onChange={(e) => setAdminSuspended(e.target.checked)}
                                                className="peer appearance-none w-5 h-5 rounded-[6px] border-2 border-slate-300 checked:bg-red-600 checked:border-red-600 transition-all dark:border-slate-600 dark:checked:bg-red-500 dark:checked:border-red-500"
                                              />
                                              <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                                            </div>
                                            <div>
                                              <span className="text-red-500 font-extrabold block">Suspend Account Configuration</span>
                                              <span className={`text-[10px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Revokes system login credentials and terminates active sessions instantly.</span>
                                            </div>
                                          </label>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                          <button
                                            onClick={handleSaveAdminClearances}
                                            disabled={isPrimarySysAdmin}
                                            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex justify-center items-center gap-2"
                                          >
                                            <ShieldCheck className="w-4 h-4" /> Save Clearances securely
                                          </button>
                                          <button
                                            onClick={() => setEditingAdmin(null)}
                                            className={`px-6 py-3.5 rounded-xl font-bold cursor-pointer transition-all active:scale-[0.98] ${dm ? 'bg-[#30363d] text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                          >
                                            Cancel Configuration
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAB 3: STUDENT DIRECTORY ═══ */}
            {activeTab === 'students' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                      <span className={`bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent`}>
                        Student Directory Logs
                      </span>
                    </h1>
                    <p className={`text-sm mt-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Audit students subscription tiers, enrolled profiles, joined parameters, and toggle suspension status.
                    </p>
                  </div>
                </section>

                <div className={`rounded-3xl border overflow-hidden transition-all duration-500 ${dm ? 'bg-[#161b22] border-[#30363d] shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.05)]'}`}>
                  <div className={`p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b ${dm ? 'border-[#30363d] bg-[#0d1117]/30' : 'border-slate-100 bg-slate-50/30'}`}>
                    <div className="relative w-full max-w-md group">
                      <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${dm ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                      <input
                        type="text"
                        value={studentQuery}
                        onChange={(e) => setStudentQuery(e.target.value)}
                        placeholder="Search student profiles by name or email..."
                        className={`pl-9 pr-4 py-2.5 w-full text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${dm ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-slate-500 hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 shadow-sm'
                          }`}
                      />
                    </div>
                    <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${dm ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                      {filteredStudents.length} Registered Students
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead className={dm ? 'bg-[#0d1117]/80 text-slate-400' : 'bg-slate-50 text-slate-500'}>
                        <tr>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Identity</th>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Subscription Plan</th>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Joined Date</th>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Status</th>
                          <th className={`p-4 font-extrabold uppercase tracking-widest text-[10px] border-b ${dm ? 'border-[#30363d]' : 'border-slate-200'}`}>Administration Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500">
                              No student profiles found matching your search.
                            </td>
                          </tr>
                        ) : null}
                        {filteredStudents.map((stud) => {
                          const isEditing = editingStudent?.id === stud.id;

                          return (
                            <React.Fragment key={stud.id}>
                              <tr className={`transition-all duration-300 ${isEditing ? (dm ? 'bg-[#1e2430]' : 'bg-blue-50/50') : (dm ? 'hover:bg-[#1c212b]' : 'hover:bg-slate-50')}`}>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600">
                                      {stud.name.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="font-extrabold block text-sm text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{stud.name}</span>
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tight">{stud.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-md font-mono text-[9px] uppercase font-bold tracking-widest border ${stud.plan === 'pro'
                                    ? (dm ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200')
                                    : stud.plan === 'popular'
                                      ? (dm ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200')
                                      : (dm ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200')
                                    }`}>
                                    {stud.plan}
                                  </span>
                                </td>
                                <td className={`p-4 font-mono text-[11px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {stud.joinedDate}
                                </td>
                                <td className="p-4">
                                  {stud.suspended ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 text-[10px] font-bold uppercase tracking-wide">
                                      <BadgeAlert className="w-3.5 h-3.5" /> Suspended
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-wide">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 flex gap-2">
                                  <button
                                    onClick={() => isEditing ? setEditingStudent(null) : startConfiguringStudent(stud)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${isEditing
                                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 shadow-inner'
                                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 active:translate-y-0'
                                      }`}
                                  >
                                    {isEditing ? 'Close Profile' : 'Edit Profile'}
                                    {!isEditing && <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                </td>
                              </tr>

                              {/* INLINE student configuration form - Animated expansion */}
                              <tr className={`transition-all duration-500 ease-in-out ${isEditing ? 'opacity-100 table-row' : 'opacity-0 hidden'}`}>
                                <td colSpan={5} className="p-0 border-0">
                                  <div className={`overflow-hidden transition-all duration-500 ${isEditing ? 'max-h-[800px] border-b' : 'max-h-0'} ${dm ? 'bg-[#0d1117]/80 border-[#30363d]' : 'bg-slate-50/50 border-slate-200'}`}>
                                    <div className="p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-500">
                                      <div className={`p-6 rounded-3xl border ${dm ? 'bg-[#161b22] border-[#30363d] shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'bg-white border-indigo-100 shadow-[0_10px_40px_rgba(99,102,241,0.1)]'} space-y-6 max-w-3xl font-sans relative overflow-hidden ring-1 ring-black/5`}>
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

                                        <div className={`flex justify-between items-center border-b pb-4 ${dm ? 'border-[#30363d]' : 'border-slate-100'}`}>
                                          <div>
                                            <h4 className={`font-black text-lg ${dm ? 'text-white' : 'text-slate-900'}`}>Edit Student Profile</h4>
                                            <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Modifying details for <span className="font-bold text-indigo-500">{stud.name}</span></p>
                                          </div>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                          <div className={`p-5 rounded-2xl border ${dm ? 'bg-[#0d1117]/50 border-[#30363d]' : 'bg-slate-50 border-slate-200/60'}`}>
                                            <label className="block text-indigo-500 font-extrabold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                              <Award className="w-4 h-4" /> Platform Subscription Tiers
                                            </label>
                                            <div className="relative">
                                              <select
                                                value={studentPlan}
                                                onChange={(e) => setStudentPlan(e.target.value as any)}
                                                className={`appearance-none w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold text-sm cursor-pointer ${dm ? 'bg-[#161b22] border-[#404853] text-white hover:border-indigo-500/50' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-300 shadow-sm'
                                                  }`}
                                              >
                                                <option value="free">Free Starter Plan</option>
                                                <option value="starter">Starter Monthly Tier</option>
                                                <option value="popular">Popular Semiannual Tier</option>
                                                <option value="pro">Super Pro Unlimited Certification</option>
                                              </select>
                                              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${dm ? 'text-slate-400' : 'text-slate-500'}`} />
                                            </div>
                                          </div>

                                          <div className={`p-4 rounded-2xl border transition-all ${studentSuspended ? (dm ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200') : (dm ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200')}`}>
                                            <label className="flex items-center gap-3 cursor-pointer select-none text-xs">
                                              <div className="relative flex items-center justify-center">
                                                <input
                                                  type="checkbox"
                                                  checked={studentSuspended}
                                                  onChange={(e) => setStudentSuspended(e.target.checked)}
                                                  className="peer appearance-none w-5 h-5 rounded-[6px] border-2 border-slate-300 checked:bg-red-600 checked:border-red-600 transition-all dark:border-slate-600 dark:checked:bg-red-500 dark:checked:border-red-500"
                                                />
                                                <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                                              </div>
                                              <div>
                                                <span className="text-red-500 font-extrabold block">Suspend Account Completely</span>
                                                <span className={`text-[10px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Locks out the student from logging into the platform entirely.</span>
                                              </div>
                                            </label>
                                          </div>

                                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <button
                                              onClick={handleSaveStudentParameters}
                                              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex justify-center items-center gap-2"
                                            >
                                              <ShieldCheck className="w-4 h-4" /> Save Student Parameters
                                            </button>
                                            <button
                                              onClick={() => setEditingStudent(null)}
                                              className={`px-6 py-3.5 rounded-xl font-bold cursor-pointer transition-all active:scale-[0.98] ${dm ? 'bg-[#30363d] text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                            >
                                              Cancel Configuration
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAB 4: COURSE CATALOGS ═══ */}
            {activeTab === 'courses' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {!editingCourse ? (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <section>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      <span className={`bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-500 bg-clip-text text-transparent`}>
                        Platform Course Management
                      </span>
                    </h1>
                    <p className={`text-sm mt-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Append new course modules, modify details descriptions, modify visibility, or edit video chapters list.
                    </p>
                  </section>
                  <button
                    onClick={() => setShowAddCourse(!showAddCourse)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-extrabold rounded-[1rem] flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Add Course Catalog
                  </button>
                </div>

                {/* ADD COURSE form banner */}
                {showAddCourse && (
                  <div className={`p-6 md:p-8 rounded-[2rem] border relative overflow-hidden animate-in slide-in-from-top-4 duration-300 ${dm ? 'bg-[#161b22]/80 border-[#30363d] shadow-sm' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)]'
                    }`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                    <h3 className={`font-extrabold text-sm border-b pb-3 mb-6 relative z-10 ${dm ? 'text-white border-[#30363d]' : 'text-slate-900 border-slate-100'}`}>Add New Course Chapter</h3>
                    <form onSubmit={handleCreateCourse} className="space-y-4 text-xs font-medium">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400">Course Title *</label>
                          <input
                            type="text"
                            value={newCourse.title}
                            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            required
                            placeholder="e.g. Master Course in AI and LLMs"
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400">Category Tag</label>
                          <select
                            value={newCourse.category}
                            onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value as any })}
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-250 text-slate-800'
                              }`}
                          >
                            <option value="Tech">Technology and Engineering</option>
                            <option value="Business">Management & Business</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400">Instructor Name</label>
                          <input
                            type="text"
                            value={newCourse.instructorName}
                            onChange={(e) => setNewCourse({ ...newCourse, instructorName: e.target.value })}
                            placeholder="e.g. IIT Madras Graduates Council"
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400">Notes & Guides URL</label>
                          <input
                            type="text"
                            value={newCourse.notesUrl}
                            onChange={(e) => setNewCourse({ ...newCourse, notesUrl: e.target.value })}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400">Course Description</label>
                        <textarea
                          rows={3}
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                          required
                          placeholder="Input detailed syllabus overview here..."
                          className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400">Thumbnail URL</label>
                          <input
                            type="text"
                            value={newCourse.thumbnailUrl}
                            onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400">Cover Banner URL</label>
                          <input
                            type="text"
                            value={newCourse.bannerUrl}
                            onChange={(e) => setNewCourse({ ...newCourse, bannerUrl: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400">Retail Exam Price (₹)</label>
                          <input
                            type="number"
                            value={newCourse.examPrice}
                            onChange={(e) => setNewCourse({ ...newCourse, examPrice: Number(e.target.value) })}
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400">Discount Price (₹)</label>
                          <input
                            type="number"
                            value={newCourse.discountPrice}
                            onChange={(e) => setNewCourse({ ...newCourse, discountPrice: Number(e.target.value) })}
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400">Duration (Minutes)</label>
                          <input
                            type="number"
                            value={newCourse.durationMins}
                            onChange={(e) => setNewCourse({ ...newCourse, durationMins: Number(e.target.value) })}
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400">Pass Percentage (%)</label>
                          <input
                            type="number"
                            value={newCourse.passPercentage}
                            onChange={(e) => setNewCourse({ ...newCourse, passPercentage: Number(e.target.value) })}
                            className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400">Assignments (JSON Array)</label>
                          <textarea
                            rows={3}
                            value={newCourse.assignmentsText}
                            onChange={(e) => setNewCourse({ ...newCourse, assignmentsText: e.target.value })}
                            placeholder='[ { "id": "assign-1", "title": "Submit Linear Algebra Notebook" } ]'
                            className={`w-full p-2.5 font-mono text-[10px] rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 focus:ring-blue-500' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400">Quizzes Checklist (JSON Array)</label>
                          <textarea
                            rows={3}
                            value={newCourse.quizzesText}
                            onChange={(e) => setNewCourse({ ...newCourse, quizzesText: e.target.value })}
                            placeholder='[ { "id": "quiz-1", "question": "What is 2+2?", "options": ["3","4","5"], "answerIndex": 1 } ]'
                            className={`w-full p-2.5 font-mono text-[10px] rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 focus:ring-blue-500' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
                          <input
                            type="checkbox"
                            checked={newCourse.active}
                            onChange={(e) => setNewCourse({ ...newCourse, active: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 h-4 w-4"
                          />
                          <span>Active Visibility (Publish on marketplace immediately)</span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition cursor-pointer"
                        >
                          Publish Course
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCourse(false)}
                          className="px-4 py-2 bg-slate-500 text-white rounded font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Courses listing search */}
                <div className={`rounded-[2rem] border overflow-hidden ${dm ? 'bg-[#161b22]/80 border-[#30363d] shadow-sm' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)]'}`}>
                  <div className={`p-5 border-b ${dm ? 'border-[#30363d]' : 'border-slate-100'}`}>
                    <div className="relative max-w-sm">
                      <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        value={courseQuery}
                        onChange={(e) => setCourseQuery(e.target.value)}
                        placeholder="Search courses catalogs..."
                        className={`pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${dm ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCoursesList.map((crs, idx) => {
                      const colors = [
                        { theme: 'blue', gradient: 'from-blue-500/10 to-indigo-500/10', borderHover: 'hover:border-blue-500/40', text: 'text-blue-500', bgBtn: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-[0_4px_15px_rgba(59,130,246,0.3)]', bgBadge: 'bg-blue-50 text-blue-600 border-blue-200/60', darkBadge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                        { theme: 'emerald', gradient: 'from-emerald-500/10 to-teal-500/10', borderHover: 'hover:border-emerald-500/40', text: 'text-emerald-500', bgBtn: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.3)]', bgBadge: 'bg-emerald-50 text-emerald-600 border-emerald-200/60', darkBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                        { theme: 'purple', gradient: 'from-purple-500/10 to-fuchsia-500/10', borderHover: 'hover:border-purple-500/40', text: 'text-purple-500', bgBtn: 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-[0_4px_15px_rgba(168,85,247,0.3)]', bgBadge: 'bg-purple-50 text-purple-600 border-purple-200/60', darkBadge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                        { theme: 'amber', gradient: 'from-amber-500/10 to-orange-500/10', borderHover: 'hover:border-amber-500/40', text: 'text-amber-500', bgBtn: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-[0_4px_15px_rgba(245,158,11,0.3)]', bgBadge: 'bg-amber-50 text-amber-600 border-amber-200/60', darkBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                        { theme: 'rose', gradient: 'from-rose-500/10 to-pink-500/10', borderHover: 'hover:border-rose-500/40', text: 'text-rose-500', bgBtn: 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-[0_4px_15px_rgba(244,63,94,0.3)]', bgBadge: 'bg-rose-50 text-rose-600 border-rose-200/60', darkBadge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
                        { theme: 'indigo', gradient: 'from-indigo-500/10 to-violet-500/10', borderHover: 'hover:border-indigo-500/40', text: 'text-indigo-500', bgBtn: 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-[0_4px_15px_rgba(99,102,241,0.3)]', bgBadge: 'bg-indigo-50 text-indigo-600 border-indigo-200/60', darkBadge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' }
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <div key={crs.id} className={`group relative p-6 rounded-[1.5rem] border overflow-hidden transition-all duration-300 ${
                          dm ? `bg-gradient-to-br from-[#161b22] to-[#0d1117] border-[#30363d] ${color.borderHover} hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]` : `bg-gradient-to-br from-white to-slate-50 border-slate-200/80 hover:shadow-[0_12px_35px_rgb(0,0,0,0.06)] ${color.borderHover}`
                        } flex flex-col h-full`}>
                          <div className={`absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br ${color.gradient} rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700`} />
                          
                          <div className="flex justify-between items-start gap-4 relative z-10 mb-4">
                            <div>
                              <span className={`inline-flex px-2.5 py-1 text-[9px] tracking-widest uppercase font-black rounded-lg border ${dm ? color.darkBadge : color.bgBadge}`}>
                                {crs.category}
                              </span>
                              <h4 className={`font-black text-[17px] mt-3 leading-snug transition-colors ${dm ? 'text-white' : 'text-slate-900'} group-hover:${color.text}`}>{crs.title}</h4>
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl border shrink-0 shadow-sm ${dm ? 'bg-[#161b22]/80 border-[#30363d]' : 'bg-white border-slate-100'}`}>
                              <span className={`text-sm font-mono font-black ${color.text}`}>₹{crs.examPrice}</span>
                            </div>
                          </div>

                          <p className={`text-[11px] line-clamp-3 leading-relaxed relative z-10 mb-4 flex-grow ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{crs.description}</p>

                          <div className={`flex justify-between items-center text-[10px] font-bold pb-4 border-b relative z-10 mb-4 ${dm ? 'border-[#30363d] text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                            <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {crs.lectures?.length || 0} Lectures Added</span>
                            <span>{crs.active ? (
                              <span className="text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Published</span>
                            ) : (
                              <span className="text-amber-500 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20"><XCircle className="w-3.5 h-3.5" /> Draft</span>
                            )}</span>
                          </div>

                          <div className="flex gap-2 relative z-10 mt-auto">
                            <button
                              onClick={() => {
                                setEditingCourse(crs);
                                setEditingCourseLecturesText(JSON.stringify(crs.lectures || [], null, 2));
                                setEditingCourseAssignmentsText(JSON.stringify(crs.assignments || [], null, 2));
                                setEditingCourseQuizzesText(JSON.stringify(crs.quizzes || [], null, 2));
                              }}
                              className={`flex-1 py-3 px-4 ${color.bgBtn} text-white text-[11px] font-extrabold rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2`}
                            >
                              <Settings className="w-3.5 h-3.5" /> Edit Details & Lectures
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(crs.id, crs.title)}
                              className={`p-3 rounded-xl border transition-all duration-300 active:scale-95 flex items-center justify-center ${dm ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                              title="Purge Catalog"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </>
              ) : (
                <div className="animate-in slide-in-from-right-8 duration-500 relative flex flex-col">
                  {/* Page Header (Sticky) */}
                  <div className={`sticky top-0 z-20 px-6 py-4 mb-6 rounded-3xl border flex flex-col sm:flex-row justify-between sm:items-center backdrop-blur-xl shadow-sm gap-4 ${
                    dm ? 'bg-[#161b22]/90 border-[#30363d]' : 'bg-white/90 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setEditingCourse(null)} 
                        className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 font-bold text-sm border shadow-sm ${
                          dm ? 'bg-[#30363d] text-white hover:bg-slate-700 border-[#404853]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" /> Back to Courses
                      </button>
                      <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-[#30363d] mx-2"></div>
                      <div className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center ${dm ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Settings className="w-5 h-5" />
                      </div>
                      <div className="hidden sm:block">
                        <h3 className={`font-black text-lg leading-tight line-clamp-1 ${dm ? 'text-white' : 'text-slate-900'}`}>Edit Specs: {editingCourse.title}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Course Configuration Page</p>
                      </div>
                    </div>
                  </div>

                  {/* Page Body */}
                  <div className={`relative w-full overflow-hidden rounded-[2rem] border shadow-[0_20px_60px_rgb(0,0,0,0.05)] flex flex-col ${
                    dm ? 'bg-gradient-to-br from-[#161b22] to-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200/80'
                  }`}>
                    <div className="p-6 md:p-8 relative">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <form onSubmit={handleSaveCourseEdits} className="space-y-6 text-xs font-medium relative z-10">
                          {/* Top Specs */}
                          <div className={`p-5 rounded-2xl border ${dm ? 'bg-[#0d1117]/50 border-[#30363d]' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Title *</label>
                                <input
                                  type="text"
                                  value={editingCourse.title}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                  required
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Category Tag</label>
                                <select
                                  value={editingCourse.category}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                >
                                  <option value="Tech">Technology & Computer Science</option>
                                  <option value="Business">Business & Analytics</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Instructor Name</label>
                                <input
                                  type="text"
                                  value={editingCourse.instructorName || ''}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, instructorName: e.target.value })}
                                  placeholder="e.g. IIT Madras Graduates Council"
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Notes & Guides URL</label>
                                <input
                                  type="text"
                                  value={editingCourse.notesUrl || ''}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, notesUrl: e.target.value })}
                                  placeholder="https://drive.google.com/drive/folders/..."
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Syllabus Description</label>
                              <textarea
                                rows={3}
                                value={editingCourse.description}
                                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                required
                                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                  dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Media URLs */}
                          <div className={`p-5 rounded-2xl border ${dm ? 'bg-[#0d1117]/50 border-[#30363d]' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                            <h4 className={`font-bold text-[10px] uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Media Assets</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Thumbnail URL</label>
                                <input
                                  type="text"
                                  value={editingCourse.thumbnailUrl || ''}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, thumbnailUrl: e.target.value })}
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Cover Banner URL</label>
                                <input
                                  type="text"
                                  value={editingCourse.bannerUrl || ''}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, bannerUrl: e.target.value })}
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Structure */}
                          <div className={`p-5 rounded-2xl border ${dm ? 'bg-[#0d1117]/50 border-[#30363d]' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                            <h4 className={`font-bold text-[10px] uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Pricing & Structure</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Exam Price (₹)</label>
                                <input
                                  type="number"
                                  value={editingCourse.examPrice}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, examPrice: Number(e.target.value) })}
                                  required
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono font-bold text-blue-500 ${
                                    dm ? 'bg-[#161b22] border-[#30363d] hover:border-[#404853]' : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Discount Price (₹)</label>
                                <input
                                  type="number"
                                  value={editingCourse.discountPrice || 0}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, discountPrice: Number(e.target.value) })}
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono font-bold ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Duration (Mins)</label>
                                <input
                                  type="number"
                                  value={editingCourse.durationMins || 60}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, durationMins: Number(e.target.value) })}
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono font-bold ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-white hover:border-[#404853]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={`font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Pass %</label>
                                <input
                                  type="number"
                                  value={editingCourse.passPercentage || 70}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, passPercentage: Number(e.target.value) })}
                                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono font-bold ${
                                    dm ? 'bg-[#161b22] border-[#30363d] text-emerald-400 hover:border-[#404853]' : 'bg-white border-slate-200 text-emerald-600 hover:border-slate-300'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Raw JSON Data Blocks */}
                          <div className={`p-5 rounded-2xl border ${dm ? 'bg-[#0d1117]/50 border-[#30363d]' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                            <h4 className={`font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}><Terminal className="w-3.5 h-3.5" /> Advanced JSON Editing</h4>
                            
                            <div className="space-y-1.5">
                              <label className={`text-[10px] block font-bold uppercase tracking-wider ${dm ? 'text-indigo-400' : 'text-indigo-600'}`}>Video Lecture Modules list</label>
                              <textarea
                                rows={4}
                                value={editingCourseLecturesText}
                                onChange={(e) => setEditingCourseLecturesText(e.target.value)}
                                placeholder='[ { "title": "Intro Lecture", "videoId": "aircAruvnKk" } ]'
                                className={`w-full p-4 font-mono text-[11px] rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner ${
                                  dm ? 'bg-[#000000]/40 border-[#30363d] text-sky-300' : 'bg-slate-100/50 border-slate-200 text-sky-600'
                                }`}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className={`text-[10px] block font-bold uppercase tracking-wider ${dm ? 'text-emerald-400' : 'text-emerald-600'}`}>Assignments list</label>
                                <textarea
                                  rows={4}
                                  value={editingCourseAssignmentsText}
                                  onChange={(e) => setEditingCourseAssignmentsText(e.target.value)}
                                  placeholder='[ { "id": "assign-1", "title": "Practical SQL exercise" } ]'
                                  className={`w-full p-4 font-mono text-[11px] rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner ${
                                    dm ? 'bg-[#000000]/40 border-[#30363d] text-emerald-300' : 'bg-slate-100/50 border-slate-200 text-emerald-600'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={`text-[10px] block font-bold uppercase tracking-wider ${dm ? 'text-amber-400' : 'text-amber-600'}`}>Quizzes checklist</label>
                                <textarea
                                  rows={4}
                                  value={editingCourseQuizzesText}
                                  onChange={(e) => setEditingCourseQuizzesText(e.target.value)}
                                  placeholder='[ { "id": "q-1", "question": "Explain KNN?", "options": ["Linear","Cluster","Classification"], "answerIndex": 2 } ]'
                                  className={`w-full p-4 font-mono text-[11px] rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-inner ${
                                    dm ? 'bg-[#000000]/40 border-[#30363d] text-amber-300' : 'bg-slate-100/50 border-slate-200 text-amber-600'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          <div className={`p-4 rounded-xl border flex items-center transition-all ${
                            editingCourse.active ? (dm ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200') : (dm ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200')
                          }`}>
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                              <div className="relative flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={editingCourse.active}
                                  onChange={(e) => setEditingCourse({ ...editingCourse, active: e.target.checked })}
                                  className="peer appearance-none w-5 h-5 rounded-[6px] border-2 border-slate-300 checked:bg-emerald-500 checked:border-emerald-500 transition-all dark:border-slate-600 dark:checked:bg-emerald-500 dark:checked:border-emerald-500"
                                />
                                <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                              </div>
                              <div>
                                <span className="font-extrabold block text-sm">Published & Enrollable</span>
                                <span className={`text-[10px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Make this course visible to students on the marketplace.</span>
                              </div>
                            </label>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                              type="submit"
                              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-extrabold text-sm cursor-pointer transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-5 h-5" /> Apply Course Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCourse(null)}
                              className={`flex-1 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all active:scale-[0.98] ${
                                dm ? 'bg-[#30363d] text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              Cancel Customization
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ TAB 5: CERTIFICATE AUDIT LEDGER ═══ */}
            {activeTab === 'certificates' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <section>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      <span className={`bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent`}>
                        Certificates Auditing Ledger
                      </span>
                    </h1>
                    <p className={`text-sm mt-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Audit verification hashes, reissue legitimate student certifications, or void forged credentials entries.
                    </p>
                  </section>

                  <button
                    onClick={() => {
                      if (studentsList.length === 0 || courses.length === 0) {
                        onToast('Cannot issue certificate: Students or Courses records are empty.', 'ref');
                        return;
                      }
                      // Pre-set selections to prevent blanks
                      setManualStudentId(studentsList[0]?.id || '');
                      setManualCourseId(courses[0]?.id || '');
                      setShowManualIssueModal(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-extrabold rounded-[1rem] flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Manually Issue Certificate
                  </button>
                </div>

                <div className={`rounded-[2rem] border overflow-hidden ${dm ? 'bg-[#161b22]/80 border-[#30363d] shadow-sm' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)]'}`}>
                  <div className={`p-5 border-b ${dm ? 'border-[#30363d]' : 'border-slate-100'}`}>
                    <div className="relative max-w-sm">
                      <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        value={certificateQuery}
                        onChange={(e) => setCertificateQuery(e.target.value)}
                        placeholder="Index recipient name, course, or ID..."
                        className={`pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${dm ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                      <thead className={dm ? 'bg-[#0d1117]/80 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-[#30363d]' : 'bg-slate-50/80 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-b border-slate-200'}>
                        <tr>
                          <th className="p-5 font-black">Recipient Student</th>
                          <th className="p-5 font-black">Certificate ID / Hash</th>
                          <th className="p-5 font-black">Assessed Course</th>
                          <th className={`p-5 font-black border-l border-r ${dm ? 'border-[#30363d]' : 'border-slate-200'} text-center`}>Ledger Status</th>
                          <th className="p-5 font-black text-center">Revision Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {filteredCertificates.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <Search className={`w-8 h-8 ${dm ? 'text-slate-600' : 'text-slate-300'}`} />
                                <span className={`text-sm font-bold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>No certificate qualifications matching "{certificateQuery}" found.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredCertificates.map((cert: any) => {
                            const certId = cert.certificateId || cert.id;
                            const isRevoked = cert.status === 'REVOKED' || cert.revoked === true;

                            return (
                              <tr key={cert.id} className={`transition-all duration-200 ${dm ? 'hover:bg-[#161b22] border-[#30363d]' : 'hover:bg-slate-50 border-slate-100'} group`}>
                                <td className="p-5 align-middle">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${dm ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                                      {(cert.userName || cert.studentName || 'S')[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <strong className={`block text-sm font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{cert.userName || cert.studentName}</strong>
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Grade: <span className={dm ? 'text-emerald-400' : 'text-emerald-600'}>{cert.grade || 'A'}</span> ({cert.score || 100}%)</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-5 align-middle">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-[11px] font-black tracking-wide ${dm ? 'bg-[#0d1117] border-[#30363d] text-blue-400' : 'bg-white border-slate-200 text-blue-600 shadow-sm'}`}>
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {certId}
                                  </div>
                                </td>
                                <td className="p-5 align-middle">
                                  <span className={`font-bold text-[13px] ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {cert.courseTitle || cert.courseName}
                                  </span>
                                </td>
                                <td className={`p-5 align-middle text-center border-l border-r ${dm ? 'border-[#30363d]' : 'border-slate-100'}`}>
                                  {isRevoked ? (
                                    <div className="flex flex-col items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] uppercase font-black text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                                        <XCircle className="w-3 h-3" /> REVOKED
                                      </span>
                                      {cert.revocationReason && (
                                        <span className={`block text-[9px] font-bold max-w-[120px] truncate ${dm ? 'text-slate-500' : 'text-slate-400'}`} title={cert.revocationReason}>
                                          {cert.revocationReason}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] uppercase font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                      <CheckCircle2 className="w-3 h-3" /> VALID
                                    </span>
                                  )}
                                </td>
                                <td className="p-5 align-middle">
                                  <div className="flex items-center justify-center gap-2">
                                    {/* 1. View & Print */}
                                    <button
                                      onClick={() => setPreviewAdminCert(cert)}
                                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
                                        dm ? 'bg-[#30363d] text-white hover:bg-slate-700 border-[#404853]' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm'
                                      }`}
                                    >
                                      <Eye className="w-3.5 h-3.5 text-blue-500" /> Preview
                                    </button>

                                    {/* 2. Revoke vs Reactivate */}
                                    {isRevoked ? (
                                      <button
                                        onClick={() => handleSuperAdminReactivate(cert.id)}
                                        className="px-3 py-1.5 rounded-xl font-bold text-[11px] text-white bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Restore
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setRevokingCertId(cert.id);
                                          setRevokeReasonInput('');
                                        }}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
                                          dm ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                        }`}
                                      >
                                        <BadgeAlert className="w-3.5 h-3.5" /> Revoke
                                      </button>
                                    )}

                                    {/* 3. Permanent Deletion */}
                                    <div className={`w-px h-6 mx-1 ${dm ? 'bg-[#30363d]' : 'bg-slate-200'}`}></div>
                                    <button
                                      onClick={() => handleSuperAdminDelete(cert.id)}
                                      className={`p-2 rounded-xl transition-all cursor-pointer border ${
                                        dm ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border-transparent' : 'text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-transparent'
                                      }`}
                                      title="Permanent record deletion from disc store"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* A. MANUAL ISSUE CERTIFICATE LIGHTBOX MODAL */}
                {showManualIssueModal && (
                  <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-900'
                      }`}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#c9a84c]">Manual Credentials Generation</h3>
                        <button
                          onClick={() => setShowManualIssueModal(false)}
                          className="p-1 rounded-full hover:bg-red-500/10 text-slate-450 hover:text-red-500 transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleManualIssueSubmit} className="space-y-4 text-xs font-semibold">
                        <div>
                          <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[9px] tracking-wider">Select Recipient Student</label>
                          <select
                            value={manualStudentId}
                            onChange={(e) => setManualStudentId(e.target.value)}
                            className={`w-full p-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                              }`}
                            required
                          >
                            <option value="">-- Choose recipient --</option>
                            {studentsList.map((stud) => (
                              <option key={stud.id} value={stud.id}>
                                {stud.name} ({stud.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[9px] tracking-wider">Select Certified Program</label>
                          <select
                            value={manualCourseId}
                            onChange={(e) => setManualCourseId(e.target.value)}
                            className={`w-full p-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                              }`}
                            required
                          >
                            <option value="">-- Choose course --</option>
                            {courses.map((crs) => (
                              <option key={crs.id} value={crs.id}>
                                {crs.title} ({crs.category})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[9px] tracking-wider">Performance Score (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={manualScore}
                              onChange={(e) => setManualScore(Number(e.target.value))}
                              className={`w-full p-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                                }`}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[9px] tracking-wider">Assigned Grade</label>
                            <select
                              value={manualGrade}
                              onChange={(e) => setManualGrade(e.target.value)}
                              className={`w-full p-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                                }`}
                              required
                            >
                              <option value="Distinction">Distinction</option>
                              <option value="First Class">First Class</option>
                              <option value="Passed">Passed</option>
                              <option value="A+">A+</option>
                              <option value="A">A</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-450 italic leading-relaxed pt-1">
                          * Generates formatted Certificate and publishes QR stamp verifiable public directories on graduation save click.
                        </p>

                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider text-slate-950 bg-[#c9a84c] hover:bg-[#d9b85c] active:scale-95 transition-all text-center mt-3 shadow-lg"
                        >
                          Authenticate and Issue Certificate
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* B. REVOCATION REASON MODAL LIGHTBOX */}
                {revokingCertId && (
                  <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className={`relative w-full max-w-sm rounded-2xl p-6 border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-900'
                      }`}>
                      <h3 className="font-extrabold text-sm mb-2 text-red-500 uppercase tracking-widest">Reason for Void Action</h3>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        Voiding are logged for system audit logs. State below why this student qualification is being suspended or declared void.
                      </p>

                      <div className="space-y-4 text-xs font-semibold">
                        <input
                          type="text"
                          value={revokeReasonInput}
                          onChange={(e) => setRevokeReasonInput(e.target.value)}
                          placeholder="e.g. Unfair practices during MCF test"
                          className={`w-full p-2.5 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          required
                        />

                        <div className="flex gap-2 font-extrabold">
                          <button
                            onClick={handleSuperAdminRevoke}
                            className="flex-grow py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all text-center"
                          >
                            Confirm Revoke void
                          </button>
                          <button
                            onClick={() => setRevokingCertId(null)}
                            className={`px-4 py-2 rounded-xl border transition-all ${darkMode ? 'border-slate-800 text-slate-350 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* C. DETAILED LANDSCAPE PDF PREVIEW LIGHTBOX */}
                {previewAdminCert && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-4">
                    <div className={`relative w-full max-w-4xl rounded-3xl p-6 sm:p-8 border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                      }`}>
                      <div className="flex justify-between items-center mb-6 text-slate-800 dark:text-white">
                        <div>
                          <span className="text-[10px] uppercase font-extrabold text-blue-500 tracking-wider">Credential Live Audit</span>
                          <h3 className="text-lg font-extrabold">Professional Qualification Preview</h3>
                        </div>
                        <button
                          onClick={() => setPreviewAdminCert(null)}
                          className="p-1 px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        >
                          Close Preview
                        </button>
                      </div>

                      <PremiumCertificate certificate={previewAdminCert} darkMode={darkMode} />
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ═══ TAB 6: REVENUES & BILLING ═══ */}
            {activeTab === 'payments' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    <span className={`bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent`}>
                      Platform Financial Revenues
                    </span>
                  </h1>
                  <p className={`text-sm mt-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    Audit incoming stripe/razorpay billing ledgers and track interactive business growth graphs.
                  </p>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className={`group p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${dm ? 'bg-gradient-to-br from-[#161b22] to-[#0d1117] border-[#30363d] hover:border-blue-500/50 hover:shadow-blue-500/20' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-blue-500/10 hover:border-blue-300'}`}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 group-hover:bg-blue-500/30 transition-all duration-700 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Total Recurrent Revenues</span>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-6 ${dm ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                      <span className="text-4xl font-black text-blue-500 tracking-tight">₹{stats.totalRevenue || 0}</span>
                    </div>
                  </div>
                  
                  {/* Card 2 */}
                  <div className={`group p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${dm ? 'bg-gradient-to-br from-[#161b22] to-[#0d1117] border-[#30363d] hover:border-emerald-500/50 hover:shadow-emerald-500/20' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-emerald-500/10 hover:border-emerald-300'}`}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 group-hover:bg-emerald-500/30 transition-all duration-700 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Daily Gateways Volume</span>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 group-hover:-rotate-6 ${dm ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          <Activity className="w-5 h-5 animate-pulse" />
                        </div>
                      </div>
                      <span className="text-4xl font-black text-emerald-500 tracking-tight">₹{stats.todayRevenue || 0}</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className={`group p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${dm ? 'bg-gradient-to-br from-[#161b22] to-[#0d1117] border-[#30363d] hover:border-purple-500/50 hover:shadow-purple-500/20' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-purple-500/10 hover:border-purple-300'}`}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-150 group-hover:bg-purple-500/30 transition-all duration-700 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Auditable Transactions</span>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-12 ${dm ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                      </div>
                      <span className="text-4xl font-black text-purple-500 tracking-tight">{(stats.allPayments || []).length} <span className="text-lg">Count</span></span>
                    </div>
                  </div>
                </div>

                {/* Revenues line plot graph */}
                {/* Revenues line plot graph */}
                <div className={`group p-6 md:p-8 rounded-[2rem] border relative overflow-hidden transition-all duration-700 hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)] ${dm ? 'bg-gradient-to-br from-[#161b22] to-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)]'} space-y-6`}>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-1000" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-500/20 transition-all duration-1000" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <h3 className={`font-black text-lg tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>Financial Scaling Growth</h3>
                      <p className={`text-[11px] font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Quarterly Trajectory Analysis</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${dm ? 'bg-[#0d1117] border-[#30363d] text-blue-400' : 'bg-slate-50 border-slate-200 text-blue-600'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Live Sync
                    </div>
                  </div>

                  <div className="relative h-64 w-full pt-4 mt-2">
                    <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible relative z-10">
                      <style>
                        {`
                          @keyframes drawLine {
                            0% { stroke-dasharray: 1500; stroke-dashoffset: 1500; }
                            100% { stroke-dasharray: 1500; stroke-dashoffset: 0; }
                          }
                          .animated-line {
                            animation: drawLine 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                          }
                          @keyframes fadeFill {
                            0% { opacity: 0; transform: translateY(20px); }
                            100% { opacity: 0.3; transform: translateY(0); }
                          }
                          .animated-fill {
                            animation: fadeFill 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                            animation-delay: 1.5s;
                            opacity: 0;
                          }
                          @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-5px); }
                            100% { transform: translateY(0px); }
                          }
                          .floating-tooltip {
                            animation: fadeFill 1s forwards, float 4s ease-in-out infinite;
                            animation-delay: 2s;
                            opacity: 0;
                          }
                          @keyframes pointPulse {
                            0% { transform: scale(1); opacity: 0.8; }
                            50% { transform: scale(1.6); opacity: 1; }
                            100% { transform: scale(1); opacity: 0.8; }
                          }
                          .point-pulse {
                            animation: pointPulse 2s infinite;
                            transform-origin: center;
                          }
                          .grid-line {
                            stroke-dasharray: 4;
                            animation: fadeFill 2s forwards;
                            opacity: 0;
                          }
                        `}
                      </style>

                      {/* Horizontal Grid Lines */}
                      <line x1="0" y1="130" x2="500" y2="130" stroke={dm ? '#334155' : '#cbd5e1'} strokeWidth="1" className="grid-line" style={{ animationDelay: '0.1s' }} />
                      <line x1="0" y1="90" x2="500" y2="90" stroke={dm ? '#334155' : '#cbd5e1'} strokeWidth="1" className="grid-line" style={{ animationDelay: '0.2s' }} />
                      <line x1="0" y1="50" x2="500" y2="50" stroke={dm ? '#334155' : '#cbd5e1'} strokeWidth="1" className="grid-line" style={{ animationDelay: '0.3s' }} />
                      <line x1="0" y1="10" x2="500" y2="10" stroke={dm ? '#334155' : '#cbd5e1'} strokeWidth="1" className="grid-line" style={{ animationDelay: '0.4s' }} />

                      {/* Vertical Reference Lines */}
                      <line x1="130" y1="10" x2="130" y2="130" stroke={dm ? '#334155' : '#cbd5e1'} strokeWidth="1" className="grid-line" style={{ animationDelay: '0.5s' }} />
                      <line x1="250" y1="10" x2="250" y2="130" stroke={dm ? '#334155' : '#cbd5e1'} strokeWidth="1" className="grid-line" style={{ animationDelay: '0.6s' }} />
                      <line x1="370" y1="10" x2="370" y2="130" stroke={dm ? '#334155' : '#cbd5e1'} strokeWidth="1" className="grid-line" style={{ animationDelay: '0.7s' }} />

                      <defs>
                        <linearGradient id="blueGradSuperAnim" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="30%" stopColor="#6366F1" />
                          <stop offset="70%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Complex Filled Area */}
                      <path
                        d="M 10 130 
                           L 10 110 L 50 115 L 90 90 L 130 100 
                           L 170 70 L 210 80 L 250 55 L 290 65 
                           L 330 35 L 370 45 L 410 20 L 450 30 L 490 10 
                           L 490 130 Z"
                        fill="url(#blueGradSuperAnim)"
                        className="animated-fill"
                      />

                      {/* Complex Animated Line */}
                      <path
                        d="M 10 110 
                           L 50 115 L 90 90 L 130 100 
                           L 170 70 L 210 80 L 250 55 L 290 65 
                           L 330 35 L 370 45 L 410 20 L 450 30 L 490 10"
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="animated-line"
                        filter="url(#neonGlow)"
                      />

                      {/* Interactive Target Nodes */}
                      <circle cx="130" cy="100" r="4" className={`fill-indigo-500 ${dm ? 'stroke-[#161b22]' : 'stroke-white'} stroke-[3px] point-pulse`} style={{ transformOrigin: '130px 100px', animationDelay: '0.8s' }} />
                      <circle cx="250" cy="55" r="4" className={`fill-purple-500 ${dm ? 'stroke-[#161b22]' : 'stroke-white'} stroke-[3px] point-pulse`} style={{ transformOrigin: '250px 55px', animationDelay: '1.2s' }} />
                      <circle cx="370" cy="45" r="4" className={`fill-fuchsia-500 ${dm ? 'stroke-[#161b22]' : 'stroke-white'} stroke-[3px] point-pulse`} style={{ transformOrigin: '370px 45px', animationDelay: '1.6s' }} />
                      <circle cx="490" cy="10" r="6" className={`fill-pink-500 ${dm ? 'stroke-[#161b22]' : 'stroke-white'} stroke-[4px] point-pulse`} style={{ transformOrigin: '490px 10px', animationDelay: '2s' }} filter="url(#neonGlow)" />

                      {/* Floating Tooltip at the Peak */}
                      <g className="floating-tooltip" transform="translate(390, -15)">
                        <rect x="0" y="0" width="80" height="35" rx="8" fill={dm ? '#1e293b' : '#ffffff'} stroke={dm ? '#334155' : '#e2e8f0'} strokeWidth="1" filter="url(#neonGlow)" />
                        <text x="40" y="14" fill={dm ? '#94a3b8' : '#64748B'} className="text-[7px] font-black uppercase tracking-widest text-center" textAnchor="middle">Current Peak</text>
                        <text x="40" y="27" fill={dm ? '#38bdf8' : '#0ea5e9'} className="text-[11px] font-black text-center" textAnchor="middle">+32.4% ▲</text>
                      </g>

                      {/* Labels */}
                      <text x="10" y="150" fill={dm ? '#64748B' : '#94a3b8'} className="text-[10px] font-black uppercase tracking-wider">Start</text>
                      <text x="130" y="150" fill={dm ? '#64748B' : '#94a3b8'} className="text-[10px] font-black uppercase tracking-wider text-center" textAnchor="middle">Q1</text>
                      <text x="250" y="150" fill={dm ? '#64748B' : '#94a3b8'} className="text-[10px] font-black uppercase tracking-wider text-center" textAnchor="middle">Q2</text>
                      <text x="370" y="150" fill={dm ? '#64748B' : '#94a3b8'} className="text-[10px] font-black uppercase tracking-wider text-center" textAnchor="middle">Q3</text>
                      <text x="490" y="150" fill={dm ? '#EC4899' : '#db2777'} className="text-[10px] font-black uppercase tracking-wider text-right" textAnchor="end">Today</text>
                    </svg>
                  </div>
                </div>

                {/* Payments Directory */}
                <div className={`rounded-[2rem] border overflow-hidden ${dm ? 'bg-[#161b22]/80 border-[#30363d] shadow-sm' : 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)]'}`}>
                  <div className={`p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${dm ? 'border-[#30363d]' : 'border-slate-100'}`}>
                    <h3 className={`font-extrabold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>Ledger Payments Records</h3>
                    <div className="relative w-full sm:max-w-sm">
                      <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        value={paymentQuery}
                        onChange={(e) => setPaymentQuery(e.target.value)}
                        placeholder="Search payments ledger..."
                        className={`pl-9 pr-4 py-2 w-full text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${dm ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead className={dm ? 'bg-[#0d1117]/80 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-[#30363d]' : 'bg-slate-50/80 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-b border-slate-200'}>
                        <tr>
                          <th className="p-5 font-black">Billing Customer</th>
                          <th className="p-5 font-black">Payment Specs Details</th>
                          <th className="p-5 font-black">Gateway Reference ID</th>
                          <th className="p-5 font-black">Amount Received</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-12 text-center">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <Search className={`w-8 h-8 ${dm ? 'text-slate-600' : 'text-slate-300'}`} />
                                <span className={`text-sm font-bold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>No payment records found.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredPayments.map((p: any) => (
                            <tr key={p.id} className={`transition-all duration-200 ${dm ? 'hover:bg-[#161b22] border-[#30363d]' : 'hover:bg-slate-50 border-slate-100'} group`}>
                              <td className="p-5 align-middle">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${dm ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                    {(p.userName || 'E')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <strong className={`block text-sm font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{p.userName || 'Enrolled Student'}</strong>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{p.createdAt?.split('T')[0]}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-5 align-middle">
                                <span className={`font-bold text-[13px] ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                                  {p.details}
                                </span>
                              </td>
                              <td className="p-5 align-middle">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-[11px] font-black tracking-wide ${dm ? 'bg-[#0d1117] border-[#30363d] text-sky-400' : 'bg-white border-slate-200 text-sky-600 shadow-sm'}`}>
                                  {p.gatewayRef}
                                </div>
                              </td>
                              <td className="p-5 align-middle">
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[13px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                  ₹{p.amount}
                                </span>
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

            {/* ═══ TAB 7: ADMINISTRATIVE AUDITING LOGS ═══ */}
            {activeTab === 'logs' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      <span className={`bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 bg-clip-text text-transparent`}>
                        Platform Audit Logs
                      </span>
                    </h1>
                    <p className={`text-sm mt-2 font-bold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      Immutable security ledger tracking global administrative modifications.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-xs font-bold uppercase">
                    <ShieldAlert className="w-4 h-4" />
                    Secure Compliance Mode
                  </div>
                </section>

                <div className={`rounded-[2rem] border overflow-hidden shadow-2xl ${dm ? 'bg-[#050505] border-[#30363d]' : 'bg-slate-900 border-slate-800'}`}>
                  {/* Terminal Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${dm ? 'border-[#30363d] bg-[#0d1117]' : 'border-slate-800 bg-slate-950'}`}>
                    <div className="flex gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                      <Terminal className="w-4 h-4 text-slate-300" />
                      <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px] font-mono">syslog // root@skillverse</span>
                    </div>
                    <div className="flex gap-1.5 items-center bg-emerald-500/10 px-2 py-1 rounded">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-emerald-500 text-[9px] font-black uppercase tracking-wider">Live Trace</span>
                    </div>
                  </div>

                  {/* Terminal Body */}
                  <div className="p-6 md:p-8 font-mono text-xs leading-relaxed select-text space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {logsList.length === 0 ? (
                      <div className="flex items-center gap-3 text-slate-500">
                        <Terminal className="w-5 h-5" />
                        <p className="italic font-medium">Waiting for security events... <span className="animate-pulse">_</span></p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {logsList.slice().reverse().map((log, index) => (
                          <div key={log.id} className="flex gap-4 group">
                            {/* Timeline Node */}
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full mt-1 border-2 ${index === 0 ? 'bg-emerald-500 border-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-800 border-slate-700'}`}></div>
                              {index !== logsList.length - 1 && <div className="w-px h-full mt-2 bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>}
                            </div>
                            
                            {/* Log Content */}
                            <div className="flex-1 pb-2">
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
                                <span className="text-slate-500 font-bold">[{log.timestamp}]</span>
                                <span className="text-blue-400 font-black">@{log.adminName}</span>
                                <span className="text-slate-600">executed:</span>
                              </div>
                              <div className={`p-4 rounded-xl border transition-all duration-300 ${dm ? 'bg-[#0d1117] border-[#30363d] group-hover:border-slate-600' : 'bg-slate-800/50 border-slate-700 group-hover:border-slate-500'}`}>
                                <strong className="text-emerald-400 block mb-1.5 text-[13px]">
                                  $ sudo {log.action.toLowerCase().replace(/\s+/g, '_')}
                                </strong>
                                <p className="text-slate-300 font-medium">{log.details}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {logsList.length > 0 && (
                      <div className="flex items-center gap-2 text-slate-500 pt-4 font-bold">
                        <span>root@skillverse:~#</span><span className="w-2.5 h-4 bg-emerald-500 inline-block animate-pulse"></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* ═══ TAB 8: SUPPORT TICKETS ═══ */}
            {activeTab === 'support' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      <span className={`bg-gradient-to-r from-blue-400 via-sky-500 to-blue-400 bg-clip-text text-transparent`}>
                        Student Support Queries
                      </span>
                    </h1>
                    <p className={`text-sm mt-2 font-bold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      View and resolve incoming queries from the student dashboards.
                    </p>
                  </div>
                </section>

                <div className={`rounded-[2rem] border overflow-hidden shadow-sm ${dm ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className={`border-b ${dm ? 'border-[#30363d] bg-[#0d1117]' : 'border-slate-200 bg-slate-50/50'}`}>
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
                              <span className={`text-sm font-bold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>No active support tickets found.</span>
                            </td>
                          </tr>
                        ) : (
                          supportTickets.map((t: any) => (
                            <tr key={t.id} className={`transition-all duration-200 ${dm ? 'hover:bg-[#0d1117]' : 'hover:bg-slate-50'}`}>
                              <td className="p-5 align-top">
                                <strong className={`block text-sm font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{t.id}</strong>
                                <span className="text-xs text-slate-500">{t.userName} ({t.userEmail})</span><br/>
                                <span className="text-[10px] text-slate-400 mt-1">{new Date(t.createdAt).toLocaleString()}</span>
                              </td>
                              <td className="p-5 align-top">
                                <strong className={`block text-sm font-bold mb-1 ${dm ? 'text-slate-200' : 'text-slate-800'}`}>{t.subject}</strong>
                                <p className={`text-xs whitespace-pre-wrap ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{t.description}</p>
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
                                      if(res.ok) fetchAllSuperAdminData();
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

            {/* VIEW 10: SUPER ADMIN PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <div className="space-y-8 col-span-1 animate-in fade-in duration-500">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Profile & Security Credentials</h1>
                  <p className="text-xs text-slate-400 mt-1">Configure your super administrative screen name, security passwords, and preferences.</p>
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

                      <form onSubmit={handleUpdateSuperAdminProfile} className="mt-5 space-y-5 text-xs font-semibold">
                        
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
                            Save Super Admin Settings
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
                          Add an extra layer of security to your super admin account by enabling 2FA via an authenticator app.
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
                          <Bell className="w-4 h-4 text-pink-500" /> 
                        </div>
                        Notifications
                      </h3>
                      <div className="mt-4 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500" defaultChecked />
                          <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Alerts</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500" defaultChecked />
                          <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>New Support Tickets</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500" />
                          <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>System Audit Anomalies</span>
                        </label>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            )}

          </div>
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
