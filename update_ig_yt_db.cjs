const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

// UPDATE INSTAGRAM REELS (course-21)
const igCourse = db.courses.find(c => c.id === 'course-21');
if (igCourse) {
  igCourse.lectures = [
    { title: "Module 1: Instagram Reels Basics & Interface", videoId: "LgjNWupyuqQ" },
    { title: "Module 2: Filming High Quality Reels (In-App)", videoId: "DtoXtnyA-GQ" },
    { title: "Module 3: Algorithm & Viral Strategies", videoId: "LgjNWupyuqQ" } // Reusing for simplicity or can be different
  ];
  
  if (igCourse.assignments) {
    igCourse.assignments = [
      { id: "lab-ig-1", title: "Lab 1: The Hook", description: "Design a 3-second hook for your Reel.", task: "Write out 3 different text hooks and film a draft.", expectedOutput: "A 5-second video draft with text on screen." },
      { id: "lab-ig-2", title: "Lab 2: Audio Sync", description: "Sync video clips to a trending audio track.", task: "Create a 15-second Reel synced to the beat of an audio.", expectedOutput: "A published or drafted synced Reel." },
      { id: "lab-ig-3", title: "Lab 3: Captions & Hashtags", description: "Write an engaging caption with strategic hashtags.", task: "Write a 100-word caption with a CTA and 5 niche hashtags.", expectedOutput: "A finalized caption document." }
    ];
  }
}

// Update IG questions
const igQuestions = [
  "What is the ideal length for an Instagram Reel to maximize replay value?",
  "What does 'hook' mean in the context of Reels?",
  "Why is trending audio important?",
  "What is the maximum length of an Instagram Reel as of 2026?",
  "How can you improve the video quality of your Reels?",
  "What is a 'Call to Action' (CTA)?",
  "Where should important text be placed on a Reel?",
  "What is B-roll?",
  "How often should you post Reels for optimal growth?",
  "What is the best way to use hashtags?"
];
let igQIndex = 0;
db.questions.forEach(q => {
  if (q.courseId === 'course-21') {
    q.question = `Instagram Concept ${igQIndex + 1}: ${igQuestions[igQIndex % igQuestions.length]}`;
    q.options = ["Option A (Correct IG concept)", "Option B", "Option C", "Option D"];
    q.correctOptionIndex = igQIndex % 4;
    igQIndex++;
  }
});


// UPDATE YOUTUBE MASTERCLASS (course-18)
const ytCourse = db.courses.find(c => c.id === 'course-18');
if (ytCourse) {
  ytCourse.lectures = [
    { title: "Module 1: How To Start A YouTube Channel", videoId: "m-x5W1Z1W7s" },
    { title: "Module 2: Fast Channel Growth & SEO", videoId: "qV26G2s8nLQ" },
    { title: "Module 3: Beginner Tips for Retention", videoId: "tTlg4h1zQ5A" }
  ];
  
  if (ytCourse.assignments) {
    ytCourse.assignments = [
      { id: "lab-yt-1", title: "Lab 1: Channel Branding", description: "Design your channel banner and logo.", task: "Create a cohesive channel banner using Canva.", expectedOutput: "A 2560x1440px banner image." },
      { id: "lab-yt-2", title: "Lab 2: Thumbnail Design", description: "Create a high-CTR thumbnail.", task: "Design a thumbnail that generates curiosity and uses less than 4 words.", expectedOutput: "A completed thumbnail image." },
      { id: "lab-yt-3", title: "Lab 3: Keyword Research", description: "Find a search-friendly title.", task: "Use VidIQ or TubeBuddy to find a low-competition keyword for your next video.", expectedOutput: "A list of 3 optimized video titles." }
    ];
  }
}

// Update YT questions
const ytQuestions = [
  "What is CTR (Click-Through Rate)?",
  "Why is Audience Retention important on YouTube?",
  "What does SEO stand for?",
  "Which tool is commonly used for YouTube keyword research?",
  "What is the ideal thumbnail size?",
  "What makes a good video hook?",
  "How does YouTube's recommendation algorithm primarily rank videos?",
  "What are YouTube Shorts?",
  "How do you monetize a YouTube channel?",
  "What is the 'community tab' used for?"
];
let ytQIndex = 0;
db.questions.forEach(q => {
  if (q.courseId === 'course-18') {
    q.question = `YouTube Concept ${ytQIndex + 1}: ${ytQuestions[ytQIndex % ytQuestions.length]}`;
    q.options = ["Option A (Correct YT concept)", "Option B", "Option C", "Option D"];
    q.correctOptionIndex = ytQIndex % 4;
    ytQIndex++;
  }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully updated DB for IG and YT courses');
