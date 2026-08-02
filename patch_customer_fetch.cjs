const fs = require('fs');
let code = fs.readFileSync('src/CustomerApp.tsx', 'utf8');

code = code.replace(
`      if (placedOrderNumber) {
        await fetch('/api/orders/' + placedOrderNumber, {`,
`      const orderId = orders.find(o => o.orderNumber === placedOrderNumber)?.id;
      if (orderId) {
        await fetch('/api/orders/' + orderId, {`
);

code = code.replace(
`    if (placedOrderNumber) {
        await fetch('/api/orders/' + placedOrderNumber, {`,
`    const orderId = orders.find(o => o.orderNumber === placedOrderNumber)?.id;
    if (orderId) {
        await fetch('/api/orders/' + orderId, {`
);

fs.writeFileSync('src/CustomerApp.tsx', code);
