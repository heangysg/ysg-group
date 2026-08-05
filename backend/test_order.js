const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  return client.query('SELECT count(*) FROM "Order"');
}).then(res => {
  console.log("Orders count:", res.rows[0].count);
  return client.query('SELECT "totalAmount" FROM "Order"');
}).then(res => {
  console.log("totalAmount rows:", res.rows);
  client.end();
}).catch(console.error);
