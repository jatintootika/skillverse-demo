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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User, PlatformSettings, AdminActivityLog, Course } from '../types';
import { PremiumCertificate } from './PremiumCertificate';

interface SuperAdminPortalProps {
  currentUser: User;
  darkMode: boolean;
  onToast: (msg: string, type: 'success' | 'ref') => void;
  initialTab?: 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs';
  onTabChange?: (tab: 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs') => void;
}

// Global caching container to prevent unmount refetch latency during route changes
const globalSuperAdminCache: {
  settings?: PlatformSettings;
  adminsList?: User[];
  studentsList?: User[];
  courses?: Course[];
  logsList?: AdminActivityLog[];
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
  const [activeTab, setActiveTabState] = useState<'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs'>(initialTab || 'settings');

  const setActiveTab = (tab: 'settings' | 'admins' | 'students' | 'courses' | 'certificates' | 'payments' | 'logs') => {
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
      <div className="flex flex-col items-center py-20 justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-4 border-slate-300 border-t-blue-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Loading SuperMaster Ledgers...</span>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      
      {/* SIDEBAR TABS NAV */}
      <div className="w-full lg:w-[240px] shrink-0 space-y-4">
        <div className={`p-4 rounded-3xl border text-center ${
          darkMode ? 'border-blue-500/10 bg-slate-900/50' : 'border-slate-150 bg-slate-50'
        }`}>
          <ShieldAlert className="w-6 h-6 text-blue-500 mx-auto mb-1 animate-pulse" />
          <h4 className="font-extrabold text-[10px] uppercase font-mono tracking-wider text-blue-500">SuperAdmin Workspace</h4>
          <p className="text-[9px] text-slate-400 mt-0.5">Clearing Index Authorities</p>
        </div>

        <div className="flex flex-row lg:flex-col overflow-x-auto gap-1 pb-2 lg:pb-0 scrollbar-none font-medium text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap w-full text-left py-2.5 px-3.5 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/5 text-slate-400'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> Parameters & Policies
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`whitespace-nowrap w-full text-left py-2.5 px-3.5 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'admins' ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/5 text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Staff Clearances
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`whitespace-nowrap w-full text-left py-2.5 px-3.5 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'students' ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/5 text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Student Directory
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`whitespace-nowrap w-full text-left py-2.5 px-3.5 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'courses' ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/5 text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Course Catalogs
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`whitespace-nowrap w-full text-left py-2.5 px-3.5 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'certificates' ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/5 text-slate-400'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Audits Certificates
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`whitespace-nowrap w-full text-left py-2.5 px-3.5 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'payments' ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/5 text-slate-400'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Revenues & Billing
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`whitespace-nowrap w-full text-left py-2.5 px-3.5 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'logs' ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/5 text-slate-400'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> System Audits
          </button>
        </div>
      </div>

      {/* ACTIVE SCREEN WORKSPACE */}
      <div className="flex-grow space-y-6 min-w-0">
        
        {/* TAB 1: PARAMETERS & POLICIES */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">System Parameters Integration</h1>
              <p className="text-xs text-slate-450">Configure SMTP relays, Payment Credentials, and regulatory legal compliance page parameters.</p>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-6 text-xs font-medium">
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'} space-y-6`}>
                
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-mono tracking-tight">SMTP Port</label>
                      <input
                        type="number"
                        value={settings.smtpPort || 465}
                        onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) || 0 })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-mono tracking-tight">SMTP User Account</label>
                      <input
                        type="text"
                        value={settings.smtpUser || ''}
                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
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
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-mono tracking-tight">Stripe Public Key</label>
                      <input
                        type="text"
                        value={settings.stripePublicKey || ''}
                        onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
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
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'} space-y-4`}>
                <h3 className="font-bold text-sm text-blue-500 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Website Policies Configuration Content
                </h3>
                <p className="text-[10px] text-slate-400">Content here is rendered live inside separate terms pages and refund references across the application.</p>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Terms and Conditions</label>
                    <textarea
                      rows={3}
                      value={settings.termsOfService || ''}
                      onChange={(e) => setSettings({ ...settings, termsOfService: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Privacy Policy</label>
                    <textarea
                      rows={3}
                      value={settings.privacyPolicy || ''}
                      onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Refund Policy</label>
                    <textarea
                      rows={3}
                      value={settings.refundPolicy || ''}
                      onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Platform Disclaimer</label>
                    <textarea
                      rows={3}
                      value={settings.disclaimer || ''}
                      onChange={(e) => setSettings({ ...settings, disclaimer: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Certificate Verification Policy</label>
                    <textarea
                      rows={3}
                      value={settings.verificationPolicy || ''}
                      onChange={(e) => setSettings({ ...settings, verificationPolicy: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 text-white text-xs font-bold rounded-xl bg-blue-600 hover:scale-[1.01] active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Apply System and Policies parameters
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: STAFF CLEARANCES (Managing Admins, permissions, assignedCourses) */}
        {activeTab === 'admins' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Access Staff Privileges</h1>
              <p className="text-xs text-slate-400 mt-1">Configure permissions level flags, Course Assignments, suspension parameters, or demote staff clearances.</p>
            </div>

            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'} space-y-4`}>
              <h3 className="font-bold text-sm text-blue-500">Promote Student Email to Admin Staff</h3>
              <form onSubmit={handlePromoteAdmin} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  placeholder="name@student.in"
                  className={`flex-grow text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Promote Staff
                </button>
              </form>
            </div>

            <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'}`}>
              <div className="p-4 border-b border-inherit">
                <div className="relative max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={adminQuery}
                    onChange={(e) => setAdminQuery(e.target.value)}
                    placeholder="Search staff accounts..."
                    className={`pl-8 pr-3 py-1.5 w-full text-xs rounded-lg border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left font-sans text-xs">
                  <thead className={darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-500'}>
                    <tr className="border-b border-inherit">
                      <th className="p-4 font-bold">Identity</th>
                      <th className="p-4 font-bold">Clearances</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Manage clearances</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit font-medium">
                    {filteredAdmins.map((adm) => {
                      const isPrimarySysAdmin = adm.id === 'usr-1';
                      return (
                        <React.Fragment key={adm.id}>
                          <tr className={darkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50/50'}>
                            <td className="p-4">
                              <span className="font-extrabold block text-slate-100 dark:text-white">{adm.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{adm.email}</span>
                            </td>
                            <td className="p-4">
                              <span className="p-1 px-2.5 rounded font-mono text-[9px] uppercase font-bold bg-blue-500/10 text-blue-500">
                                {adm.role}
                              </span>
                            </td>
                            <td className="p-4">
                              {adm.suspended ? (
                                <span className="text-red-500 font-bold flex items-center gap-1"><BadgeAlert className="w-3.5 h-3.5" /> Suspended</span>
                              ) : (
                                <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                              )}
                            </td>
                            <td className="p-4 flex gap-2">
                              <button
                                onClick={() => startConfiguringAdmin(adm)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold text-white bg-slate-650 hover:bg-slate-700 transition ${
                                  editingAdmin?.id === adm.id ? 'ring-2 ring-blue-500 bg-blue-600' : 'bg-blue-600'
                                }`}
                              >
                                Edit Clearance Scope
                              </button>
                            </td>
                          </tr>

                          {/* INLINE clearance configuration form */}
                          {editingAdmin?.id === adm.id && (
                            <tr>
                              <td colSpan={4} className={`p-6 ${darkMode ? 'bg-slate-95 w-full bg-slate-950/40' : 'bg-slate-50/80'}`}>
                                <div className="space-y-4 max-w-2xl font-sans">
                                  <div className="flex justify-between items-center border-b pb-2 border-slate-800">
                                    <h4 className="font-bold text-xs">Configure Clearances for: {adm.name}</h4>
                                    {isPrimarySysAdmin && <span className="text-amber-500 font-mono text-[10px]">PRIMARY SYSTEM ADMINISTRATOR LOCKED (READ-ONLY)</span>}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                                    {/* Permissions module permissions */}
                                    <div className="space-y-2">
                                      <label className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Administrative permissions Module</label>
                                      <div className="space-y-2">
                                        {['courses', 'exams', 'students', 'certificates', 'coupons'].map((perm) => (
                                          <label key={perm} className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              disabled={isPrimarySysAdmin}
                                              checked={adminPermissions.includes(perm)}
                                              onChange={() => togglePermission(perm)}
                                              className="rounded text-blue-600"
                                            />
                                            <span className="capitalize">{perm === 'courses' ? 'Course Catalog Management' : perm === 'exams' ? 'Exam MCQs Builder' : perm === 'students' ? 'Students Upgrades' : perm === 'certificates' ? 'Revoke and Reissue Certificate' : 'Discounts and Coupons Management'}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Assigned Course Scope */}
                                    <div className="space-y-2">
                                      <label className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Assigned Course Scope</label>
                                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                        {courses.map((crs) => (
                                          <label key={crs.id} className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              disabled={isPrimarySysAdmin}
                                              checked={adminAssignedCourses.includes(crs.id)}
                                              onChange={() => toggleAssignedCourse(crs.id)}
                                              className="rounded text-blue-600"
                                            />
                                            <span className="truncate">{crs.title}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <hr className={darkMode ? 'border-slate-800' : 'border-slate-200'} />

                                  <div className="flex gap-4 items-center">
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                                      <input
                                        type="checkbox"
                                        disabled={isPrimarySysAdmin}
                                        checked={adminSuspended}
                                        onChange={(e) => setAdminSuspended(e.target.checked)}
                                        className="rounded text-red-600"
                                      />
                                      <span className="text-red-500 font-bold">Suspend account completely (Revokes system login credentials)</span>
                                    </label>
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                    <button
                                      onClick={handleSaveAdminClearances}
                                      disabled={isPrimarySysAdmin}
                                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer disabled:opacity-50"
                                    >
                                      Save Clearances
                                    </button>
                                    <button
                                      onClick={() => setEditingAdmin(null)}
                                      className="px-3.5 py-1.5 bg-slate-500 text-white rounded font-bold cursor-pointer"
                                    >
                                      Close Configuration
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT DIRECTORY */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Student Directory logs</h1>
              <p className="text-xs text-slate-400 mt-1">Audit students subscription tiers, enrolled profiles, joined parameters, and toggle suspension status.</p>
            </div>

            <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'}`}>
              <div className="p-4 border-b border-inherit">
                <div className="relative max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    placeholder="Search student profiles..."
                    className={`pl-8 pr-3 py-1.5 w-full text-xs rounded-lg border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left font-sans">
                  <thead className={darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-500'}>
                    <tr className="border-b border-inherit">
                      <th className="p-4 font-bold">Identity</th>
                      <th className="p-4 font-bold">Subscription Plan</th>
                      <th className="p-4 font-bold">Joined Date</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Administration Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit font-medium">
                    {filteredStudents.map((stud) => (
                      <React.Fragment key={stud.id}>
                        <tr className={darkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50/50'}>
                          <td className="p-4">
                            <span className="font-extrabold block text-slate-100 dark:text-white">{stud.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{stud.email}</span>
                          </td>
                          <td className="p-4">
                            <span className="p-1 px-2.5 rounded font-mono font-bold capitalize bg-blue-500/10 text-blue-500">
                              {stud.plan}
                            </span>
                          </td>
                          <td className="p-4 text-slate-450 text-[11px] font-mono">
                            {stud.joinedDate}
                          </td>
                          <td className="p-4">
                            {stud.suspended ? (
                              <span className="text-red-500 font-bold flex items-center gap-1"><BadgeAlert className="w-3.5 h-3.5" /> Suspended</span>
                            ) : (
                              <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => startConfiguringStudent(stud)}
                              className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-650 rounded hover:bg-blue-700 transition cursor-pointer"
                            >
                              Edit Profile Parameters
                            </button>
                          </td>
                        </tr>

                        {editingStudent?.id === stud.id && (
                          <tr>
                            <td colSpan={5} className={`p-6 ${darkMode ? 'bg-slate-950/40' : 'bg-slate-50/80'}`}>
                              <div className="space-y-4 max-w-md font-sans text-xs">
                                <h4 className="font-bold">Edit Student: {stud.name}</h4>
                                
                                <div className="space-y-1">
                                  <label className="text-slate-400 font-medium tracking-tight">Platform Subscription Tiers</label>
                                  <select
                                    value={studentPlan}
                                    onChange={(e) => setStudentPlan(e.target.value as any)}
                                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                                    }`}
                                  >
                                    <option value="free">Free Starter Plan</option>
                                    <option value="starter">Starter Monthly Tier</option>
                                    <option value="popular">Popular Semiannual Tier</option>
                                    <option value="pro">Super Pro Unlimited Certification</option>
                                  </select>
                                </div>

                                <div className="pt-2">
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={studentSuspended}
                                      onChange={(e) => setStudentSuspended(e.target.checked)}
                                      className="rounded text-red-650"
                                    />
                                    <span className="text-red-500 font-bold">Suspend account completely (Lock out user from logging in)</span>
                                  </label>
                                </div>

                                <div className="flex gap-2 pt-2 text-[11px]">
                                  <button
                                    onClick={handleSaveStudentParameters}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer"
                                  >
                                    Save Student Parameters
                                  </button>
                                  <button
                                    onClick={() => setEditingStudent(null)}
                                    className="px-3 py-1.5 bg-slate-500 text-white rounded font-bold cursor-pointer"
                                  >
                                    Close Config
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COURSE CATALOGS */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Platform Course Management</h1>
                <p className="text-xs text-slate-400 mt-1">Append new course modules, modify details descriptions, modify visibility, or edit video chapters list.</p>
              </div>
              <button
                onClick={() => setShowAddCourse(!showAddCourse)}
                className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow hover:scale-[1.01] transition-transform"
              >
                <Plus className="w-4 h-4" /> Add Course Catalog
              </button>
            </div>

            {/* ADD COURSE form banner */}
            {showAddCourse && (
              <div className={`p-6 rounded-3xl border animate-in slide-in-from-top-4 duration-300 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'
              }`}>
                <h3 className="font-extrabold text-sm text-blue-500 border-b pb-2 mb-4">Add New Course Chapter</h3>
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
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Category Tag</label>
                      <select
                        value={newCourse.category}
                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value as any })}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-250 text-slate-800'
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
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
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
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
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
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Cover Banner URL</label>
                      <input
                        type="text"
                        value={newCourse.bannerUrl}
                        onChange={(e) => setNewCourse({ ...newCourse, bannerUrl: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Discount Price (₹)</label>
                      <input
                        type="number"
                        value={newCourse.discountPrice}
                        onChange={(e) => setNewCourse({ ...newCourse, discountPrice: Number(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Duration (Minutes)</label>
                      <input
                        type="number"
                        value={newCourse.durationMins}
                        onChange={(e) => setNewCourse({ ...newCourse, durationMins: Number(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Pass Percentage (%)</label>
                      <input
                        type="number"
                        value={newCourse.passPercentage}
                        onChange={(e) => setNewCourse({ ...newCourse, passPercentage: Number(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full p-2.5 font-mono text-[10px] rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 focus:ring-blue-500' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full p-2.5 font-mono text-[10px] rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 focus:ring-blue-500' : 'bg-slate-50 border-slate-200'
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
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'}`}>
              <div className="relative max-w-xs mb-4">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                  placeholder="Query courses catalogs..."
                  className={`pl-8 pr-3 py-1.5 w-full text-xs rounded-lg border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCoursesList.map((crs) => (
                  <div key={crs.id} className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50/80 border-slate-200'
                  } space-y-3`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="p-0.5 px-2 text-[8px] tracking-wider uppercase bg-blue-500/10 text-blue-500 font-bold rounded">
                          {crs.category}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-200 dark:text-white mt-1 leading-snug">{crs.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-blue-500">₹{crs.examPrice}</span>
                    </div>

                    <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">{crs.description}</p>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{crs.lectures?.length || 0} Lectures Added</span>
                      <span>{crs.active ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Published</span>
                      ) : (
                        <span className="text-amber-500 font-bold flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Draft</span>
                      )}</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setEditingCourse(crs);
                          setEditingCourseLecturesText(JSON.stringify(crs.lectures || [], null, 2));
                          setEditingCourseAssignmentsText(JSON.stringify(crs.assignments || [], null, 2));
                          setEditingCourseQuizzesText(JSON.stringify(crs.quizzes || [], null, 2));
                        }}
                        className="p-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                      >
                        Edit / Add lectures
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(crs.id, crs.title)}
                        className="p-1.5 px-3 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                      >
                        Purge Catalog
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COURSE ADVANCED lectures & details editing modal list */}
            {editingCourse && (
              <div className={`p-6 rounded-3xl border select-none ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'
              }`}>
                <h3 className="font-extrabold text-sm text-blue-500 border-b pb-2 mb-4">Edit Specs for: {editingCourse.title}</h3>
                <form onSubmit={handleSaveCourseEdits} className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Title *</label>
                      <input
                        type="text"
                        value={editingCourse.title}
                        onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                        required
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Category Tag</label>
                      <select
                        value={editingCourse.category}
                        onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-250'
                        }`}
                      >
                        <option value="Tech">Technology & Computer Science</option>
                        <option value="Business">Business & Analytics</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Instructor Name</label>
                      <input
                        type="text"
                        value={editingCourse.instructorName || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, instructorName: e.target.value })}
                        placeholder="e.g. IIT Madras Graduates Council"
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Notes & Guides URL</label>
                      <input
                        type="text"
                        value={editingCourse.notesUrl || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, notesUrl: e.target.value })}
                        placeholder="https://drive.google.com/drive/folders/..."
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Syllabus Description</label>
                    <textarea
                      rows={3}
                      value={editingCourse.description}
                      onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                      required
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Thumbnail URL</label>
                      <input
                        type="text"
                        value={editingCourse.thumbnailUrl || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, thumbnailUrl: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Cover Banner URL</label>
                      <input
                        type="text"
                        value={editingCourse.bannerUrl || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, bannerUrl: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400">Exam Price (₹)</label>
                      <input
                        type="number"
                        value={editingCourse.examPrice}
                        onChange={(e) => setEditingCourse({ ...editingCourse, examPrice: Number(e.target.value) })}
                        required
                        className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Discount Price (₹)</label>
                      <input
                        type="number"
                        value={editingCourse.discountPrice || 0}
                        onChange={(e) => setEditingCourse({ ...editingCourse, discountPrice: Number(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Duration (Minutes)</label>
                      <input
                        type="number"
                        value={editingCourse.durationMins || 60}
                        onChange={(e) => setEditingCourse({ ...editingCourse, durationMins: Number(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Pass Percentage (%)</label>
                      <input
                        type="number"
                        value={editingCourse.passPercentage || 70}
                        onChange={(e) => setEditingCourse({ ...editingCourse, passPercentage: Number(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Video Lecture Modules list (Raw JSON format)</label>
                    <textarea
                      rows={4}
                      value={editingCourseLecturesText}
                      onChange={(e) => setEditingCourseLecturesText(e.target.value)}
                      placeholder='[ { "title": "Intro Lecture", "videoId": "aircAruvnKk" } ]'
                      className={`w-full p-3 font-mono text-[10px] rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 text-sky-400 ${
                        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 font-mono">
                      <label className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Assignments list (Raw JSON format)</label>
                      <textarea
                        rows={3}
                        value={editingCourseAssignmentsText}
                        onChange={(e) => setEditingCourseAssignmentsText(e.target.value)}
                        placeholder='[ { "id": "assign-1", "title": "Practical SQL exercise" } ]'
                        className={`w-full p-2.5 font-mono text-[10px] rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 text-sky-400 ${
                          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5 font-mono">
                      <label className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">Quizzes checklist (Raw JSON format)</label>
                      <textarea
                        rows={3}
                        value={editingCourseQuizzesText}
                        onChange={(e) => setEditingCourseQuizzesText(e.target.value)}
                        placeholder='[ { "id": "q-1", "question": "Explain KNN?", "options": ["Linear","Cluster","Classification"], "answerIndex": 2 } ]'
                        className={`w-full p-2.5 font-mono text-[10px] rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 text-sky-400 ${
                          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingCourse.active}
                        onChange={(e) => setEditingCourse({ ...editingCourse, active: e.target.checked })}
                        className="rounded text-blue-600 h-4 w-4"
                      />
                      <span>Published and Enrollable Catalog Status</span>
                    </label>
                  </div>

                  <div className="flex gap-2 font-medium">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Apply Course Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCourse(null)}
                      className="px-4 py-2 bg-slate-500 text-white rounded font-bold cursor-pointer"
                    >
                      Cancel Customization
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CERTIFICATE AUDIT LEDGER */}
        {activeTab === 'certificates' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Certificates Auditing Ledger</h1>
                <p className="text-xs text-slate-400 mt-1">Audit verification hashes, reissue legitimate student certifications, or void forged credentials entries.</p>
              </div>

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
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-white" /> Manually Issue Certificate
              </button>
            </div>

            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'} space-y-4`}>
              <div className="relative max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={certificateQuery}
                  onChange={(e) => setCertificateQuery(e.target.value)}
                  placeholder="Index recipient name, course, or ID..."
                  className={`pl-8 pr-3 py-1.5 w-full text-xs rounded-lg border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full text-left font-sans">
                  <thead className={darkMode ? 'bg-slate-950 text-slate-400 font-mono text-[9px] uppercase' : 'bg-slate-100 text-slate-500 font-mono text-[9px] uppercase'}>
                    <tr className="border-b border-inherit">
                      <th className="p-4 font-bold">Recipient Student</th>
                      <th className="p-4 font-bold font-mono">Certificate ID / ID Hash</th>
                      <th className="p-4 font-bold">Assessed course</th>
                      <th className="p-4 font-bold border-l border-r border-slate-800/10">Ledger status</th>
                      <th className="p-4 font-bold text-center">Revision actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {filteredCertificates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                          No certificate qualifications matching "{certificateQuery}" found.
                        </td>
                      </tr>
                    ) : (
                      filteredCertificates.map((cert: any) => {
                        const certId = cert.certificateId || cert.id;
                        const isRevoked = cert.status === 'REVOKED' || cert.revoked === true;
                        
                        return (
                          <tr key={cert.id} className={darkMode ? 'hover:bg-slate-950/45 text-slate-100' : 'hover:bg-slate-50/50 text-slate-800'}>
                            <td className="p-4">
                              <strong className="block text-slate-100 dark:text-white">{cert.userName || cert.studentName}</strong>
                              <span className="text-[10px] text-slate-400 font-mono">Grade: {cert.grade || 'A'} ({cert.score || 100}%)</span>
                            </td>
                            <td className="p-4 font-mono select-all text-xs font-bold text-blue-500">
                              {certId}
                            </td>
                            <td className="p-4 truncate max-w-[150px]">
                              {cert.courseTitle || cert.courseName}
                            </td>
                            <td className="p-4 border-l border-r border-slate-800/5 dark:border-slate-850/50">
                              {isRevoked ? (
                                <div className="space-y-1">
                                  <span className="p-1 px-2 text-[9px] uppercase font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded">
                                    REVOKED VOID
                                  </span>
                                  {cert.revocationReason && (
                                    <span className="block text-[9px] text-slate-400 font-mono italic max-w-[120px] truncate" title={cert.revocationReason}>
                                      Reason: {cert.revocationReason}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="p-1 px-2 text-[9px] uppercase font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                  ACTIVE VALID
                                </span>
                              )}
                            </td>
                            <td className="p-4 flex items-center justify-center gap-2">
                              {/* 1. View & Print */}
                              <button
                                onClick={() => setPreviewAdminCert(cert)}
                                className={`px-2 py-1 text-[10px] rounded font-bold transition flex items-center gap-1 cursor-pointer ${
                                  darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                }`}
                              >
                                <Eye className="w-3 h-3 text-blue-500" /> Preview
                              </button>

                              {/* 2. Revoke vs Reactivate */}
                              {isRevoked ? (
                                <button
                                  onClick={() => handleSuperAdminReactivate(cert.id)}
                                  className="px-2.5 py-1 text-[10px] text-white bg-emerald-600 rounded font-bold hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Reactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setRevokingCertId(cert.id);
                                    setRevokeReasonInput('');
                                  }}
                                  className="px-2.5 py-1 text-[10px] text-white bg-red-600 rounded font-bold hover:bg-red-700 transition cursor-pointer flex items-center gap-1"
                                >
                                  <BadgeAlert className="w-3 h-3" /> Revoke Void
                                </button>
                              )}

                              {/* 3. Permanent Deletion */}
                              <button
                                onClick={() => handleSuperAdminDelete(cert.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-500/10 transition cursor-pointer"
                                title="Permanent record deletion from disc store"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
                <div className={`relative w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-900'
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
                        className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
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
                        className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
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
                          className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                            darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1.5 font-bold uppercase text-[9px] tracking-wider">Assigned Grade</label>
                        <select
                          value={manualGrade}
                          onChange={(e) => setManualGrade(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                            darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
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
                <div className={`relative w-full max-w-sm rounded-2xl p-6 border shadow-2xl ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-900'
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
                      className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
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
                        className={`px-4 py-2 rounded-xl border transition-all ${
                          darkMode ? 'border-slate-800 text-slate-350 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
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
                <div className={`relative w-full max-w-4xl rounded-3xl p-6 sm:p-8 border shadow-2xl ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
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

        {/* TAB 6: REVENUES & BILLING */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Platform Financial revenues</h1>
              <p className="text-xs text-slate-400 mt-1">Audit incoming stripe/razorpay billing ledgers and track interactive business growth graphs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-3xl border text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'}`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Recurrent Revenues</span>
                <span className="text-2xl font-extrabold text-blue-500 block mt-1">₹{stats.totalRevenue || 0}</span>
              </div>
              <div className={`p-4 rounded-3xl border text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'}`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Gateways Volume</span>
                <span className="text-2xl font-extrabold text-emerald-50 block mt-1 text-emerald-500">₹{stats.todayRevenue || 0}</span>
              </div>
              <div className={`p-4 rounded-3xl border text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'}`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Auditable Transaction count</span>
                <span className="text-2xl font-extrabold block mt-1 text-purple-500">{(stats.allPayments || []).length} Payments</span>
              </div>
            </div>

            {/* Revenues line plot graph */}
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150 shadow-sm'} space-y-4`}>
              <div>
                <h3 className="font-extrabold text-xs">Financial Scaling Growth (Quarter Trend)</h3>
                <p className="text-[10px] text-slate-400 font-light">Interactive reporting of billing cycles</p>
              </div>

              <div className="relative h-44 w-full pt-4">
                <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="3" className="opacity-20" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="3" className="opacity-20" />
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="3" className="opacity-20" />

                  <path
                    d="M 10 120 L 90 90 L 170 70 L 250 50 L 330 30 L 415 15 L 490 10 L 490 120 Z"
                    fill="url(#blueGradSuper)"
                    className="opacity-15"
                  />

                  <defs>
                    <linearGradient id="blueGradSuper" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 10 120 Q 90 90, 170 80 T 250 55 T 330 35 T 415 15 T 490 10"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <text x="10" y="140" fill="#64748B" className="text-[9px] font-mono">Q1</text>
                  <text x="170" y="140" fill="#64748B" className="text-[9px] font-mono">Q2</text>
                  <text x="330" y="140" fill="#64748B" className="text-[9px] font-mono">Q3</text>
                  <text x="450" y="140" fill="#64748B" className="text-[9px] font-mono">Today</text>
                </svg>
              </div>
            </div>

            {/* Payments Directory */}
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm">Ledger Payments Records</h3>
                <div className="relative max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={paymentQuery}
                    onChange={(e) => setPaymentQuery(e.target.value)}
                    placeholder="Search payments ledger..."
                    className={`pl-8 pr-3 py-1.5 w-full text-xs rounded-lg border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-205'
                    }`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full text-left font-sans text-xs">
                  <thead className={darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-500'}>
                    <tr className="border-b border-inherit">
                      <th className="p-4 font-bold">Billing Customer</th>
                      <th className="p-4 font-bold col-span-1">Payment Specs details</th>
                      <th className="p-4 font-bold font-mono">Gateway Reference ID</th>
                      <th className="p-4 font-bold">Amount Recieved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {filteredPayments.map((p: any) => (
                      <tr key={p.id} className={darkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50/50'}>
                        <td className="p-4">
                          <strong className="block text-slate-100 dark:text-white">{p.userName || 'Enrolled Student'}</strong>
                          <span className="text-[10px] text-slate-405 font-mono">{p.createdAt?.split('T')[0]}</span>
                        </td>
                        <td className="p-4 truncate max-w-[180px]">
                          {p.details}
                        </td>
                        <td className="p-4 font-mono font-bold select-all text-[10px] text-sky-400">
                          {p.gatewayRef}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-500 text-xs">
                          ₹{p.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ADMINISTRATIVE AUDITING LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Platform Audit logs</h1>
              <p className="text-xs text-slate-450 mt-1">Global security and administrative activity tracking ledger records.</p>
            </div>

            <div className={`p-4 rounded-3xl border font-mono text-[10px] leading-relaxed select-text space-y-2 max-h-[480px] overflow-y-auto ${
              darkMode ? 'bg-slate-950 border-slate-900 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-705'
            }`}>
              {logsList.length === 0 ? (
                <p className="text-slate-450 italic">No auditing actions recorded on this turn session.</p>
              ) : (
                logsList.slice().reverse().map((log) => (
                  <div key={log.id} className="py-2.5 border-b border-inherit flex justify-between gap-4 items-start hover:bg-slate-900/10 p-2 rounded-lg">
                    <div>
                      <span className="text-blue-500 font-extrabold block">[{log.timestamp}] @{log.adminName}</span>
                      <p className="text-slate-205 mt-0.5">{log.action}: {log.details}</p>
                    </div>
                    <span className="p-0.5 px-2 rounded font-mono text-[8.5px] bg-blue-500/10 text-blue-400 font-bold border border-blue-500/10 uppercase">
                      Secured log
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
