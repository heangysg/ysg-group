const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testUpload() {
  const API_URL = 'http://localhost:5000';
  const token = jwt.sign(
    { id: 1, email: 'admin@ysggroup.com', isSuperAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const res = await fetch(`${API_URL}/api/admin/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ image })
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

testUpload().catch(console.error);
