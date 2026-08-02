const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.get\('\/api\/state', async \(req, res\) => {[\s\S]*?}\);[\s\S]*?}\);/g;

code = code.replace(regex, `app.get('/api/state', async (req, res) => {
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

fs.writeFileSync('server.ts', code);
