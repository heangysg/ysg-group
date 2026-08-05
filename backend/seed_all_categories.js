require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const images = [
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1565439390234-fc0baf17b075?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1611078712799-d75d3369a84b?auto=format&fit=crop&q=80&w=800"
];

async function main() {
  const categories = await prisma.category.findMany();
  
  let inserted = 0;
  for (const category of categories) {
    const productsCount = await prisma.product.count({
      where: { categoryId: category.id }
    });

    if (productsCount === 0) {
      console.log(`Seeding products for category: ${category.name}`);
      
      const dummyProducts = [];
      for (let i = 0; i < 6; i++) {
        dummyProducts.push({
          categoryId: category.id,
          name: `${category.name} Premium Equipment ${i+1}`,
          slug: `${category.slug}-equip-${i+1}-${Date.now()}`,
          nameKhmer: `ឧបករណ៍ ${category.name} ${i+1}`,
          brand: 'YSG Global',
          price: (Math.random() * 5000 + 500).toFixed(2),
          status: 'PUBLISHED',
          isPublished: true,
          isFeatured: i < 2, // First 2 are featured
          thumbnail: images[i % images.length],
          description: `High performance ${category.name} machinery built for extreme durability and efficiency.`,
          updatedAt: new Date()
        });
      }
      
      for (const prod of dummyProducts) {
        await prisma.product.create({ data: prod });
        inserted++;
      }
    }
  }
  
  console.log(`Seeded ${inserted} products across empty categories.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
