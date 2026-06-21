const fs = require('fs');
const file = 'src/data/notes.ts';
let content = fs.readFileSync(file, 'utf8');

const nextjsIndex = content.indexOf('Next.js Quickstart (Crash Course)');
if (nextjsIndex !== -1) {
  const lecturesStart = content.indexOf('lectures: [', nextjsIndex);
  const lecturesEnd = content.indexOf('cheatSheet:', lecturesStart);

  if (lecturesStart !== -1 && lecturesEnd !== -1) {
    const newLectures = `lectures: [
    {
      title: "Next.js Full Crash Course (Complete Guide)",
      content: "### Overview of Next.js Full Crash Course\\n\\nThis module covers the core principles and practical applications of **Next.js**. The concepts discussed here are fundamental to mastering the broader subject of Next.js Quickstart (Crash Course).\\n\\n#### Key Takeaways\\n* **Core Fundamentals**: Understanding the theoretical foundation of Next.js.\\n* **Practical Application**: How to apply these concepts in real-world scenarios and industry projects.\\n* **Best Practices**: Common pitfalls to avoid and industry-standard workflows.\\n\\n> **Tip**: Make sure to watch the complete video lecture and practice the associated lab assignments to solidify your understanding of this topic."
    }
    ],
    `;
    
    const before = content.substring(0, lecturesStart);
    const after = content.substring(lecturesEnd);
    content = before + newLectures + after;
    fs.writeFileSync(file, content);
    console.log('Successfully updated notes.ts to 1 lecture');
  } else {
    console.log('Could not find lectures array for Next.js');
  }
}
