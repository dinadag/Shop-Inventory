const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'db.sqlite');
const db = new Database(dbPath);

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    stock INTEGER
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    payment_method TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_name TEXT,
    price REAL,
    quantity INTEGER
  );
`);

// Create a default admin if none exists
const admin = db.prepare("SELECT * FROM users WHERE email = 'admin@example.com'").get();
if (!admin) {
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run('admin@example.com', 'password', 'admin');
}

// --- AUTH ROUTES ---
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  try {
    const info = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, password);
    const user = { id: info.lastInsertRowid, email, role: 'user' };
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
  
  if (user) {
    res.json(user); // Send the user object back, which will act as our "token" in localStorage
  } else {
    res.status(400).json({ error: 'Invalid email or password' });
  }
});

// --- PRODUCT ROUTES ---
app.get('/products', (req, res) => {
  const { search } = req.query;
  if (search) {
    const products = db.prepare("SELECT * FROM products WHERE name LIKE ?").all(`%${search}%`);
    res.json(products);
  } else {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  }
});

app.post('/products', (req, res) => {
  // We trust the frontend to only show this button to admins
  const { name, description, price, stock } = req.body;
  const info = db.prepare("INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)").run(name, description, price, stock);
  res.json({ id: info.lastInsertRowid, name, description, price, stock });
});

app.delete('/products/:id', (req, res) => {
  const id = req.params.id;
  // Simple delete. We save product_name in order_items now, so deleting this won't break order history!
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  res.json({ success: true });
});

// --- ORDER ROUTES ---
app.post('/orders', (req, res) => {
  const { userId, items, paymentMethod } = req.body;
  
  let total = 0;
  items.forEach(item => {
    total += item.price * item.quantity;
    db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(item.quantity, item.id);
  });

  const orderInfo = db.prepare("INSERT INTO orders (user_id, total, payment_method) VALUES (?, ?, ?)").run(userId, total, paymentMethod);
  const orderId = orderInfo.lastInsertRowid;

  items.forEach(item => {
    db.prepare("INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)").run(orderId, item.name, item.price, item.quantity);
  });

  res.json({ success: true });
});

app.get('/orders', (req, res) => {
  const userId = req.query.userId;
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ?").all(userId);
  
  const ordersWithItems = orders.map(order => {
    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
    order.items = items;
    return order;
  });

  res.json(ordersWithItems);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Simple API running on http://localhost:${PORT}`);
});
