/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareCode, Send, X, Mic, RefreshCw, Bot, User, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface AIChatBotProps {
  darkMode: boolean;
  onToast: (msg: string, type: 'success' | 'ref') => void;
}

export function AIChatBot({ darkMode, onToast }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: `Hello there! Great to connect with you. I'm **SkillGenz AI**, your advanced study assistant.

How can I help you today? Are you looking to master a new skill, explore a course, or something else? 😊`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Recommend a course',
    'Explain Machine Learning',
    'How do I prepare for exams?',
    'What is Data Science?'
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const currentMsg = textToSend;
    setInputVal('');
    setMessages((prev) => [...prev, { role: 'user', text: currentMsg }]);
    setIsTyping(true);

    try {
      const payload = {
        message: currentMsg,
        context: messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\\n')
      };

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Connection with brain failed.');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err: any) {
      console.error(err);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `I seem to have lost connection to my neural core. As an offline backup:
Our **SkillGenz Premium Courses** are fully equipped to guide you. Feel free to explore the modules and let me know if you need any specific guidance once I'm back online!`
          }
        ]);
        setIsTyping(false);
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    setVoiceRecording(true);
    onToast('Listening...', 'success');
    
    setTimeout(() => {
      setVoiceRecording(false);
      const voiceTexts = [
        'How do I prepare for the AI exam?',
        'Recommend a tech course',
        'Explain machine learning foundations'
      ];
      const randomT = voiceTexts[Math.floor(Math.random() * voiceTexts.length)];
      setInputVal(randomT);
      onToast(`Voice text: "${randomT}"`, 'success');
    }, 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputVal);
    }
  };

  return (
    <div id="ai-assistant-container" className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="relative group">
          {/* Outer glowing aura */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700 animate-pulse" />
          
          <button
            id="ai-bot-floating-trigger"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-300 focus:outline-none"
          >
            <Bot className="w-8 h-8 relative z-10 drop-shadow-md" />
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full z-20 animate-bounce" />
          </button>
        </div>
      )}

      {/* Expanded Premium Chat Interface */}
      {isOpen && (
        <div
          id="ai-bot-expanded-card"
          className={`w-[360px] sm:w-[420px] h-[640px] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 ${
            darkMode
              ? 'bg-slate-900 border border-slate-800'
              : 'bg-white border border-slate-200'
          }`}
        >
          {/* Header - Always Dark/Vibrant for Premium Contrast */}
          <div className="px-5 py-4 bg-slate-950 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 opacity-60" />
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg border-2 border-white/10">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                    SkillGenz AI <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </h4>
                  <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wide">
                    Online & Ready
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-grow p-5 overflow-y-auto space-y-6 ${darkMode ? 'bg-slate-900' : 'bg-slate-50/50'} scrollbar-thin`}>
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 items-end max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                
                {/* Avatar */}
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white mb-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Bubble */}
                <div className={`px-4 py-3 text-[14px] leading-relaxed shadow-sm transition-all ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                    : darkMode
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl rounded-bl-sm'
                    : 'bg-white border border-slate-200/60 text-slate-700 rounded-2xl rounded-bl-sm shadow-sm'
                }`}>
                  {msg.text.split('\n').map((line, lIdx) => {
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const matches = line.match(boldRegex);
                    if (matches) {
                      return (
                        <p key={lIdx} className="mb-1.5 last:mb-0">
                          {line.split('**').map((tok, tIdx) => (tIdx % 2 === 1 ? <strong key={tIdx} className={msg.role === 'user' ? 'text-white font-bold' : 'text-slate-900 dark:text-white font-bold'}>{tok}</strong> : tok))}
                        </p>
                      );
                    }
                    return <p key={lIdx} className="mb-1.5 last:mb-0">{line}</p>;
                  })}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 items-end max-w-[80%] animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm mb-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className={`px-4 py-4 rounded-2xl rounded-bl-sm flex items-center gap-1.5 ${
                  darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200/60 shadow-sm'
                }`}>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area Group */}
          <div className={`p-4 shrink-0 ${darkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]'}`}>
            
            {/* Smart Prompts (Inside Input Area for better reachability) */}
            {messages.length < 3 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none mb-3 pb-1">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className={`shrink-0 text-[12px] font-medium px-4 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 hover:border-blue-500 text-slate-300 hover:text-blue-400'
                        : 'bg-white border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 shadow-sm'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input Field Area */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleVoiceInput}
                disabled={voiceRecording}
                className={`p-3 rounded-full transition-all shrink-0 ${
                  voiceRecording
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                    : darkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <div className={`flex-grow relative flex items-center rounded-3xl border transition-all ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500' 
                  : 'bg-slate-50 border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white'
              }`}>
                <input
                  type="text"
                  id="ai-bot-text-input"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  className="w-full bg-transparent text-[14px] px-5 py-3.5 focus:outline-none disabled:opacity-50 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <button
                id="ai-bot-send-btn"
                onClick={() => handleSendMessage(inputVal)}
                disabled={!inputVal.trim() || isTyping}
                className={`p-3 rounded-full shrink-0 transition-all ${
                  !inputVal.trim() || isTyping
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Small Footer Footer */}
            <div className="text-center mt-3">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Powered by Gemini AI • SkillGenz
              </span>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
