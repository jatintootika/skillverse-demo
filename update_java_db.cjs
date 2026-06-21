const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const courseId = 'course-23';
const course = db.courses.find(c => c.id === courseId);
if (course) {
  // Update Lectures to 1
  course.lectures = [
    {
      title: "Java Full Crash Course (Complete Guide)",
      videoId: "eIrMbAQSU34" // Common Java crash course video ID placeholder
    }
  ];

  // Update Assignments to Java specific
  if (course.assignments) {
    course.assignments = course.assignments.slice(0, 3).map((a, i) => ({
      ...a,
      title: `Lab ${i + 1}: Java Core Concepts`,
      description: `Apply the OOP principles learned in the Java Crash Course.`,
      task: `Implement a Java class demonstrating inheritance, polymorphism, and encapsulation.`,
      expectedOutput: `A working Java program that outputs the expected results based on the object interactions.`
    }));
  }

  console.log('Successfully updated DB for Java to 1 lecture and Java labs');
}

// Update questions
const javaQuestions = [
  "What is the main principle of OOP in Java?",
  "Which keyword is used to inherit a class in Java?",
  "What is the difference between an interface and an abstract class?",
  "How does Java handle memory management?",
  "What is the purpose of the 'public static void main' method?",
  "What is a NullPointerException?",
  "How do you create a thread in Java?",
  "What is the Java Collections Framework?",
  "What is the difference between checked and unchecked exceptions?",
  "How does the 'final' keyword work in Java?"
];

let qIndex = 0;
db.questions.forEach(q => {
  if (q.courseId === courseId) {
    q.question = `Java Concept ${qIndex + 1}: ${javaQuestions[qIndex % javaQuestions.length]}`;
    q.options = [
      "Option A (Correct Java concept)",
      "Option B (Incorrect Java concept)",
      "Option C (C++ specific concept)",
      "Option D (Generic concept)"
    ];
    q.correctOptionIndex = qIndex % 4;
    qIndex++;
  }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully updated Java DB objects');
