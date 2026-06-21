const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const course = db.courses.find(c => c.id === 'course-25');
if (course) {
  course.lectures = [
    {
      title: "Next.js Full Crash Course (Complete Guide)",
      videoId: "wm5gMKuwSYk"
    }
  ];
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  console.log('Successfully updated DB for Next.js to only 1 lecture');
}
