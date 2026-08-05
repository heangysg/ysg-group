const fetch = require('node-fetch'); // wait, I don't need node-fetch if I use native fetch in node 24

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/admin/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: "Order", select: "totalAmount, status, createdAt", countExact: true })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}
test();
