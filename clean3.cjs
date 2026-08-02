const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sIdx = code.indexOf("// API Routes");
const eIdx = code.indexOf("// Vite Middleware for development");
const before = code.substring(0, sIdx);
const after = code.substring(eIdx);

const newRoutes = `// API Routes

app.get('/api/state', async (req, res) => {
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
});

// Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, location, lat, lng, items, extraNotes, deliveryCharge, total, paymentMethod } = req.body;
    
    if (!isDbConnected) {
      const today = new Date().toISOString().split('T')[0];
      if (inMemoryState.settings.lastOrderDate !== today) {
        inMemoryState.settings.lastOrderDate = today;
        inMemoryState.settings.lastOrderNumber = '1000';
        inMemoryState.orders = inMemoryState.orders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.status));
      }
      
      const newOrderNumber = parseInt(inMemoryState.settings.lastOrderNumber || '1000') + 1;
      inMemoryState.settings.lastOrderNumber = newOrderNumber.toString();
      
      const newOrder = {
        id: inMemoryState.orders.length > 0 ? Math.max(...inMemoryState.orders.map(o => o.id)) + 1 : 1,
        orderNumber: newOrderNumber,
        customerName, phone, location, lat: lat || 0, lng: lng || 0,
        items: JSON.stringify(items),
        extraNotes: extraNotes || '',
        deliveryCharge: deliveryCharge || 0,
        total: total || 0,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      inMemoryState.orders.push(newOrder);
      broadcastOrders();
      io.emit('new_order_alert', { orderNumber: newOrderNumber });
      return res.json({ success: true, orderNumber: newOrderNumber, orderId: newOrder.id });
    }

    const today = new Date().toISOString().split('T')[0];
    const dateRowRes = await pool.query("SELECT value FROM settings WHERE key = 'lastOrderDate'");
    const dateRow = dateRowRes.rows[0];
    
    if (dateRow && dateRow.value !== today) {
      await pool.query("UPDATE settings SET value = $1 WHERE key = 'lastOrderDate'", [today]);
      await pool.query("UPDATE settings SET value = '1000' WHERE key = 'lastOrderNumber'");
      await pool.query("DELETE FROM orders WHERE status = 'delivered' OR status = 'cancelled' OR status = 'rejected'");
    }
    
    const currentNumberRowRes = await pool.query("SELECT value FROM settings WHERE key = 'lastOrderNumber'");
    const currentNumberRow = currentNumberRowRes.rows[0];
    const newOrderNumber = parseInt(currentNumberRow ? currentNumberRow.value : '1000') + 1;
    
    await pool.query("UPDATE settings SET value = $1 WHERE key = 'lastOrderNumber'", [newOrderNumber.toString()]);
    
    await pool.query(\`
      INSERT INTO orders 
      ("orderNumber", "customerName", phone, location, lat, lng, items, "extraNotes", "deliveryCharge", total, "paymentMethod")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    \`, [
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
    const latestOrder = await pool.query('SELECT id FROM orders WHERE "orderNumber" = $1 ORDER BY id DESC LIMIT 1', [newOrderNumber]);
    const id = latestOrder.rows[0]?.id;
    res.json({ success: true, orderNumber: newOrderNumber, orderId: id });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.delete('/api/orders/clear', async (req, res) => {
  try {
    if (!isDbConnected) {
      inMemoryState.orders = inMemoryState.orders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.status));
      broadcastOrders();
      return res.json({ success: true });
    }
    await pool.query("DELETE FROM orders WHERE status = 'delivered' OR status = 'cancelled' OR status = 'rejected'");
    broadcastOrders();
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing orders:", error);
    res.status(500).json({ error: "Failed to clear orders" });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { status, extraFee, deliveryGuyNumber } = req.body;
    
    if (!isDbConnected) {
      const order = inMemoryState.orders.find(o => o.id === parseInt(req.params.id));
      if (order) {
        if (status !== undefined) order.status = status;
        if (extraFee !== undefined) order.extraFee = extraFee;
        if (deliveryGuyNumber !== undefined) order.deliveryGuyNumber = deliveryGuyNumber;
        broadcastOrders();
      }
      return res.json({ success: true });
    }

    const updates = [];
    const values = [];
    let queryIndex = 1;
    
    if (status !== undefined) {
      updates.push(\`status = $\${queryIndex++}\`);
      values.push(status);
    }
    if (extraFee !== undefined) {
      updates.push(\`"extraFee" = $\${queryIndex++}\`);
      values.push(extraFee);
    }
    if (deliveryGuyNumber !== undefined) {
      updates.push(\`"deliveryGuyNumber" = $\${queryIndex++}\`);
      values.push(deliveryGuyNumber);
    }
    
    if (updates.length > 0) {
      values.push(req.params.id);
      await pool.query(\`UPDATE orders SET \${updates.join(', ')} WHERE id = $\${queryIndex}\`, values);
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
});

app.delete('/api/menu/:id', async (req, res) => {
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
});

// Settings Management
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

// Feedback Management
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

fs.writeFileSync('server.ts', before + newRoutes + after);
