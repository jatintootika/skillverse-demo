const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestCourse() {
  try {
    const newCourse = await prisma.course.create({
      data: {
        title: 'Mastering Full Stack Development (Live Test)',
        description: 'This is a test course created to verify dynamic resources like Notes, Lab Manuals, and Practice MCQs.',
        category: 'Tech',
        price: 0,
        instructorName: 'SkillGenz Testing Bot',
        active: true,
        durationMins: 120,
        passPercentage: 80,
        notesUrl: 'https://example.com/demo-notes.pdf',
        labManualUrl: 'https://example.com/demo-lab-manual.pdf',
        practiceMcqsUrl: 'https://example.com/demo-mcqs',
        lectures: [
          { title: 'Introduction to Full Stack', duration: '10:00' },
          { title: 'Setting up the Database', duration: '15:30' }
        ]
      }
    });
    console.log('Test course created successfully:', newCourse);
  } catch (error) {
    console.error('Error creating test course:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestCourse();
