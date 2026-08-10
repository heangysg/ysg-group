const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearImages() {
  const namesToClear = [
    'Import Products',
    'Architectures',
    'Hotel & Restaurant',
    'Entertainment game',
    'Export Products',
    'Agriculture trade',
    'Furniture & Decor',
    'Crocodile skin',
    'Foodstuffs'
  ];

  console.log('Clearing images for specific categories...');
  
  for (const name of namesToClear) {
    const res = await prisma.category.updateMany({
      where: { name: name },
      data: { image: null }
    });
    console.log(`Cleared ${name}: ${res.count} records updated`);
  }
  
  console.log('Done!');
}

clearImages()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
