require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.product.count();
  const allProds = await prisma.product.findMany();
  console.log('Total Products:', count);
  console.log('Products:', JSON.stringify(allProds.map(p => ({ id: p.id, status: p.status, isPublished: p.isPublished, categoryId: p.categoryId })).slice(0, 5), null, 2));
}
main().finally(() => prisma.$disconnect());
