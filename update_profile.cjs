const fs = require('fs');
const path = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/src/components/StudentDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Icons to Lucide Import
if (!content.includes('Bot, Gamepad2, Sparkles, Palette')) {
  content = content.replace(
    "} from 'lucide-react';",
    "  Bot, Gamepad2, Sparkles, Palette\n} from 'lucide-react';"
  );
}

// 2. Add State Variables
if (!content.includes('avatarConfig')) {
  // Find where `const [activeTab` is defined to inject states near it
  const stateInsertPoint = content.indexOf("const [activeTab");
  if (stateInsertPoint !== -1) {
    const statesToInject = `
  const [avatarConfig, setAvatarConfig] = useState({ bg: 'from-blue-500 to-indigo-600', icon: 'User', style: 'classic' });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
`;
    content = content.slice(0, stateInsertPoint) + statesToInject + content.slice(stateInsertPoint);
  }
}

// 3. Replace Profile Tab Content
const lines = content.split('\n');
const startProfileIndex = lines.findIndex(l => l.includes("{/* ═══ SETTINGS ═══ */}"));
const endProfileIndex = lines.findIndex((l, i) => i > startProfileIndex && l.includes("</AnimatePresence>"));

if (startProfileIndex !== -1 && endProfileIndex !== -1) {
  const prefix = lines.slice(0, startProfileIndex).join('\n');
  const suffix = lines.slice(endProfileIndex).join('\n');

  const newProfileContent = fs.readFileSync('c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/new_profile.txt', 'utf8');
  content = prefix + '\n' + newProfileContent + '\n            ' + suffix;
} else {
  console.error("Could not find Profile bounds");
}

// 4. Inject Avatar Modal before closing div
const modalContent = fs.readFileSync('c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/new_avatar_modal.txt', 'utf8');
// find the last AnimatePresence for the main layout, wait, the main layout is:
//       </div>
//     </div>
//   );
// }
const endComponentRegex = /(?:\s*<\/div>\s*<\/div>\s*\);\s*\}\s*)$/;
if (endComponentRegex.test(content)) {
  content = content.replace(endComponentRegex, '\n' + modalContent + '\n    </div>\n  );\n}');
} else {
  console.log("Could not find end of component, trying fallback...");
  content = content.replace('    </div>\n  );\n}', '\n' + modalContent + '\n    </div>\n  );\n}');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated profile and avatar modal');
