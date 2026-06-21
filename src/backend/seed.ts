import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './prisma.js';
import * as bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Reading data-db.json...');
  const dataPath = path.resolve(__dirname, '../../data-db.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const dbData = JSON.parse(rawData);

  console.log(`Found ${dbData.courses.length} courses and ${dbData.questions.length} questions.`);

  console.log('Seeding courses...');
  for (const course of dbData.courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {
        title: course.title,
        category: course.category,
        description: course.description,
        price: course.examPrice,
        lectures: course.lectures as any,
        durationMins: course.durationMins,
        passPercentage: course.passPercentage,
      },
      create: {
        id: course.id,
        title: course.title,
        category: course.category,
        description: course.description,
        price: course.examPrice,
        lectures: course.lectures as any,
        durationMins: course.durationMins,
        passPercentage: course.passPercentage,
        skills: []
      }
    });
  }

  console.log('Seeding questions...');
  for (const q of dbData.questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex
      },
      create: {
        id: q.id,
        courseId: q.courseId,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex
      }
    });
  }

  console.log('Ensuring Master Demo Accounts exist...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'student@skillgenz.com' },
    update: { referralCode: 'SKILL-STUDENT' },
    create: { name: 'Demo Student', email: 'student@skillgenz.com', password: passwordHash, role: 'student', plan: 'free', referralCode: 'SKILL-STUDENT' }
  });

  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@skillgenz.com' },
    update: { referralCode: 'SKILL-ADMIN' },
    create: { name: 'Demo Admin', email: 'admin@skillgenz.com', password: adminHash, role: 'admin', plan: 'pro', referralCode: 'SKILL-ADMIN' }
  });

  const superHash = await bcrypt.hash('super123', 10);
  await prisma.user.upsert({
    where: { email: 'super@skillgenz.com' },
    update: { referralCode: 'SKILL-SUPER' },
    create: { name: 'Super Admin', email: 'super@skillgenz.com', password: superHash, role: 'super_admin', plan: 'pro', referralCode: 'SKILL-SUPER' }
  });

  console.log('Seeding complete! Everything is locked and loaded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
