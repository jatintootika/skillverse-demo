const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  try {
    const courses = await prisma.course.findMany();
    console.log('PRISMA RETURNED COURSES:', courses.length);
    if(courses.length > 0) {
      const ig = courses.find(c => c.id === 'course-21');
      console.log('IG Lectures in Prisma:', ig ? JSON.stringify(ig.lectures) : 'not found');
    }
  } catch(e) {
    console.log('Prisma Error:', e.message);
  }
}
check().finally(() => prisma.$disconnect());
