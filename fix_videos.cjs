import { BadgeHelp } from 'lucide-react';

const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const fixMap = {
  'course-21': ['1vsqN_oe80k', 'wHLsEe2OPEY', 'tJCEVBwvrqY'],
  'course-18': ['bixR-KIJKYM', 'DvwHLJQZp7I', 'OMJWPnSq8ls'],
  'course-22': ['H2P4e4D75OQ', 'bixR-KIJKYM', 'DvwHLJQZp7I', 'OMJWPnSq8ls']
};

async function fix() {
  try {
    for (const courseId of Object.keys(fixMap)) {
      const vids = fixMap[courseId];
      // Fix JSON DB
      const dbCourse = db.courses.find(c => c.id === courseId);
      if (dbCourse) {
        dbCourse.lectures.forEach((lec, idx) => {
          if (vids[idx]) lec.videoId = vids[idx];
        });
      }

      // Fix Prisma
      const prismaCourse = await prisma.course.findUnique({ where: { id: courseId }});
      if (prismaCourse) {
        const pLecs = prismaCourse.lectures;
        pLecs.forEach((lec, idx) => {
          if (vids[idx]) lec.videoId = vids[idx];
        });
        await prisma.course.update({
          where: { id: courseId },
          data: { lectures: pLecs }
        });
        console.log(`Updated video IDs for ${courseId} in Prisma`);
      }
    }
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    console.log('Successfully updated JSON DB');
  } catch (error) {
    console.error('Error:', error);
  }
}
fix().finally(() => prisma.$disconnect());
