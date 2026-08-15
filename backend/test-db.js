const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/ysg_machinery' });

client.connect()
  .then(() => client.query('SELECT * FROM "Product" WHERE "isPublished" = true LIMIT 1'))
  .then(res => console.log('Rows:', res.rows.length))
  .catch(err => console.error('DB Error:', err))
  .finally(() => client.end());
