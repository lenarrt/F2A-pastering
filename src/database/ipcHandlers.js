const { ipcMain } = require('electron')
const db = require('./database.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'f2a-plastering-secret-key'

// ============ AUTH ============
ipcMain.handle('auth:login', (event, { username, password }) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    const validPassword = bcrypt.compareSync(password, user.password)
    
    if (!validPassword) {
      return { success: false, message: 'Invalid password' }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ USERS ============
ipcMain.handle('users:getAll', () => {
  try {
    const users = db.prepare('SELECT id, name, username, role, created_at FROM users').all()
    return { success: true, data: users }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('users:create', (event, { name, username, password, role }) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10)
    const result = db.prepare(
      'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, username, hashedPassword, role)
    return { success: true, id: result.lastInsertRowid }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('users:update', (event, { id, name, username, role, password }) => {
  try {
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10)
      db.prepare(
        'UPDATE users SET name = ?, username = ?, role = ?, password = ? WHERE id = ?'
      ).run(name, username, role, hashedPassword, id)
    } else {
      db.prepare(
        'UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?'
      ).run(name, username, role, id)
    }
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('users:delete', (event, id) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id)
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ CATEGORIES ============
ipcMain.handle('categories:getAll', () => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all()
    return { success: true, data: categories }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('categories:create', (event, { name }) => {
  try {
    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name)
    return { success: true, id: result.lastInsertRowid }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ PRODUCTS ============
ipcMain.handle('products:getAll', () => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `).all()
    return { success: true, data: products }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('products:create', (event, { name, barcode, category_id, price, stock, low_stock_threshold, unit }) => {
  try {
    const result = db.prepare(`
      INSERT INTO products (name, barcode, category_id, price, stock, low_stock_threshold, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, barcode, category_id, price, stock, low_stock_threshold, unit)
    return { success: true, id: result.lastInsertRowid }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('products:update', (event, { id, name, barcode, category_id, price, stock, low_stock_threshold, unit }) => {
  try {
    db.prepare(`
      UPDATE products SET name = ?, barcode = ?, category_id = ?, price = ?, 
      stock = ?, low_stock_threshold = ?, unit = ? WHERE id = ?
    `).run(name, barcode, category_id, price, stock, low_stock_threshold, unit, id)
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('products:delete', (event, id) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id)
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ SALES ============
ipcMain.handle('sales:create', (event, { user_id, total, items }) => {
  try {
    // Use a transaction so everything saves or nothing does
    const createSale = db.transaction(() => {
      const sale = db.prepare(
        'INSERT INTO sales (user_id, total) VALUES (?, ?)'
      ).run(user_id, total)

      for (const item of items) {
        db.prepare(
          'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        ).run(sale.lastInsertRowid, item.product_id, item.quantity, item.price)

        // Deduct stock
        db.prepare(
          'UPDATE products SET stock = stock - ? WHERE id = ?'
        ).run(item.quantity, item.product_id)
      }

      return sale.lastInsertRowid
    })

    const saleId = createSale()
    return { success: true, id: saleId }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('sales:getAll', () => {
  try {
    const sales = db.prepare(`
      SELECT s.*, u.name as cashier_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `).all()

    // Get items for each sale
    const salesWithItems = sales.map(sale => {
      const items = db.prepare(`
        SELECT si.*, p.name as product_name
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `).all(sale.id)
      return { ...sale, items }
    })

    return { success: true, data: salesWithItems }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ RESTOCK ============
ipcMain.handle('restock:create', (event, { product_id, quantity, note }) => {
  try {
    const restock = db.transaction(() => {
      db.prepare(
        'INSERT INTO restock_log (product_id, quantity, note) VALUES (?, ?, ?)'
      ).run(product_id, quantity, note)

      db.prepare(
        'UPDATE products SET stock = stock + ? WHERE id = ?'
      ).run(quantity, product_id)
    })

    restock()
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('restock:getAll', () => {
  try {
    const logs = db.prepare(`
      SELECT r.*, p.name as product_name
      FROM restock_log r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `).all()
    return { success: true, data: logs }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ SETTINGS ============
ipcMain.handle('settings:getAll', () => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all()
    const settingsObj = {}
    settings.forEach(s => settingsObj[s.key] = s.value)
    return { success: true, data: settingsObj }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('settings:update', (event, { key, value }) => {
  try {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})