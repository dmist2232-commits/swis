const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`app.patch('/api/orders/:id', async (req, res) => {`,
`app.delete('/api/orders/clear', async (req, res) => {
  try {
    await pool.query("DELETE FROM orders WHERE status = 'delivered' OR status = 'cancelled' OR status = 'rejected'");
    broadcastOrders();
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing orders:", error);
    res.status(500).json({ error: "Failed to clear orders" });
  }
});\n\napp.patch('/api/orders/:id', async (req, res) => {`
);

fs.writeFileSync('server.ts', code);
