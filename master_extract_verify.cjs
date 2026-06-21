/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER SCRIPT: Extract real YT IDs from search results,
 * verify them, get their titles, and assign to business courses
 * ═══════════════════════════════════════════════════════════════
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\JATIN\\.gemini\\antigravity-ide\\brain\\a757cf8d-87bc-4317-945d-0cc63b67b52b\\.system_generated\\steps';

function extractVideoIds(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    const ids = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
      ids.add(match[1]);
    }
    return [...ids];
  } catch { return []; }
}

function checkVideo(videoId) {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve({ videoId, ok: true, title: json.title });
          } catch { resolve({ videoId, ok: false, title: '' }); }
        } else { resolve({ videoId, ok: false, title: '' }); }
      });
    }).on('error', () => resolve({ videoId, ok: false, title: '' }));
  });
}

async function verifyBatch(ids) {
  const results = [];
  for (const id of ids.slice(0, 25)) { // top 25 from each search
    const r = await checkVideo(id);
    if (r.ok) results.push(r);
  }
  return results;
}

async function main() {
  // Extract IDs from each search page
  const searches = {
    freelancing: path.join(BASE, '161', 'content.md'),
    stockMarket: path.join(BASE, '169', 'content.md'),
    contentCreation: path.join(BASE, '170', 'content.md'),
    communication: path.join(BASE, '171', 'content.md'),
    videoEditing: path.join(BASE, '172', 'content.md'),
    entrepreneurship: path.join(BASE, '173', 'content.md'),
  };

  const verifiedByCategory = {};

  for (const [cat, filePath] of Object.entries(searches)) {
    const ids = extractVideoIds(filePath);
    console.log(`\n📂 ${cat}: Found ${ids.length} IDs, verifying top 25...`);
    const verified = await verifyBatch(ids);
    verifiedByCategory[cat] = verified;
    console.log(`   ✅ ${verified.length} verified working:`);
    for (const v of verified) {
      console.log(`      ${v.videoId} | ${v.title}`);
    }
  }

  // Now output the JSON assignment for each business course
  console.log('\n\n═══════════════════════════════════════');
  console.log('FINAL ASSIGNMENT - Unique IDs per course');
  console.log('═══════════════════════════════════════\n');

  // Output all verified IDs in JSON format for easy copy
  const output = {};
  for (const [cat, vids] of Object.entries(verifiedByCategory)) {
    output[cat] = vids.map(v => ({ id: v.videoId, title: v.title }));
  }
  console.log(JSON.stringify(output, null, 2));
}

main();
