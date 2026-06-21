const fs = require('fs');
const file = 'src/data/notes.ts';
let content = fs.readFileSync(file, 'utf8');

const courseKey = '"course-20"';
const pythonIndex = content.indexOf(courseKey);
if (pythonIndex !== -1) {
  const lecturesStart = content.indexOf('lectures: [', pythonIndex);
  const cheatSheetStart = content.indexOf('cheatSheet:', lecturesStart);

  if (lecturesStart !== -1 && cheatSheetStart !== -1) {
    const newLectures = `lectures: [
    {
      title: "Python Full Crash Course (Complete Guide)",
      content: "### Overview of Python Full Crash Course\\n\\nThis module covers the core principles and practical applications of **Python**. The concepts discussed here are fundamental to mastering the broader subject of Python for Beginners (Crash Course).\\n\\n#### Key Takeaways\\n* **Core Fundamentals**: Understanding variables, loops, functions, and data structures.\\n* **Practical Application**: Building simple scripts to automate tasks and process data.\\n* **Best Practices**: Writing clean, readable, and Pythonic code.\\n\\n> **Tip**: Make sure to practice writing code and running your scripts to fully grasp the concepts."
    }
    ],
    `;
    
    const before = content.substring(0, lecturesStart);
    const after = content.substring(cheatSheetStart);
    content = before + newLectures + after;
    fs.writeFileSync(file, content);
    console.log('Successfully updated notes.ts to 1 lecture for Python (course-20)');
  } else {
    console.log('Could not find lectures array for Python (course-20)');
  }
} else {
  console.log('Could not find course-20 in notes.ts');
}
