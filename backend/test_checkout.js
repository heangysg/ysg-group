const fs = require('fs');
fetch('http://localhost:5000/api/orders/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'Test No Email',
    customerPhone: '123456789',
    customerEmail: '',
    address: '123 Test St',
    paymentMethod: 'Bakong',
    items: [{ id: '40b7bba5-53de-4932-b26a-32a0c1b98f64', quantity: 1, name: 'Test Product', price: 10 }]
  })
}).then(async r => {
  console.log("Status:", r.status);
  console.log("Body:", await r.text());
}).catch(e => console.error(e));
