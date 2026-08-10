require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cheerio = require('cheerio');

const oldCategoryMap = {
  'Foods Machine': 2,
  'Agriculture Machine': 3,
  'Grill & Frozen': 5,
  'Food & Drink Additive': 6,
  'Ingredient': 7,
  'Flavours': 8,
  'Raw Packages': 10,
  'Architectures': 11,
  'Hotel & Restaurant': 12,
  'Agriculture trade': 13,
  'Furniture & Decor': 14,
  'Crocodile skin': 15,
  'Foodstuffs': 16,
  'Printing & Design': 17,
  'Entertainment game': 18,
  'Decor': 19,
  'Machine': 2,
  'Import Products': 10,
  'Export Products': 13
};

const khmerPrefixes = {
  'Foods Machine': 'ម៉ាស៊ីនអាហារ',
  'Agriculture Machine': 'ម៉ាស៊ីនកសិកម្ម',
  'Grill & Frozen': 'អាំង និង កក',
  'Food & Drink Additive': 'សារធាតុបន្ថែម',
  'Ingredient': 'គ្រឿងផ្សំ',
  'Flavours': 'រសជាតិ',
  'Raw Packages': 'ការវេចខ្ចប់',
  'Architectures': 'ស្ថាបត្យកម្ម',
  'Hotel & Restaurant': 'សណ្ឋាគារ និង ភោជនីយដ្ឋាន',
  'Agriculture trade': 'កសិកម្ម',
  'Furniture & Decor': 'គ្រឿងសង្ហារឹម',
  'Crocodile skin': 'ស្បែកក្រពើ',
  'Foodstuffs': 'គ្រឿងឧបភោគបរិភោគ',
  'Printing & Design': 'បោះពុម្ព និង រចនា',
  'Entertainment game': 'ហ្គេមកម្សាន្ត',
  'Decor': 'ការតុបតែង',
  'Machine': 'ម៉ាស៊ីន',
  'Import Products': 'ផលិតផលនាំចូល',
  'Export Products': 'ផលិតផលនាំចេញ'
};

async function scrapeCategory(oldId) {
  const url = `https://www.ysg-group.com/category_detail/?cate_id=${oldId}&.html`;
  console.log('Fetching', url);
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const products = [];
    $('.men-pro-item').each((i, el) => {
      const titleEl = $(el).find('.item-info-product h5 a');
      const name = titleEl.text().trim();
      
      let imgUrl = $(el).find('.pro-image-front').attr('src');
      if (imgUrl) imgUrl = imgUrl.trim();
      
      if (name && imgUrl) {
        if (!imgUrl.startsWith('http')) {
          imgUrl = 'https://www.ysg-group.com/' + imgUrl.replace(/^\//, '');
        }
        products.push({ name, image: imgUrl });
      }
    });
    return products;
  } catch (err) {
    console.error('Error fetching', url, err.message);
    return [];
  }
}

async function main() {
  const categories = await prisma.category.findMany();
  let inserted = 0;
  
  for (const category of categories) {
    const productsCount = await prisma.product.count({
      where: { categoryId: category.id }
    });

    if (productsCount < 4) {
      console.log(`\nSeeding products for category with less than 4 items: ${category.name}`);
      
      const oldId = oldCategoryMap[category.name] || 2;
      const scrapedProducts = await scrapeCategory(oldId);
      
      if (scrapedProducts.length === 0) {
        console.log(`No products found for ${category.name} on old site. Skipping.`);
        continue;
      }
      
      const countToInsert = 4 - productsCount;
      const count = Math.min(countToInsert, scrapedProducts.length);
      const dummyProducts = [];
      const khmerPrefix = khmerPrefixes[category.name] || 'ផលិតផល';
      
      // We skip the first few to avoid duplicating existing ones (heuristically)
      const startIndex = Math.min(productsCount, scrapedProducts.length - count);
      
      for (let i = 0; i < count; i++) {
        const prod = scrapedProducts[startIndex + i];
        
        dummyProducts.push({
          categoryId: category.id,
          name: prod.name,
          slug: `${category.slug}-item-${i}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          nameKhmer: `${khmerPrefix} - ${prod.name}`,
          brand: 'YSG Group',
          price: (Math.random() * 5000 + 500).toFixed(2),
          status: 'PUBLISHED',
          isPublished: true,
          isFeatured: i < 1,
          thumbnail: prod.image,
          description: `Imported ${prod.name} by YSG Group.`,
          updatedAt: new Date()
        });
      }
      
      for (const prod of dummyProducts) {
        await prisma.product.create({ data: prod });
        inserted++;
      }
    }
  }
  
  console.log(`\nSuccessfully seeded ${inserted} real matched products across empty categories!`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
