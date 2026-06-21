const fs = require('fs');
const file = 'src/data/notes.ts';
let content = fs.readFileSync(file, 'utf8');

const courseKey = '"course-19"';
const cppIndex = content.indexOf(courseKey);
if (cppIndex !== -1) {
  const lecturesStart = content.indexOf('lectures: [', cppIndex);
  const cheatSheetStart = content.indexOf('cheatSheet:', lecturesStart);

  if (lecturesStart !== -1 && cheatSheetStart !== -1) {
    const newLectures = `lectures: [
    {
      title: "C++ Full Crash Course (Complete Guide)",
      content: "### Overview of C++ Full Crash Course\\n\\nThis module covers the core principles and practical applications of **C++**. The concepts discussed here are fundamental to mastering the broader subject of C++ Fast Track (Crash Course).\\n\\n#### Key Takeaways\\n* **Core Fundamentals**: Understanding pointers, memory management, and OOP paradigms.\\n* **Practical Application**: Building high-performance applications and using STL.\\n* **Best Practices**: Writing efficient code and managing system resources.\\n\\n> **Tip**: Make sure to practice writing code and understanding memory allocation to fully grasp the concepts."
    }
    ],
    `;
    
    const before = content.substring(0, lecturesStart);
    const after = content.substring(cheatSheetStart);
    content = before + newLectures + after;
    fs.writeFileSync(file, content);
    console.log('Successfully updated notes.ts to 1 lecture for C++ (course-19)');
  } else {
    console.log('Could not find lectures array for C++ (course-19)');
  }
} else {
  console.log('Could not find course-19 in notes.ts');
}
