/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Download, Share2, Clipboard, Printer, ExternalLink, Linkedin, Award, ShieldCheck } from 'lucide-react';

interface PremiumCertificateProps {
  certificate: any; // Supports both legacy and rich Certificate schemas
  darkMode?: boolean;
}

export function PremiumCertificate({ certificate, darkMode = false }: PremiumCertificateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [logoFailedLeft, setLogoFailedLeft] = useState(false);
  const [logoFailedRight, setLogoFailedRight] = useState(false);
  const [signatureFailed, setSignatureFailed] = useState(false);

  // Safely extract parameters from either legacy or rich schema
  const certId = certificate?.certificateId || certificate?.id || '';
  const studentName = certificate?.student?.name || certificate?.userName || 'Distinguished Student';
  const courseTitle = certificate?.course?.title || certificate?.courseName || 'Advanced Professional Program';
  const courseCategory = certificate?.course?.category || 'Professional Education';
  const courseLevel = certificate?.course?.level || 'Intermediate';
  const courseDuration = certificate?.course?.duration || '30 Hours';
  const score = certificate?.score || certificate?.completionDetails?.score || 100;
  const grade = certificate?.completionDetails?.grade || (score >= 90 ? 'Distinction' : score >= 75 ? 'Merit' : 'Pass');
  const issuedDateStr = certificate?.completionDetails?.completedDate || certificate?.issuedAt || certificate?.createdAt || new Date().toISOString();
  
  const formattedDate = new Date(issuedDateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Assets fallbacks/URLs
  const logoUrl = certificate?.logoUrl || "/logo-grad.png";
  const signatureUrl = certificate?.signatureUrl || certificate?.issuedBy?.signature || "/assets/signature.png";
  const qrCodeImage = certificate?.qrCode?.qrCodeBase64 || certificate?.qrCodeBase64 || '';
  const verifyUrl = `${window.location.origin}/verify/${certId}`;

  // Screen scale responsive monitoring
  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      const parentWidth = containerRef.current?.parentElement?.getBoundingClientRect().width || 400;
      // Target landscape width is exactly 1122px (297mm @ 96 DPI)
      const targetWidth = 1122;
      const calculatedScale = parentWidth / targetWidth;
      // Safeguard boundaries
      setScale(Math.max(0.2, Math.min(calculatedScale, 1)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }
    return () => {
      window.removeEventListener('resize', updateScale);
      observer.disconnect();
    };
  }, []);

  const styles = {
    wrapper: {
      width: "1122px",
      height: "794px",
      backgroundColor: "#fffef9",
      fontFamily: "Georgia, serif",
      position: "relative" as const,
      overflow: "hidden" as const,
      border: "12px solid #c9a84c",
      outline: "4px solid #1a3a5c",
      outlineOffset: "-18px",
      padding: "15mm",
      boxSizing: "border-box" as const,
      color: "#1a3a5c"
    },

    watermark: {
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(-30deg)",
      fontSize: "80px",
      color: "rgba(201, 168, 76, 0.06)",
      fontWeight: "bold",
      whiteSpace: "nowrap" as const,
      zIndex: 0,
      pointerEvents: "none" as const,
      userSelect: "none" as const
    },

    cornerTL: {
      position: "absolute" as const,
      top: "8mm",
      left: "8mm",
      width: "30px",
      height: "30px",
      borderTop: "3px solid #c9a84c",
      borderLeft: "3px solid #c9a84c"
    },

    cornerTR: {
      position: "absolute" as const,
      top: "8mm",
      right: "8mm",
      width: "30px",
      height: "30px",
      borderTop: "3px solid #c9a84c",
      borderRight: "3px solid #c9a84c"
    },

    cornerBL: {
      position: "absolute" as const,
      bottom: "8mm",
      left: "8mm",
      width: "30px",
      height: "30px",
      borderBottom: "3px solid #c9a84c",
      borderLeft: "3px solid #c9a84c"
    },

    cornerBR: {
      position: "absolute" as const,
      bottom: "8mm",
      right: "8mm",
      width: "30px",
      height: "30px",
      borderBottom: "3px solid #c9a84c",
      borderRight: "3px solid #c9a84c"
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8mm",
      position: "relative" as const,
      zIndex: 1
    },

    logo: {
      width: "60px",
      height: "60px",
      objectFit: "contain" as const
    },

    headerTitle: {
      textAlign: "center" as const,
      flex: 1
    },

    headerH1: {
      fontSize: "28px",
      color: "#1a3a5c",
      letterSpacing: "6px",
      textTransform: "uppercase" as const,
      fontWeight: "normal",
      margin: 0
    },

    headerSubtitle: {
      fontSize: "11px",
      color: "#c9a84c",
      letterSpacing: "3px",
      marginTop: "4px",
      textTransform: "uppercase" as const
    },

    goldDivider: {
      width: "100%",
      height: "2px",
      background: "linear-gradient(to right, transparent, #c9a84c, #c9a84c, transparent)",
      margin: "5mm 0",
      position: "relative" as const,
      zIndex: 1
    },

    bodySection: {
      textAlign: "center" as const,
      position: "relative" as const,
      zIndex: 1
    },

    certifyText: {
      fontSize: "13px",
      color: "#555",
      letterSpacing: "2px",
      marginBottom: "4mm",
      fontStyle: "italic"
    },

    studentName: {
      fontSize: "42px",
      color: "#1a3a5c",
      fontWeight: "bold",
      letterSpacing: "2px",
      marginBottom: "3mm",
      textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
    },

    nameUnderline: {
      width: "60%",
      margin: "0 auto 4mm",
      height: "3px",
      background: "linear-gradient(to right, transparent, #c9a84c, transparent)"
    },

    completedText: {
      fontSize: "13px",
      color: "#555",
      letterSpacing: "1px",
      marginBottom: "3mm",
      fontStyle: "italic"
    },

    courseTitle: {
      fontSize: "22px",
      color: "#1a3a5c",
      fontWeight: "bold",
      marginBottom: "4mm",
      letterSpacing: "1px"
    },

    courseDetails: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      fontSize: "11px",
      color: "#1a3a5c",
      marginBottom: "5mm"
    },

    detailBadge: {
      padding: "2px 10px",
      border: "1px solid #c9a84c",
      borderRadius: "2px",
      color: "#1a3a5c"
    },

    footerSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: "5mm",
      position: "relative" as const,
      zIndex: 1
    },

    signatureArea: {
      textAlign: "center" as const,
      width: "140px"
    },

    signatureImage: {
      width: "120px",
      height: "50px",
      objectFit: "contain" as const,
      marginBottom: "3px"
    },

    signatureLine: {
      borderTop: "1.5px solid #1a3a5c",
      paddingTop: "4px",
      fontSize: "9px",
      color: "#444",
      letterSpacing: "1px"
    },

    centerInfo: {
      textAlign: "center" as const,
      flex: 1
    },

    certId: {
      fontSize: "10px",
      color: "#888",
      letterSpacing: "1px",
      marginBottom: "3px"
    },

    certIdStrong: {
      color: "#1a3a5c",
      fontSize: "11px",
      fontWeight: "bold"
    },

    issuedBy: {
      fontSize: "9px",
      color: "#c9a84c",
      letterSpacing: "2px",
      textTransform: "uppercase" as const,
      marginTop: "5px"
    },

    completionDate: {
      fontSize: "10px",
      color: "#666",
      marginTop: "3px"
    },

    qrSection: {
      textAlign: "center" as const,
      width: "100px"
    },

    qrCode: {
      width: "80px",
      height: "80px",
      border: "2px solid #c9a84c",
      padding: "4px",
      background: "white",
      display: "block",
      margin: "0 auto"
    },

    qrText: {
      fontSize: "8px",
      color: "#888",
      marginTop: "4px",
      letterSpacing: "1px"
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('cert-printable-container')?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate - ${certId}</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Georgia', serif;
                background: #fffef9;
                -webkit-print-color-adjust: exact;
              }
              .certificate-print-wrapper {
                width: 297mm;
                height: 210mm;
                padding: 15mm;
                border: 12px solid #c9a84c;
                outline: 4px solid #1a3a5c;
                outline-offset: -18px;
                position: relative;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-30deg);
                font-size: 80px;
                color: rgba(201, 168, 76, 0.06);
                font-weight: bold;
                white-space: nowrap;
                z-index: 0;
                pointer-events: none;
                user-select: none;
              }
              .corner {
                position: absolute;
                width: 30px;
                height: 30px;
                border-color: #c9a84c;
                border-style: solid;
              }
              .corner-tl { top: 8mm; left: 8mm; border-width: 3px 0 0 3px; }
              .corner-tr { top: 8mm; right: 8mm; border-width: 3px 3px 0 0; }
              .corner-bl { bottom: 8mm; left: 8mm; border-width: 0 0 3px 3px; }
              .corner-br { bottom: 8mm; right: 8mm; border-width: 0 3px 3px 0; }
              
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8mm;
              }
              .logo {
                width: 60px;
                height: 60px;
                object-fit: contain;
              }
              .header-title {
                text-align: center;
                flex: 1;
              }
              .header-title h1 {
                font-size: 28px;
                color: #1a3a5c;
                letter-spacing: 6px;
                text-transform: uppercase;
                font-weight: normal;
                margin: 0;
              }
              .header-title p {
                font-size: 11px;
                color: #c9a84c;
                letter-spacing: 3px;
                margin-top: 4px;
                text-transform: uppercase;
              }
              .gold-divider {
                width: 100%;
                height: 2px;
                background: linear-gradient(to right, transparent, #c9a84c, #c9a84c, transparent);
                margin: 5mm 0;
              }
              .body-section {
                text-align: center;
              }
              .certify-text {
                font-size: 13px;
                color: #555;
                letter-spacing: 2px;
                margin-bottom: 4mm;
                font-style: italic;
              }
              .student-name {
                font-size: 42px;
                color: #1a3a5c;
                font-weight: bold;
                letter-spacing: 2px;
                margin-bottom: 3mm;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
              }
              .name-underline {
                width: 60%;
                margin: 0 auto 4mm;
                height: 3px;
                background: linear-gradient(to right, transparent, #c9a84c, transparent);
              }
              .completed-text {
                font-size: 13px;
                color: #555;
                letter-spacing: 1px;
                margin-bottom: 3mm;
                font-style: italic;
              }
              .course-title {
                font-size: 22px;
                color: #1a3a5c;
                font-weight: bold;
                margin-bottom: 4mm;
                letter-spacing: 1px;
              }
              .course-details {
                display: flex;
                justify-content: center;
                gap: 20px;
                font-size: 11px;
                color: #1a3a5c;
                margin-bottom: 5mm;
              }
              .course-details span {
                padding: 2px 10px;
                border: 1px solid #c9a84c;
                border-radius: 2px;
                color: #1a3a5c;
              }
              .footer-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 5mm;
              }
              .signature-area {
                text-align: center;
                width: 140px;
              }
              .signature-image {
                width: 120px;
                height: 50px;
                object-fit: contain;
                margin-bottom: 3px;
              }
              .signature-line {
                border-top: 1.5px solid #1a3a5c;
                padding-top: 4px;
                font-size: 9px;
                color: #444;
                letter-spacing: 1px;
              }
              .center-info {
                text-align: center;
                flex: 1;
              }
              .cert-id {
                font-size: 10px;
                color: #888;
                letter-spacing: 1px;
                margin-bottom: 3px;
              }
              .cert-id strong {
                color: #1a3a5c;
                font-size: 11px;
                font-weight: bold;
              }
              .issued-by {
                font-size: 9px;
                color: #c9a84c;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-top: 5px;
              }
              .completion-date {
                font-size: 10px;
                color: #666;
                margin-top: 3px;
              }
              .qr-section {
                text-align: center;
                width: 100px;
              }
              .qr-code {
                width: 80px;
                height: 80px;
                border: 2px solid #c9a84c;
                padding: 4px;
                background: white;
                display: block;
                margin: 0 auto;
              }
              .qr-text {
                font-size: 8px;
                color: #888;
                margin-top: 4px;
                letter-spacing: 1px;
              }
            </style>
          </head>
          <body>
            <div class="certificate-print-wrapper">
              <div class="watermark">EDTECH PLATFORM</div>
              <div class="corner corner-tl"></div>
              <div class="corner corner-tr"></div>
              <div class="corner corner-bl"></div>
              <div class="corner corner-br"></div>
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function(){ window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const downloadRegistryPdf = async () => {
    try {
      if (!certId) {
        alert('Invalid certificate identifier.');
        return;
      }
      const response = await fetch(`/api/certificates/download/${certId}`);
      if (!response.ok) {
        throw new Error('Registry response failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Registry PDF download failed:", error);
      alert('Official Registry PDF could not be requested. Using Landscape Print fallback!');
      handlePrint();
    }
  };

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    alert('Public verification link successfully copied to your Clipboard!');
  };

  const handleLinkedInShare = () => {
    const text = `I am excited to announce that I have successfully graduated with an official qualification in ${courseTitle} from EdTech Platform!\n\nCertificate ID: ${certId}\nVerify Credentials: ${verifyUrl}\n\nManaged and Mentored by IIT Madras Graduates.`;
    navigator.clipboard.writeText(text);
    alert('LinkedIn update content successfully copied to clipboard! You can paste it directly when the share window opens.');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`, '_blank');
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* 1. SCALED SCREEN VIEWWRAPPER CONTAINER */}
      <div 
        ref={containerRef}
        className="w-full flex justify-center items-start overflow-hidden rounded-3xl"
        style={{
          height: `${794 * scale}px`,
          position: 'relative' as const,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          backgroundColor: '#f1f5f9'
        }}
      >
        <div
          id="cert-printable-container"
          style={{
            ...styles.wrapper,
            position: 'absolute' as const,
            top: 0,
            left: '50%',
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Watermark in background */}
          <div style={styles.watermark}>EDTECH PLATFORM</div>

          {/* Aesthetic Corner Ornaments */}
          <div style={styles.cornerTL}></div>
          <div style={styles.cornerTR}></div>
          <div style={styles.cornerBL}></div>
          <div style={styles.cornerBR}></div>

          {/* Header Section */}
          <div style={styles.header}>
            {logoFailedLeft ? (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#102a43" strokeWidth="1.5" style={styles.logo}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <img
                src={logoUrl}
                alt="Logo Left"
                style={styles.logo}
                onError={() => setLogoFailedLeft(true)}
              />
            )}

            <div style={styles.headerTitle}>
              <h1 style={styles.headerH1}>Certificate of Completion</h1>
              <p style={styles.headerSubtitle}>
                Developed and Managed by IIT Madras Graduates
              </p>
            </div>

            {logoFailedRight ? (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#102a43" strokeWidth="1.5" style={styles.logo}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <img
                src={logoUrl}
                alt="Logo Right"
                style={styles.logo}
                onError={() => setLogoFailedRight(true)}
              />
            )}
          </div>

          <div style={styles.goldDivider}></div>

          {/* Body Section */}
          <div style={styles.bodySection}>
            <p style={styles.certifyText}>This is to proudly certify that</p>
            <div style={styles.studentName}>{studentName}</div>
            <div style={styles.nameUnderline}></div>
            <p style={styles.completedText}>
              has successfully completed the course
            </p>
            <div style={styles.courseTitle}>{courseTitle}</div>
            <div style={styles.courseDetails}>
              <span style={styles.detailBadge}>
                Category: <strong>{courseCategory}</strong>
              </span>
              <span style={styles.detailBadge}>
                Level: <strong>{courseLevel}</strong>
              </span>
              <span style={styles.detailBadge}>
                Duration: <strong>{courseDuration}</strong>
              </span>
              <span style={styles.detailBadge}>
                Grade: <strong>{grade}</strong>
              </span>
            </div>
          </div>

          <div style={styles.goldDivider}></div>

          {/* Footer Section */}
          <div style={styles.footerSection}>
            
            {/* Signature Area */}
            <div style={styles.signatureArea}>
              <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {signatureFailed ? (
                  <svg width="120" height="40" viewBox="0 0 100 35" fill="none" stroke="#1a3a5c" strokeWidth="1.5" style={{ marginBottom: '3px' }}>
                    <path d="M10 25 C 25 8, 35 5, 45 22 C 55 35, 70 8, 90 18" strokeLinecap="round" />
                    <circle cx="45" cy="22" r="1.5" fill="#c9a84c" />
                  </svg>
                ) : (
                  <img
                    src={signatureUrl}
                    alt="Authorized Signature"
                    style={styles.signatureImage}
                    onError={() => setSignatureFailed(true)}
                  />
                )}
              </div>
              <div style={styles.signatureLine}>Authorized Signatory</div>
            </div>

            {/* Verification details in center */}
            <div style={styles.centerInfo}>
              <div style={styles.certId}>
                Certificate ID:{" "}
                <strong style={styles.certIdStrong}>{certId}</strong>
              </div>
              <div style={styles.completionDate}>
                Completed On: {formattedDate}
              </div>
              <div style={styles.issuedBy}>EdTech Platform</div>
            </div>

            {/* Secure verification QR section */}
            <div style={styles.qrSection}>
              {qrCodeImage ? (
                <img
                  src={qrCodeImage}
                  alt="QR Code vector"
                  style={styles.qrCode}
                />
              ) : (
                <div style={{...styles.qrCode, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#888'}}>
                  QR Hash
                </div>
              )}
              <div style={styles.qrText}>Scan to Verify</div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. PREMIUM ACTION TOOLBAR */}
      <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
        <button
          onClick={downloadRegistryPdf}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1a3a5c] text-white hover:bg-[#102a43] active:scale-95 transition-all text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
        >
          <Download className="w-4 h-4 text-amber-400" /> Download Registry PDF
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#fffef9] border border-slate-200 text-slate-800 hover:bg-slate-50 hover:scale-[1.01] active:scale-95 transition-all text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4 text-blue-500" /> Landscape print / view
        </button>

        <button
          onClick={copyVerifyLink}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <Clipboard className="w-4 h-4 text-green-600" /> Copy Verification Link
        </button>

        <button
          onClick={handleLinkedInShare}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0077b5] text-white hover:bg-[#006297] active:scale-95 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
        >
          <Linkedin className="w-4 h-4" /> Share on LinkedIn
        </button>
      </div>

    </div>
  );
}
