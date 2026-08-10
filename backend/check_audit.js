const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const logs = await prisma.$queryRaw`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5`;
  console.log(logs);
}
check().finally(() => prisma.$disconnect());
