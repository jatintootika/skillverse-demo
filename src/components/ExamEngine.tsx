/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Timer, AlertCircle, HelpCircle, ArrowLeft, ArrowRight, Clipboard, CheckCircle, Download, Linkedin, Share2, Award, ArrowRightCircle, Play, Lock, Shield, BarChart3, TrendingUp, TrendingDown, Target, Zap, BookOpen, ChevronRight, XCircle, RefreshCw } from 'lucide-react';
import { ExamQuestion, User } from '../types';

interface ExamEngineProps {
  courseId: string;
  courseTitle: string;
  questions: ExamQuestion[];
  currentUser: User;
  darkMode: boolean;
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'ref') => void;
}

export function ExamEngine({
  courseId,
  courseTitle,
  questions,
  currentUser,
  darkMode,
  onClose,
  onToast
}: ExamEngineProps) {
  const [stages, setStages] = useState<'rules' | 'active' | 'analysis' | 'result'>('rules');
  const [agreed, setAgreed] = useState(false);
  const [isCertificateUnlocked, setIsCertificateUnlocked] = useState(false);
  
  // Active Exam state variables
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [cheatingAttempts, setCheatingAttempts] = useState(0);

  // Result metrics
  const [scorePct, setScorePct] = useState(0);
  const [pResult, setPResult] = useState<any>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-cheating listeners
  useEffect(() => {
    if (stages !== 'active') return;

    // 1. Alert on tab switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatingAttempts((prev) => {
          const updated = prev + 1;
          onToast(`Warning! Tab switch detected (${updated}/3). Swapping tabs is strictly monitored during the SkillVerse Exam!`, 'ref');
          if (updated >= 3) {
            handleCompleteExam(true); // force submit on heavy violations
          }
          return updated;
        });
      }
    };

    // 2. Disable right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onToast('Inspection is restricted during active examination.', 'ref');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);

    // Initialise timer loop
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onToast('Timer expired! Submitting your exam automatically.', 'ref');
          handleCompleteExam(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stages]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  const handleNavigateQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    setCurrentIdx(targetIdx);
    setVisited((prev) => ({ ...prev, [targetIdx]: true }));
  };

  const handleCompleteExam = async (forcedByCheating = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // If forced checkout due to cheating limit
    let finalAnswers = { ...answers };
    if (forcedByCheating) {
      onToast('Standard verification aborted due to excessive tab switching violations.', 'ref');
    }

    try {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          courseId,
          answers: finalAnswers
        })
      });

      const data = await res.json();
      setScorePct(data.scorePct);
      setPResult(data);
      setStages('analysis');

      if (data.passed) {
        onToast('Congratulations! You cleared the certification exam!', 'success');
        triggerConfettiParticles();
      } else {
        onToast('Encouragement: You did not clear this attempt. Review correct answers and try again!', 'ref');
      }
    } catch (err) {
      console.error(err);
      onToast('Unexpected connection error; compiling scores client-side.', 'ref');
      
      // Client-side simulation fallback if backend fails
      let score = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correctOptionIndex) score++;
      });
      const localPct = Math.round((score / questions.length) * 100);
      setScorePct(localPct);
      
      // Mock pResult for the UI to render the certificate and paywall
      const mockResult = {
        passed: localPct >= 70,
        scorePct: localPct,
        certificate: localPct >= 70 ? {
          certificateId: `SV-MOCK-${Math.floor(Math.random() * 100000)}`,
          userName: currentUser.name,
          courseName: courseTitle,
          issuedAt: new Date().toISOString()
        } : null
      } as any;
      setPResult(mockResult);
      setStages('analysis');
      
      if (localPct >= 70) {
        onToast('Congratulations! You cleared the certification exam!', 'success');
        triggerConfettiParticles();
      } else {
        onToast('Encouragement: You did not clear this attempt. Review correct answers and try again!', 'ref');
      }
    }
  };

  const triggerConfettiParticles = () => {
    // Elegant lightweight particles engine
    const canvas = document.createElement('div');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);

    for (let i = 0; i < 100; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.width = '8px';
      p.style.height = '8px';
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.backgroundColor = ['#2563EB', '#38BDF8', '#10B981', '#F59E0B', '#EC4899'][Math.floor(Math.random() * 5)];
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = `-10px`;
      p.style.opacity = `${0.4 + Math.random() * 0.6}`;
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      canvas.appendChild(p);

      // Animate down
      let y = -10;
      const speed = 2 + Math.random() * 5;
      const drift = -1 + Math.random() * 2;
      let angle = 0;
      
      const step = () => {
        y += speed;
        angle += 3;
        p.style.top = `${y}px`;
        p.style.left = `${parseFloat(p.style.left) + drift}px`;
        p.style.transform = `rotate(${angle}deg)`;

        if (y < window.innerHeight) {
          requestAnimationFrame(step);
        } else {
          p.remove();
        }
      };
      step();
    }

    setTimeout(() => {
      canvas.remove();
    }, 6000);
  };

  // Printable screen trigger
  const handlePrintCertificate = () => {
    window.print();
  };

  const handleShareToLinkedIn = () => {
    if (!pResult ? undefined : !pResult.certificate) return;
    const certUrl = `https://verify.skillverse.in/${pResult.certificate.certificateId}`;
    const shareText = `I am proud to share that I passed the ${courseTitle} examination at SkillVerse verified with an expert passing score of ${scorePct}%! Check my credentials index: ${certUrl}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopyVerification = () => {
    if (!pResult ? undefined : !pResult.certificate) return;
    const certUrl = `${window.location.origin}/verify/${pResult.certificate.certificateId}`;
    navigator.clipboard.writeText(certUrl);
    onToast('Verification link successfully copied to your clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{ background: darkMode ? '#0b0e15' : '#f1f5f9', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
      </div>

      {/* 1. RULES STAGE - Immersive Glassmorphism */}
      {stages === 'rules' && (
        <div className="w-full max-w-4xl mx-auto px-6 animate-in zoom-in-95 duration-500 relative z-10">
          <div className="rounded-3xl overflow-hidden relative"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: darkMode
                ? '0 0 80px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 25px 60px -12px rgba(0,0,0,0.15)'
            }}>
            {/* Top gradient strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400" />
            
            <div className="p-10 sm:p-14">
              {/* Header - Icon + Title */}
              <div className="text-center mb-10">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(59,130,246,0.2)',
                      boxShadow: '0 0 40px rgba(59,130,246,0.15)'
                    }}>
                    <Award className="w-12 h-12 text-blue-400" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />
                  </div>
                </div>
                <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Certification Exam
                </h1>
                <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {courseTitle} &middot; SkillVerse Verify
                </p>
              </div>

              {/* Bento Grid Rules - 2x2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {/* Rule 1: Duration */}
                <div className="p-6 rounded-2xl transition-all duration-200"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(59,130,246,0.03)',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.08)'}`,
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <Timer className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Time Limit</h4>
                  </div>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    You have exactly <strong className={darkMode ? 'text-white' : 'text-slate-900'}>60 minutes</strong> to complete all questions. The timer auto-submits when it expires.
                  </p>
                </div>
                
                {/* Rule 2: Passing Grade */}
                <div className="p-6 rounded-2xl transition-all duration-200"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(16,185,129,0.03)',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.08)'}`,
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <Target className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Passing Grade</h4>
                  </div>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Score <strong className={darkMode ? 'text-white' : 'text-slate-900'}>70% or above</strong> to earn the verified credentials. 80%+ unlocks the premium certificate.
                  </p>
                </div>
                
                {/* Rule 3: No Negative Marking */}
                <div className="p-6 rounded-2xl transition-all duration-200"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(139,92,246,0.03)',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.08)'}`,
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}>
                      <CheckCircle className="w-5 h-5 text-violet-400" />
                    </div>
                    <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Evaluation Logic</h4>
                  </div>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    There is <strong className={darkMode ? 'text-white' : 'text-slate-900'}>no negative marking</strong>. Answer every question to maximize your score.
                  </p>
                </div>
                
                {/* Rule 4: Proctored Session */}
                <div className="p-6 rounded-2xl transition-all duration-200"
                  style={{
                    background: darkMode ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.03)',
                    border: `1px solid ${darkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.1)'}`,
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Proctored Session</h4>
                  </div>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tab switching is monitored. <strong className="text-red-400">3 violations = automatic failure</strong>. External aids are prohibited.
                  </p>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-4 mb-10 p-5 rounded-2xl"
                style={{
                  background: darkMode ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.03)',
                  border: `1px solid ${darkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)'}`,
                }}>
                <input
                  type="checkbox"
                  id="rules-agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-400 text-blue-600 focus:ring-blue-500 w-5 h-5 cursor-pointer"
                  style={{ accentColor: '#3b82f6' }}
                />
                <label htmlFor="rules-agree" className={`text-sm leading-relaxed cursor-pointer select-none ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  I hereby state that I am the verified account holder, and I agree to use zero external guides or aids during this certification process.
                </label>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 items-center">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold transition-all text-sm"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: darkMode ? '#94a3b8' : '#64748b',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStages('active')}
                  disabled={!agreed}
                  className="w-full sm:w-auto px-10 py-3.5 font-bold text-white rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    boxShadow: agreed ? '0 8px 30px -5px rgba(59,130,246,0.5)' : 'none'
                  }}
                >
                  Start Examination <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE EXAM STAGE - Immersive */}
      {stages === 'active' && (
        <div className="w-full h-full animate-in slide-in-from-bottom-8 duration-500 flex flex-col relative z-10"
          style={{ color: darkMode ? '#e1e2ec' : '#1b1b1d' }}>
          {/* Header */}
          <div className="px-6 sm:px-10 py-4 flex justify-between items-center shrink-0"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(24px)',
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 text-[10px] sm:text-xs rounded-xl font-bold uppercase tracking-widest"
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}>
                LIVE ASSESSMENT
              </div>
              <h2 className="hidden sm:block font-bold text-sm truncate max-w-xs" style={{ color: darkMode ? '#c2c6d6' : '#475569' }}>{courseTitle}</h2>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold font-mono text-sm transition-all ${
              timeLeft < 300 ? 'animate-pulse' : ''
            }`} style={{
              background: timeLeft < 300 ? 'rgba(239,68,68,0.1)' : (darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
              border: `1px solid ${timeLeft < 300 ? 'rgba(239,68,68,0.25)' : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
              color: timeLeft < 300 ? '#ef4444' : (darkMode ? '#e1e2ec' : '#1e293b'),
              boxShadow: timeLeft < 300 ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
            }}>
              <Timer className="w-4 h-4" style={{ color: timeLeft < 300 ? '#ef4444' : '#3b82f6' }} />
              {formatTimer(timeLeft)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 shrink-0" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                boxShadow: '0 0 10px rgba(59,130,246,0.4)'
              }}
            />
          </div>

          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            {/* Left Column - Question Area */}
            <div className="flex-grow p-6 sm:p-10 overflow-y-auto flex flex-col"
              style={{ background: darkMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.01)' }}>
              
              <div className="flex-grow max-w-4xl mx-auto w-full space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
                      }}>
                      {String(currentIdx + 1).padStart(2, '0')}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.15em]"
                      style={{ color: darkMode ? '#8c909f' : '#94a3b8' }}>
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium leading-relaxed"
                    style={{ fontFamily: 'Inter, Outfit, sans-serif', color: darkMode ? '#e1e2ec' : '#1e293b' }}>
                    {currentQ.question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2">
                  {currentQ.options.map((optId, oIdx) => {
                    const selected = answers[currentQ.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        className="w-full text-left p-5 sm:p-6 rounded-2xl text-sm sm:text-base transition-all duration-200 flex items-center justify-between group"
                        style={{
                          background: selected
                            ? (darkMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)')
                            : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)'),
                          border: `1px solid ${selected
                            ? 'rgba(59,130,246,0.4)'
                            : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
                          boxShadow: selected
                            ? '0 0 20px rgba(59,130,246,0.15), inset 0 0 20px rgba(59,130,246,0.05)'
                            : 'none',
                          backdropFilter: 'blur(16px)',
                          color: darkMode ? '#e1e2ec' : '#1e293b',
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs transition-colors"
                            style={{
                              background: selected
                                ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                                : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                              color: selected ? 'white' : (darkMode ? '#8c909f' : '#94a3b8'),
                              border: `1px solid ${selected ? 'rgba(59,130,246,0.5)' : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
                            }}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="font-medium leading-relaxed">{optId}</span>
                        </div>
                        {selected && <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.8)' }} />}
                      </button>
                    );
                  })}
                </div>

                {cheatingAttempts > 0 && (
                  <div className="p-4 rounded-2xl text-xs sm:text-sm leading-relaxed flex items-start gap-3 mt-6"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.15)',
                      color: '#fca5a5',
                    }}>
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                    <span>
                      <strong>Compliance Warning ({cheatingAttempts}/3):</strong> Tab switching detected. Further violations will result in automatic exam failure.
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="mt-8 pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between max-w-4xl mx-auto w-full"
                style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <div className="flex w-full sm:w-auto gap-3">
                  <button
                    onClick={() => handleNavigateQuestion(currentIdx - 1)}
                    disabled={currentIdx === 0}
                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold rounded-2xl disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => handleNavigateQuestion(currentIdx + 1)}
                    disabled={currentIdx === questions.length - 1}
                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold rounded-2xl disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                  <button
                    onClick={() => {
                      if (currentIdx < questions.length - 1) handleNavigateQuestion(currentIdx + 1);
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold rounded-2xl transition-colors"
                    style={{ color: darkMode ? '#8c909f' : '#94a3b8' }}
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleCompleteExam(false)}
                    className="flex-1 sm:flex-none px-8 py-3 font-bold text-sm text-white rounded-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      boxShadow: '0 8px 30px -5px rgba(59,130,246,0.4)',
                    }}
                  >
                    Submit Exam <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Navigator Sidebar */}
            <div className="w-full md:w-[320px] shrink-0 p-6 sm:p-8 overflow-y-auto flex flex-col"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
                borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                backdropFilter: 'blur(24px)',
              }}>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-6"
                style={{ color: darkMode ? '#8c909f' : '#94a3b8' }}>
                Question Navigator
              </h4>
              
              <div className="grid grid-cols-5 gap-3">
                {questions.map((q, idx) => {
                  const answered = answers[q.id] !== undefined;
                  const current = idx === currentIdx;
                  
                  let bgStyle: React.CSSProperties = {
                    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    color: darkMode ? '#8c909f' : '#94a3b8',
                  };
                  if (current) {
                    bgStyle = {
                      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      border: '1px solid rgba(59,130,246,0.5)',
                      color: 'white',
                      boxShadow: '0 0 15px rgba(59,130,246,0.4)',
                    };
                  } else if (answered) {
                    bgStyle = {
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      color: '#4edea3',
                    };
                  } else if (visited[idx]) {
                    bgStyle = {
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#fbbf24',
                    };
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleNavigateQuestion(idx)}
                      className="w-full aspect-square text-xs sm:text-sm font-bold rounded-xl transition-all"
                      style={bgStyle}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-8 space-y-4 text-xs font-medium" style={{ color: darkMode ? '#8c909f' : '#94a3b8' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-md" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }} /> Answered</div>
                  <span>{Object.keys(answers).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-md" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }} /> Skipped</div>
                  <span>{Object.values(visited).filter(v=>v).length - Object.keys(answers).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-md" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} /> Pending</div>
                  <span>{questions.length - Object.values(visited).filter(v=>v).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXAM ANALYSIS STAGE */}
      {stages === 'analysis' && (
        <ExamAnalysis
          questions={questions}
          answers={answers}
          scorePct={scorePct}
          courseTitle={courseTitle}
          darkMode={darkMode}
          onViewCertificate={() => setStages('result')}
          onRetakeExam={() => {
            setAnswers({});
            setTimeLeft(3600);
            setCurrentIdx(0);
            setVisited({ 0: true });
            setCheatingAttempts(0);
            setStages('active');
          }}
          onClose={onClose}
        />
      )}

      {/* 4. EVALUATION RESULTS STAGE */}
      {stages === 'result' && (
        <div className="w-full h-full animate-in zoom-in-95 duration-500 py-8 px-4 md:px-8 overflow-y-auto relative z-10">
          
          {/* Top Stats Banner */}
          <div className="rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mb-8"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: darkMode ? '0 0 80px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 25px 60px -12px rgba(0,0,0,0.15)',
            }}>
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #10b981)' }} />
            
            <div className="space-y-4 text-center md:text-left flex-1">
              <span className="px-3 py-1.5 text-[10px] sm:text-xs rounded-xl font-bold uppercase tracking-widest"
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}>Assessment report summary</span>
              <h2 className="text-2xl sm:text-4xl font-bold flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {scorePct >= 70 ? (
                  <><div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}><CheckCircle className="w-7 h-7 text-emerald-400" /></div> <span style={{ color: '#4edea3' }}>CERTIFIED</span></>
                ) : (
                  <><div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 20px rgba(239,68,68,0.2)' }}><AlertCircle className="w-7 h-7 text-red-400" /></div> <span style={{ color: '#f87171' }}>NOT CLEARED</span></>
                )}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed max-w-md mx-auto md:mx-0" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                {scorePct >= 70
                  ? `You achieved an excellent score of ${scorePct}%. Your professional certification records were compiled in our verified system ledger.`
                  : `You scored ${scorePct}%. You need a passing percentage of 70% to unlock credentials.`}
              </p>
            </div>

            <div className="flex flex-col items-center shrink-0 relative">
              {scorePct >= 70 && <div className="absolute inset-0 bg-emerald-500/20 blur-[50px] rounded-full" />}
              <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center relative"
                style={{
                  background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,1)',
                  border: `2px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
                }}>
                {/* SVG Circle highlight */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className={`stroke-current ${scorePct >= 70 ? 'text-emerald-500' : 'text-blue-500'}`}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={2 * Math.PI * 72 * (1 - scorePct / 100)}
                    strokeLinecap="round"
                    style={{ filter: scorePct >= 70 ? 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' : 'drop-shadow(0 0 8px rgba(59,130,246,0.8))' }}
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="stroke-current opacity-10"
                    strokeWidth="12"
                    fill="transparent"
                    style={{ color: darkMode ? '#ffffff' : '#000000' }}
                  />
                </svg>

                <span className={`text-5xl font-extrabold font-mono`} style={{ color: scorePct >= 70 ? '#4edea3' : '#60a5fa', textShadow: `0 0 20px ${scorePct >= 70 ? 'rgba(16,185,129,0.5)' : 'rgba(59,130,246,0.5)'}` }}>{scorePct}%</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] mt-2" style={{ color: darkMode ? '#8c909f' : '#94a3b8' }}>Score</span>
              </div>
            </div>
          </div>

          {/* If Pass: Issue Gorgeous Printable Certificate card widget */}
          {scorePct >= 70 && pResult && pResult.certificate && (
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                <h3 className="font-bold text-xs uppercase tracking-[0.2em] px-4" style={{ fontFamily: 'Outfit, sans-serif', color: darkMode ? '#8c909f' : '#64748b' }}>Authentic Certification</h3>
                <div className="h-px flex-1" style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
              </div>
              
              <div className="relative group rounded-[2rem] overflow-hidden" style={{ border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, padding: '4px' }}>
                {/* Paywall Overlay */}
                {!isCertificateUnlocked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/60 dark:bg-[#0b0e15]/80 backdrop-blur-[16px] rounded-[1.8rem]">
                    <div className="p-10 rounded-3xl max-w-sm w-full text-center space-y-6 relative overflow-hidden animate-in zoom-in-95"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(32px)'
                      }}>
                      {/* Premium Gold Glow background */}
                      <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />
                      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-orange-600/20 rounded-full blur-[80px] pointer-events-none" />
                      
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />
                      
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center border mb-2"
                          style={{
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,88,12,0.15))',
                            border: '1px solid rgba(245,158,11,0.3)',
                            boxShadow: '0 0 30px rgba(245,158,11,0.2)'
                          }}>
                          <Lock className="w-8 h-8 text-amber-400" style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.8))' }} />
                        </div>
                      </div>
                      
                      <div className="space-y-2 relative z-10">
                        <h4 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md" style={{ fontFamily: 'Outfit, sans-serif' }}>Unlock Premium</h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">Secure your officially verified credentials and showcase your expertise to top recruiters.</p>
                      </div>

                      <div className="relative z-10 p-5 rounded-2xl flex items-center justify-center gap-4 shadow-inner"
                        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-amber-500/70 font-bold tracking-widest uppercase mb-0.5">Original</span>
                          <span className="text-sm text-slate-500 line-through decoration-red-500/50 decoration-2 font-mono">₹1,999</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-0.5">Special Offer</span>
                          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 drop-shadow-lg">₹499</span>
                        </div>
                      </div>

                      <ul className="text-xs text-left space-y-3.5 mb-6 font-medium text-slate-200 relative z-10">
                        <li className="flex items-center gap-3"><div className="p-1.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}><Shield className="w-3.5 h-3.5 text-emerald-400" /></div> Lifetime Validity & Verification</li>
                        <li className="flex items-center gap-3"><div className="p-1.5 rounded-xl" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}><Download className="w-3.5 h-3.5 text-blue-400" /></div> High-Resolution PDF Export</li>
                        <li className="flex items-center gap-3"><div className="p-1.5 rounded-xl" style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)' }}><Linkedin className="w-3.5 h-3.5 text-sky-400" /></div> 1-Click LinkedIn Integration</li>
                      </ul>

                      <button
                        onClick={() => {
                          onToast('Payment Mock Successful! Certificate Unlocked.', 'success');
                          setIsCertificateUnlocked(true);
                        }}
                        className="w-full relative group/btn overflow-hidden px-6 py-4 font-bold text-white rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.15em] text-xs z-10"
                        style={{ boxShadow: '0 10px 30px -10px rgba(245,158,11,0.6)' }}
                      >
                        <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                        Secure Payment <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Ultra Premium Certificate Design */}
                <div id="print-area-certificate" className={`w-full aspect-[1.414/1] rounded-[1.8rem] relative overflow-hidden select-text text-center flex flex-col justify-center transition-all duration-1000 ${!isCertificateUnlocked ? 'filter blur-[12px] grayscale-[0.5] scale-[0.98] pointer-events-none select-none opacity-50' : 'scale-100 opacity-100'}`}>
                  
                  {/* Outer Certificate Paper styling */}
                  <div className="absolute inset-0 bg-[#fdfbf7] shadow-2xl" />
                  
                  {/* Intricate Borders */}
                  <div className="absolute inset-4 sm:inset-6 border-[8px] sm:border-[12px] border-double border-[#c9a84c] opacity-80" />
                  <div className="absolute inset-6 sm:inset-8 border border-[#1a3a5c] opacity-30" />
                  
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#c9a84c 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none text-[200px] font-serif font-bold text-[#c9a84c] whitespace-nowrap rotate-[-30deg]">
                    SKILLVERSE
                  </div>
                  
                  {/* Corner Ornaments */}
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#1a3a5c]" />
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#1a3a5c]" />
                  <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#1a3a5c]" />
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#1a3a5c]" />

                  <div className="relative z-10 flex flex-col items-center justify-between h-full py-12 sm:py-16 px-10 sm:px-20">
                    
                    {/* Header Header */}
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a3a5c] to-blue-800 text-white flex items-center justify-center shadow-lg border-2 border-[#c9a84c] mb-4">
                        <Award className="w-8 h-8 text-[#f8e5b0]" />
                      </div>
                      <h1 className="text-3xl sm:text-5xl font-serif font-medium text-[#1a3a5c] tracking-widest uppercase" style={{ textShadow: '1px 1px 0 rgba(255,255,255,1), 2px 2px 4px rgba(0,0,0,0.1)' }}>
                        Certificate
                      </h1>
                      <div className="h-px w-48 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mt-4 mb-1" />
                      <span className="text-[9px] sm:text-[11px] text-[#c9a84c] font-bold tracking-[0.4em] uppercase">Of Professional Achievement</span>
                    </div>

                    {/* Recipient Details */}
                    <div className="flex flex-col items-center space-y-4 my-6">
                      <p className="text-xs sm:text-sm text-slate-500 italic font-serif">This is to proudly certify that</p>
                      
                      <h2 className="text-4xl sm:text-6xl font-bold text-[#1a3a5c] leading-tight capitalize" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                        {pResult.certificate.userName}
                      </h2>
                      
                      <div className="w-3/4 h-0.5 bg-[#c9a84c] rounded-full opacity-50" />
                      
                      <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mt-2 font-serif">
                        has successfully fulfilled all requirements, cleared the official assessment, and demonstrated exceptional proficiency in
                      </p>
                      
                      <h3 className="text-xl sm:text-2xl font-bold text-[#1a3a5c] uppercase tracking-wider mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {pResult.certificate.courseName}
                      </h3>
                      
                      <div className="inline-flex items-center gap-4 mt-4 px-6 py-2 border border-[#c9a84c]/40 rounded-full bg-white/50 shadow-sm backdrop-blur-sm">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Grade Achieved:</span>
                        <span className="text-sm sm:text-base font-extrabold text-[#1a3a5c]">{scorePct}%</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Date:</span>
                        <span className="text-sm sm:text-base font-extrabold text-[#1a3a5c]">{new Date(pResult.certificate.issuedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Footer Signatures & QR */}
                    <div className="w-full flex justify-between items-end mt-auto pt-6 border-t-2 border-[#1a3a5c]/10">
                      
                      {/* Signature 1 */}
                      <div className="text-center w-40">
                        <div className="h-12 flex items-center justify-center mb-1 relative">
                          <span className="text-2xl text-[#1a3a5c]/80" style={{ fontFamily: '"Brush Script MT", cursive' }}>SkillVerse Admin</span>
                        </div>
                        <div className="border-t border-[#1a3a5c] pt-1">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Authorized Signatory</span>
                        </div>
                      </div>

                      {/* Official Seal / QR */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#c9a84c] to-yellow-600 rounded-full flex items-center justify-center p-1 shadow-[0_4px_15px_rgba(201,168,76,0.4)] border-4 border-white">
                          <div className="w-full h-full border border-dashed border-white/50 rounded-full flex items-center justify-center relative overflow-hidden bg-[#1a3a5c]">
                            <Shield className="w-8 h-8 text-[#f8e5b0] opacity-90" />
                            <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-conic-gradient(from 0deg, transparent 0deg 15deg, white 15deg 30deg)' }} />
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-[8px] font-bold text-[#1a3a5c] uppercase tracking-[0.2em] block">ID: {pResult.certificate.certificateId}</span>
                          <span className="text-[7px] text-slate-400 uppercase tracking-widest">Verify online</span>
                        </div>
                      </div>

                      {/* Signature 2 */}
                      <div className="text-center w-40">
                        <div className="h-12 flex items-center justify-center mb-1">
                          <span className="text-2xl text-[#1a3a5c]/80" style={{ fontFamily: '"Brush Script MT", cursive' }}>Academic Council</span>
                        </div>
                        <div className="border-t border-[#1a3a5c] pt-1">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Board of Directors</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Download and sharing buttons triggers */}
              {isCertificateUnlocked ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in slide-in-from-top-4">
                  <button
                    onClick={handlePrintCertificate}
                    className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-sm text-white rounded-2xl hover:-translate-y-0.5 transition-all"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 8px 30px -5px rgba(59,130,246,0.4)' }}
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button
                    onClick={handleShareToLinkedIn}
                    className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-sm rounded-2xl transition-all"
                    style={{
                      background: darkMode ? 'rgba(14,165,233,0.1)' : 'rgba(14,165,233,0.05)',
                      border: `1px solid ${darkMode ? 'rgba(14,165,233,0.3)' : 'rgba(14,165,233,0.2)'}`,
                      color: '#0ea5e9'
                    }}
                  >
                    <Linkedin className="w-4 h-4" /> Share on LinkedIn
                  </button>
                  <button
                    onClick={handleCopyVerification}
                    className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-sm rounded-2xl transition-all"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                      color: darkMode ? '#e1e2ec' : '#1e293b'
                    }}
                  >
                    <Clipboard className="w-4 h-4" /> Copy Link
                  </button>
                </div>
              ) : (
                <div className="text-center pt-2 pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: darkMode ? '#8c909f' : '#94a3b8' }}><Lock className="w-3 h-3 inline mr-1" /> Downloading is locked</p>
                </div>
              )}

            </div>
          )}

          {/* Correct answer reviews and retake CTA if Failed */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            
            {scorePct < 70 && (
              <button
                onClick={() => {
                  setAnswers({});
                  setTimeLeft(3600);
                  setCurrentIdx(0);
                  setStages('active');
                }}
                className="px-8 py-4 font-bold text-sm text-white rounded-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 8px 30px -5px rgba(59,130,246,0.4)' }}
              >
                <Play className="w-4 h-4" /> Retake Exam
              </button>
            )}

            <button
              onClick={() => setReviewOpen(!reviewOpen)}
              className="px-8 py-4 text-sm rounded-2xl font-bold transition-all"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                color: darkMode ? '#e1e2ec' : '#1e293b',
                backdropFilter: 'blur(16px)'
              }}
            >
              {reviewOpen ? 'Hide Answer Key' : 'Review Answers'}
            </button>

            <button
              onClick={onClose}
              className="px-8 py-4 text-sm rounded-2xl font-bold transition-all"
              style={{ color: darkMode ? '#8c909f' : '#64748b' }}
            >
              Exit to Dashboard
            </button>
          </div>

          {/* Exam review expanded panel */}
          {reviewOpen && (
            <div className="space-y-4 p-6 sm:p-10 rounded-[2rem] animate-in slide-in-from-bottom-5"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                backdropFilter: 'blur(24px)'
              }}>
              <h3 className="font-bold text-xs uppercase tracking-[0.2em] mb-8" style={{ fontFamily: 'Outfit, sans-serif', color: darkMode ? '#8c909f' : '#64748b' }}>Key Sheet Audit</h3>
              {questions.map((q, qIndex) => {
                const isCorrect = answers[q.id] === q.correctOptionIndex;
                const userChoice = answers[q.id];
                
                let bgClass = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                let borderClass = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                
                if (isCorrect) {
                  bgClass = 'rgba(16,185,129,0.08)';
                  borderClass = 'rgba(16,185,129,0.2)';
                } else if (userChoice !== undefined) {
                  bgClass = 'rgba(239,68,68,0.08)';
                  borderClass = 'rgba(239,68,68,0.2)';
                }

                return (
                  <div
                    key={q.id}
                    className="p-6 sm:p-8 rounded-2xl text-sm leading-relaxed space-y-5 transition-all"
                    style={{ background: bgClass, border: `1px solid ${borderClass}` }}
                  >
                    <div className="flex items-start gap-4 max-w-3xl">
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold"
                        style={{
                          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          color: darkMode ? '#e1e2ec' : '#1e293b'
                        }}>Q{qIndex + 1}</span>
                      <p className="font-semibold text-base mt-0.5" style={{ color: darkMode ? '#e1e2ec' : '#1e293b' }}>{q.question}</p>
                    </div>

                    <div className="space-y-3 pl-12">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOption = oIdx === q.correctOptionIndex;
                        const isUserSelected = oIdx === userChoice;
                        
                        let optColor = darkMode ? '#8c909f' : '#64748b';
                        if (isCorrectOption) optColor = '#4edea3';
                        else if (isUserSelected) optColor = '#f87171';

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-3 p-2.5 rounded-xl`}
                            style={{
                              color: optColor,
                              fontWeight: isCorrectOption || isUserSelected ? '600' : '500',
                              background: isCorrectOption ? 'rgba(16,185,129,0.05)' : isUserSelected ? 'rgba(239,68,68,0.05)' : 'transparent',
                              textDecoration: isUserSelected && !isCorrect ? 'line-through' : 'none',
                              textDecorationColor: 'rgba(239,68,68,0.5)'
                            }}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: isCorrectOption ? '#4edea3' : isUserSelected ? '#f87171' : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') }} />
                            <span>{opt}</span>
                            {isCorrectOption && <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg ml-3 shrink-0" style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', color: '#4edea3' }}>Correct</span>}
                            {isUserSelected && !isCorrect && <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg ml-3 shrink-0" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// EXAM ANALYSIS COMPONENT - Professional Topic-wise Breakdown
// ──────────────────────────────────────────────────────────────────────────

interface TopicAnalysis {
  topic: string;
  total: number;
  correct: number;
  percentage: number;
  questions: { question: string; isCorrect: boolean; userAnswer: string; correctAnswer: string }[];
}

interface ExamAnalysisProps {
  questions: ExamQuestion[];
  answers: Record<string, number>;
  scorePct: number;
  courseTitle: string;
  darkMode: boolean;
  onViewCertificate: () => void;
  onRetakeExam: () => void;
  onClose: () => void;
}

function extractTopicFromQuestion(question: string): string {
  const q = question.toLowerCase();
  
  // AI & ML
  if (q.includes('neural network') || q.includes('backpropagation') || q.includes('deep learning')) return 'Neural Networks';
  if (q.includes('activation function') || q.includes('relu') || q.includes('sigmoid') || q.includes('gelu')) return 'Activation Functions';
  if (q.includes('transformer') || q.includes('self-attention') || q.includes('language model') || q.includes('gpt')) return 'Transformers & LLMs';
  if (q.includes('overfit') || q.includes('underfit') || q.includes('regularization') || q.includes('variance') || q.includes('bias')) return 'Model Training & Optimization';
  if (q.includes('epoch') || q.includes('batch') || q.includes('learning rate') || q.includes('gradient')) return 'Training Fundamentals';
  if (q.includes('supervised') || q.includes('unsupervised') || q.includes('clustering') || q.includes('classification')) return 'Learning Paradigms';
  
  // Web Dev
  if (q.includes('react') || q.includes('usememo') || q.includes('useeffect') || q.includes('virtual dom') || q.includes('hook')) return 'React & Frontend';
  if (q.includes('express') || q.includes('middleware') || q.includes('cors') || q.includes('backend') || q.includes('node')) return 'Backend & APIs';
  if (q.includes('nosql') || q.includes('mongodb') || q.includes('database') || q.includes('sql') || q.includes('schema')) return 'Databases';
  if (q.includes('websocket') || q.includes('socket') || q.includes('http') || q.includes('protocol') || q.includes('api')) return 'Networking & Protocols';
  if (q.includes('css') || q.includes('html') || q.includes('dom') || q.includes('layout') || q.includes('responsive')) return 'HTML/CSS & Layout';
  
  // Data Science
  if (q.includes('pandas') || q.includes('numpy') || q.includes('dataframe') || q.includes('array')) return 'Data Libraries';
  if (q.includes('statistic') || q.includes('deviation') || q.includes('mean') || q.includes('median') || q.includes('hypothesis')) return 'Statistics';
  if (q.includes('visualization') || q.includes('seaborn') || q.includes('plotly') || q.includes('chart') || q.includes('dashboard')) return 'Data Visualization';
  if (q.includes('feature') || q.includes('prediction') || q.includes('regression') || q.includes('model')) return 'Predictive Modeling';
  
  // Cybersecurity
  if (q.includes('encrypt') || q.includes('cryptograph') || q.includes('aes') || q.includes('rsa') || q.includes('hash')) return 'Cryptography';
  if (q.includes('vulnerability') || q.includes('penetration') || q.includes('exploit') || q.includes('attack')) return 'Vulnerability Assessment';
  if (q.includes('network') || q.includes('firewall') || q.includes('port') || q.includes('tcp') || q.includes('ip')) return 'Network Security';
  if (q.includes('injection') || q.includes('xss') || q.includes('csrf') || q.includes('security')) return 'Web Security';
  
  // Cloud
  if (q.includes('aws') || q.includes('ec2') || q.includes('s3') || q.includes('lambda') || q.includes('serverless')) return 'Cloud Services (AWS)';
  if (q.includes('azure') || q.includes('gcp') || q.includes('cloud')) return 'Cloud Platforms';
  if (q.includes('docker') || q.includes('container') || q.includes('kubernetes') || q.includes('k8s')) return 'Containers & Orchestration';
  if (q.includes('ci/cd') || q.includes('jenkins') || q.includes('pipeline') || q.includes('deploy')) return 'CI/CD & Deployment';
  
  // Flutter / App Dev
  if (q.includes('dart') || q.includes('flutter') || q.includes('widget') || q.includes('stateful')) return 'Flutter & Dart';
  if (q.includes('state management') || q.includes('provider') || q.includes('stream')) return 'State Management';
  
  // Business
  if (q.includes('seo') || q.includes('marketing') || q.includes('campaign') || q.includes('conversion')) return 'Digital Marketing';
  if (q.includes('stock') || q.includes('trading') || q.includes('candlestick') || q.includes('equity')) return 'Stock Trading';
  if (q.includes('freelanc') || q.includes('client') || q.includes('proposal') || q.includes('pitch')) return 'Freelancing';
  if (q.includes('brand') || q.includes('content') || q.includes('audience') || q.includes('social media')) return 'Content & Branding';
  if (q.includes('startup') || q.includes('mvp') || q.includes('funding') || q.includes('venture')) return 'Entrepreneurship';
  if (q.includes('communicat') || q.includes('presentation') || q.includes('negotiation') || q.includes('leadership')) return 'Communication Skills';
  if (q.includes('finance') || q.includes('accounting') || q.includes('balance sheet') || q.includes('cash flow')) return 'Corporate Finance';
  
  // Design
  if (q.includes('figma') || q.includes('wireframe') || q.includes('prototype') || q.includes('ui') || q.includes('ux')) return 'UI/UX Design';
  if (q.includes('typography') || q.includes('color') || q.includes('layout') || q.includes('spacing')) return 'Visual Design';
  
  // Generic fallback - extract keywords
  const words = question.split(/\s+/).filter(w => w.length > 5);
  if (words.length > 2) return 'General Concepts';
  return 'Core Fundamentals';
}

function ExamAnalysis({
  questions,
  answers,
  scorePct,
  courseTitle,
  darkMode,
  onViewCertificate,
  onRetakeExam,
  onClose,
}: ExamAnalysisProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showTopics, setShowTopics] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Animate score counter
  useEffect(() => {
    let current = 0;
    const target = scorePct;
    const step = Math.max(1, Math.floor(target / 60));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedScore(current);
      if (current >= target) clearInterval(interval);
    }, 25);
    
    const topicTimer = setTimeout(() => setShowTopics(true), 800);
    
    return () => {
      clearInterval(interval);
      clearTimeout(topicTimer);
    };
  }, [scorePct]);

  // Compute topic-wise analysis
  const topicAnalysis: TopicAnalysis[] = useMemo(() => {
    const topicMap: Record<string, { total: number; correct: number; questions: TopicAnalysis['questions'] }> = {};
    
    questions.forEach((q) => {
      const topic = extractTopicFromQuestion(q.question);
      if (!topicMap[topic]) {
        topicMap[topic] = { total: 0, correct: 0, questions: [] };
      }
      
      const userAnswerIdx = answers[q.id];
      const isCorrect = userAnswerIdx === q.correctOptionIndex;
      
      topicMap[topic].total += 1;
      if (isCorrect) topicMap[topic].correct += 1;
      
      topicMap[topic].questions.push({
        question: q.question,
        isCorrect,
        userAnswer: userAnswerIdx !== undefined ? q.options[userAnswerIdx] : 'Not Answered',
        correctAnswer: q.options[q.correctOptionIndex],
      });
    });
    
    return Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        total: data.total,
        correct: data.correct,
        percentage: Math.round((data.correct / data.total) * 100),
        questions: data.questions,
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }, [questions, answers]);

  const weakTopics = topicAnalysis.filter(t => t.percentage < 50);
  const strongTopics = topicAnalysis.filter(t => t.percentage >= 80);
  const totalCorrect = questions.filter(q => answers[q.id] === q.correctOptionIndex).length;
  const totalWrong = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctOptionIndex).length;
  const totalSkipped = questions.filter(q => answers[q.id] === undefined).length;

  const scoreColor = scorePct >= 80 ? 'text-emerald-500' : scorePct >= 60 ? 'text-amber-500' : 'text-red-500';
  const scoreBorderColor = scorePct >= 80 ? 'border-emerald-500' : scorePct >= 60 ? 'border-amber-500' : 'border-red-500';
  const scoreGradient = scorePct >= 80 ? 'from-emerald-500 to-teal-400' : scorePct >= 60 ? 'from-amber-500 to-orange-400' : 'from-red-500 to-pink-400';
  const scoreLabel = scorePct >= 80 ? 'Excellent' : scorePct >= 60 ? 'Good Effort' : 'Needs Improvement';

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference * (1 - animatedScore / 100);

  return (
    <div className="w-full h-full animate-in zoom-in-95 duration-500 py-6 space-y-6 overflow-y-auto px-4 md:px-8 relative z-10"
         style={{ color: darkMode ? '#e1e2ec' : '#1b1b1d' }}>
      
      {/* ── Header Card: Score Overview ── */}
      <div className="rounded-[2rem] overflow-hidden relative p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10"
           style={{
             background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
             backdropFilter: 'blur(24px)',
             border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
             boxShadow: darkMode ? '0 0 80px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 25px 60px -12px rgba(0,0,0,0.15)',
           }}>
        
        {/* Ambient glow */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${scoreGradient}`} />
        <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px] pointer-events-none opacity-20 bg-gradient-to-br ${scoreGradient}`} />
        
        {/* Radial Score Gauge */}
        <div className="relative shrink-0">
          <svg width="180" height="180" className="transform -rotate-90">
            <circle cx="90" cy="90" r="75" fill="none" strokeWidth="12" className={`${darkMode ? 'stroke-[#1e293b]' : 'stroke-slate-100'}`} />
            <circle
              cx="90" cy="90" r="75" fill="none" strokeWidth="12"
              className={`${scoreColor} transition-all duration-1000 ease-out`}
              style={{ stroke: 'currentColor', strokeDasharray: 2 * Math.PI * 75, strokeDashoffset: 2 * Math.PI * 75 * (1 - animatedScore / 100), strokeLinecap: 'round' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-black font-mono ${scoreColor}`}>{animatedScore}%</span>
            <span className={`text-xs font-bold uppercase tracking-[0.2em] mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Score</span>
          </div>
        </div>
        
        {/* Score Summary */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <span className={`px-4 py-1.5 text-[10px] rounded-xl font-bold uppercase tracking-widest border ${
              scorePct >= 80
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : scorePct >= 60
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
            }`}>{scoreLabel}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Exam Analysis Report
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed max-w-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {courseTitle} • Detailed performance breakdown across {topicAnalysis.length} topic{topicAnalysis.length !== 1 ? 's' : ''} identified.
          </p>
          
          {/* Quick Stats Row */}
          <div className="flex flex-wrap gap-3 pt-3 justify-center md:justify-start">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold ${
              darkMode ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              <CheckCircle className="w-4 h-4" /> {totalCorrect} Correct
            </div>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold ${
              darkMode ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              <XCircle className="w-4 h-4" /> {totalWrong} Wrong
            </div>
            {totalSkipped > 0 && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold ${
                darkMode ? 'bg-slate-500/5 border-slate-500/20 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <HelpCircle className="w-4 h-4" /> {totalSkipped} Skipped
              </div>
            )}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold ${
              darkMode ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
            }`}>
              <BookOpen className="w-4 h-4" /> {questions.length} Total
            </div>
          </div>
        </div>
      </div>

      {/* ── Weak & Strong Topic Highlights ── */}
      {showTopics && (weakTopics.length > 0 || strongTopics.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-5 duration-500">
          
          {/* Weak Topics */}
          {weakTopics.length > 0 && (
            <div className={`rounded-[2rem] p-8 border ${darkMode ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50/50 border-red-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-500/15' : 'bg-red-100'}`}>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-base text-red-600 dark:text-red-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Needs Improvement
                </h3>
              </div>
              <div className="space-y-3">
                {weakTopics.map(t => (
                  <div key={t.topic} className={`flex items-center justify-between p-4 rounded-2xl border text-sm font-medium ${
                    darkMode ? 'bg-[#0b0e15]/50 border-red-500/10 text-slate-300' : 'bg-white border-red-100 text-slate-700'
                  }`}>
                    <span className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                      {t.topic}
                    </span>
                    <span className="text-red-500 font-bold">{t.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Strong Topics */}
          {strongTopics.length > 0 && (
            <div className={`rounded-[2rem] p-8 border ${darkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-emerald-500/15' : 'bg-emerald-100'}`}>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-bold text-base text-emerald-600 dark:text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Strong Performance
                </h3>
              </div>
              <div className="space-y-3">
                {strongTopics.map(t => (
                  <div key={t.topic} className={`flex items-center justify-between p-4 rounded-2xl border text-sm font-medium ${
                    darkMode ? 'bg-[#0b0e15]/50 border-emerald-500/10 text-slate-300' : 'bg-white border-emerald-100 text-slate-700'
                  }`}>
                    <span className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      {t.topic}
                    </span>
                    <span className="text-emerald-500 font-bold">{t.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Topic-wise Detailed Breakdown ── */}
      {showTopics && (
        <div className="rounded-[2rem] overflow-hidden"
             style={{
               background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
               border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
               backdropFilter: 'blur(24px)'
             }}>
          <div className={`px-8 py-6 border-b flex items-center justify-between ${
            darkMode ? 'border-[rgba(255,255,255,0.06)]' : 'border-[rgba(0,0,0,0.06)]'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-2xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Topic-wise Breakdown</h3>
                <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Click any topic to expand details</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-4 py-2 rounded-xl ${darkMode ? 'bg-[rgba(255,255,255,0.05)] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {topicAnalysis.length} Topics
            </span>
          </div>
          
          <div className="divide-y" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
            {topicAnalysis.map((topic, idx) => {
              const isExpanded = expandedTopic === topic.topic;
              const topicColor = topic.percentage >= 80 ? 'emerald' : topic.percentage >= 50 ? 'amber' : 'red';
              
              return (
                <div key={topic.topic} className="animate-in slide-in-from-left-3" style={{ animationDelay: `${idx * 80}ms` }}>
                  
                  {/* Topic Header Row */}
                  <button
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.topic)}
                    className={`w-full px-8 py-6 flex items-center gap-6 text-left transition-colors ${
                      darkMode ? 'hover:bg-[rgba(255,255,255,0.02)]' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Topic Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      topicColor === 'emerald'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : topicColor === 'amber'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                      {topicColor === 'emerald' ? <Zap className="w-6 h-6" /> : topicColor === 'amber' ? <Target className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    
                    {/* Topic Name + Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-base truncate pr-4">{topic.topic}</span>
                        <span className={`text-sm font-bold shrink-0 ${
                          topicColor === 'emerald' ? 'text-emerald-500' : topicColor === 'amber' ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {topic.correct}/{topic.total} ({topic.percentage}%)
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-[#0b0e15]' : 'bg-slate-100'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            topicColor === 'emerald' ? 'bg-emerald-500' : topicColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${topic.percentage}%`, transitionDelay: `${idx * 100}ms` }}
                        />
                      </div>
                    </div>
                    
                    {/* Expand icon */}
                    <ChevronRight className={`w-5 h-5 transition-transform duration-200 shrink-0 ${
                      darkMode ? 'text-slate-500' : 'text-slate-400'
                    } ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {/* Expanded Question Details */}
                  {isExpanded && (
                    <div className={`px-8 pb-8 space-y-4 animate-in slide-in-from-top-2 duration-300 ${
                      darkMode ? 'bg-[rgba(0,0,0,0.1)]' : 'bg-slate-50/50'
                    }`}>
                      {topic.questions.map((qItem, qIdx) => (
                        <div
                          key={qIdx}
                          className={`p-5 rounded-2xl border text-sm leading-relaxed ${
                            qItem.isCorrect
                              ? darkMode ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-emerald-50 border-emerald-100'
                              : darkMode ? 'bg-red-500/5 border-red-500/15' : 'bg-red-50 border-red-100'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            {qItem.isCorrect
                              ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            }
                            <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{qItem.question}</p>
                          </div>
                          
                          {!qItem.isCorrect && (
                            <div className="pl-8 space-y-2 mt-3">
                              <p className="text-red-500 dark:text-red-400 bg-red-500/10 p-2 rounded-lg">
                                <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Your Answer: </span>
                                <span className="line-through opacity-80">{qItem.userAnswer}</span>
                              </p>
                              <p className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg">
                                <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Correct Answer: </span>
                                {qItem.correctAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="rounded-[2rem] p-6 sm:p-10 mb-10"
           style={{
             background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
             border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
             backdropFilter: 'blur(24px)'
           }}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          
          {/* Get Certificate Button - Only if score >= 80% */}
          {scorePct >= 80 && (
            <button
              onClick={onViewCertificate}
              className="group relative px-8 py-4 font-bold text-white rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 hover:-translate-y-0.5 transition-all shadow-[0_8px_30px_-5px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 text-sm overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <Award className="w-5 h-5" />
              Get Certificate
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          {/* Retake Exam */}
          {scorePct < 80 && (
            <button
              onClick={onRetakeExam}
              className="px-8 py-4 font-bold text-white rounded-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 text-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 8px 30px -5px rgba(59,130,246,0.4)' }}
            >
              <RefreshCw className="w-4 h-4" />
              Retake Exam
            </button>
          )}

          {/* View Certificate (lower score, still passed >= 70) */}
          {scorePct >= 70 && scorePct < 80 && (
            <button
              onClick={onViewCertificate}
              className="px-8 py-4 font-bold rounded-2xl text-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                color: darkMode ? '#e1e2ec' : '#1e293b'
              }}
            >
              <Award className="w-4 h-4" />
              View Result Details
            </button>
          )}
          
          {/* Exit */}
          <button
            onClick={onClose}
            className="px-8 py-4 text-sm rounded-2xl font-bold transition-all hover:-translate-y-0.5"
            style={{ color: darkMode ? '#8c909f' : '#64748b' }}
          >
            Exit to Dashboard
          </button>
        </div>
        
        {/* Encouragement message */}
        {scorePct < 80 && (
          <p className={`text-center text-xs mt-6 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {scorePct >= 70
              ? '💡 You passed! Score 80% or above to unlock the premium "Get Certificate" option.'
              : `📚 You need at least 70% to pass. Focus on improving: ${weakTopics.map(t => t.topic).join(', ')}.`
            }
          </p>
        )}
      </div>
    </div>

  );
}
