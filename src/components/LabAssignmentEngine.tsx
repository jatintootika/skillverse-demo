/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, FileSpreadsheet, X, UploadCloud, Terminal, Eye, EyeOff, Key } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  task?: string;
  expectedOutput?: string;
  solution?: string;
  fileUrl?: string;
}

interface LabAssignmentEngineProps {
  courseTitle: string;
  assignments: Assignment[];
  darkMode: boolean;
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'ref') => void;
}

export function LabAssignmentEngine({
  courseTitle,
  assignments,
  darkMode,
  onClose,
  onToast
}: LabAssignmentEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedLabs, setCompletedLabs] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);

  if (!assignments || assignments.length === 0) {
    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md ${darkMode ? 'bg-black/60' : 'bg-slate-900/40'}`}>
        <div className={`w-full max-w-md p-6 rounded-[2rem] shadow-2xl text-center ${darkMode ? 'bg-[#161b22] border border-[#30363d]' : 'bg-white border border-slate-200'}`}>
          <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>No lab assignments available for this course.</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl">Close</button>
        </div>
      </div>
    );
  }

  const currentLab = assignments[currentIdx];
  const isCompleted = completedLabs[currentLab.id];

  const handleComplete = () => {
    setCompletedLabs(prev => ({ ...prev, [currentLab.id]: true }));
    onToast(`Marked "${currentLab.title}" as completed!`, 'success');
  };

  const handleNext = () => {
    if (currentIdx < assignments.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowSolution(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowSolution(false);
    }
  };

  // ── Style Tokens ──
  const bgMain = darkMode ? 'bg-[#0b0e15]' : 'bg-slate-50';
  const textMain = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const glassCard = darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md ${darkMode ? 'bg-black/60' : 'bg-slate-900/40'}`}>
      <div className={`w-full max-w-4xl rounded-[2rem] shadow-2xl border flex flex-col overflow-hidden h-[90vh] ${glassCard}`}>
        
        {/* Header */}
        <div className={`shrink-0 px-6 py-4 flex items-center justify-between border-b ${darkMode ? 'border-[#30363d] bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-lg leading-tight ${textMain}`}>Practical Labs</h2>
              <p className={`text-xs ${textMuted}`}>{courseTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto flex flex-col md:flex-row ${bgMain}`}>
          {/* Main Lab Panel */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-[#30363d]">
                <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">
                  Lab {currentIdx + 1} of {assignments.length}
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
              
              <div>
                <h3 className={`text-2xl sm:text-3xl font-bold leading-tight mb-4 ${textMain}`}>
                  {currentLab.title}
                </h3>
                {currentLab.description && (
                  <p className={`text-base leading-relaxed ${textMuted} mb-8`}>
                    {currentLab.description}
                  </p>
                )}

                <div className="space-y-6">
                  {/* Task Section */}
                  {currentLab.task && (
                    <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`}>
                      <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <Terminal className="w-4 h-4 text-blue-500" /> Your Task
                      </h4>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {currentLab.task}
                      </p>
                    </div>
                  )}

                  {/* Expected Output Section */}
                  {currentLab.expectedOutput && (
                    <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0d1117] border-[#30363d]' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Expected Output
                      </h4>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'} font-mono whitespace-pre-wrap`}>
                        {currentLab.expectedOutput}
                      </p>
                    </div>
                  )}

                  {/* Solution Section */}
                  {currentLab.solution && showSolution && (
                    <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                      <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                        <Key className="w-4 h-4" /> Solution / Approach
                      </h4>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-indigo-200' : 'text-indigo-900'} whitespace-pre-wrap`}>
                        {currentLab.solution}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleComplete}
                  disabled={isCompleted}
                  className={`flex-1 w-full py-3.5 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                    isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  }`}
                >
                  {isCompleted ? <><CheckCircle className="w-5 h-5" /> Completed</> : <><UploadCloud className="w-5 h-5" /> Mark as Completed</>}
                </button>

                {currentLab.solution && (
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className={`flex-1 w-full py-3.5 font-bold rounded-xl transition-all border flex items-center justify-center gap-2 ${
                      darkMode 
                        ? 'border-[#30363d] text-slate-300 hover:bg-white/5' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {showSolution ? <><EyeOff className="w-5 h-5" /> Hide Solution</> : <><Eye className="w-5 h-5" /> Show Solution</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className={`w-full md:w-80 shrink-0 p-6 overflow-y-auto border-t md:border-t-0 md:border-l ${darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200'}`}>
            <h4 className={`text-xs font-bold tracking-[0.15em] uppercase mb-6 ${textMuted}`}>
              Lab Directory
            </h4>
            
            <div className="space-y-2">
              {assignments.map((lab, idx) => {
                const isActive = idx === currentIdx;
                const isDone = completedLabs[lab.id];
                
                return (
                  <button
                    key={lab.id}
                    onClick={() => { setCurrentIdx(idx); setShowSolution(false); }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                      isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                        : (darkMode ? 'bg-transparent border-transparent hover:bg-white/5 text-slate-400' : 'bg-transparent border-transparent hover:bg-slate-100 text-slate-600')
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isDone ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-emerald-500' : 'border-slate-400'}`} />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isActive ? '' : ''}`}>Lab {idx + 1}</p>
                      <p className="text-[10px] truncate opacity-80 mt-0.5">{lab.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className={`shrink-0 p-4 border-t flex items-center justify-between ${darkMode ? 'border-[#30363d] bg-white/5' : 'border-slate-200 bg-white'}`}>
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-6 py-2.5 text-sm font-bold rounded-xl disabled:opacity-30 transition-all flex items-center gap-2 dark:text-white dark:hover:bg-white/10 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Lab
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIdx === assignments.length - 1}
            className="px-6 py-2.5 text-sm font-bold rounded-xl disabled:opacity-30 transition-all flex items-center gap-2 dark:text-white dark:hover:bg-white/10 text-slate-700 hover:bg-slate-100"
          >
            Next Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
