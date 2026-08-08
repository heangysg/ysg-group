const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const categoriesData = [
  {
    name: 'Machine', nameKhmer: 'ម៉ាស៊ីន',
    subcategories: [
      { name: 'Foods Machine', nameKhmer: 'ម៉ាស៊ីនអាហារ', image: 'https://www.ysg-group.com/assets/images/categorys/thumbs/2018-06-19__17-08-27__4.png' },
      { name: 'Agriculture Machine', nameKhmer: 'ម៉ាស៊ីនកសិកម្ម', image: 'https://www.ysg-group.com/assets/images/categorys/thumbs/2018-06-19__17-17-58__Layer_25_copy.png' },
      { name: 'Grill & Frozen', nameKhmer: 'អាំង និង កក', image: 'https://www.ysg-group.com/assets/images/categorys/thumbs/2018-06-28__15-08-34__04-Soft-Serve-_-Frozen-Yogur-C722_C723d.png' },
      { name: 'Printing & Design', nameKhmer: 'បោះពុម្ព និង រចនា', image: 'https://www.ysg-group.com/assets/images/categorys/thumbs/2018-06-28__15-06-43__printing-press_72.png' },
      { name: 'Decor', nameKhmer: 'ការតុបតែង', image: 'https://www.ysg-group.com/assets/images/categorys/thumbs/2018-06-28__15-10-35__JAFA-0412-400.png' },
    ]
  },
  {
    name: 'Flavours', nameKhmer: 'រសជាតិ',
    subcategories: [
      { name: 'Food & Drink Additive', nameKhmer: 'សារធាតុបន្ថែមអាហារ និងភេសជ្ជៈ', image: 'https://www.ysg-group.com/assets/no.png' },
      { name: 'Ingredient', nameKhmer: 'គ្រឿងផ្សំ', image: 'https://www.ysg-group.com/assets/no.png' },
      { name: 'Flavours', nameKhmer: 'រសជាតិ', image: 'https://www.ysg-group.com/assets/no.png' },
    ]
  },
  {
    name: 'Import Products', nameKhmer: 'ផលិតផលនាំចូល',
    subcategories: [
      { name: 'Raw Packages', nameKhmer: 'ការវេចខ្ចប់', image: 'https://www.ysg-group.com/assets/no.png' },
      { name: 'Architectures', nameKhmer: 'ស្ថាបត្យកម្ម', image: 'https://www.ysg-group.com/assets/no.png' },
      { name: 'Hotel & Restaurant', nameKhmer: 'សណ្ឋាគារ និង ភោជនីយដ្ឋាន', image: 'https://www.ysg-group.com/assets/no.png' },
      { name: 'Entertainment game', nameKhmer: 'ហ្គេមកម្សាន្ត', image: 'https://www.ysg-group.com/assets/no.png' },
    ]
  },
  {
    name: 'Export Products', nameKhmer: 'ផលិតផលនាំចេញ',
    subcategories: [
      { name: 'Agriculture trade', nameKhmer: 'កសិកម្ម', image: 'https://www.ysg-group.com/assets/no.png' },
      { name: 'Furniture & Decor', nameKhmer: 'គ្រឿងសង្ហារឹម', image: 'https://www.ysg-group.com/assets/no.png' },
      { name: 'Crocodile skin', nameKhmer: 'ស្បែកក្រពើ', image: 'https://www.ysg-group.com/assets/no.png' },
      { name: 'Foodstuffs', nameKhmer: 'គ្រឿងឧបភោគបរិភោគ', image: 'https://www.ysg-group.com/assets/no.png' },
    ]
  }
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('Starting seed...');
  for (const parent of categoriesData) {
    let parentCategory = await prisma.category.findFirst({
      where: { name: parent.name }
    });
    
    if (!parentCategory) {
      parentCategory = await prisma.category.create({
        data: {
          id: crypto.randomUUID(),
          name: parent.name,
          nameKhmer: parent.nameKhmer,
          slug: slugify(parent.name),
          updatedAt: new Date()
        }
      });
      console.log(`Created parent category: ${parent.name}`);
    } else {
      await prisma.category.update({
        where: { id: parentCategory.id },
        data: { nameKhmer: parent.nameKhmer }
      });
      console.log(`Updated parent category: ${parent.name}`);
    }

    for (const sub of parent.subcategories) {
      let subCategory = await prisma.category.findFirst({
        where: { name: sub.name }
      });

      if (!subCategory) {
        subCategory = await prisma.category.create({
          data: {
            id: crypto.randomUUID(),
            name: sub.name,
            nameKhmer: sub.nameKhmer,
            slug: slugify(sub.name),
            image: sub.image || null,
            parentId: parentCategory.id,
            updatedAt: new Date()
          }
        });
        console.log(`Created subcategory: ${sub.name}`);
      } else {
        await prisma.category.update({
          where: { id: subCategory.id },
          data: {
            nameKhmer: sub.nameKhmer,
            image: sub.image || subCategory.image,
            parentId: parentCategory.id
          }
        });
        console.log(`Updated subcategory: ${sub.name}`);
      }
    }
  }
  
  // Seed some dummy products for the new subcategories if they are empty
  const subCategories = await prisma.category.findMany({ where: { parentId: { not: null } } });
  let productsInserted = 0;
  for (const sub of subCategories) {
    const productsCount = await prisma.product.count({ where: { categoryId: sub.id } });
    if (productsCount === 0) {
       console.log(`Seeding dummy products for empty subcategory: ${sub.name}`);
       const dummyProducts = [];
       for (let i = 0; i < 3; i++) {
         dummyProducts.push({
           categoryId: sub.id,
           name: `${sub.name} Premium Item ${i+1}`,
           slug: `${slugify(sub.name)}-item-${i+1}-${Date.now()}`,
           nameKhmer: `ផលិតផល ${sub.nameKhmer || sub.name} ${i+1}`,
           brand: 'YSG Global',
           price: (Math.random() * 5000 + 500).toFixed(2),
           status: 'PUBLISHED',
           isPublished: true,
           isFeatured: i === 0,
           thumbnail: sub.image && sub.image !== 'https://www.ysg-group.com/assets/no.png' ? sub.image : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
           description: `High performance ${sub.name} built for extreme durability and efficiency.`,
           updatedAt: new Date()
         });
       }
       for (const prod of dummyProducts) {
         await prisma.product.create({ data: prod });
         productsInserted++;
       }
    }
  }
  console.log(`Seeded ${productsInserted} dummy products.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
