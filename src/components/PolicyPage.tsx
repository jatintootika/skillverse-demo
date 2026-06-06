/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Scale, ArrowLeft } from 'lucide-react';
import { PlatformSettings } from '../types';

interface PolicyPageProps {
  view: string;
  darkMode: boolean;
  onToast: (msg: string, type: 'success' | 'ref') => void;
}

export function PolicyPage({ view, darkMode, onToast }: PolicyPageProps) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/superadmin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching settings for policies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [view]);

  const getPageConfig = () => {
    switch (view) {
      case 'terms':
        return {
          title: 'Terms and Conditions',
          icon: <Scale className="w-6 h-6 text-blue-500" />,
          content: settings?.termsOfService || 'These are the Terms of Service of SkillVerse. All certification exams must be completed independently within the allocated 60 minutes. Sharing answers or utilizing external materials will count as academic dishonesty and result in immediate revocation of any credentials without refund.'
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
          content: settings?.privacyPolicy || 'SkillVerse takes student privacy seriously. Your profile and exam response histories are safely locked under standard credentials and are only accessible by authorized platform administrators and verification audits when recruiters query your credentials.'
        };
      case 'refund':
        return {
          title: 'Refund Policy',
          icon: <FileText className="w-6 h-6 text-blue-500" />,
          content: settings?.refundPolicy || 'If you do not pass an exam attempt, you may select a single retake or purchase additional attempts. Once an exam is launched, we cannot offer any refund for individual exam purchases or premium subscription packages.'
        };
      case 'disclaimer':
        return {
          title: 'Disclaimer',
          icon: <FileText className="w-6 h-6 text-blue-500" />,
          content: settings?.disclaimer || 'SkillVerse is an independent skill verification vendor. While founded by graduates of IIT Madras, we are not an official academic department of the Indian Institute of Technology Madras. Passing certificates verify skills, but direct job placement is subject to partner interviews and placement procedures.'
        };
      case 'verification_policy':
        return {
          title: 'Certificate Verification Policy',
          icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
          content: settings?.verificationPolicy || 'Credentials printed with verified unique SV IDs can be securely verified at verify.skillverse.in by authorized candidates, institutions, or prospective recruiters. Unofficial modifications or tampering with unique QR vectors renders the credentials invalid.'
        };
      default:
        return {
          title: 'Policy Document',
          icon: <FileText className="w-6 h-6 text-blue-500" />,
          content: 'No content found.'
        };
    }
  };

  const config = getPageConfig();

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      <div className={`rounded-3xl p-8 md:p-12 border ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-150 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-500/10 rounded-2xl">
            {config.icon}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{config.title}</h1>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-mono">SkillVerse Legal and Compliance Document</p>
          </div>
        </div>

        <hr className={`my-6 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed font-light space-y-6">
            <p className="whitespace-pre-wrap">{config.content}</p>
          </div>
        )}

        <hr className={`my-8 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />

        <div className="flex justify-between items-center text-xs text-slate-450 font-mono">
          <span>Website Developed and Managed by IIT Madras Graduates.</span>
          <span>Last Updated: 2026</span>
        </div>
      </div>
    </div>
  );
}
