/**
 * Find and verify replacement video IDs for the 7 broken ones
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
  // Candidate replacement videos to test
  const candidates = [
    // Transformers / LLMs
    'zjkBMFhNj_g',  // Andrej Karpathy - Intro to LLMs
    'zduSFxRajkE',  // Let's build GPT from scratch
    'UU1WVnMk4E8',  // freeCodeCamp Transformers
    'bCz4OMemCcA',  // freeCodeCamp NLP with transformers

    // Power BI / Data dashboards
    'TmhQCQr_DCA',  // freeCodeCamp Power BI  
    'ataei-28UQo',  // Kevin Stratvert Power BI
    'c7LrqSxjJQQ',  // Learnit Training Power BI
    'AGrl-H87pRU',  // Alex the Analyst - Data Analytics

    // Freelancing
    '9g04033z6hE',  // Freelancing Full Course for Beginners
    'Fj79Pq06V9g',  // Upwork Tutorial 2024
    'vV2o29-bO3U',  // Fiverr Tutorial Complete Guide
    'b4w6P6M67Jg',  // 0 to 1 Crore with Freelancing
    
    // Content Creation / Personal Branding
    'lOmMBMFDGAE',  // Ali Abdaal - How I Built a Personal Brand
    '4D2onJB0VIg',  // GaryVee Personal Branding
    'NjKuEXqh66I',  // Think Media - How to make YouTube videos
    'n48YQ-JXWvM',  // Ali Abdaal - Productivity for Creators
    'G2dFuPOKXsw',  // Think Media - YouTube for Beginners
    'hXONwGbhH1Q',  // Ali Abdaal How to be a Content Creator
    
    // YouTube Masterclass / Growth
    'WU8cjFg2alY',  // Think Media - YouTube Algorithm
    'B3OjfK0t1XM',  // Think Media YouTube Secrets
    'dSVUcXP6L-4',  // Cathrin Manning - How to Start a YouTube Channel
    'mvf3tKjRIkE',  // Roberto Blake YouTube Growth
    'LKc_8fT6pGc',  // Video Influencers YouTube Strategy
    
    // Instagram Reels 
    'KcTHsxKeTSk',  // Vanessa Lau Instagram Growth
    'P1GrTYbhkVE',  // Modern Millie Instagram
    'MRN0mkV0VYA',  // Later - Instagram Reels Strategy
    'Gs8tXSX0HMU',  // Instagram Marketing Strategy
    '0G-BdOkjZVM',  // Jade Darmawangsa Instagram

    // Podcasting
    'iGUKR85HA2g',  // Pat Flynn - How to Start a Podcast  
    'Yc5Ui9WIjw0',  // Think Media - Podcasting for Beginners
    'gnEO7cBBDgE',  // Colin and Samir Podcasting
    'dv0lHWUPjxY',  // Justin Brown Podcast Tutorial
    'rL6gWG2K7gI',  // Think Media Podcast Equipment
  ];

  console.log(`Testing ${candidates.length} candidate video IDs...\n`);
  
  for (const id of candidates) {
    const r = await checkVideo(id);
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} ${id} → ${r.ok ? r.title : 'UNAVAILABLE'}`);
  }
}

main();
