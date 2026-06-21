const fs = require('fs');
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

// From inject-videos.cjs
const fixMap = {
  'course-9': ['bixR-KIJKYM', 'DvwHLJQZp7I', 'O91v145A6xU', 'O91v145A6xU', 'H2P4e4D75OQ', 'bixR-KIJKYM', 'DvwHLJQZp7I', 'H2P4e4D75OQ', 'bixR-KIJKYM', 'OMJWPnSq8ls'],
  'course-10': ['p7HKvqRI_Bo', 'ZgI2QY-LgqI', 'C3CRilsW3k0', '8B4LqA2Ghyk', 'C3CRilsW3k0', '8B4LqA2Ghyk', 'ZgI2QY-LgqI', 'p7HKvqRI_Bo', 'W1D7gG90gWw', '8B4LqA2Ghyk']
};

for (const courseId of Object.keys(fixMap)) {
  const vids = fixMap[courseId];
  const dbCourse = db.courses.find(c => c.id === courseId);
  if (dbCourse) {
    dbCourse.lectures.forEach((lec, idx) => {
      // replace video ID if we have a valid one for this index
      if (vids[idx]) {
        lec.videoId = vids[idx];
      }
    });
  }
}

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully updated course 9 and 10 video IDs in data-db.json');
