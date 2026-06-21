const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const courseId = 'course-24';
const course = db.courses.find(c => c.id === courseId);
if (course && course.lectures.length > 0) {
  course.lectures[0].videoId = "zF34dRivLOw"; // User requested video ID
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  console.log('Successfully updated Rust video to zF34dRivLOw');
}
