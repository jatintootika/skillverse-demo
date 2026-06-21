const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function update() {
  try {
    const course = await prisma.course.findUnique({where: {id: 'course-25'}});
    if (!course) {
      console.log('Course not found');
      return;
    }
    const lectures = [
      { title: 'Lecture 1: Introduction to Next.js & App Router', videoId: 'wm5gMKuwSYk' },
      { title: 'Lecture 2: Server Components vs Client Components', videoId: 'gssFksyIGT0' },
      { title: 'Lecture 3: Routing, Layouts, and Navigation', videoId: 'KjY94sAKL34' },
      { title: 'Lecture 4: Data Fetching, Caching, and Revalidating', videoId: '843tec5hXjc' },
      { title: 'Lecture 5: Styling with Tailwind CSS in Next.js', videoId: 'A63UxsQsN_s' },
      { title: 'Lecture 6: API Routes & Route Handlers', videoId: 'Z8fA_s3T1P8' },
      { title: 'Lecture 7: Optimizing Images and Fonts', videoId: 'O_X5g9Xk5Z4' },
      { title: 'Lecture 8: Authentication with NextAuth.js', videoId: 'w2hWT_Tjcxc' },
      { title: 'Lecture 9: SEO & Metadata Optimization', videoId: 'dF_TItR5f3s' },
      { title: 'Lecture 10: Deploying to Vercel', videoId: '2HBIobDsMI0' }
    ];
    await prisma.course.update({ where: { id: 'course-25' }, data: { lectures } });
    console.log('Successfully updated Prisma DB!');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
update();
