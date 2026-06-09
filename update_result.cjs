const fs = require('fs');
const path = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/src/components/ExamEngine.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('{/* 4. EVALUATION RESULTS STAGE */}'));
const endIndex = lines.findIndex(l => l.includes('// ──────────────────────────────────────────────────────────────────────────'));

if (startIndex !== -1 && endIndex !== -1) {
  const prefix = lines.slice(0, startIndex).join('\n');
  const suffix = lines.slice(endIndex - 2).join('\n'); // leaving the closing div tags

  const replacementPath = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/new_result.txt';
  const newResultContent = fs.readFileSync(replacementPath, 'utf8');

  fs.writeFileSync(path, prefix + '\n' + newResultContent + '\n' + suffix, 'utf8');
  console.log('Successfully updated result stage');
} else {
  console.log('Could not find boundaries');
}
