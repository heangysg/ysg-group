require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    data: { isPublished: true, status: 'PUBLISHED' }
  });
  console.log(`Updated ${result.count} products to be published.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
