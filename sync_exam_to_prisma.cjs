require('dotenv').config();
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dbFile = 'data-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

async function syncToPrisma() {
  try {
    console.log('1. Updating Course exam settings (passPercentage, durationMins)...');
    await prisma.course.updateMany({
      data: {
        passPercentage: 80,
        durationMins: 120
      }
    });
    console.log('Course exam settings updated.');

    console.log('2. Deleting old questions from Prisma...');
    await prisma.question.deleteMany({});
    console.log('Old questions deleted.');

    console.log('3. Inserting new questions into Prisma...');
    
    // We only want to insert questions for courses that actually exist in the DB
    const existingCourses = await prisma.course.findMany({ select: { id: true } });
    const existingCourseIds = new Set(existingCourses.map(c => c.id));

    const questionsToInsert = db.questions
      .filter(q => existingCourseIds.has(q.courseId))
      .map(q => ({
        id: q.id,
        courseId: q.courseId,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex
      }));

    if (questionsToInsert.length > 0) {
      const result = await prisma.question.createMany({
        data: questionsToInsert
      });
      console.log(`Successfully synced ${result.count} questions to Prisma!`);
    } else {
      console.log('No questions to insert.');
    }
  } catch (error) {
    console.error('Error syncing to Prisma:', error);
  }
}

syncToPrisma().finally(() => prisma.$disconnect());
