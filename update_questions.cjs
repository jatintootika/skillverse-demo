const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data-db.json', 'utf8'));

const nextJsQuestions = [
  "What is the primary purpose of the App Router in Next.js?",
  "How do Server Components differ from Client Components?",
  "Which function is used for data fetching in Server Components?",
  "How can you revalidate cached data in Next.js?",
  "What is the recommended way to handle routing in Next.js?",
  "How do you define a dynamic route segment?",
  "What is the use of the `generateStaticParams` function?",
  "Which Next.js feature automatically optimizes images?",
  "How do you define an API Route using the App Router?",
  "What is the main benefit of Edge Functions in Next.js?"
];

let qIndex = 0;
db.questions.forEach(q => {
  if (q.courseId === 'course-25') {
    q.question = `Next.js Concept ${qIndex + 1}: ${nextJsQuestions[qIndex % nextJsQuestions.length]}`;
    q.options = [
      "Option A (Next.js specific)",
      "Option B (React specific)",
      "Option C (Node.js specific)",
      "Option D (Generic)"
    ];
    q.correctOptionIndex = qIndex % 4;
    qIndex++;
  }
});

fs.writeFileSync('data-db.json', JSON.stringify(db, null, 2));
console.log('Successfully updated Next.js questions in data-db.json');
