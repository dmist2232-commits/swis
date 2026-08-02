const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/app\.post\('\/api\/menu', async \(req, res\) => {[\s\S]*?}\);/, `app.post('/api/menu', async (req, res) => {
  try {
    const { category, name, description, price, image } = req.body;
    if (!isDbConnected) {
      const id = inMemoryState.menu_items.length + 1;
      inMemoryState.menu_items.push({ id, category, name, description, price: parseFloat(price), image: image || '' });
      broadcastMenu();
      return res.json({ success: true });
    }
    await pool.query(
      'INSERT INTO menu_items (category, name, description, price, image) VALUES ($1, $2, $3, $4, $5)',
      [category, name, description, parseFloat(price), image || '']
    );
    broadcastMenu();
    res.json({ success: true });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ error: "Failed to add menu item" });
  }
});`);

code = code.replace(/app\.delete\('\/api\/menu\/:id', async \(req, res\) => {[\s\S]*?}\);/, `app.delete('/api/menu/:id', async (req, res) => {
  try {
    if (!isDbConnected) {
      inMemoryState.menu_items = inMemoryState.menu_items.filter(item => item.id !== parseInt(req.params.id));
      broadcastMenu();
      return res.json({ success: true });
    }
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    broadcastMenu();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});`);

fs.writeFileSync('server.ts', code);
