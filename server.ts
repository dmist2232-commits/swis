import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Pool } from 'pg';
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

// Initialize PostgreSQL Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dmist2232%40gmail.com:200732503140@sisaranew-sisara-en5m2b:5432/SISARA'
});

// Add error handler on pool to prevent the app from crashing on idle client errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Simple Schema Setup
const initDb = async (retries = 1) => {
  while (retries) {
    try {
      await pool.query('SELECT 1'); // Test connection
      await pool.query(`
        CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        category TEXT,
        name TEXT,
        description TEXT,
        price REAL,
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "orderNumber" INTEGER,
        "customerName" TEXT,
        phone TEXT,
        location TEXT,
        lat REAL,
        lng REAL,
        items TEXT, -- JSON string
        "extraNotes" TEXT,
        "extraFee" REAL DEFAULT 0,
        "deliveryCharge" REAL DEFAULT 0,
        total REAL,
        "paymentMethod" TEXT,
        status TEXT DEFAULT 'pending', -- pending, accepted, cancelled, cooking, onway, delivered
        "deliveryGuyNumber" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        "customerName" TEXT,
        rating INTEGER,
        comment TEXT,
        pinned INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Initialize default settings if not exist
    const defaultSettings = [
      { key: 'adminPassword', value: '200732503140' },
      { key: 'hostPassword', value: '132333435363' },
      { key: 'currentEvent', value: '' },
      { key: 'perKmRate', value: '100' },
      { key: 'firstKmRate', value: '150' },
      { key: 'shopPhone', value: '0112345678' },
      { key: 'payHereId', value: '' },
      { key: 'hostLat', value: '7.1652' },
      { key: 'hostLng', value: '80.0573' },
      { key: 'lastOrderNumber', value: '1000' },
      { key: 'banners', value: '[]' },
      { key: 'lastOrderDate', value: new Date().toISOString().split('T')[0] }
    ];

    const today = new Date().toISOString().split('T')[0];
    const dateSettingResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['lastOrderDate']);
    const dateSetting = dateSettingResult.rows[0];
    
    if (dateSetting && dateSetting.value !== today) {
      await pool.query('UPDATE settings SET value = $1 WHERE key = $2', [today, 'lastOrderDate']);
      await pool.query('UPDATE settings SET value = $1 WHERE key = $2', ['1000', 'lastOrderNumber']);
    }

    for (const setting of defaultSettings) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [setting.key, setting.value]
      );
    }
    console.log("Database initialized successfully");
    break; // Success, exit loop
  } catch (err: any) {
    console.error(`Database connection failed. Retries left: ${retries - 1}`, err.message);
    retries -= 1;
    if (retries === 0) {
      console.error("Could not connect to database. Please check DATABASE_URL.");
    } else {
      // Wait for 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}
};

initDb();

// Helper to broadcast state changes
const broadcastOrders = async () => {
  const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
  io.emit('orders_updated', result.rows);
};

const broadcastMenu = async () => {
  const result = await pool.query('SELECT * FROM menu_items');
  io.emit('menu_updated', result.rows);
};

const broadcastSettings = async () => {
  const result = await pool.query('SELECT * FROM settings');
  const settingsObj = result.rows.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  io.emit('settings_updated', settingsObj);
};

const broadcastFeedbacks = async () => {
  const result = await pool.query('SELECT * FROM feedbacks ORDER BY id DESC');
  io.emit('feedbacks_updated', result.rows);
};

// API Routes
app.get('/api/state', async (req, res) => {
  try {
    const ordersRes = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    const menuRes = await pool.query('SELECT * FROM menu_items');
    const settingsRes = await pool.query('SELECT * FROM settings');
    const feedbacksRes = await pool.query('SELECT * FROM feedbacks ORDER BY id DESC');

    const settings = settingsRes.rows.reduce((acc: any, curr: any) => {
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
    // Return empty state for preview environment gracefully
    res.json({ 
      orders: [], 
      menu: [], 
      settings: {
        lastOrderDate: new Date().toISOString().split('T')[0],
        lastOrderNumber: '1000'
      }, 
      feedbacks: [] 
    });
  }
});

// Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, location, lat, lng, items, extraNotes, deliveryCharge, total, paymentMethod } = req.body;
    
    const today = new Date().toISOString().split('T')[0];
    const dateRowRes = await pool.query("SELECT value FROM settings WHERE key = 'lastOrderDate'");
    const dateRow = dateRowRes.rows[0];
    
    if (dateRow && dateRow.value !== today) {
      await pool.query("UPDATE settings SET value = $1 WHERE key = 'lastOrderDate'", [today]);
      await pool.query("UPDATE settings SET value = '1000' WHERE key = 'lastOrderNumber'");
    }
    
    const currentNumberRowRes = await pool.query("SELECT value FROM settings WHERE key = 'lastOrderNumber'");
    const currentNumberRow = currentNumberRowRes.rows[0];
    const newOrderNumber = parseInt(currentNumberRow ? currentNumberRow.value : '1000') + 1;
    
    await pool.query("UPDATE settings SET value = $1 WHERE key = 'lastOrderNumber'", [newOrderNumber.toString()]);
    
    await pool.query(`
      INSERT INTO orders 
      ("orderNumber", "customerName", phone, location, lat, lng, items, "extraNotes", "deliveryCharge", total, "paymentMethod")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
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
    ]);
    
    broadcastOrders();
    io.emit('new_order_alert', { orderNumber: newOrderNumber });
    res.json({ success: true, orderNumber: newOrderNumber });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update Order
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { status, extraFee, deliveryGuyNumber } = req.body;
    const updates = [];
    const values = [];
    let queryIndex = 1;
    
    if (status !== undefined) {
      updates.push(`status = $${queryIndex++}`);
      values.push(status);
    }
    if (extraFee !== undefined) {
      updates.push(`"extraFee" = $${queryIndex++}`);
      values.push(extraFee);
    }
    if (deliveryGuyNumber !== undefined) {
      updates.push(`"deliveryGuyNumber" = $${queryIndex++}`);
      values.push(deliveryGuyNumber);
    }
    
    if (updates.length > 0) {
      values.push(req.params.id);
      await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = $${queryIndex}`, values);
      broadcastOrders();
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Menu Management
app.post('/api/menu', async (req, res) => {
  try {
    const { category, name, description, price, image } = req.body;
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
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    broadcastMenu();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

// Settings Management
app.post('/api/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    await pool.query('UPDATE settings SET value = $1 WHERE key = $2', [value, key]);
    broadcastSettings();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Feedback Management
app.post('/api/feedbacks', async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;
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
    await pool.query('DELETE FROM feedbacks WHERE id = $1', [req.params.id]);
    broadcastFeedbacks();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
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
