const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const fixMap = {
  'course-21': ['1vsqN_oe80k', 'wHLsEe2OPEY', 'tJCEVBwvrqY'],
  'course-18': ['bixR-KIJKYM', 'DvwHLJQZp7I', 'OMJWPnSq8ls'],
  'course-22': ['H2P4e4D75OQ', 'bixR-KIJKYM', 'DvwHLJQZp7I', 'OMJWPnSq8ls']
};

for (const courseId of Object.keys(fixMap)) {
  const vids = fixMap[courseId];
  const dbCourse = db.courses.find(c => c.id === courseId);
  if (dbCourse) {
    dbCourse.lectures.forEach((lec, idx) => {
      if (vids[idx]) lec.videoId = vids[idx];
    });
  }
}

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully updated JSON DB video IDs');
