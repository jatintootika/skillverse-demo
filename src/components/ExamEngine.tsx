/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertCircle, HelpCircle, ArrowLeft, ArrowRight, Clipboard, CheckCircle, Download, Linkedin, Share2, Award, ArrowRightCircle } from 'lucide-react';
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
  const [stages, setStages] = useState<'rules' | 'active' | 'result'>('rules');
  const [agreed, setAgreed] = useState(false);
  
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
      setStages('result');

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
      setStages('result');
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
    <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* 1. SEED/RULES STAGE */}
      {stages === 'rules' && (
        <div className="max-w-2xl mx-auto my-16 px-4">
          <div className={`rounded-3xl border p-8 shadow-2xl relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-sky-400" />
            
            <div className="text-center mb-8">
              <Award className="w-12 h-12 text-blue-500 mx-auto animate-bounce" />
              <h1 className="text-2xl font-extrabold tracking-tight mt-3">Course Certification Exam</h1>
              <p className="text-xs text-slate-400 mt-1">{courseTitle} Examination</p>
            </div>

            <div className={`rounded-2xl p-6 mb-6 space-y-4 text-xs leading-relaxed ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 border-b pb-2">
                <AlertCircle className="w-4 h-4 text-blue-500" /> Exam Rules and Instructions:
              </h3>
              <ul className="space-y-3 list-inside list-disc text-slate-400">
                <li><strong className="text-blue-500">Duration Limits:</strong> You have exactly <strong>60 minutes</strong> to complete all questions.</li>
                <li><strong className="text-blue-500">Passing Grade:</strong> You must score <strong>70% or more</strong> (a minimum of 35 answered correctly out of 50 standard, or proportional based on course config).</li>
                <li><strong className="text-blue-500">Evaluation Logic:</strong> There is <strong>no negative marking</strong>. Ensure you answer every question.</li>
                <li><strong className="text-blue-500">Locked Exam Window:</strong> You cannot pause or minimize the examination. Swapping windows or navigating out of this browser tab will register a compliance warning. <strong>3 violations will invoke an automatic submission!</strong></li>
                <li><strong className="text-blue-500">Instant Certification:</strong> A pass rank automatically provisions your credentials inside our global public auditing verification indices.</li>
              </ul>
            </div>

            {/* Checkbox agreement */}
            <div className="flex items-start gap-2.5 mb-8">
              <input
                type="checkbox"
                id="rules-agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <label htmlFor="rules-agree" className="text-xs text-slate-400 leading-snug cursor-pointer select-none">
                I hereby state that I am the verified account holder, and I agree to use zero external guides or aids during this certification process.
              </label>
            </div>

            {/* Action CTAs */}
            <div className="flex justify-between items-center bg-transparent">
              <button
                onClick={onClose}
                className={`text-xs px-4 py-2.5 rounded-xl border ${darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                Abandom Exam
              </button>
              <button
                onClick={() => setStages('active')}
                disabled={!agreed}
                className="px-6 py-2.5 font-semibold text-xs text-white rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 disabled:opacity-40 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
              >
                Start Examination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE SYSTEM STAGE */}
      {stages === 'active' && (
        <div id="active-exam-fullscreen" className="h-full flex flex-col">
          {/* Header Progress and timer bar */}
          <div className={`px-6 h-16 border-b flex justify-between items-center shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center space-x-3">
              <div className="px-2.5 py-1 text-[10px] font-mono rounded bg-blue-500/15 text-blue-500 font-extrabold tracking-uppercase">
                LIVE ASSESSMENT
              </div>
              <h2 className="text-sm font-bold truncate max-w-[180px] sm:max-w-none">{courseTitle}</h2>
            </div>

            {/* Timer countdown with alert threshold colors */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
              timeLeft < 300
                ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse'
                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              <Timer className="w-4 h-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>

          {/* Top visual progress bar bar */}
          <div className="w-full h-1 bg-slate-200">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>

          {/* Body Section splits Question and Sidebar palette */}
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            {/* Left Column Questionnaire */}
            <div className="flex-grow p-6 sm:p-10 overflow-y-auto space-y-6">
              
              <div id="question-header" className="space-y-1">
                <span className="text-xs font-bold text-blue-500">QUESTION {currentIdx + 1} OF {questions.length}</span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-relaxed max-w-3xl">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options lists */}
              <div id="exam-options-panel" className="grid grid-cols-1 gap-3 max-w-3xl pt-2">
                {currentQ.options.map((optId, oIdx) => {
                  const selected = answers[currentQ.id] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        selected
                          ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500 text-blue-600 dark:text-sky-400'
                          : darkMode
                          ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs border ${
                          selected
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-transparent border-slate-400 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{optId}</span>
                      </div>

                      {selected && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Anti cheating warning panel */}
              {cheatingAttempts > 0 && (
                <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/5 max-w-3xl text-red-500 text-[11px] leading-relaxed flex items-start gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Compliance Warning Index: {cheatingAttempts}/3 violations logged. Changing windows or exiting full screen rules will terminate your exam and register as zero score evaluation! Please stay focused.
                  </span>
                </div>
              )}

              {/* Navigation CTAs floor */}
              <div className="flex items-center justify-between max-w-3xl pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleNavigateQuestion(currentIdx - 1)}
                    disabled={currentIdx === 0}
                    className={`px-4 py-2 text-xs rounded-xl border disabled:opacity-30 ${
                      darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleNavigateQuestion(currentIdx + 1)}
                    disabled={currentIdx === questions.length - 1}
                    className={`px-4 py-2 text-xs rounded-xl border disabled:opacity-30 ${
                      darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Next
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      // skip registers an answer pattern as skipped but increments index
                      if (currentIdx < questions.length - 1) {
                        handleNavigateQuestion(currentIdx + 1);
                      } else {
                        onToast('You are on the final question. Use skip or review side board.', 'ref');
                      }
                    }}
                    className={`px-3 py-2 text-xs rounded-xl ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    Skip Question
                  </button>
                  
                  <button
                    onClick={() => handleCompleteExam(false)}
                    className="px-5 py-2.5 font-bold text-xs text-white rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                  >
                    Submit Exam List
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column sidebar question pallet */}
            <div className={`w-full md:w-[280px] p-6 border-t md:border-t-0 md:border-l overflow-y-auto font-sans flex flex-col ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">Question Progress board</h4>
              
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const answered = answers[q.id] !== undefined;
                  const current = idx === currentIdx;
                  
                  // Palette color definitions:
                  // Green = answered, Blue = current, Grey = not visited
                  let btnColor = 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800';
                  if (current) {
                    btnColor = 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-500';
                  } else if (answered) {
                    btnColor = 'bg-green-500 border-green-500 text-white';
                  } else if (visited[idx]) {
                    btnColor = 'bg-red-500/10 border-red-500/30 text-red-500'; // Visited but skipped/unanswered
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleNavigateQuestion(idx)}
                      className={`w-10 h-10 text-xs font-mono font-bold rounded-lg border transition-all hover:scale-105 ${btnColor}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850 space-y-3.5 text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-green-500" />
                  <span>Answered Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-red-500/25 border border-red-500/20" />
                  <span>Skipped / Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-blue-500" />
                  <span>Current Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-805" />
                  <span>Unvisited</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. EVALUATION RESULTS STAGE */}
      {stages === 'result' && (
        <div className="max-w-4xl mx-auto my-12 px-4 space-y-8 pb-16">
          
          {/* Top Stats Banner */}
          <div className={`rounded-3xl p-8 border shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Assessment report summary</span>
              <h2 className="text-xl sm:text-2xl font-extrabold flex items-center justify-center md:justify-start gap-2.5">
                {scorePct >= 70 ? (
                  <span className="text-green-500 flex items-center gap-1.5 font-sans font-extrabold"><CheckCircle className="w-7 h-7" /> EXAM CLEANED (PASSED)</span>
                ) : (
                  <span className="text-red-500 flex items-center gap-1.5 font-sans font-extrabold"><AlertCircle className="w-7 h-7" /> RETAKE REQUIRED (FAILED)</span>
                )}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                {scorePct >= 70
                  ? `You achieved an excellent score of ${scorePct}%. Your professional certification records were compiled in our verified system ledger.`
                  : `You scored ${scorePct}%. You need a passing percentage of 70% (minimum 35 MCQ out of 50 score equivalents) to unlock credentials.`}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-[8px] border-slate-200 dark:border-slate-950 flex flex-col items-center justify-center relative">
                {/* SVG Circle highlight */}
                <svg className="absolute inset-0 w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-blue-500"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - scorePct / 100)}
                    strokeLinecap="round"
                  />
                </svg>

                <span className="text-2xl font-extrabold font-mono text-blue-500 dark:text-sky-400">{scorePct}%</span>
                <span className="text-[10px] text-slate-400 font-mono">Passing: 70%</span>
              </div>
            </div>
          </div>

          {/* If Pass: Issue Gorgeous Printable Certificate card widget */}
          {scorePct >= 70 && pResult && pResult.certificate && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-400 tracking-wider">PREVIEWING AUTHENTIC CERTIFICATION</h3>
              
              <div id="print-area-certificate" className="bg-white border-[14px] border-double border-blue-900 rounded-lg p-8 sm:p-12 text-slate-800 aspect-1.414 shadow-2xl relative overflow-hidden select-text text-center font-sans tracking-wide">
                
                {/* Classic border elements */}
                <div className="absolute top-2 left-2 right-2 bottom-2 border border-slate-300" />
                
                <div className="relative space-y-5">
                  {/* SkillVerse Logo Banner header */}
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="p-1 rounded-md bg-gradient-to-tr from-blue-700 to-sky-500 text-white">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent">SkillVerse</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">CERTIFICATE OF ACHIEVEMENT</span>
                    <span className="text-[8px] italic text-slate-300 uppercase tracking-tight block">OFFICIALLY RECORDED AT VERIFY.SKILLVERSE.IN</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 font-light italic">This is to officially certify and records that</p>
                    <h2 className="text-2xl font-serif font-extrabold text-slate-900 leading-none underline tracking-wide py-2">
                      {pResult.certificate.userName}
                    </h2>
                  </div>

                  <div className="space-y-1 max-w-lg mx-auto">
                    <p className="text-[11px] text-slate-500 font-light">has successfully cleared and passed the specialized standards examination for</p>
                    <h3 className="text-base font-bold text-blue-900">
                      {pResult.certificate.courseName} Certification
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Acquiring an aggregated grade score of <strong>{scorePct}%</strong> on {new Date(pResult.certificate.issuedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* QR Code and Authority signatures panel split */}
                  <div className="pt-4 flex justify-between items-end border-t border-slate-100 max-w-xl mx-auto">
                    
                    {/* Left stats ID */}
                    <div className="text-left space-y-1 text-[9px] font-mono text-slate-400">
                      <div><strong className="text-slate-600">ID:</strong> {pResult.certificate.certificateId}</div>
                      <div><strong className="text-slate-600">Issued Date:</strong> {new Date(pResult.certificate.issuedAt).toLocaleDateString()}</div>
                      <div><strong className="text-slate-600">Validity:</strong> Lifetime</div>
                    </div>

                    {/* Middle Verification QR Code mockup link */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-12 h-12 bg-white border border-slate-200 p-0.5 flex items-center justify-center">
                        {/* Simulated precise black white QR vectors */}
                        <div className="grid grid-cols-4 gap-0.5 w-10 h-10 bg-slate-950 p-1 rounded-sm border border-slate-100">
                          <div className="bg-white" /><div className="bg-white" /><div className="bg-black" /><div className="bg-white" />
                          <div className="bg-black" /><div className="bg-white" /><div className="bg-white" /><div className="bg-black" />
                          <div className="bg-white" /><div className="bg-black" /><div className="bg-slate-950" /><div className="bg-white" />
                          <div className="bg-white" /><div className="bg-white" /><div className="bg-black" /><div className="bg-white" />
                        </div>
                      </div>
                      <span className="text-[7px] text-slate-400 scale-90 font-light tracking-tight">verify.skillverse.in</span>
                    </div>

                    {/* Right Authority Sign stamp */}
                    <div className="text-right space-y-1">
                      <div className="font-serif italic text-xs text-blue-900 border-b pb-0.5 border-slate-300 font-semibold px-2">SkillVerse Certification Board</div>
                      <div className="text-[7px] text-slate-400 tracking-wider">IIT MADRAS GRADUATES COUNCIL</div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Download and sharing buttons triggers */}
              <div className="flex flex-wrap gap-2.5 justify-center pt-2">
                <button
                  onClick={handlePrintCertificate}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-sky-500 text-white font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Printable PDF / Print
                </button>
                <button
                  onClick={handleShareToLinkedIn}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-sky-500/20 text-sky-500 font-semibold text-xs rounded-xl hover:bg-sky-500/10 transition-all"
                >
                  <Linkedin className="w-4 h-4" /> Share on LinkedIn
                </button>
                <button
                  onClick={handleCopyVerification}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-500/20 text-slate-400 font-semibold text-xs rounded-xl hover:bg-slate-500/10 transition-all"
                >
                  <Clipboard className="w-4 h-4" /> Copy Verification Link
                </button>
              </div>

            </div>
          )}

          {/* Correct answer reviews and retake CTA if Failed */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            
            {scorePct < 70 && (
              <button
                onClick={() => {
                  setAnswers({});
                  setTimeLeft(3600);
                  setCurrentIdx(0);
                  setStages('active');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                Retake Exam Attempt
              </button>
            )}

            <button
              onClick={() => setReviewOpen(!reviewOpen)}
              className={`px-4 py-3 border text-xs rounded-xl font-medium ${
                darkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {reviewOpen ? 'Hide Answers Review' : 'Review Correct Answers'}
            </button>

            <button
              onClick={onClose}
              className={`px-4 py-3 text-xs rounded-xl text-blue-500 hover:underline`}
            >
              Direct to Dashboard Space
            </button>
          </div>

          {/* Exam review expanded panel */}
          {reviewOpen && (
            <div className="space-y-4 animate-in slide-in-from-bottom-5">
              <h3 className="font-extrabold text-sm text-slate-400 tracking-wider">EXAMINATION KEY SHEET AUDIT</h3>
              {questions.map((q, qIndex) => {
                const isCorrect = answers[q.id] === q.correctOptionIndex;
                const userChoice = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border text-xs leading-relaxed space-y-2.5 ${
                      isCorrect
                        ? 'bg-green-500/5 border-green-500/10'
                        : userChoice !== undefined
                        ? 'bg-red-500/5 border-red-500/10'
                        : 'bg-slate-500/5 border-slate-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-2 max-w-3xl">
                      <span className="font-extrabold text-slate-400">Q{qIndex + 1}.</span>
                      <p className="font-bold">{q.question}</p>
                    </div>

                    <div className="space-y-1.5 pl-6 list-none font-medium">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOption = oIdx === q.correctOptionIndex;
                        const isUserSelected = oIdx === userChoice;
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-1.5 ${
                              isCorrectOption
                                ? 'text-green-500 font-bold'
                                : isUserSelected
                                ? 'text-red-500 line-through'
                                : 'text-slate-400'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{opt}</span>
                            {isCorrectOption && <span>(Correct Answer)</span>}
                            {isUserSelected && !isCorrect && <span>(Your Selection)</span>}
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
