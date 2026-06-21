/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, Search, ArrowLeft, CheckCircle, XCircle, TrendingUp, User as UserIcon, BookOpen, AlertCircle, Play, Trophy, Medal } from 'lucide-react';
import { User, Course } from '../types';
import { getTopPerformers, getUserRankAndStats } from '../lib/leaderboard';

interface ScoreCardProps {
  darkMode: boolean;
  currentUser: User | null;
  courses: Course[];
  onNavigate: (view: string) => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export function ScoreCard({ darkMode, currentUser, courses, onNavigate, onOpenAuth }: ScoreCardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [error, setError] = useState('');
  
  const topPerformers = getTopPerformers();

  // If user is logged in, auto-fetch their stats
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      fetchStats(currentUser.studentId || currentUser.id);
    }
  }, [currentUser]);

  const fetchStats = async (targetId: string) => {
    setIsSearching(true);
    setError('');
    
    try {
      const res = await fetch(`/api/student/scorecard/${encodeURIComponent(targetId)}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStudentStats({
          attempts: data.attempts,
          student: data.student
        });
      } else {
        setError(data.error || 'No score card found for the given Student ID. Please check and try again.');
        setStudentStats(null);
      }
    } catch (err) {
      console.error(err);
      setError('Error retrieving score card data.');
      setStudentStats(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchStats(searchQuery.trim());
  };

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-300' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const bgCard = darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-[80vh] flex flex-col ${darkMode ? 'bg-[#0d1117] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
        
        <button 
          onClick={() => onNavigate('home')}
          className={`flex items-center gap-2 mb-8 text-sm font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-sky-400/20 text-blue-500 mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Student Score Card
          </h1>
          <p className={`max-w-2xl mx-auto text-sm md:text-base ${textSecondary}`}>
            Verify exam scores, track academic progress, and showcase technical proficiencies. 
            Enter a valid Student Registration ID to securely view their academic transcript.
          </p>
        </div>

        {!currentUser && !studentStats && (
          <div className={`max-w-lg mx-auto p-6 md:p-8 rounded-3xl border shadow-sm ${bgCard}`}>
            <h2 className="text-lg font-bold mb-4">Search Score Card</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-2 ${textSecondary}`}>Student Registration ID</label>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder="e.g. user-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      darkMode ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Fetch Score Card <ArrowLeft className="w-4 h-4 rotate-180" /></>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className={`text-xs ${textSecondary} mb-3`}>Are you a registered student?</p>
              <button 
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="text-sm font-semibold text-blue-500 hover:text-blue-400 underline underline-offset-2"
              >
                Login to view your own Score Card
              </button>
            </div>
          </div>
        )}

        {!currentUser && !studentStats && (
          <div className={`max-w-lg mx-auto mt-8 p-6 md:p-8 rounded-3xl border shadow-sm ${bgCard}`}>
            <div className="flex flex-col items-center justify-center mb-6">
              <Trophy className="w-10 h-10 text-amber-500 mb-2" />
              <h2 className="text-xl font-bold">Top 3 Performers</h2>
              <p className={`text-xs ${textSecondary} mt-1`}>Global Leaderboard</p>
            </div>
            
            <div className="space-y-3">
              {topPerformers.map((performer, idx) => (
                <div key={performer.id} className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{performer.name}</p>
                      <p className={`text-[10px] ${textMuted}`}>{performer.attempts} Exams</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">{performer.score}%</p>
                    <p className={`text-[10px] ${textMuted}`}>Avg Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {studentStats && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Summary Card */}
            <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${bgCard} flex flex-col md:flex-row items-start md:items-center gap-6 justify-between`}>
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-inner shrink-0 mt-1 sm:mt-0">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{studentStats.student?.name || 'Academic Score Card'}</h2>
                  <p className={`text-sm ${textMuted} mt-0.5 font-mono uppercase tracking-wider`}>
                    ID: {studentStats.student?.studentId || searchQuery || currentUser?.studentId || 'VERIFIED-STUDENT'}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {studentStats.student?.currentlyStudying && (
                      <div>
                        Studying: <span className="font-semibold text-slate-700 dark:text-slate-350">{studentStats.student.currentlyStudying}</span>
                      </div>
                    )}
                    {studentStats.student?.dateOfBirth && (
                      <div>
                        DOB: <span className="font-semibold text-slate-700 dark:text-slate-350">{studentStats.student.dateOfBirth}</span>
                      </div>
                    )}
                  </div>
                  
                  {studentStats.student?.skills && (
                    <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mr-1">Skills:</span>
                      {studentStats.student.skills.split(',').map((skill: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
                <div className={`flex-1 md:flex-none p-4 rounded-2xl ${darkMode ? 'bg-[#0d1117]' : 'bg-slate-50'} border ${darkMode ? 'border-[#30363d]' : 'border-slate-200'} text-center min-w-[120px]`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted} mb-1`}>Exams Taken</p>
                  <p className="text-2xl font-black text-blue-500">{studentStats.attempts?.length || 0}</p>
                </div>
                <div className={`flex-1 md:flex-none p-4 rounded-2xl ${darkMode ? 'bg-[#0d1117]' : 'bg-slate-50'} border ${darkMode ? 'border-[#30363d]' : 'border-slate-200'} text-center min-w-[120px]`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted} mb-1`}>Avg Score</p>
                  <p className="text-2xl font-black text-emerald-500">
                    {studentStats.attempts?.length > 0 
                      ? Math.round(studentStats.attempts.reduce((acc: number, a: any) => acc + (a.score / a.totalQuestions) * 100, 0) / studentStats.attempts.length) 
                      : 0}%
                  </p>
                </div>
                <div className={`flex-1 md:flex-none p-4 rounded-2xl ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'} border ${darkMode ? 'border-amber-500/20' : 'border-amber-200'} text-center min-w-[120px]`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-1`}>Global Rank</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-500 flex items-center justify-center gap-1">
                    #{getUserRankAndStats(studentStats.student?.id || searchQuery || currentUser?.id || '').rank}
                  </p>
                </div>
              </div>
            </div>

            {/* Attempts List */}
            <h3 className="text-lg font-bold mt-8 mb-4 px-2">Exam History & Performance</h3>
            
            {studentStats.attempts && studentStats.attempts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {studentStats.attempts.map((attempt: any, idx: number) => {
                  const course = courses.find(c => c.id === attempt.courseId);
                  const passPct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  const isPassed = attempt.status === 'passed';
                  
                  return (
                    <div key={idx} className={`p-5 rounded-2xl border ${bgCard} flex flex-col`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                          darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {course?.category || 'General'}
                        </span>
                        
                        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                          isPassed 
                            ? (darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200')
                            : (darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200')
                        }`}>
                          {isPassed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isPassed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-base mb-4 leading-snug line-clamp-2 flex-grow">
                        {course?.title || 'Unknown Course Exam'}
                      </h4>
                      
                      <div className="space-y-3 mt-auto">
                        <div className="flex justify-between items-center text-sm">
                          <span className={textMuted}>Score</span>
                          <span className="font-bold text-lg">{passPct}%</span>
                        </div>
                        
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${passPct}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/50">
                          <span className={textMuted}>Questions: {attempt.score}/{attempt.totalQuestions}</span>
                          <span className={textMuted}>{new Date(attempt.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-12 text-center rounded-3xl border border-dashed ${darkMode ? 'border-slate-800 bg-[#161b22]/50' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <BookOpen className={`w-8 h-8 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                </div>
                <h4 className="text-lg font-bold mb-2">No Exam Records Found</h4>
                <p className={`text-sm ${textMuted} max-w-sm mx-auto`}>
                  This student hasn't taken any certification exams yet. Complete courses and pass exams to build your score card!
                </p>
                {currentUser && (
                  <button
                    onClick={() => onNavigate('courses')}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                  >
                    Browse Courses
                  </button>
                )}
              </div>
            )}
            
            {(!currentUser || searchQuery) && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setStudentStats(null);
                    setSearchQuery('');
                  }}
                  className={`text-sm font-medium ${textSecondary} hover:${textPrimary} underline underline-offset-4`}
                >
                  Search another Score Card
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
