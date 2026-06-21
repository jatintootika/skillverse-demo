const fs = require('fs');
const file = 'src/data/notes.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/title: "Lecture 1: Python Full Course for Beginners"/g, 'title: "Lecture 1: Introduction to Next.js & App Router"');
content = content.replace(/title: "Lecture 2: Java Tutorial for Beginners"/g, 'title: "Lecture 2: Server Components vs Client Components"');
content = content.replace(/title: "Lecture 3: C\\+\\+ Tutorial for Beginners"/g, 'title: "Lecture 3: Routing, Layouts, and Navigation"');
content = content.replace(/title: "Lecture 4: C# Tutorial for Beginners"/g, 'title: "Lecture 4: Data Fetching, Caching, and Revalidating"');
content = content.replace(/title: "Lecture 5: JavaScript Full Course"/g, 'title: "Lecture 5: Styling with Tailwind CSS in Next.js"');
content = content.replace(/title: "Lecture 6: React Native Tutorial"/g, 'title: "Lecture 6: API Routes & Route Handlers"');
content = content.replace(/title: "Lecture 7: SQL Full Course"/g, 'title: "Lecture 7: Optimizing Images and Fonts"');
content = content.replace(/title: "Lecture 8: PHP Programming Crash Course"/g, 'title: "Lecture 8: Authentication with NextAuth.js"');
content = content.replace(/title: "Lecture 9: Ruby Programming Language"/g, 'title: "Lecture 9: SEO & Metadata Optimization"');
content = content.replace(/title: "Lecture 10: Go Programming Crash Course"/g, 'title: "Lecture 10: Deploying to Vercel"');

fs.writeFileSync(file, content);
console.log('Successfully updated notes.ts titles');
