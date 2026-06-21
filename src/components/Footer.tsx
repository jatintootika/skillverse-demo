/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Linkedin, Twitter, Youtube, Instagram, ArrowRight, MessageSquareCode } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
  onNavigate: (view: string) => void;
  onToast: (msg: string, type: 'success' | 'ref') => void;
}

export function Footer({ darkMode, onNavigate, onToast }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      onToast('Please type a valid email address.', 'ref');
      return;
    }
    
    setIsSubscribing(true);
    // Simulate network API request
    setTimeout(() => {
      // Add email to localStorage to prove it works
      try {
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subs') || '[]');
        if (!subscribers.includes(email)) {
          subscribers.push(email);
          localStorage.setItem('newsletter_subs', JSON.stringify(subscribers));
        }
      } catch(err) {}
      
      onToast('Welcome inside! You are now subscribed to our newsletter.', 'success');
      setEmail('');
      setIsSubscribing(false);
    }, 1200);
  };

  return (
    <footer
      className={`border-t transition-all ${
        darkMode ? 'bg-slate-950 border-slate-900 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-slate-200/30">
                <img src="/logo.png" alt="SkillGenz Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">SkillGenz</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm text-slate-400">
              India&apos;s most affordable educational and certification exam gateway. Founded by IIT-grads to groom placement-ready technical and business professionals.
            </p>
            <div className="flex items-center space-x-3 text-slate-400">
              <a href="https://www.linkedin.com/company/skillgenz-com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://x.com/SkillgenZ" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors" title="Twitter">
                <Twitter className="w-4 h-4" />
              </a>

              <a href="https://www.instagram.com/skillgenz.official?igsh=Zmpvenp0NmwwbTh4" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links columns */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white uppercase mb-4">
              Explore Skills
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-blue-500 transition-colors">
                  All Courses Grid
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-blue-500 transition-colors">
                  Combo Bundle Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('certificates_showcase')} className="hover:text-blue-500 transition-colors">
                  Certificate Samples
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const sampleId = 'SV-2026-AI-01438';
                    onNavigate(`verify_${sampleId}`);
                  }}
                  className="hover:text-blue-500 font-medium text-blue-600 transition-colors"
                >
                  Verify Certificate ID
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white uppercase mb-4">
              Institutional
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-blue-500 transition-colors">
                  IIT Madras Graduates Council
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-blue-500 transition-colors">
                  Raise Support ticket
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('leaderboard')} className="hover:text-blue-500 transition-colors flex items-center gap-1">
                  Scoreboard Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter column */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white uppercase mb-4 col-span-1">
              Join Newsletter
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Subscribe to get placement alert letters, direct recruitment notices, and exam schedules.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Type your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-grow text-xs px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-3 bg-gradient-to-r from-blue-600 to-sky-400 text-white rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[40px]"
              >
                {isSubscribing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>
            <span className="text-[10px] text-slate-400 mt-2 block tracking-tight">
              Over 50,000+ students already enrolled.
            </span>
          </div>
        </div>

        <hr className={`my-8 ${darkMode ? 'border-slate-900' : 'border-slate-200'}`} />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div>
            <span className="block font-medium text-slate-900 dark:text-slate-100">Developed and Managed by IIT Madras Graduates</span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Government of India MSME/UDYAM Registered Enterprise.
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">(c) 2026 SkillGenz Platform. Powered by elite AI resources. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
            <button onClick={() => onNavigate('privacy')} className="hover:text-blue-500 transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-blue-500 transition-colors">Terms & Conditions</button>
            <button onClick={() => onNavigate('refund')} className="hover:text-blue-500 transition-colors">Cancellation & Refund Policy</button>
            <button onClick={() => onNavigate('shipping')} className="hover:text-blue-500 transition-colors">Shipping & Delivery Policy</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-blue-500 transition-colors">Contact Us</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
