import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Testing prisma...");
  const count = await prisma.user.count();
  console.log("Count:", count);
}
main().then(() => process.exit(0)).catch(console.error);
