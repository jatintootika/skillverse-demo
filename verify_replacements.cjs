/**
 * Verify the 7 replacement video IDs found via browser
 */
const https = require('https');

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
        } else {
          resolve({ videoId, ok: false, title: '' });
        }
      });
    }).on('error', () => resolve({ videoId, ok: false, title: '' }));
  });
}

async function main() {
  const replacements = [
    { id: 'FjEJ0yahkGw', purpose: 'Freelancing' },
    { id: 'TY9OrhsUsjM', purpose: 'Content Creation / Personal Branding' },
    { id: 'kaAdmiUEmBE', purpose: 'YouTube Growth Masterclass' },
    { id: '8XRL5SVUsTE', purpose: 'Instagram Reels Strategy' },
    { id: 'JeJ-JDU5bqw', purpose: 'Podcasting Tutorial' },
    { id: 'ZhAz268Hdpw', purpose: 'Transformers ML' },
    { id: '6cV3OwFrOkk', purpose: 'Power BI Tutorial' },
    // Also already-verified working ones for more lectures
    { id: 'zjkBMFhNj_g', purpose: 'LLM Intro (Karpathy)' },
    { id: 'UU1WVnMk4E8', purpose: 'LLM from scratch (freeCodeCamp)' },
    { id: 'TmhQCQr_DCA', purpose: 'Power BI (Kevin)' },
    { id: 'c7LrqSxjJQQ', purpose: 'Power BI Dashboard' },
    { id: 'AGrl-H87pRU', purpose: 'Power BI Beginner to Pro' },
  ];

  for (const r of replacements) {
    const result = await checkVideo(r.id);
    const icon = result.ok ? '✅' : '❌';
    console.log(`${icon} ${r.id} [${r.purpose}] → ${result.ok ? result.title : 'UNAVAILABLE'}`);
  }
}

main();
