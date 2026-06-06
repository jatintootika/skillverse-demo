const fs = require('fs');
let content = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

content = content.replace(/<div className="flex-grow space-y-8 min-w-0">/, '<div className="flex-grow min-w-0 relative">\n        <AnimatePresence mode="wait">');

content = content.replace(/{activeTab === 'home' && \(\s*<div className="space-y-8 animate-in fade-in duration-200">/g, `{activeTab === 'home' && (
          <motion.div key="home" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">`);

content = content.replace(/{activeTab === 'resources' && \(\s*<div className="space-y-6 animate-in fade-in duration-200">/g, `{activeTab === 'resources' && (
          <motion.div key="resources" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">`);

content = content.replace(/{activeTab === 'exams' && \(\s*<div className="space-y-6 animate-in fade-in duration-200">/g, `{activeTab === 'exams' && (
          <motion.div key="exams" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">`);

content = content.replace(/{activeTab === 'certificates' && \(\s*<div className="space-y-6 animate-in fade-in duration-200">/g, `{activeTab === 'certificates' && (
          <motion.div key="certificates" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">`);

content = content.replace(/{activeTab === 'payments' && \(\s*<div className="space-y-6 animate-in fade-in duration-200">/g, `{activeTab === 'payments' && (
          <motion.div key="payments" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">`);

content = content.replace(/{activeTab === 'profile' && \(\s*<div className="space-y-6 animate-in fade-in duration-200">/g, `{activeTab === 'profile' && (
          <motion.div key="profile" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">`);

content = content.replace(/<\/div>\s*{\/\* WATCHING VIDEO CATALOG DIALOG MODAL \*\//, `</AnimatePresence>\n      </div>\n\n      {/* WATCHING VIDEO CATALOG DIALOG MODAL */`);

content = content.replace(/<\/div>\s*\)\s*}/g, `</motion.div>\n        )}`);

fs.writeFileSync('src/components/StudentDashboard.tsx', content);
