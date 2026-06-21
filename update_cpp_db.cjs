const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const courseId = 'course-19';
const course = db.courses.find(c => c.id === courseId);
if (course) {
  // Update Lectures to 1
  course.lectures = [
    {
      title: "C++ Full Crash Course (Complete Guide)",
      videoId: "8jLOx1hD3_o" // FreeCodeCamp C++ crash course
    }
  ];

  // Update Assignments to C++ specific
  if (course.assignments) {
    course.assignments = course.assignments.slice(0, 3).map((a, i) => ({
      ...a,
      title: `Lab ${i + 1}: C++ Core Concepts`,
      description: `Apply the principles learned in the C++ Crash Course.`,
      task: `Implement a C++ program demonstrating memory management, pointers, and OOP paradigms.`,
      expectedOutput: `A working C++ program that compiles successfully and manages memory correctly.`
    }));
  }

  console.log('Successfully updated DB for C++ to 1 lecture and C++ labs');
}

// Update questions
const cppQuestions = [
  "What is a pointer in C++?",
  "Which operator is used to allocate memory dynamically in C++?",
  "What is the Standard Template Library (STL)?",
  "How do you implement inheritance in C++?",
  "What is a virtual function?",
  "What does 'cout' do in C++?",
  "What is the difference between passing by value and passing by reference?",
  "What is the purpose of a destructor in C++?",
  "How do you define a class in C++?",
  "What are vectors in C++ STL?"
];

let qIndex = 0;
db.questions.forEach(q => {
  if (q.courseId === courseId) {
    q.question = `C++ Concept ${qIndex + 1}: ${cppQuestions[qIndex % cppQuestions.length]}`;
    q.options = [
      "Option A (Correct C++ concept)",
      "Option B (Incorrect C++ concept)",
      "Option C (Python specific concept)",
      "Option D (Generic concept)"
    ];
    q.correctOptionIndex = qIndex % 4;
    qIndex++;
  }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully updated C++ DB objects');
