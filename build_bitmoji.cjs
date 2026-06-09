const fs = require('fs');
const path = 'c:/Users/JATIN/OneDrive/Desktop/edu platform4/skillverse/src/components/StudentDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update State
content = content.replace(
  "const [avatarConfig, setAvatarConfig] = useState({ bg: 'from-blue-500 to-indigo-600', icon: 'User', style: 'classic' });",
  "const [avatarConfig, setAvatarConfig] = useState({ seed: 'Felix', hair: 'pixie', hairColor: '000000', skinColor: 'ffdbb4', mouth: 'smile', eyes: 'smiling', shirt: 'collared', bg: 'from-blue-500 to-indigo-600' });"
);

// 2. Update Profile Banner Avatar Display
// We replace the block from <div className={`w-28 h-28... to </div>
const profileAvatarRegex = /<div className={`w-28 h-28 rounded-full border-4 shadow-xl flex items-center justify-center text-white \$\{dm \? 'border-\[#0d1117\]' : 'border-white'\} bg-gradient-to-br \$\{avatarConfig\.bg\} transition-transform duration-300 group-hover:scale-105`}>[\s\S]*?<\/div>/;

const newProfileAvatar = `<div className={\`w-28 h-28 rounded-full border-4 shadow-xl flex items-center justify-center text-white \${dm ? 'border-[#0d1117]' : 'border-white'} bg-gradient-to-br \${avatarConfig.bg} transition-transform duration-300 group-hover:scale-105 overflow-hidden\`}>
  <img src={\`https://api.dicebear.com/7.x/micah/svg?seed=\${avatarConfig.seed}&hair=\${avatarConfig.hair}&hairColor=\${avatarConfig.hairColor}&skinColor=\${avatarConfig.skinColor}&mouth=\${avatarConfig.mouth}&eyes=\${avatarConfig.eyes}&shirt=\${avatarConfig.shirt}\`} alt="Avatar" className="w-full h-full object-cover scale-110 translate-y-2" />
</div>`;

content = content.replace(profileAvatarRegex, newProfileAvatar);


// 3. Replace Modal Body
// Start at: <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
// End at: <div className={`p-6 border-t flex justify-end gap-3
const modalBodyRegex = /<div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">[\s\S]*?<div className={`p-6 border-t flex justify-end gap-3/g;

const newModalBody = `<div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
  {/* Live Preview */}
  <div className="flex flex-col items-center justify-center">
    <div
      style={{ 
        borderColor: dm ? '#161b22' : '#ffffff'
      }}
      className={\`relative w-56 h-56 rounded-full border-[6px] shadow-2xl flex items-center justify-center text-white transition-all duration-500 bg-gradient-to-br \${avatarConfig.bg} \${dm ? 'border-[#161b22]' : 'border-white'} overflow-hidden\`}
    >
      <img src={\`https://api.dicebear.com/7.x/micah/svg?seed=\${avatarConfig.seed}&hair=\${avatarConfig.hair}&hairColor=\${avatarConfig.hairColor}&skinColor=\${avatarConfig.skinColor}&mouth=\${avatarConfig.mouth}&eyes=\${avatarConfig.eyes}&shirt=\${avatarConfig.shirt}\`} alt="Live Preview" className="w-full h-full object-cover scale-110 translate-y-3" />
    </div>
    <p className={\`mt-6 text-sm font-bold tracking-widest uppercase \${textSecondary}\`}>Snapchat Style Avatar</p>
  </div>

  {/* Controls (Scrollable) */}
  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
    
    {/* Hair Style */}
    <div>
      <label className={\`block text-[11px] font-bold uppercase tracking-widest mb-3 \${textSecondary}\`}>Hair Style</label>
      <div className="flex flex-wrap gap-2">
        {['pixie', 'mrT', 'danny', 'full', 'doug', 'fonze'].map(style => (
          <button 
            key={style}
            onClick={() => setAvatarConfig(prev => ({ ...prev, hair: style }))}
            className={\`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all capitalize \${
              avatarConfig.hair === style 
                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                : (dm ? 'border-[#30363d] bg-[#161b22] text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300')
            }\`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>

    {/* Hair Color */}
    <div>
      <label className={\`block text-[11px] font-bold uppercase tracking-widest mb-3 \${textSecondary}\`}>Hair Color</label>
      <div className="flex flex-wrap gap-2">
        {['000000', '4a312c', '70463b', 'd6b370', 'f59e0b', 'ef4444', 'eab308', 'ffffff'].map(color => (
          <button 
            key={color}
            onClick={() => setAvatarConfig(prev => ({ ...prev, hairColor: color }))}
            className={\`w-8 h-8 rounded-full border-2 transition-transform \${avatarConfig.hairColor === color ? 'scale-125 border-blue-500' : 'border-transparent hover:scale-110'}\`}
            style={{ backgroundColor: \`#\${color}\` }}
          />
        ))}
      </div>
    </div>

    {/* Skin Tone */}
    <div>
      <label className={\`block text-[11px] font-bold uppercase tracking-widest mb-3 \${textSecondary}\`}>Skin Tone</label>
      <div className="flex flex-wrap gap-2">
        {['ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '734129', '3a2318'].map(color => (
          <button 
            key={color}
            onClick={() => setAvatarConfig(prev => ({ ...prev, skinColor: color }))}
            className={\`w-8 h-8 rounded-full border-2 transition-transform \${avatarConfig.skinColor === color ? 'scale-125 border-blue-500' : 'border-transparent hover:scale-110'}\`}
            style={{ backgroundColor: \`#\${color}\` }}
          />
        ))}
      </div>
    </div>

    {/* Mouth Expression */}
    <div>
      <label className={\`block text-[11px] font-bold uppercase tracking-widest mb-3 \${textSecondary}\`}>Expression</label>
      <div className="flex flex-wrap gap-2">
        {['smile', 'pucker', 'smirk', 'laughing', 'surprised'].map(exp => (
          <button 
            key={exp}
            onClick={() => setAvatarConfig(prev => ({ ...prev, mouth: exp }))}
            className={\`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all capitalize \${
              avatarConfig.mouth === exp 
                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                : (dm ? 'border-[#30363d] bg-[#161b22] text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300')
            }\`}
          >
            {exp}
          </button>
        ))}
      </div>
    </div>

    {/* Clothing */}
    <div>
      <label className={\`block text-[11px] font-bold uppercase tracking-widest mb-3 \${textSecondary}\`}>Clothing</label>
      <div className="flex flex-wrap gap-2">
        {['collared', 'crew', 'open'].map(shirt => (
          <button 
            key={shirt}
            onClick={() => setAvatarConfig(prev => ({ ...prev, shirt: shirt }))}
            className={\`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all capitalize \${
              avatarConfig.shirt === shirt 
                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                : (dm ? 'border-[#30363d] bg-[#161b22] text-slate-400 hover:border-slate-600' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300')
            }\`}
          >
            {shirt}
          </button>
        ))}
      </div>
    </div>

    {/* Gradient Background */}
    <div>
      <label className={\`block text-[11px] font-bold uppercase tracking-widest mb-3 \${textSecondary}\`}>Backdrop</label>
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'blue', cls: 'from-blue-500 to-indigo-600' },
          { id: 'purple', cls: 'from-purple-500 to-fuchsia-600' },
          { id: 'orange', cls: 'from-orange-400 to-rose-500' },
          { id: 'emerald', cls: 'from-emerald-400 to-teal-600' },
          { id: 'dark', cls: 'from-slate-700 to-slate-900' },
        ].map(theme => (
          <button 
            key={theme.id}
            onClick={() => setAvatarConfig(prev => ({ ...prev, bg: theme.cls }))}
            className={\`w-8 h-8 rounded-full bg-gradient-to-br \${theme.cls} transition-all border-2 \${
              avatarConfig.bg === theme.cls ? 'scale-125 border-blue-500' : 'border-transparent hover:scale-110'
            }\`}
          />
        ))}
      </div>
    </div>
  </div>
</div>

<div className={\`p-6 border-t flex justify-end gap-3`;

content = content.replace(modalBodyRegex, newModalBody);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated to Bitmoji style avatar builder!');
