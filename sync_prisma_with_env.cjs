require('dotenv').config();
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
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
      console.log(`Updated course ${course.id} lectures in Prisma`);
    }
    console.log('Successfully synced courses to Prisma!');
  } catch (error) {
    console.error('Error syncing to Prisma:', error);
  }
}

syncToPrisma().finally(() => prisma.$disconnect());
