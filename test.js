import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.course.findMany().then(res => console.log(res.length)).catch(console.error).finally(() => prisma.$disconnect());
