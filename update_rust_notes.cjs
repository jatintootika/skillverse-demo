const fs = require('fs');
const file = 'src/data/notes.ts';
let content = fs.readFileSync(file, 'utf8');

const courseKey = '"course-24"';
const rustIndex = content.indexOf(courseKey);
if (rustIndex !== -1) {
  const lecturesStart = content.indexOf('lectures: [', rustIndex);
  const cheatSheetStart = content.indexOf('cheatSheet:', lecturesStart);

  if (lecturesStart !== -1 && cheatSheetStart !== -1) {
    const newLectures = `lectures: [
    {
      title: "Rust Full Crash Course (Complete Guide)",
      content: "### Overview of Rust Full Crash Course\\n\\nThis module covers the core principles and practical applications of **Rust**. The concepts discussed here are fundamental to mastering the broader subject of Rust Essentials (Crash Course).\\n\\n#### Key Takeaways\\n* **Core Fundamentals**: Understanding ownership, borrowing, and lifetimes.\\n* **Practical Application**: Building memory-safe concurrent applications without a garbage collector.\\n* **Best Practices**: Using Cargo, handling errors, and safe concurrency.\\n\\n> **Tip**: Make sure to practice writing code and satisfying the borrow checker to fully grasp the concepts."
    }
    ],
    `;
    
    const before = content.substring(0, lecturesStart);
    const after = content.substring(cheatSheetStart);
    content = before + newLectures + after;
    fs.writeFileSync(file, content);
    console.log('Successfully updated notes.ts to 1 lecture for Rust');
  } else {
    console.log('Could not find lectures array for Rust');
  }
} else {
  console.log('Could not find course-24 in notes.ts');
}
