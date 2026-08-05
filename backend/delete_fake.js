require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.product.deleteMany({
    where: { brand: 'YSG Group' }
  });
  console.log('Deleted YSG Group products:', res);
}

main().finally(() => prisma.$disconnect());
