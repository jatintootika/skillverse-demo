/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareCode, Send, X, Mic, RefreshCw, Bot, User } from 'lucide-react';

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
      text: `Hello! I am **SkillVerse AI**, your study and certification assistant.

Founded by IIT grads, I can assist you with:
- **Recommending courses** suited for your profile
- **Explaining concepts** in Machine Learning, Full-Stack development, or Option Hedges
- **Verifying certificate IDs** or reviewing exam requirements!

What skill are you looking to master today?`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Which course should I take first?',
    'How do I prepare for AI exam?',
    'Explain machine learning basics',
    'Show me job salary for data science',
    'How to verify my certificate?'
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message to state
    const currentMsg = textToSend;
    setInputVal('');
    setMessages((prev) => [...prev, { role: 'user', text: currentMsg }]);
    setIsTyping(true);

    try {
      const payload = {
        message: currentMsg,
        history: messages
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Connection with brain failed.');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.response }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `[Server Connection Error] **Server connection error**: I lost connection to my core neural network. Let me reply as an offline backup:
Our **SkillVerse Exam certificates** are accepted globally! You can try reviewing the Course detail views, registering an account to access free lectures, or upgrading your bundle parameters to Popular/Pro configurations right now!`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    setVoiceRecording(true);
    onToast('Activating Vocal Input System (Microphone)... Talk now!', 'success');
    
    setTimeout(() => {
      setVoiceRecording(false);
      const voiceTexts = [
        'How do I prepare for AI exam?',
        'Recommend a tech course',
        'Is the certification acceptable for jobs?',
        'Explain machine learning foundations'
      ];
      const randomT = voiceTexts[Math.floor(Math.random() * voiceTexts.length)];
      setInputVal(randomT);
      onToast(`Transcribed Vocals: "${randomT}"`, 'success');
    }, 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputVal);
    }
  };

  return (
    <div id="ai-assistant-container" className="fixed bottom-6 right-6 z-50">
      {/* Floating Spark Button */}
      {!isOpen && (
        <button
          id="ai-bot-floating-trigger"
          onClick={() => setIsOpen(true)}
          className={`relative group p-4 rounded-full bg-gradient-to-r from-blue-600 to-sky-400 text-white shadow-xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none`}
        >
          {/* Pulse Glow rings */}
          <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          
          {/* Tooltip text */}
          <span className="absolute right-14 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-slate-900 border border-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 shadow-md">
            Ask SkillVerse AI
          </span>
        </button>
      )}

      {/* Expanded chat screen */}
      {isOpen && (
        <div
          id="ai-bot-expanded-card"
          className={`w-[360px] sm:w-[380px] h-[520px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            darkMode
              ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/50'
              : 'bg-white border-slate-100 text-slate-800 shadow-slate-300/30'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-400 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded-lg bg-white/10">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">SkillVerse AI</h4>
                <div id="ai-status-indicator" className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-blue-50 uppercase tracking-wider">Online Coach</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/15 transition-colors"
              title="Minimize chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Chat messages board */}
          <div
            className={`flex-grow p-4 overflow-y-auto space-y-4 text-xs ${
              darkMode ? 'bg-slate-950/40' : 'bg-slate-50/50'
            }`}
          >
            {/* Loop through messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 items-start max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Profile icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble content */}
                <div
                  className={`p-3 rounded-2xl whitespace-pre-line leading-relaxed border transition-colors ${
                    msg.role === 'user'
                      ? 'bg-blue-600 border-blue-600 text-white rounded-tr-none'
                      : darkMode
                      ? 'bg-slate-800 border-slate-700/60 text-slate-100 rounded-tl-none'
                      : 'bg-white border-slate-100 text-slate-700 shadow-sm rounded-tl-none'
                  }`}
                >
                  {/* Simplistic formatting support for markdown bullet points */}
                  {msg.text.split('\n').map((line, lIdx) => {
                    let formattedLine = line;
                    // Bold support **word**
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const matches = line.match(boldRegex);
                    if (matches) {
                      return (
                        <p key={lIdx} className="mb-1">
                          {line.split('**').map((tok, tIdx) => (tIdx % 2 === 1 ? <strong key={tIdx} className={msg.role === 'user' ? 'text-white underline' : 'text-blue-500 font-bold'}>{tok}</strong> : tok))}
                        </p>
                      );
                    }
                    return (
                      <p key={lIdx} className="mb-0.5">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Simulated typing loading */}
            {isTyping && (
              <div className="flex gap-2.5 items-start max-w-[80%]">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div
                  className={`p-3 rounded-2xl rounded-tl-none flex items-center space-x-1 border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick interactive prompts container */}
          {messages.length < 3 && (
            <div className={`px-4 py-2 border-t overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-full border transition-all pointer hover:scale-[1.02] inline-block ${
                    darkMode
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-100 hover:bg-slate-100 text-slate-600 hover:text-blue-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* User inputs floor */}
          <div className={`p-3 border-t flex items-center gap-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <button
              onClick={handleVoiceInput}
              disabled={voiceRecording}
              className={`p-2.5 rounded-lg border transition-all ${
                voiceRecording
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : darkMode
                  ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="Talk voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              id="ai-bot-text-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about AI, FullStack, Pricing..."
              disabled={isTyping}
              className={`flex-grow text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />

            <button
              id="ai-bot-send-btn"
              onClick={() => handleSendMessage(inputVal)}
              disabled={!inputVal.trim() || isTyping}
              className="p-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-sky-400 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
