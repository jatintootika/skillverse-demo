const fs = require('fs');
const file = 'src/data/notes.ts';
let content = fs.readFileSync(file, 'utf8');

const courseKey = '"course-22"';
const podIndex = content.indexOf(courseKey);
if (podIndex !== -1) {
  const lecturesStart = content.indexOf('lectures: [', podIndex);
  const cheatSheetStart = content.indexOf('cheatSheet:', lecturesStart);

  if (lecturesStart !== -1 && cheatSheetStart !== -1) {
    const newLectures = `lectures: [
    {
      title: "Module 1: How to Start a Podcast in 2026",
      content: "### Introduction to Podcasting\\n\\nIn this first module, we explore the essential steps to launch your podcast. Defining your audience, choosing a niche, and structuring your episode format are crucial first steps before touching any equipment.\\n\\n* **Niche & Audience:** Find a specific topic you are passionate about.\\n* **Format:** Solo, co-hosted, or interview style."
    },
    {
      title: "Module 2: Podcasting Equipment & Gear Guide",
      content: "### Gear Essentials\\n\\nChoosing the right microphone is vital. \\n\\n* **Microphones:** Dynamic mics (like Samson Q2U) are best for untreated rooms as they reject background noise better than condenser mics.\\n* **Audio Interfaces:** For multiple XLR microphones."
    },
    {
      title: "Module 3: Starting a Video Podcast Step-by-Step",
      content: "### Adding Video\\n\\nVideo podcasts are growing rapidly. \\n\\n* **Cameras:** You can start with your smartphone before upgrading to a mirrorless camera.\\n* **Lighting & Set Design:** Good lighting is often more important than an expensive camera."
    },
    {
      title: "Module 4: YouTube Podcast Distribution",
      content: "### Distribution & RSS Feeds\\n\\nOnce recorded, your podcast needs to reach listeners.\\n\\n* **Podcast Hosts:** Platforms like Spotify for Podcasters or Buzzsprout host your audio files.\\n* **RSS Feed:** This link distributes your show to Apple Podcasts, Spotify, and more.\\n* **YouTube Integration:** Setting up your show as a 'Podcast' playlist on YouTube."
    }
    ],
    `;
    
    const before = content.substring(0, lecturesStart);
    const after = content.substring(cheatSheetStart);
    content = before + newLectures + after;
    fs.writeFileSync(file, content);
    console.log('Successfully updated notes.ts to 4 lectures for Podcasting (course-22)');
  } else {
    console.log('Could not find lectures array for Podcasting (course-22)');
  }
} else {
  console.log('Could not find course-22 in notes.ts');
}
