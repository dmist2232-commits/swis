const fetch = require('node-fetch');
fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({customerName:"Test",phone:"0112345678",location:"Test",items:[{name:"Test",price:100}],total:100,paymentMethod:"cash"})
}).then(res => res.json()).then(console.log);
