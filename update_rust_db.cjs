const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const courseId = 'course-24';
const course = db.courses.find(c => c.id === courseId);
if (course) {
  // Update Lectures to 1
  course.lectures = [
    {
      title: "Rust Full Crash Course (Complete Guide)",
      videoId: "5C_HPTJg5ek" // FreeCodeCamp Rust full course video ID or placeholder
    }
  ];

  // Update Assignments to Rust specific
  if (course.assignments) {
    course.assignments = course.assignments.slice(0, 3).map((a, i) => ({
      ...a,
      title: `Lab ${i + 1}: Rust Core Concepts`,
      description: `Apply the memory safety principles learned in the Rust Crash Course.`,
      task: `Implement a Rust program demonstrating ownership, borrowing, and lifetimes.`,
      expectedOutput: `A working Rust program that compiles successfully without memory errors.`
    }));
  }

  console.log('Successfully updated DB for Rust to 1 lecture and Rust labs');
}

// Update questions
const rustQuestions = [
  "What is the primary feature of Rust that ensures memory safety?",
  "How does Rust handle ownership?",
  "What does the 'mut' keyword do in Rust?",
  "What is a 'borrow' in Rust?",
  "What are lifetimes in Rust used for?",
  "How does Rust handle concurrency safely?",
  "What is the 'Cargo' tool in Rust?",
  "What is the difference between String and &str in Rust?",
  "How do you handle errors without exceptions in Rust?",
  "What are traits in Rust?"
];

let qIndex = 0;
db.questions.forEach(q => {
  if (q.courseId === courseId) {
    q.question = `Rust Concept ${qIndex + 1}: ${rustQuestions[qIndex % rustQuestions.length]}`;
    q.options = [
      "Option A (Correct Rust concept)",
      "Option B (Incorrect Rust concept)",
      "Option C (C++ specific concept)",
      "Option D (Generic concept)"
    ];
    q.correctOptionIndex = qIndex % 4;
    qIndex++;
  }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully updated Rust DB objects');
