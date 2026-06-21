const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const courseId = 'course-22';
const course = db.courses.find(c => c.id === courseId);
if (course) {
  // Update Lectures to 4 Podcasting lectures
  course.lectures = [
    {
      title: "Module 1: How to Start a Podcast in 2026 (Beginner Tutorial)",
      videoId: "Q8pfZna6H6Q"
    },
    {
      title: "Module 2: Podcasting Equipment & Gear Guide",
      videoId: "Qgsgv_FGKtc"
    },
    {
      title: "Module 3: Starting a Video Podcast Step-by-Step",
      videoId: "rKnrWvX7iPQ"
    },
    {
      title: "Module 4: YouTube Podcast Distribution",
      videoId: "plothTBL1AA"
    }
  ];

  // Update Assignments to Podcasting specific
  if (course.assignments) {
    course.assignments = [
      {
        id: "lab-pod-1",
        title: "Lab 1: Define Your Niche & Format",
        description: "Plan your podcast topic, target audience, and episode structure.",
        task: "Write a 1-page podcast proposal including name, niche, and outline for the first 3 episodes.",
        expectedOutput: "A clear podcast proposal document."
      },
      {
        id: "lab-pod-2",
        title: "Lab 2: Audio Recording & Editing",
        description: "Record a short audio segment and apply basic editing techniques.",
        task: "Record a 2-minute intro, remove background noise, and add intro music using Audacity or Riverside.",
        expectedOutput: "A polished 2-minute MP3 audio file."
      },
      {
        id: "lab-pod-3",
        title: "Lab 3: RSS Feed & Distribution",
        description: "Set up a podcast host and generate your RSS feed.",
        task: "Create a free account on a podcast host (e.g. Spotify for Podcasters) and upload your first episode.",
        expectedOutput: "A valid RSS feed link ready for distribution."
      }
    ];
  }

  console.log('Successfully updated DB for Podcasting to 4 lectures and Podcasting labs');
}

// Update questions
const podQuestions = [
  "What is an RSS feed in podcasting?",
  "Which microphone type is best for reducing background noise in untreated rooms?",
  "What is the standard audio format for uploading podcast episodes?",
  "What is 'Podcast Hosting'?",
  "What does 'DAW' stand for in podcast editing?",
  "Why is it important to have consistent cover art?",
  "What is a 'dynamic' microphone?",
  "How can you monetize a podcast?",
  "What is a call to action (CTA) in a podcast?",
  "Which platform allows video podcasts directly?"
];

let qIndex = 0;
db.questions.forEach(q => {
  if (q.courseId === courseId) {
    q.question = `Podcasting Concept ${qIndex + 1}: ${podQuestions[qIndex % podQuestions.length]}`;
    q.options = [
      "Option A (Correct Podcasting concept)",
      "Option B (Incorrect concept)",
      "Option C (Irrelevant concept)",
      "Option D (Generic concept)"
    ];
    q.correctOptionIndex = qIndex % 4;
    qIndex++;
  }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully updated Podcasting DB objects');
