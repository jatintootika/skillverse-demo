/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Menu, X, ShieldAlert, LogOut, Moon, Sun, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export function Navbar({
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
  onNavigate,
  currentView,
  onOpenAuth
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Courses', id: 'courses' },
    { name: 'Certificates', id: 'certificates_showcase' },
    { name: 'Score Card', id: 'scorecard' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'About Team', id: 'about' },
    { name: 'Contact', id: 'contact' }
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav
      id="skillgenz-navbar"
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
        darkMode
          ? 'bg-slate-900/65 border-slate-800/60 text-white backdrop-blur-md'
          : 'bg-white/60 border-slate-200/40 text-slate-800 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div
            id="logo-button"
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => handleLinkClick('home')}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center bg-white border border-slate-200/50 dark:border-slate-800">
              <img src="/logo.png" alt="SkillGenz Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
                SkillGenz
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-slate-600 dark:text-slate-300 font-bold pl-1 uppercase">
                IITIANS FOUNDED
              </span>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <div className="hidden md:flex items-center space-x-6">
            {menuLinks.map((link) => (
              <button
                key={link.id}
                id={`nav-${link.id}`}
                onClick={() => handleLinkClick(link.id)}
                className={`text-sm font-medium transition-colors hover:text-blue-500 relative py-1 ${
                  currentView === link.id
                    ? 'text-blue-600 font-semibold'
                    : darkMode
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {link.name}
                {currentView === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Action buttons controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              id="theme-toggler"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors border ${
                darkMode
                  ? 'hover:bg-slate-800 border-slate-800 text-sky-400'
                  : 'hover:bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                {/* Dashboard button depending on role */}
                <button
                  id="dashboard-button"
                  onClick={() => {
                    if (currentUser.role === 'student') onNavigate('student_dashboard');
                    else if (currentUser.role === 'admin') onNavigate('admin_dashboard');
                    else if (currentUser.role === 'super_admin') onNavigate('super_admin_dashboard');
                  }}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                >
                  {currentUser.role === 'student'
                    ? 'Student Panel'
                    : currentUser.role === 'admin'
                    ? 'Admin Portal'
                    : 'Super Admin'}
                </button>

                {/* Profile Circle name */}
                <div
                  id="navbar-profile-trigger"
                  onClick={() => onNavigate(currentUser.role === 'student' ? 'student_dashboard' : 'admin_dashboard')}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/25">
                    {currentUser.profilePhoto ? (
                      <img src={currentUser.profilePhoto} alt="" className="rounded-full w-full h-full object-cover" />
                    ) : (
                      currentUser.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </div>

                <button
                  id="logout-button"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="login-auth-trigger"
                  onClick={() => onOpenAuth('login')}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                    darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  id="signup-auth-trigger"
                  onClick={() => onOpenAuth('signup')}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-400 text-white hover:shadow-md hover:shadow-blue-500/20 transition-all font-medium py-2 rounded-lg"
                >
                  Get Exam Certified
                </button>
              </div>
            )}
          </div>

          {/* Quick theme-switch & responsive sandwich icons for mobiles */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-lg border ${
                darkMode ? 'border-slate-800 text-sky-400' : 'border-slate-200 text-slate-500'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 rounded-lg border ${
                darkMode ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-panel"
          className={`md:hidden px-4 pt-2 pb-6 space-y-3 border-t transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}
        >
          {menuLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
                currentView === link.id
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'hover:bg-slate-800 text-slate-300'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {link.name}
            </button>
          ))}

          <hr className={darkMode ? 'border-slate-800' : 'border-slate-100'} />

          {currentUser ? (
            <div className="space-y-2 pt-1">
              <span className="text-xs px-3 text-slate-400 block font-light">
                Logged in as <strong className="text-blue-500">{currentUser.name}</strong>
              </span>
              <button
                onClick={() => {
                  if (currentUser.role === 'student') onNavigate('student_dashboard');
                  else if (currentUser.role === 'admin') onNavigate('admin_dashboard');
                  else if (currentUser.role === 'super_admin') onNavigate('super_admin_dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center block py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/20 text-red-500 text-xs font-medium hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2 text-xs font-semibold rounded-lg text-center ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold rounded-lg text-center bg-gradient-to-r from-blue-600 to-sky-400 text-white"
              >
                Sign Up Pass
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
