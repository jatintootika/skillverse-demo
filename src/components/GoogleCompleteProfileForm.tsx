import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Phone, Lock, Calendar, BookOpen, Sparkles, AlertCircle } from 'lucide-react';

interface GoogleCompleteProfileFormProps {
  user: any;
  darkMode: boolean;
  onCancel: () => void;
  onComplete: (updatedUser: any) => void;
}

export const GoogleCompleteProfileForm = ({
  user,
  darkMode,
  onCancel,
  onComplete
}: GoogleCompleteProfileFormProps) => {
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [skills, setSkills] = useState('');
  const [currentlyStudying, setCurrentlyStudying] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !dateOfBirth || !currentlyStudying || !skills) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate age from DOB
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let ageCalculated = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        ageCalculated--;
      }

      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone,
          age: ageCalculated,
          dateOfBirth,
          currentlyStudying,
          skills,
          hasCompletedOnboarding: true,
          password: password || undefined // Optional password
        })
      });

      const data = await res.json();
      if (res.ok) {
        onComplete(data.user);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const selectBg = darkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-200';
  const inputClass = `w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2 border border-red-100 dark:border-red-500/20">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Phone Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Phone Number *</label>
        <div className="relative">
          <input
            type="tel"
            required
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
          <Phone size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Date of Birth Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date of Birth *</label>
        <div className="relative">
          <input
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={inputClass}
          />
          <Calendar size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Currently Studying Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Currently Study / Profession *</label>
        <div className="relative">
          <select
            required
            value={currentlyStudying}
            onChange={(e) => setCurrentlyStudying(e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            <option value="" disabled>Select status</option>
            <option value="School Student">School Student</option>
            <option value="College Student">College Student (Undergrad/Postgrad)</option>
            <option value="Graduate">Recent Graduate</option>
            <option value="Working Professional">Working Professional</option>
            <option value="Self Learner / Other">Self Learner / Other</option>
          </select>
          <BookOpen size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Skills Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Skills * (comma separated)</label>
        <div className="relative">
          <input
            type="text"
            required
            placeholder="e.g. React, Python, Web Design"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className={inputClass}
          />
          <Sparkles size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Optional Password Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Set Password (Optional)</label>
        <div className="relative">
          <input
            type="password"
            placeholder="For future credentials sign-in"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving Profile...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
};
