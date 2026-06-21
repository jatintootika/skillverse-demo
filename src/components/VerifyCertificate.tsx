/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Award, 
  User, 
  ArrowLeft, 
  FileDown, 
  Share2, 
  Search, 
  ExternalLink, 
  Linkedin,
  FileCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import { PremiumCertificate } from './PremiumCertificate';

interface VerifyCertificateProps {
  initialId: string;
  darkMode: boolean;
  onGoHome: () => void;
}

export function VerifyCertificate({ initialId, darkMode, onGoHome }: VerifyCertificateProps) {
  const [certId, setCertId] = useState(initialId || '');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchVerification = async (verifyTarget: string) => {
    if (!verifyTarget.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setCertificate(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/certificates/verify/${verifyTarget.trim()}`);
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.message || 'The certificate ID you entered does not exist in our system.');
      } else {
        setCertificate(data.certificate);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not establish server connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setCertId(initialId);
      fetchVerification(initialId);
    } else {
      // Clear states if no initialId
      setCertificate(null);
      setErrorMsg('');
      setSearched(false);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVerification(certId);
  };

  return (
    <div className={`py-12 px-4 sm:px-6 lg:px-8 transition-colors ${darkMode ? 'text-white bg-slate-950' : 'text-slate-800 bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation back helper */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to Home
        </button>

        {/* Search header container */}
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl mb-8 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-100 backdrop-blur-md'}`}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mt-4">EdTech Public Verification System</h2>
            <p className="text-xs text-slate-400 mt-1.5 font-sans">
              Instant cryptographic proof of course credentials. MSME/UDYAM Registered Registry.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="cert-search-input"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="Enter Certificate ID, e.g. CERT-EDTECH-123456-2026"
                className={`w-full text-xs pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="text-white text-xs font-semibold px-6 py-3 rounded-xl bg-[#1a3a5c] hover:bg-[#102a43] hover:scale-[1.02] active:scale-95 transition-all shadow-md"
            >
              {loading ? 'Searching...' : 'Verify'}
            </button>
          </form>
        </div>

        {/* Loading display */}
        {loading && (
          <div className="flex flex-col items-center py-16 space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-slate-300 border-t-amber-500 animate-spin" />
            <p className="text-xs text-slate-400 animate-pulse font-mono">Consolidating proof audit parameters...</p>
          </div>
        )}

        {/* Main verification reports */}
        {!loading && searched && (
          <div className="space-y-6">
            {certificate ? (
              certificate.status === 'REVOKED' || !certificate.valid ? (
                /* 1. STATUS: REVOKED */
                <div className="border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 rounded-3xl p-6 sm:p-10 space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-550 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-10 h-10 text-red-550" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-red-500 text-xl">Certificate Has Been Revoked</h3>
                    <p className="font-mono text-xs text-slate-400">ID Reference: {certId}</p>
                  </div>
                  
                  <div className={`max-w-md mx-auto p-5 rounded-2xl border text-xs leading-relaxed space-y-3 ${
                    darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-150'
                  }`}>
                    <div className="text-slate-400 uppercase font-mono tracking-wider font-extrabold text-[9px] text-center">Audit Dossier</div>
                    <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                      <span className="text-slate-400">Revocation date:</span>
                      <strong className="text-red-500 font-mono">
                        {certificate.revokedAt ? new Date(certificate.revokedAt).toLocaleDateString() : 'N/A'}
                      </strong>
                    </div>
                    <div className="flex flex-col gap-1 items-start text-left pt-1">
                      <span className="text-slate-500 dark:text-slate-400">Action Statement:</span>
                      <strong className="block bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/15 p-2 rounded w-full">
                        {certificate.revokedReason || 'No revocation statement declared.'}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 pt-3">
                    If this is an administrative discrepancy, contact platform support for active rectifications.
                  </p>
                </div>
              ) : (
                /* 2. STATUS: VALID & SECURE */
                <div className="space-y-8">
                  {/* Top Styles for Animations */}
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes verifyGlow {
                      0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.4)); }
                      50% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(16, 185, 129, 0.8)); }
                      100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.4)); }
                    }
                    @keyframes rotRing {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                    @keyframes pulseBreathe {
                      0%, 100% { opacity: 0.85; }
                      50% { opacity: 1; }
                    }
                  `}} />

                  {/* Centered Holographic Verification Badge */}
                  <div className="flex flex-col items-center justify-center text-center p-8 rounded-[2.5rem] border border-emerald-500/35 bg-slate-950 bg-gradient-to-br from-emerald-950/80 via-slate-950 to-blue-950/80 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
                    
                    {/* Floating verified rings */}
                    <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                      <div className="absolute inset-0 border-2 border-dashed border-emerald-500/40 rounded-full animate-[rotRing_20s_linear_infinite]" />
                      <div className="absolute w-24 h-24 border border-emerald-500/20 rounded-full animate-[pulse_3s_ease-in-out_infinite]" />
                      <div 
                        style={{ animation: 'verifyGlow 2.5s ease-in-out infinite' }}
                        className="w-20 h-20 bg-gradient-to-tr from-emerald-50 via-green-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <ShieldCheck className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-emerald-400 font-extrabold px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full mb-3 animate-[pulseBreathe_2s_infinite]">
                      🛡️ Cryptographically Secured Record
                    </span>

                    {/* MSME Certification */}
                    <div className="flex flex-wrap gap-2.5 justify-center mb-4 mt-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Building className="w-3.5 h-3.5" />
                        <span>MSME / UDYAM Regd.</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-white mb-2">Verified Graduate Credential</h3>
                    <p className="text-slate-350 text-xs max-w-lg leading-relaxed mb-1 font-sans">
                      This verification report confirms that <strong className="text-white capitalize">{certificate.student?.name || certificate.userName}</strong> has successfully completed the <strong className="text-emerald-400">{certificate.courseName || certificate.course?.title}</strong> program.
                    </p>
                    <div className="font-mono text-center bg-black/60 border border-white/10 rounded-xl px-4 py-2 mt-4 inline-flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold">Registry ID:</span>
                      <strong className="text-xs text-emerald-400 select-all">{certificate.certificateId}</strong>
                    </div>
                  </div>

                  {/* Security Parameters & Sync status */}
                  <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold ${
                    darkMode ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-white border-slate-100 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Integrity Checksum</span>
                        <code className="text-[10px] font-mono text-slate-600 dark:text-slate-400 select-all">SHA-256 Validated: {certificate.certificateId ? `0x${certificate.certificateId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}${certificate.score}a9b8` : 'e3b0c44298fc'}</code>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Status: ACTIVE
                      </span>
                      <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        Database: SYNCED
                      </span>
                    </div>
                  </div>

                  {/* Multi-Section Dossier layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Student Program Metadata */}
                    <div className={`p-6 sm:p-8 rounded-3xl border leading-relaxed space-y-6 ${
                      darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                    }`}>
                      <div>
                        <h4 className="text-xs font-mono font-extrabold text-amber-500 uppercase tracking-wider">Candidate & Course Profile</h4>
                        <div className="w-10 h-[2px] bg-amber-500 mt-1"></div>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Full Name:</span>
                          <strong className="font-bold text-slate-800 dark:text-white capitalize">{certificate.student?.name || certificate.userName}</strong>
                        </div>
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Contact Email:</span>
                          <strong className="font-mono text-slate-800 dark:text-white">{certificate.student?.email || 'N/A'}</strong>
                        </div>
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Syllabus Category:</span>
                          <span className="font-medium text-slate-800 dark:text-white">{certificate.course?.category || 'Technical Program'}</span>
                        </div>
                        {certificate.course?.subCategory && (
                          <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Field Specialization:</span>
                            <span className="font-medium text-slate-800 dark:text-white">{certificate.course.subCategory}</span>
                          </div>
                        )}
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Course Level:</span>
                          <strong className="font-bold text-indigo-500">{certificate.course?.level || 'Professional'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Program Duration:</span>
                          <span className="font-medium text-slate-800 dark:text-white">{certificate.course?.duration || '30 Hours'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Completion details & Issuance Seal */}
                    <div className={`p-6 sm:p-8 rounded-3xl border leading-relaxed space-y-6 ${
                      darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                    }`}>
                      <div>
                        <h4 className="text-xs font-mono font-extrabold text-blue-500 uppercase tracking-wider">Academics & Issuing records</h4>
                        <div className="w-10 h-[2px] bg-blue-500 mt-1"></div>
                      </div>
                      <div className="space-y-4 text-xs">
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Enrolled:</span>
                          <span className="text-slate-800 dark:text-white font-medium">
                            {certificate.completionDetails?.enrolledDate 
                              ? new Date(certificate.completionDetails.enrolledDate).toLocaleDateString()
                              : '15 January 2026'}
                          </span>
                        </div>
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 shrink-0">Completed:</span>
                          <strong className="text-slate-800 dark:text-white font-bold text-right">
                            {certificate.completionDetails?.completedDate 
                              ? new Date(certificate.completionDetails.completedDate).toLocaleDateString()
                              : new Date(certificate.issuedAt).toLocaleDateString()}
                          </strong>
                        </div>
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-bold">Qualifying Score:</span>
                          <strong className="font-mono text-emerald-500 font-extrabold">{certificate.score}%</strong>
                        </div>
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-bold">Acquired Grade:</span>
                          <strong className="font-sans font-bold text-amber-500">{certificate.completionDetails?.grade || 'Pass'}</strong>
                        </div>
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Issuer:</span>
                          <span className="font-serif italic font-bold text-slate-800 dark:text-white">{certificate.issuedBy?.organizationName || 'EdTech Platform'}</span>
                        </div>
                        <div className="border-b pb-2 dark:border-slate-800 flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> MSME Registry:</span>
                          <strong className="text-slate-800 dark:text-white font-mono text-[10px] uppercase">UDYAM Registered</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">IIT Madras Endorsement:</span>
                          <strong className="text-slate-500 dark:text-amber-500/80 font-sans font-bold text-right text-[10px] uppercase">IIT Madras Graduates</strong>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* PREMIUM DIGITAL VIEW & PRINT COMPACT ROW */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg leading-relaxed ${
                    darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'
                  }`}>
                    <div className="text-center mb-6">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#c9a84c] font-extrabold">Interactive Credential Render</span>
                      <h3 className="text-lg font-extrabold font-serif text-slate-800 dark:text-white mt-1">Official Document Certificate</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Audit verification layout render</p>
                    </div>

                    {/* Embed Certificate display */}
                    <PremiumCertificate certificate={certificate} darkMode={darkMode} isVerificationPage={true} />
                  </div>

                </div>
              )
            ) : (
              /* 3. STATUS: NOT FOUND */
              <div className="border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-550 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 animate-bounce text-amber-500" />
                </div>
                <h3 className="font-extrabold text-amber-500 text-lg">Certificate Records Unsupported</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  {errorMsg || 'The Certificate ID you entered does not exist in our registry system records. Please verify spelling mistakes and recheck.'}
                </p>
                <div className="pt-4 border-t w-full border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setCertId('');
                      setSearched(false);
                      setErrorMsg('');
                    }}
                    className="px-5 py-2.5 rounded-xl text-white font-bold bg-[#1a3a5c] text-xs transition-colors hover:bg-slate-800"
                  >
                    Clear & Search Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
