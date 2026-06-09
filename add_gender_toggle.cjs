const fs = require('fs');
const path = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/src/components/StudentDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update State declaration
content = content.replace(
  "const [avatarConfig, setAvatarConfig] = useState({ seed: 'Felix', hair: 'pixie', hairColor: '000000', skinColor: 'ffdbb4', mouth: 'smile', eyes: 'smiling', shirt: 'collared', bg: 'from-blue-500 to-indigo-600' });",
  "const [avatarConfig, setAvatarConfig] = useState({ gender: 'male', seed: 'Felix', hair: 'fonze', hairColor: '000000', skinColor: 'ffdbb4', mouth: 'smile', eyes: 'smiling', shirt: 'collared', bg: 'from-blue-500 to-indigo-600' });"
);

// 2. Add Gender Toggle & Update Hair Styles array
const modalControlsRegex = /\{\/\* Controls \(Scrollable\) \*\/\}\s*<div className="space-y-8 max-h-\[400px\] overflow-y-auto pr-4 no-scrollbar">/;

const genderToggleHTML = `{/* Controls (Scrollable) */}
  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
    
    {/* Gender Toggle */}
    <div>
      <div className="flex bg-slate-100 dark:bg-[#161b22] p-1 rounded-xl w-full max-w-xs">
        <button 
          onClick={() => setAvatarConfig(prev => ({ ...prev, gender: 'male', hair: 'fonze' }))}
          className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${avatarConfig.gender === 'male' ? 'bg-white dark:bg-[#30363d] text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
        >
          Masculine
        </button>
        <button 
          onClick={() => setAvatarConfig(prev => ({ ...prev, gender: 'female', hair: 'pixie' }))}
          className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${avatarConfig.gender === 'female' ? 'bg-white dark:bg-[#30363d] text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
        >
          Feminine
        </button>
      </div>
    </div>`;

content = content.replace(modalControlsRegex, genderToggleHTML);

// 3. Update Hair styles array depending on gender
const oldHairMap = `{[('pixie', 'mrT', 'danny', 'full', 'doug', 'fonze') || 'pixie', 'mrT', 'danny', 'full', 'doug', 'fonze']`; 
// wait, I can just replace the explicit array
content = content.replace(
  "{['pixie', 'mrT', 'danny', 'full', 'doug', 'fonze'].map(style => (",
  "{(avatarConfig.gender === 'male' ? ['fonze', 'mrT', 'dougFunny', 'mrClean', 'dannyPhantom', 'turban'] : ['pixie', 'full']).map(style => ("
);

// Note: Ensure `dannyPhantom` and `dougFunny` replaces `danny` and `doug` everywhere
// Not explicitly needed since I overwrote the array, but they might be selected.

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully added gender toggle!');
