import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');

// Simple Schema Setup
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    description TEXT,
    price REAL,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNumber INTEGER,
    customerName TEXT,
    phone TEXT,
    location TEXT,
    lat REAL,
    lng REAL,
    items TEXT, -- JSON string
    extraNotes TEXT,
    extraFee REAL DEFAULT 0,
    deliveryCharge REAL DEFAULT 0,
    total REAL,
    paymentMethod TEXT,
    status TEXT DEFAULT 'pending', -- pending, accepted, cancelled, cooking, onway, delivered
    deliveryGuyNumber TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    rating INTEGER,
    comment TEXT,
    pinned INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize default settings if not exist
const initSettings = () => {
  const settings = [
    { key: 'adminPassword', value: '200732503140' },
    { key: 'hostPassword', value: '132333435363' },
    { key: 'currentEvent', value: '' },
    { key: 'perKmRate', value: '100' },
    { key: 'firstKmRate', value: '150' },
    { key: 'shopPhone', value: '0112345678' },
    { key: 'payHereId', value: '' },
    { key: 'hostLat', value: '7.1652' }, // roughly Veyangoda
    { key: 'hostLng', value: '80.0573' },
    { key: 'lastOrderNumber', value: '1000' },
    { key: 'banners', value: '[]' },
    { key: 'lastOrderDate', value: new Date().toISOString().split('T')[0] }
  ];
  const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  const update = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
  
  const today = new Date().toISOString().split('T')[0];
  const dateSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('lastOrderDate') as { value: string } | undefined;
  
  if (dateSetting && dateSetting.value !== today) {
    update.run(today, 'lastOrderDate');
    update.run('1000', 'lastOrderNumber');
  }

  for (const setting of settings) {
    insert.run(setting.key, setting.value);
  }
};
initSettings();

// Helper to broadcast state changes
const broadcastOrders = () => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  io.emit('orders_updated', orders);
};

const broadcastMenu = () => {
  const menu = db.prepare('SELECT * FROM menu_items').all();
  io.emit('menu_updated', menu);
};

const broadcastSettings = () => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const settingsObj = settings.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  io.emit('settings_updated', settingsObj);
};

const broadcastFeedbacks = () => {
  const feedbacks = db.prepare('SELECT * FROM feedbacks ORDER BY id DESC').all();
  io.emit('feedbacks_updated', feedbacks);
};

// API Routes
app.get('/api/state', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const menu = db.prepare('SELECT * FROM menu_items').all();
  const settings = db.prepare('SELECT * FROM settings').all().reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  const feedbacks = db.prepare('SELECT * FROM feedbacks ORDER BY id DESC').all();
  res.json({ orders, menu, settings, feedbacks });
});

// Create Order
app.post('/api/orders', (req, res) => {
  const { customerName, phone, location, lat, lng, items, extraNotes, deliveryCharge, total, paymentMethod } = req.body;
  
  const today = new Date().toISOString().split('T')[0];
  const dateRow = db.prepare("SELECT value FROM settings WHERE key = 'lastOrderDate'").get() as any;
  if (dateRow.value !== today) {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'lastOrderDate'").run(today);
    db.prepare("UPDATE settings SET value = '1000' WHERE key = 'lastOrderNumber'").run();
  }
  
  const currentNumberRow = db.prepare("SELECT value FROM settings WHERE key = 'lastOrderNumber'").get() as any;
  const newOrderNumber = parseInt(currentNumberRow.value) + 1;
  db.prepare("UPDATE settings SET value = ? WHERE key = 'lastOrderNumber'").run(newOrderNumber.toString());

  const stmt = db.prepare(`
    INSERT INTO orders 
    (orderNumber, customerName, phone, location, lat, lng, items, extraNotes, deliveryCharge, total, paymentMethod)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    newOrderNumber,
    customerName,
    phone,
    location,
    lat || 0,
    lng || 0,
    JSON.stringify(items),
    extraNotes || '',
    deliveryCharge || 0,
    total || 0,
    paymentMethod
  );
  
  broadcastOrders();
  io.emit('new_order_alert', { orderNumber: newOrderNumber });
  res.json({ success: true, orderNumber: newOrderNumber });
});

// Update Order
app.patch('/api/orders/:id', (req, res) => {
  const { status, extraFee, deliveryGuyNumber } = req.body;
  const updates = [];
  const values = [];
  
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  if (extraFee !== undefined) {
    updates.push('extraFee = ?');
    values.push(extraFee);
  }
  if (deliveryGuyNumber !== undefined) {
    updates.push('deliveryGuyNumber = ?');
    values.push(deliveryGuyNumber);
  }
  
  if (updates.length > 0) {
    values.push(req.params.id);
    db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    broadcastOrders();
  }
  res.json({ success: true });
});

// Menu Management
app.post('/api/menu', (req, res) => {
  const { category, name, description, price, image } = req.body;
  db.prepare('INSERT INTO menu_items (category, name, description, price, image) VALUES (?, ?, ?, ?, ?)')
    .run(category, name, description, parseFloat(price), image || '');
  broadcastMenu();
  res.json({ success: true });
});

app.delete('/api/menu/:id', (req, res) => {
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  broadcastMenu();
  res.json({ success: true });
});

// Settings Management
app.post('/api/settings', (req, res) => {
  const { key, value } = req.body;
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(value, key);
  broadcastSettings();
  res.json({ success: true });
});

// Feedback Management
app.post('/api/feedbacks', (req, res) => {
  const { customerName, rating, comment } = req.body;
  db.prepare('INSERT INTO feedbacks (customerName, rating, comment) VALUES (?, ?, ?)')
    .run(customerName, rating, comment);
  broadcastFeedbacks();
  res.json({ success: true });
});

app.patch('/api/feedbacks/:id', (req, res) => {
  const { pinned } = req.body;
  if (pinned !== undefined) {
    db.prepare('UPDATE feedbacks SET pinned = ? WHERE id = ?').run(pinned ? 1 : 0, req.params.id);
    broadcastFeedbacks();
  }
  res.json({ success: true });
});

app.delete('/api/feedbacks/:id', (req, res) => {
  db.prepare('DELETE FROM feedbacks WHERE id = ?').run(req.params.id);
  broadcastFeedbacks();
  res.json({ success: true });
});

// Vite Middleware for development / Static files for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
