const { Client } = require('pg');
require('dotenv').config();

const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => c.query('SELECT * FROM "Setting"'))
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => c.end());
