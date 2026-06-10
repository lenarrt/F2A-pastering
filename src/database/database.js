const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

// Store the database in the user's app data folder
const dbPath = path.join(app.getPath('userData'), 'f2a-plastering.db')
const db = new Database(dbPath)

// Enable foreign keys for data integrity
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create all tables
const initDatabase = () => {

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('owner', 'cashier')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      barcode TEXT UNIQUE,
      category_id INTEGER,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 10,
      unit TEXT NOT NULL DEFAULT 'unit',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `)

  // Sales table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // Sale items table (each product in a sale)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)

  // Restock log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS restock_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  // Insert default settings
  db.exec(`
    INSERT OR IGNORE INTO settings (key, value) VALUES
    ('business_name', 'F2A Plastering'),
    ('receipt_footer', 'Thank you for your business!'),
    ('tax_rate', '0')
  `)

  // Insert default owner account
  // Password is "owner123" - we will change this later
  const bcrypt = require('bcryptjs')
  const hashedPassword = bcrypt.hashSync('owner123', 10)
  
  db.prepare(`
    INSERT OR IGNORE INTO users (name, username, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Owner', 'owner', hashedPassword, 'owner')

  console.log('Database initialized successfully')
}

initDatabase()

module.exports = db