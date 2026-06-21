/**
 * ═══════════════════════════════════════════════════════════
 * Find UNIQUE, TOPIC-MATCHING video IDs for business courses
 * by testing a large pool of candidate IDs
 * ═══════════════════════════════════════════════════════════
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
        } else { resolve({ videoId, ok: false, title: '' }); }
      });
    }).on('error', () => resolve({ videoId, ok: false, title: '' }));
  });
}

async function main() {
  // MASSIVE pool of candidate video IDs for business/soft-skill topics
  // These are from well-known channels and likely still up
  const candidates = [
    // === FREELANCING ===
    'dnhBCMfHFCM', // Freelancing tips
    '4ZhA_9LPlbo', // freelancing 
    'OzP5pkhEjEo', // freelance web dev
    'cJufCC7S5UE', // upwork tips
    'RfBZaEeCz1s', // fiverr tips
    'dNeQ-yyi7lc', // freelance pricing
    'L_jWHffIx5E', // freelancing masterclass
    'At14ygUj2KA', // upwork profile
    '0_lyPaCDo1c', // freelance income
    'xFvmGLwKNaY', // freelance guide  
    'A7zr2qQR8po', // freelancing in India
    'uB12hNYbido', // make money freelancing
    'ks-7cVXejVo', // freelance writing
    'bZmGwU5GhTs', // freelance career
    
    // === CONTENT CREATION / BRANDING ===  
    'BsZ8FZWPKP0', // content creation tips
    '0TfvCRpFwF0', // personal branding 
    'Mv2V-Dn7hhI', // grow social media
    'jK_-2ofWMlQ', // content strategy
    'cXC4DZJvZqg', // youtube content tips
    '-FpIBGIkJWQ', // branding strategy
    'pZwR2tM-Oig', // brand identity design
    'WWnEWlKFj4Q', // build personal brand
    'tN6oJu2DqCM', // content creator life
    'MrY0HANqy-s', // social media marketing
    'j_lJKxMIpCg', // brand building tips
    
    // === STOCK MARKET / TRADING ===
    'Xn7KWR9EOGQ', // already verified - Rachana Ranade
    'dMqH7O83bII', // stock market basics
    'WfVF34Dnooc', // trading psychology
    'lNzJLPQ9ZeE', // stock market course
    'DHI_ZmGqXFI', // trading for beginners
    'kY2y90Kdnmg', // swing trading
    'lukPlrNVD0k', // candlestick patterns
    '1eDsYu7A76o', // options trading
    'h_Bwec2cFpc', // stock analysis fundamental
    'brqL-s0XN9s', // intraday trading
    'HlqUBt7HCGQ', // mutual funds vs stocks
    'TxEte4MKJM8', // risk management trading
    
    // === ENTREPRENEURSHIP / STARTUP ===
    'CBYhVcO4WgI', // startup tips 
    'Th8JoIan4dg', // how to start a business
    'xmYekD6-PZ8', // business plan
    'tyHUh-pCncY', // Y combinator advice
    'DOtCl5PU8F0', // startup school
    'f4j3P7cFe1Q', // MVP
    'ixBfFDMbyeM', // pitch deck
    'v-M7xHdQcYU', // growth hacking
    'RfProFQIbr0', // marketing strategy startups
    'mbryl4MZJms', // scaling a startup
    
    // === COMMUNICATION / SOFT SKILLS ===
    'Unzc731iCUY', // How to speak TED
    'aO1eJlGnMiE', // presentation skills
    'RVB3PBPxMWg', // public speaking tips
    'AGiKzIT9IOU', // body language tips
    'YS86Uel3g2U', // active listening skills
    'F4Zu5ZZAG7I', // email writing  
    'MnmB-BcukB4', // negotiation skills
    'PHsC_t0j1dU', // time management
    'Ge7c7otG2mk', // interview tips google
    'q5HiD5PNdbk', // leadership skills
    'dkDBj1RjQBo', // storytelling business
    '2RS9dWjbD0M', // communication TED
    'IPYeCltXpxw', // persuasion science
    
    // === VIDEO EDITING ===
    'byZJRsJnbJ0', // premiere pro 2024
    'RNYCRAHzmYA', // video editing basics
    'AKZkWd_Xcbs', // davinci resolve free
    'Jp1Ypm6q5Hg', // color grading tutorial
    'bDiX9GCwJso', // audio editing
    'VdZiKa0i9IA', // motion graphics ae
    'Ymto4JS3fV4', // premiere pro tips
    'LvVKoxGsmco', // editing workflow
    'tMBRJSgC1Ok', // transitions effects
    
    // === YOUTUBE GROWTH ===
    'XpqqjU7u5Yc', // youtube growth strategy
    '0N1G4G-rjTs', // youtube algorithm
    'S8m3Gokl0hA', // youtube thumbnails
    'HLkfU_AKzVg', // youtube seo tips
    'r11FJz46hFo', // youtube monetization
    'R0jUmwkCgT4', // youtube for beginners
    
    // === INSTAGRAM / SOCIAL MEDIA ===
    'VfANF2Hp9FI', // instagram growth
    'YbfBw_vIvV8', // instagram reels
    'mPU1V9BDoJE', // social media strategy
    
    // === PODCASTING ===
    'P5a-z4RSXO4', // start podcast 2024
    'PnKFIIyfBtQ', // podcasting equipment
    'o-y4PGOIPLI', // podcast editing
    'bq37aMV9dkM', // podcast growth
  ];

  console.log(`Testing ${candidates.length} candidate video IDs...\n`);
  
  const working = [];
  for (const id of candidates) {
    const r = await checkVideo(id);
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} ${id} → ${r.ok ? r.title : 'UNAVAILABLE'}`);
    if (r.ok) working.push({ id, title: r.title });
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✅ Working: ${working.length} / ${candidates.length}`);
  console.log(`\nWorking IDs by category:`);
  for (const w of working) {
    console.log(`  ${w.id} | ${w.title}`);
  }
  console.log(`═══════════════════════════════════════`);
}

main();
