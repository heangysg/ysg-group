const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.category.update({
    where: { id: '9bdd8301-6a26-4506-bf68-64bb6acac9eb' },
    data: { parentId: null }
  });
  console.log("Category updated successfully");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
