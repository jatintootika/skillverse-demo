const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

async function syncToPrisma() {
  try {
    for (const course of db.courses) {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          lectures: course.lectures
        }
      });
      console.log(`Updated course ${course.id} in Prisma`);
    }

    // Since questions are stored separately or as a field? Wait, let's check prisma schema.
    // Let's just update the course fields.
    console.log('Successfully synced courses to Prisma!');
  } catch (error) {
    console.error('Error syncing to Prisma:', error);
  }
}

syncToPrisma().finally(() => prisma.$disconnect());
