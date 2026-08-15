const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(client => {
    let query = 'SELECT * FROM "Product" WHERE "isPublished" = true ORDER BY "createdAt" DESC';
    return client.query(query)
      .then(res => console.log('Products:', res.rows.length))
      .finally(() => client.release());
  })
  .catch(err => console.error('Error connecting or querying:', err))
  .finally(() => pool.end());
