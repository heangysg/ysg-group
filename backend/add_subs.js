const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
  const parentId = '9bdd8301-6a26-4506-bf68-64bb6acac9eb';

  const subs = [
    {
      id: crypto.randomUUID(),
      name: 'Box Packaging',
      nameKhmer: 'ការវេចខ្ចប់ប្រអប់',
      slug: 'box-packaging',
      parentId: parentId,
      isActive: true,
      sortOrder: 1,
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Plastic Bags',
      nameKhmer: 'ថង់ប្លាស្ទិក',
      slug: 'plastic-bags',
      parentId: parentId,
      isActive: true,
      sortOrder: 2,
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Glass Bottles',
      nameKhmer: 'ដបកែវ',
      slug: 'glass-bottles',
      parentId: parentId,
      isActive: true,
      sortOrder: 3,
      updatedAt: new Date(),
    }
  ];

  for (const sub of subs) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: sub,
    });
  }

  console.log("Subcategories added successfully to Raw Packages");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
