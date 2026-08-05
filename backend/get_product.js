const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ysg' });
client.connect().then(async () => {
  const res = await client.query('SELECT id FROM "Product" LIMIT 1');
  console.log(res.rows[0]);
  client.end();
}).catch(console.error);
