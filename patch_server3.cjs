const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`    res.json({ success: true, orderNumber: newOrderNumber });`,
`    const latestOrder = await pool.query('SELECT id FROM orders WHERE "orderNumber" = $1 ORDER BY id DESC LIMIT 1', [newOrderNumber]);
    const id = latestOrder.rows[0]?.id;
    res.json({ success: true, orderNumber: newOrderNumber, orderId: id });`
);

fs.writeFileSync('server.ts', code);
