const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data-db.json');
const notesPath = path.join(__dirname, 'src', 'data', 'notes.ts');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let tsContent = `// Auto-generated Notes File to Sync with Video Lectures
export interface CourseNotes {
  courseId: string;
  title: string;
  category: string;
  overview: string;
  keyConcepts: { term: string; definition: string }[];
  lectures: { title: string; content: string }[];
  cheatSheet: string;
}

export const courseNotes: Record<string, CourseNotes> = {
`;

db.courses.forEach(course => {
  const cId = course.id;
  const safeTitle = course.title.replace(/"/g, '\\"');
  
  let lecturesArr = course.lectures.map(lec => {
    const safeLecTitle = lec.title.replace(/"/g, '\\"');
    const topic = safeLecTitle.split(':').slice(1).join(':').trim() || safeLecTitle;
    
    return `    {
      title: "${safeLecTitle}",
      content: "### Overview of ${topic}\\n\\nThis module covers the core principles and practical applications of **${topic}**. The concepts discussed here are fundamental to mastering the broader subject of ${safeTitle}.\\n\\n#### Key Takeaways\\n* **Core Fundamentals**: Understanding the theoretical foundation of ${topic}.\\n* **Practical Application**: How to apply these concepts in real-world scenarios and industry projects.\\n* **Best Practices**: Common pitfalls to avoid and industry-standard workflows.\\n\\n> **Tip**: Make sure to watch the complete video lecture and practice the associated lab assignments to solidify your understanding of this topic."
    }`;
  }).join(',\n');

  tsContent += `  "${cId}": {
    courseId: "${cId}",
    title: "${safeTitle}",
    category: "Professional Development",
    overview: "This is a comprehensive study guide for ${safeTitle}. It includes structured notes, key concepts, and actionable takeaways designed to complement the video lectures and lab assignments. Use this material for quick revision and deep-dive studying.",
    keyConcepts: [
      { term: "Fundamentals", definition: "The core principles underlying the topics discussed in this course." },
      { term: "Practical Application", definition: "Real-world implementation of the theories learned." },
      { term: "Optimization", definition: "Techniques to improve efficiency and performance in this domain." }
    ],
    lectures: [
${lecturesArr}
    ],
    cheatSheet: "### Quick Reference Guide for ${safeTitle}\\n\\n* **Review Periodically**: Revisit these notes every week to ensure maximum retention.\\n* **Practice Actively**: Don't just read—apply the concepts in the interactive labs.\\n* **Ask Questions**: Use the community forum if you get stuck on any specific module."
  },
`;
});

tsContent += `};
`;

fs.writeFileSync(notesPath, tsContent);
console.log('Successfully synced notes.ts with the 10-part video lectures!');
