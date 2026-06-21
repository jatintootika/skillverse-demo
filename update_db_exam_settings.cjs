const fs = require('fs');
const path = require('path');

// Update data-db.json
const dbPath = path.join(__dirname, 'data-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.courses.forEach(c => {
  c.passPercentage = 80;
  c.durationMins = 120;
  c.questionsCount = 30;
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('data-db.json updated successfully.');

// Update server.ts
const serverPath = path.join(__dirname, 'server.ts');
let serverCode = fs.readFileSync(serverPath, 'utf8');

serverCode = serverCode.replace(/passPercentage: 70/g, 'passPercentage: 80');
serverCode = serverCode.replace(/durationMins: 60/g, 'durationMins: 120');
serverCode = serverCode.replace(/questionsCount: 5/g, 'questionsCount: 30');

fs.writeFileSync(serverPath, serverCode);
console.log('server.ts updated successfully.');
