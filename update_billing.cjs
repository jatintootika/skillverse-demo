const fs = require('fs');
const path = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/src/components/StudentDashboard.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('{/* ═══ BILLING ═══ */}'));
const endIndex = lines.findIndex(l => l.includes('{/* ═══ SETTINGS ═══ */}'));

if (startIndex !== -1 && endIndex !== -1) {
  const prefix = lines.slice(0, startIndex).join('\n');
  const suffix = lines.slice(endIndex).join('\n'); // Starts right at SETTINGS

  const replacementPath = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/new_billing.txt';
  const newBillingContent = fs.readFileSync(replacementPath, 'utf8');

  fs.writeFileSync(path, prefix + '\n' + newBillingContent + '\n' + suffix, 'utf8');
  console.log('Successfully updated billing section');
} else {
  console.log('Could not find boundaries: start:', startIndex, 'end:', endIndex);
}
