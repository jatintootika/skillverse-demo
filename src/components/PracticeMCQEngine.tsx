/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { ExamQuestion } from '../types';

interface PracticeMCQEngineProps {
  courseId: string;
  courseTitle: string;
  darkMode: boolean;
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'ref') => void;
}

export function PracticeMCQEngine({
  courseId,
  courseTitle,
  darkMode,
  onClose,
  onToast
}: PracticeMCQEngineProps) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Track stats for practice session
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/questions`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setQuestions(data);
          } else {
            onToast('No practice questions available for this course.', 'ref');
            onClose();
          }
        } else {
          onToast('Failed to load practice questions.', 'ref');
          onClose();
        }
      } catch (err) {
        console.error(err);
        onToast('Connection error while loading questions.', 'ref');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [courseId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optIndex: number) => {
    if (showResult) return; // Prevent changing answer after checking
    setSelectedAnswer(optIndex);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (selectedAnswer === currentQ.correctOptionIndex) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setSkippedCount(prev => prev + 1);
    if (currentIdx === questions.length - 1) {
      setCompleted(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleNext = () => {
    if (currentIdx === questions.length - 1) {
      setCompleted(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setWrongCount(0);
    setSkippedCount(0);
    setCompleted(false);
  };

  // ── Style Tokens ──
  const bgMain = darkMode ? 'bg-[#0b0e15]' : 'bg-slate-50';
  const textMain = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const glassCard = darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md ${darkMode ? 'bg-black/60' : 'bg-slate-900/40'}`}>
      <div className={`w-full max-w-3xl rounded-[2rem] shadow-2xl border flex flex-col overflow-hidden max-h-[90vh] ${glassCard}`}>
        
        {/* Header */}
        <div className={`shrink-0 px-6 py-4 flex items-center justify-between border-b ${darkMode ? 'border-[#30363d] bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
          <div>
            <h2 className={`font-bold text-lg ${textMain}`}>Practice MCQs</h2>
            <p className={`text-xs ${textMuted}`}>{courseTitle}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 sm:p-8 ${bgMain}`}>
          {completed ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${textMain}`}>Practice Completed!</h3>
              
              <div className="flex justify-center gap-8 mb-10 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-500">{correctCount}</div>
                  <div className={`text-xs uppercase tracking-widest mt-1 ${textMuted}`}>Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">{wrongCount}</div>
                  <div className={`text-xs uppercase tracking-widest mt-1 ${textMuted}`}>Wrong</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-500">{skippedCount}</div>
                  <div className={`text-xs uppercase tracking-widest mt-1 ${textMuted}`}>Skipped</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <button onClick={handleRestart} className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Practice Again
                </button>
                <button onClick={onClose} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${darkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                  Score: {correctCount}
                </span>
              </div>
              
              <h3 className={`text-xl sm:text-2xl font-medium leading-relaxed ${textMain}`}>
                {currentQ.question}
              </h3>

              <div className="space-y-3 pt-4">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQ.correctOptionIndex;
                  
                  let optionClass = darkMode 
                    ? 'bg-[#161b22] border-[#30363d] text-slate-200 hover:bg-[#1e2430]' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

                  if (showResult) {
                    if (isCorrect) {
                      optionClass = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400';
                    } else {
                      optionClass = darkMode 
                        ? 'bg-[#161b22] border-[#30363d] opacity-50' 
                        : 'bg-white border-slate-200 opacity-50';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={showResult}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border text-sm sm:text-base transition-all flex items-center justify-between ${optionClass}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                          isSelected && !showResult ? 'bg-blue-600 text-white' : (darkMode ? 'bg-white/10' : 'bg-slate-100')
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-medium">{opt}</span>
                      </div>
                      {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-200 dark:border-[#30363d] flex items-center justify-between">
                <button
                  onClick={onClose}
                  className={`px-6 py-3 font-semibold text-sm rounded-xl transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Quit Practice
                </button>

                <div className="flex items-center gap-3">
                  {!showResult && (
                    <button
                      onClick={handleSkip}
                      className={`px-6 py-3 font-semibold text-sm rounded-xl transition-colors ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                      Skip
                    </button>
                  )}

                  {showResult ? (
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                    >
                      {currentIdx === questions.length - 1 ? 'Finish' : 'Next Question'} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedAnswer === null}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition-all disabled:shadow-none shadow-lg"
                    >
                      Check Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
