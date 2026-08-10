const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.category.findFirst({where: {name: 'Machine'}});
  console.log(c);
}
check().finally(() => prisma.$disconnect());
