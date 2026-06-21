const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data-db.json', 'utf8'));
const course = db.courses.find(c => c.id === 'course-25');
if (course) {
  course.assignments = course.assignments.map((assignment, index) => {
    return {
      ...assignment,
      title: `Lab ${index + 1}: Next.js Practical Application`,
      description: `In this lab, you will apply the concepts learned in Lecture ${index + 1} of Next.js Quickstart.`,
      task: `Implement the Next.js feature discussed in the lecture, ensuring correct routing, rendering, or styling as applicable.`,
      expectedOutput: `A working Next.js component or page demonstrating the learned concept.`
    };
  });
  fs.writeFileSync('data-db.json', JSON.stringify(db, null, 2));
  console.log('Successfully updated Next.js assignments in data-db.json');
}
