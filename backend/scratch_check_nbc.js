const { Pool } = require('pg');
require('dotenv').config({ path: 'd:\\ysg-project -the sis\\ysg-machinery\\backend\\.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const { rows } = await pool.query('SELECT id, "totalAmount", status, "bakongMd5" FROM "Order" WHERE "paymentMethod" = \'Bakong\' ORDER BY "createdAt" DESC LIMIT 1');
  if (rows.length === 0) { console.log('No Bakong orders found'); return; }
  const order = rows[0];
  console.log('Latest Order:', order);

  if (!order.bakongMd5) {
    console.log('No MD5 for this order'); return;
  }

  const token = process.env.BAKONG_TOKEN;
  const url = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5'; // Force production URL

  console.log('Checking URL:', url);
  console.log('With MD5:', order.bakongMd5);

  try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ md5: order.bakongMd5 })
      });
      
      const text = await res.text();
      console.log('NBC API Response:', text);
  } catch(e) {
      console.error("Fetch failed", e);
  }
}
check().then(() => pool.end()).catch(console.error);
