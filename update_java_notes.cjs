const fs = require('fs');
const file = 'src/data/notes.ts';
let content = fs.readFileSync(file, 'utf8');

const courseKey = '"course-23"';
const javaIndex = content.indexOf(courseKey);
if (javaIndex !== -1) {
  const titleIndex = content.indexOf('title:', javaIndex);
  const lecturesStart = content.indexOf('lectures: [', javaIndex);
  const cheatSheetStart = content.indexOf('cheatSheet:', lecturesStart);

  if (lecturesStart !== -1 && cheatSheetStart !== -1) {
    const newLectures = `lectures: [
    {
      title: "Java Full Crash Course (Complete Guide)",
      content: "### Overview of Java Full Crash Course\\n\\nThis module covers the core principles and practical applications of **Java OOP and JVM**. The concepts discussed here are fundamental to mastering the broader subject of Java in 3 Hours (Crash Course).\\n\\n#### Key Takeaways\\n* **Core Fundamentals**: Understanding classes, objects, interfaces, and inheritance.\\n* **Practical Application**: Building robust enterprise-level software using Java.\\n* **Best Practices**: Memory management and common design patterns.\\n\\n> **Tip**: Make sure to practice writing code and running it through the JVM to fully grasp the concepts."
    }
    ],
    `;
    
    const before = content.substring(0, lecturesStart);
    const after = content.substring(cheatSheetStart);
    content = before + newLectures + after;
    fs.writeFileSync(file, content);
    console.log('Successfully updated notes.ts to 1 lecture for Java');
  } else {
    console.log('Could not find lectures array for Java');
  }
} else {
  console.log('Could not find course-23 in notes.ts');
}
