// Extract video IDs from YouTube search page HTML
const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\JATIN\\.gemini\\antigravity-ide\\brain\\a757cf8d-87bc-4317-945d-0cc63b67b52b\\.system_generated\\steps\\161\\content.md', 'utf-8');
const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
const ids = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
  ids.add(match[1]);
}
console.log(`Found ${ids.size} unique video IDs:`);
for (const id of ids) {
  console.log(id);
}
