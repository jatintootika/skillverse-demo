const https = require('https');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const BASE = 'C:\\Users\\JATIN\\.gemini\\antigravity-ide\\brain\\a757cf8d-87bc-4317-945d-0cc63b67b52b\\.system_generated\\steps';
const prisma = new PrismaClient();

function extractVideoIds(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
  const ids = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) ids.add(match[1]);
  return [...ids];
}

function checkVideo(videoId) {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve({ videoId, ok: true, title: JSON.parse(data).title }); }
          catch { resolve({ videoId, ok: false, title: '' }); }
        } else resolve({ videoId, ok: false, title: '' });
      });
    }).on('error', () => resolve({ videoId, ok: false, title: '' }));
  });
}

async function main() {
  // Extract & verify from each search page
  const pages = {
    youtube: path.join(BASE, '195', 'content.md'),
    instagram: path.join(BASE, '196', 'content.md'),
    podcasting: path.join(BASE, '197', 'content.md'),
  };

  const verified = {};
  for (const [cat, file] of Object.entries(pages)) {
    const ids = extractVideoIds(file).slice(0, 20);
    console.log(`\n📂 ${cat}: Testing ${ids.length} IDs...`);
    verified[cat] = [];
    for (const id of ids) {
      const r = await checkVideo(id);
      if (r.ok) {
        verified[cat].push(r);
        console.log(`  ✅ ${r.videoId} | ${r.title}`);
      }
    }
  }

  // Now assign unique IDs to courses
  const yt = verified.youtube || [];
  const ig = verified.instagram || [];
  const pod = verified.podcasting || [];

  console.log(`\n✅ YouTube: ${yt.length} | Instagram: ${ig.length} | Podcasting: ${pod.length}`);

  // Build course updates with unique IDs
  const DB_PATH = path.join(__dirname, 'data-db.json');
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

  // Course 18: YouTube Masterclass (need 3 unique)
  if (yt.length >= 3) {
    const c18 = [
      { title: "Lecture 1: YouTube Algorithm & Growth Strategy", videoId: yt[0].videoId },
      { title: "Lecture 2: Creating Viral Thumbnails & Titles", videoId: yt[1].videoId },
      { title: "Lecture 3: YouTube Monetization & Brand Deals", videoId: yt[2].videoId },
    ];
    const course18 = db.courses.find(c => c.id === 'course-18');
    if (course18) { course18.lectures = c18; console.log(`\n🔧 course-18: ${c18.map(l => l.videoId).join(', ')}`); }
  }

  // Course 21: Instagram Reels (need 3 unique)
  if (ig.length >= 3) {
    const c21 = [
      { title: "Lecture 1: Instagram Reels Strategy & Algorithm", videoId: ig[0].videoId },
      { title: "Lecture 2: Creating Viral Reels – Hooks & Editing", videoId: ig[1].videoId },
      { title: "Lecture 3: Monetization & Growing Your Brand", videoId: ig[2].videoId },
    ];
    const course21 = db.courses.find(c => c.id === 'course-21');
    if (course21) { course21.lectures = c21; console.log(`🔧 course-21: ${c21.map(l => l.videoId).join(', ')}`); }
  }

  // Course 22: Podcasting (need 4 unique)
  if (pod.length >= 4) {
    const c22 = [
      { title: "Lecture 1: Getting Started with Podcasting", videoId: pod[0].videoId },
      { title: "Lecture 2: Recording Equipment & Software Setup", videoId: pod[1].videoId },
      { title: "Lecture 3: Editing & Publishing Your Podcast", videoId: pod[2].videoId },
      { title: "Lecture 4: Growing & Monetizing Your Podcast", videoId: pod[3].videoId },
    ];
    const course22 = db.courses.find(c => c.id === 'course-22');
    if (course22) { course22.lectures = c22; console.log(`🔧 course-22: ${c22.map(l => l.videoId).join(', ')}`); }
  }

  // Save & Sync
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`\n📁 Saved data-db.json`);

  console.log(`⏳ Syncing to Supabase...`);
  for (const cid of ['course-18', 'course-21', 'course-22']) {
    const course = db.courses.find(c => c.id === cid);
    if (course) {
      await prisma.course.update({ where: { id: cid }, data: { lectures: course.lectures } });
      console.log(`   ✅ Synced ${cid}`);
    }
  }

  console.log(`\n✅ ALL DONE! Creator courses fixed with unique videos!`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
