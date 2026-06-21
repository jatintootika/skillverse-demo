/**
 * Verify all YouTube video IDs in data-db.json
 * Uses YouTube oEmbed API to check if video is available
 */
const https = require('https');
const fs = require('fs');

const db = JSON.parse(fs.readFileSync('data-db.json', 'utf-8'));

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
            resolve({ videoId, status: 'OK', title: json.title });
          } catch {
            resolve({ videoId, status: 'PARSE_ERROR', title: '' });
          }
        } else {
          resolve({ videoId, status: 'UNAVAILABLE', title: '' });
        }
      });
    }).on('error', () => {
      resolve({ videoId, status: 'ERROR', title: '' });
    });
  });
}

async function main() {
  // Collect all unique video IDs with their course info
  const videoMap = new Map();
  
  for (const course of db.courses) {
    if (!course.lectures) continue;
    for (const lec of course.lectures) {
      if (!videoMap.has(lec.videoId)) {
        videoMap.set(lec.videoId, []);
      }
      videoMap.get(lec.videoId).push({ courseId: course.id, courseTitle: course.title, lecTitle: lec.title });
    }
  }

  console.log(`\nChecking ${videoMap.size} unique video IDs...\n`);

  const results = [];
  for (const [videoId] of videoMap) {
    const result = await checkVideo(videoId);
    results.push(result);
    const icon = result.status === 'OK' ? '✅' : '❌';
    console.log(`${icon} ${videoId} → ${result.status} ${result.title ? '| ' + result.title : ''}`);
  }

  const broken = results.filter(r => r.status !== 'OK');
  const working = results.filter(r => r.status === 'OK');

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✅ Working: ${working.length}`);
  console.log(`❌ Broken: ${broken.length}`);
  
  if (broken.length > 0) {
    console.log(`\nBroken video IDs:`);
    for (const b of broken) {
      const courses = videoMap.get(b.videoId);
      console.log(`  ❌ ${b.videoId} → used in:`);
      for (const c of courses) {
        console.log(`     - ${c.courseId} | ${c.lecTitle}`);
      }
    }
  }
  console.log(`═══════════════════════════════════════`);
}

main();
