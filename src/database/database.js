const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

const dbPath = path.join(app.getPath('userData'), 'f2a-plastering.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

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

  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Sales table — updated with new columns
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_id INTEGER,
      customer_name TEXT,
      total REAL NOT NULL,
      discount_total REAL NOT NULL DEFAULT 0,
      sale_type TEXT NOT NULL DEFAULT 'sale' 
        CHECK(sale_type IN ('sale', 'internal')),
      payment_status TEXT NOT NULL DEFAULT 'paid'
        CHECK(payment_status IN ('paid', 'pending', 'voided')),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `)

  // Sale items table — updated with discount
  db.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      discount_type TEXT DEFAULT NULL
        CHECK(discount_type IN ('percent', 'fixed', NULL)),
      discount_value REAL DEFAULT 0,
      final_price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)

  // Internal use log
  db.exec(`
    CREATE TABLE IF NOT EXISTS internal_use_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // Internal use items
  db.exec(`
    CREATE TABLE IF NOT EXISTS internal_use_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (log_id) REFERENCES internal_use_log(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)

  // Restock log table
  db.exec(`
  CREATE TABLE IF NOT EXISTS restock_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    buying_price REAL DEFAULT NULL,
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

  // Default settings
  db.exec(`
    INSERT OR IGNORE INTO settings (key, value) VALUES
    ('business_name', 'F2A Plastering'),
    ('receipt_footer', 'Thank you for your business!'),
    ('tax_rate', '0')
  `)

  // Default owner account
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
module.exports.dbPath = dbPath