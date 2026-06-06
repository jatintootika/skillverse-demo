const fs = require('fs');
let content = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

content = content.replace(/<\/motion\.div>\s*\)\s*}/g, `</div>\n        )}`);

fs.writeFileSync('src/components/StudentDashboard.tsx', content);
