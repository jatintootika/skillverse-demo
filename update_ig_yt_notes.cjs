const fs = require('fs');
const file = 'src/data/notes.ts';
let content = fs.readFileSync(file, 'utf8');

// UPDATE INSTAGRAM (course-21)
const igKey = '"course-21"';
const igIndex = content.indexOf(igKey);
if (igIndex !== -1) {
  const lecturesStart = content.indexOf('lectures: [', igIndex);
  const cheatSheetStart = content.indexOf('cheatSheet:', lecturesStart);
  if (lecturesStart !== -1 && cheatSheetStart !== -1) {
    const newLectures = `lectures: [
    {
      title: "Module 1: Instagram Reels Basics & Interface",
      content: "### Navigating Instagram Reels\\n\\nUnderstand the core interface of Instagram Reels, from the camera settings to adding music and effects.\\n\\n* **Aspect Ratio:** Always shoot in 9:16 vertical format.\\n* **Trending Audio:** Use the arrow icon in the app to find sounds that are gaining traction."
    },
    {
      title: "Module 2: Filming High Quality Reels (In-App)",
      content: "### Quality Settings\\n\\nEnsure your videos look professional.\\n\\n* **Camera Settings:** Turn on 'Upload at highest quality' in Instagram settings.\\n* **Lighting:** Good lighting prevents the camera sensor from adding grain."
    },
    {
      title: "Module 3: Algorithm & Viral Strategies",
      content: "### Hacking the Algorithm\\n\\nLearn what makes a video go viral.\\n\\n* **The Hook:** The first 3 seconds are crucial. Use text and movement.\\n* **Watch Time:** Keep videos fast-paced to encourage looping."
    }
    ],
    `;
    const before = content.substring(0, lecturesStart);
    const after = content.substring(cheatSheetStart);
    content = before + newLectures + after;
  }
}

// UPDATE YOUTUBE (course-18)
const ytKey = '"course-18"';
const ytIndex = content.indexOf(ytKey);
if (ytIndex !== -1) {
  const lecturesStart = content.indexOf('lectures: [', ytIndex);
  const cheatSheetStart = content.indexOf('cheatSheet:', lecturesStart);
  if (lecturesStart !== -1 && cheatSheetStart !== -1) {
    const newLectures = `lectures: [
    {
      title: "Module 1: How To Start A YouTube Channel",
      content: "### Channel Foundations\\n\\nSetting up your channel correctly is the first step to success.\\n\\n* **Niche Selection:** Choose a topic you can create 100 videos about.\\n* **Channel Art:** A clear banner and profile picture establish trust."
    },
    {
      title: "Module 2: Fast Channel Growth & SEO",
      content: "### YouTube SEO\\n\\nHelp the algorithm find your videos.\\n\\n* **Keywords:** Use tools to find search terms with high volume and low competition.\\n* **Titles & Descriptions:** Naturally weave keywords into your metadata."
    },
    {
      title: "Module 3: Beginner Tips for Retention",
      content: "### Keeping Viewers Engaged\\n\\nRetention is the most important metric on YouTube.\\n\\n* **The Intro:** Deliver on the promise of the title immediately.\\n* **Pacing:** Use B-roll, cuts, and graphics to reset viewer attention."
    }
    ],
    `;
    const before = content.substring(0, lecturesStart);
    const after = content.substring(cheatSheetStart);
    content = before + newLectures + after;
  }
}

fs.writeFileSync(file, content);
console.log('Successfully updated notes.ts for IG and YT courses');
