const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace state
code = code.replace(/app\.get\('\/api\/state', async \(req, res\) => {[\s\S]*?}\);/, `app.get('/api/state', async (req, res) => {
  if (!isDbConnected) {
    return res.json({
      orders: inMemoryState.orders,
      menu: inMemoryState.menu_items,
      settings: inMemoryState.settings,
      feedbacks: inMemoryState.feedbacks
    });
  }
  try {
    const ordersRes = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    const menuRes = await pool.query('SELECT * FROM menu_items');
    const settingsRes = await pool.query('SELECT * FROM settings');
    const feedbacksRes = await pool.query('SELECT * FROM feedbacks ORDER BY id DESC');
    const settings = settingsRes.rows.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json({ 
      orders: ordersRes.rows, 
      menu: menuRes.rows, 
      settings, 
      feedbacks: feedbacksRes.rows 
    });
  } catch (error) {
    console.error("Error fetching state:", error);
    res.json({ orders: [], menu: [], settings: {}, feedbacks: [] });
  }
});`);

// broadcast wrappers
code = code.replace(/const broadcastOrders = async \(\) => {[\s\S]*?};/, `const broadcastOrders = async () => {
  if (!isDbConnected) {
    io.emit('orders_updated', inMemoryState.orders);
    return;
  }
  const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
  io.emit('orders_updated', result.rows);
};`);

code = code.replace(/const broadcastMenu = async \(\) => {[\s\S]*?};/, `const broadcastMenu = async () => {
  if (!isDbConnected) {
    io.emit('menu_updated', inMemoryState.menu_items);
    return;
  }
  const result = await pool.query('SELECT * FROM menu_items');
  io.emit('menu_updated', result.rows);
};`);

code = code.replace(/const broadcastSettings = async \(\) => {[\s\S]*?};/, `const broadcastSettings = async () => {
  if (!isDbConnected) {
    io.emit('settings_updated', inMemoryState.settings);
    return;
  }
  const result = await pool.query('SELECT * FROM settings');
  const settingsObj = result.rows.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  io.emit('settings_updated', settingsObj);
};`);

fs.writeFileSync('server.ts', code);
