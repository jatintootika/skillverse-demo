const fs = require('fs');
const path = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/src/components/ExamEngine.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('return (') && lines.indexOf(l) > 1200);
// Find the last div closing tag inside ExamAnalysis. We know the function ends around line 1610.
// Let's find the line with `export function` or just end of file if it's the last function.
// Or just match `<div className="w-full max-w-5xl mx-auto animate-in zoom-in-95 duration-500 py-6 space-y-6 overflow-y-auto max-h-[95vh] px-4">`
const startIdxExact = lines.findIndex(l => l.includes('<div className="w-full max-w-5xl mx-auto animate-in zoom-in-95 duration-500 py-6 space-y-6 overflow-y-auto max-h-[95vh] px-4">'));
const endIndexExact = lines.findIndex((l, idx) => idx > startIdxExact && l === '  );');

if (startIdxExact !== -1 && endIndexExact !== -1) {
  const prefix = lines.slice(0, startIdxExact).join('\n');
  const suffix = lines.slice(endIndexExact).join('\n');

  const replacementPath = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/new_analysis.txt';
  const newAnalysisContent = fs.readFileSync(replacementPath, 'utf8');

  fs.writeFileSync(path, prefix + '\n' + newAnalysisContent + '\n' + suffix, 'utf8');
  console.log('Successfully updated analysis stage');
} else {
  console.log('Could not find boundaries: start:', startIdxExact, 'end:', endIndexExact);
}
