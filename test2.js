import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:Jrhume17bLWD4TVB@db.bnfiwyoazqqzqdpdbtsi.supabase.co:6543/postgres?pgbouncer=true' } } });
prisma.course.findMany().then(res => console.log("Courses count:", res.length)).catch(console.error).finally(() => prisma.$disconnect());
