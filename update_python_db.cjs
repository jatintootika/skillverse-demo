const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const courseId = 'course-20';
const course = db.courses.find(c => c.id === courseId);
if (course) {
  // Update Lectures to 1
  course.lectures = [
    {
      title: "Python Full Crash Course (Complete Guide)",
      videoId: "rfscVS0vtbw" // FreeCodeCamp Python crash course
    }
  ];

  // Update Assignments to Python specific
  if (course.assignments) {
    course.assignments = course.assignments.slice(0, 3).map((a, i) => ({
      ...a,
      title: `Lab ${i + 1}: Python Core Concepts`,
      description: `Apply the principles learned in the Python Crash Course.`,
      task: `Implement a Python script demonstrating variables, loops, functions, and data structures.`,
      expectedOutput: `A working Python script that executes successfully and outputs the expected results.`
    }));
  }

  console.log('Successfully updated DB for Python to 1 lecture and Python labs');
}

// Update questions
const pythonQuestions = [
  "Which of the following is the correct extension of the Python file?",
  "What is the output of print(2 ** 3)?",
  "Which keyword is used for function in Python language?",
  "Which of the following is a Python tuple?",
  "How do you insert comments in Python code?",
  "What is a dictionary in Python?",
  "Which statement is used to stop a loop?",
  "How do you create a variable with the numeric value 5?",
  "What is the correct way to create a list in Python?",
  "Which module in Python is used for regular expressions?"
];

let qIndex = 0;
db.questions.forEach(q => {
  if (q.courseId === courseId) {
    q.question = `Python Concept ${qIndex + 1}: ${pythonQuestions[qIndex % pythonQuestions.length]}`;
    q.options = [
      "Option A (Correct Python concept)",
      "Option B (Incorrect Python concept)",
      "Option C (Syntax error)",
      "Option D (Generic concept)"
    ];
    q.correctOptionIndex = qIndex % 4;
    qIndex++;
  }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully updated Python DB objects');
