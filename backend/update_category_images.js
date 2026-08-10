const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imageMap = {
  'Raw Packages': 'https://loremflickr.com/800/600/packaging,cardboard',
  'Box Packaging': 'https://loremflickr.com/800/600/box,packaging',
  'Plastic Bags': 'https://loremflickr.com/800/600/plastic,bag',
  'Glass Bottles': 'https://loremflickr.com/800/600/glass,bottle',
  
  'Machine': 'https://loremflickr.com/800/600/machine,industry',
  'Agriculture Machine': 'https://loremflickr.com/800/600/tractor,farm',
  'Foods Machine': 'https://loremflickr.com/800/600/factory,food',
  
  'Import Products': 'https://loremflickr.com/800/600/cargo,shipping',
  'Architectures': 'https://loremflickr.com/800/600/architecture,building',
  'Hotel & Restaurant': 'https://loremflickr.com/800/600/restaurant,kitchen',
  'Entertainment game': 'https://loremflickr.com/800/600/arcade,game',
  
  'Export Products': 'https://loremflickr.com/800/600/export,freight',
  'Agriculture trade': 'https://loremflickr.com/800/600/agriculture,crop',
  'Furniture & Decor': 'https://loremflickr.com/800/600/furniture,decor',
  'Crocodile skin': 'https://loremflickr.com/800/600/leather,texture',
  'Foodstuffs': 'https://loremflickr.com/800/600/groceries,food'
};

async function main() {
  console.log('Starting category image update...');
  
  const categories = await prisma.category.findMany();
  
  for (const cat of categories) {
    const imageUrl = imageMap[cat.name] || 'https://loremflickr.com/800/600/product';
    
    await prisma.category.update({
      where: { id: cat.id },
      data: { image: imageUrl }
    });
    
    console.log(`Updated ${cat.name} with image: ${imageUrl}`);
  }
  
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
