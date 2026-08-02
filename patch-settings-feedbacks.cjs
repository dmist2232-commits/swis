const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const patchCode = `
app.post('/api/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!isDbConnected) {
      inMemoryState.settings[key] = value;
      broadcastSettings();
      return res.json({ success: true });
    }
    await pool.query('UPDATE settings SET value = $1 WHERE key = $2', [value, key]);
    broadcastSettings();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

app.post('/api/feedbacks', async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;
    if (!isDbConnected) {
      const id = inMemoryState.feedbacks.length > 0 ? Math.max(...inMemoryState.feedbacks.map(f => f.id)) + 1 : 1;
      inMemoryState.feedbacks.push({ id, customerName, rating, comment, pinned: 0, createdAt: new Date().toISOString() });
      broadcastFeedbacks();
      return res.json({ success: true });
    }
    await pool.query(
      'INSERT INTO feedbacks ("customerName", rating, comment) VALUES ($1, $2, $3)',
      [customerName, rating, comment]
    );
    broadcastFeedbacks();
    res.json({ success: true });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ error: "Failed to add feedback" });
  }
});

app.patch('/api/feedbacks/:id', async (req, res) => {
  try {
    const { pinned } = req.body;
    if (pinned !== undefined) {
      if (!isDbConnected) {
        const feedback = inMemoryState.feedbacks.find(f => f.id === parseInt(req.params.id));
        if (feedback) {
          feedback.pinned = pinned ? 1 : 0;
          broadcastFeedbacks();
        }
        return res.json({ success: true });
      }
      await pool.query('UPDATE feedbacks SET pinned = $1 WHERE id = $2', [pinned ? 1 : 0, req.params.id]);
      broadcastFeedbacks();
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ error: "Failed to update feedback" });
  }
});

app.delete('/api/feedbacks/:id', async (req, res) => {
  try {
    if (!isDbConnected) {
      inMemoryState.feedbacks = inMemoryState.feedbacks.filter(f => f.id !== parseInt(req.params.id));
      broadcastFeedbacks();
      return res.json({ success: true });
    }
    await pool.query('DELETE FROM feedbacks WHERE id = $1', [req.params.id]);
    broadcastFeedbacks();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});
`;

code = code.replace(/app\.post\('\/api\/settings', async \(req, res\) => {[\s\S]*?}\);[\s\S]*?app\.post\('\/api\/feedbacks', async \(req, res\) => {[\s\S]*?}\);[\s\S]*?app\.patch\('\/api\/feedbacks\/:id', async \(req, res\) => {[\s\S]*?}\);[\s\S]*?app\.delete\('\/api\/feedbacks\/:id', async \(req, res\) => {[\s\S]*?}\);/g, patchCode);

fs.writeFileSync('server.ts', code);
