const { ipcMain } = require('electron')
const db = require('./database.js')
const dbPath = db.dbPath
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// TODO: move this to an env var (e.g. process.env.JWT_SECRET) before sharing the build
const JWT_SECRET = 'lista-secret-key'

// ============ AUTH ============
ipcMain.handle('auth:login', (event, { username, password }) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    if (!user) return { success: false, message: 'User not found' }
    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) return { success: false, message: 'Invalid password' }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    )
    return {
      success: true, token,
      user: { id: user.id, name: user.name, username: user.username, role: user.role }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ USERS ============
ipcMain.handle('users:getAll', () => {
  try {
    const users = db.prepare(
      'SELECT id, name, username, role, created_at FROM users'
    ).all()
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
        'UPDATE users SET name=?, username=?, role=?, password=? WHERE id=?'
      ).run(name, username, role, hashedPassword, id)
    } else {
      db.prepare(
        'UPDATE users SET name=?, username=?, role=? WHERE id=?'
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

// ============ CUSTOMERS ============
ipcMain.handle('customers:getAll', () => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY name').all()
    return { success: true, data: customers }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('customers:create', (event, { name, phone, note }) => {
  try {
    const result = db.prepare(
      'INSERT INTO customers (name, phone, note) VALUES (?, ?, ?)'
    ).run(name, phone || null, note || null)
    return { success: true, id: result.lastInsertRowid }
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

ipcMain.handle('categories:delete', (event, id) => {
  try {
    const deleteCategory = db.transaction(() => {
      db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(id)
      db.prepare('DELETE FROM categories WHERE id = ?').run(id)
    })
    deleteCategory()
    return { success: true }
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
    `).run(name, barcode || null, category_id || null, price, stock, low_stock_threshold, unit)
    return { success: true, id: result.lastInsertRowid }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('products:update', (event, { id, name, barcode, category_id, price, stock, low_stock_threshold, unit }) => {
  try {
    db.prepare(`
      UPDATE products SET name=?, barcode=?, category_id=?, price=?,
      stock=?, low_stock_threshold=?, unit=? WHERE id=?
    `).run(name, barcode || null, category_id || null, price, stock, low_stock_threshold, unit, id)
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('products:delete', (event, id) => {
  try {
    const deleteProduct = db.transaction(() => {
      // Remove from sale items first
      db.prepare('DELETE FROM sale_items WHERE product_id = ?').run(id)
      // Remove from restock log
      db.prepare('DELETE FROM restock_log WHERE product_id = ?').run(id)
      // Remove from internal use items
      db.prepare('DELETE FROM internal_use_items WHERE product_id = ?').run(id)
      // Now delete the product
      db.prepare('DELETE FROM products WHERE id = ?').run(id)
    })
    deleteProduct()
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ SALES ============
ipcMain.handle('sales:create', (event, { user_id, customer_id, customer_name, total, discount_total, items, sale_type, payment_status, note }) => {
  try {
    const createSale = db.transaction(() => {
      const sale = db.prepare(`
        INSERT INTO sales 
        (user_id, customer_id, customer_name, total, discount_total, sale_type, payment_status, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user_id,
        customer_id || null,
        customer_name || null,
        total,
        discount_total || 0,
        sale_type || 'sale',
        payment_status || 'paid',
        note || null
      )

      for (const item of items) {
        db.prepare(`
          INSERT INTO sale_items 
          (sale_id, product_id, quantity, price, discount_type, discount_value, final_price)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          sale.lastInsertRowid,
          item.product_id,
          item.quantity,
          item.price,
          item.discount_type || null,
          item.discount_value || 0,
          item.final_price
        )

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

ipcMain.handle('sales:void', (event, id) => {
  try {
    const voidSale = db.transaction(() => {
      // Get sale items to restore stock
      const items = db.prepare(
        'SELECT * FROM sale_items WHERE sale_id = ?'
      ).all(id)

      // Restore stock for each item
      for (const item of items) {
        db.prepare(
          'UPDATE products SET stock = stock + ? WHERE id = ?'
        ).run(item.quantity, item.product_id)
      }

      // Mark sale as voided
      db.prepare(
        "UPDATE sales SET payment_status = 'voided' WHERE id = ?"
      ).run(id)
    })

    voidSale()
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('sales:delete', (event, id) => {
  try {
    const deleteSale = db.transaction(() => {
      db.prepare('DELETE FROM sale_items WHERE sale_id = ?').run(id)
      db.prepare('DELETE FROM sales WHERE id = ?').run(id)
    })
    deleteSale()
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('sales:markPaid', (event, id) => {
  try {
    db.prepare(
      "UPDATE sales SET payment_status = 'paid' WHERE id = ?"
    ).run(id)
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ INTERNAL USE ============
ipcMain.handle('internal:create', (event, { user_id, note, items }) => {
  try {
    const createInternal = db.transaction(() => {
      const log = db.prepare(
        'INSERT INTO internal_use_log (user_id, note) VALUES (?, ?)'
      ).run(user_id, note || null)

      for (const item of items) {
        db.prepare(
          'INSERT INTO internal_use_items (log_id, product_id, quantity) VALUES (?, ?, ?)'
        ).run(log.lastInsertRowid, item.product_id, item.quantity)

        // Deduct stock
        db.prepare(
          'UPDATE products SET stock = stock - ? WHERE id = ?'
        ).run(item.quantity, item.product_id)
      }

      return log.lastInsertRowid
    })

    const logId = createInternal()
    return { success: true, id: logId }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('internal:getAll', () => {
  try {
    const logs = db.prepare(`
      SELECT l.*, u.name as user_name
      FROM internal_use_log l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `).all()

    const logsWithItems = logs.map(log => {
      const items = db.prepare(`
        SELECT i.*, p.name as product_name, p.unit
        FROM internal_use_items i
        LEFT JOIN products p ON i.product_id = p.id
        WHERE i.log_id = ?
      `).all(log.id)
      return { ...log, items }
    })

    return { success: true, data: logsWithItems }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ RESTOCK ============
ipcMain.handle('restock:create', (event, { product_id, quantity, buying_price, note }) => {
  try {
    const restock = db.transaction(() => {
      db.prepare(
        'INSERT INTO restock_log (product_id, quantity, buying_price, note) VALUES (?, ?, ?, ?)'
      ).run(product_id, quantity, buying_price || null, note || null)
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
    db.prepare(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
    ).run(key, value)
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// ============ BACKUP & RESTORE ============
ipcMain.handle('backup:export', async () => {
  try {
    const { dialog } = require('electron')
    const fs = require('fs')

    const result = await dialog.showSaveDialog({
      title: 'Save Backup',
      defaultPath: `lista-backup-${new Date().toISOString().split('T')[0]}.db`,
      filters: [{ name: 'Database Backup', extensions: ['db'] }]
    })

    if (result.canceled) return { success: false, message: 'Cancelled' }

    fs.copyFileSync(dbPath, result.filePath)
    return { success: true, path: result.filePath }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('backup:import', async () => {
  try {
    const { dialog, app } = require('electron')
    const fs = require('fs')

    const result = await dialog.showOpenDialog({
      title: 'Select Backup File',
      filters: [{ name: 'Database Backup', extensions: ['db'] }],
      properties: ['openFile']
    })

    if (result.canceled) return { success: false, message: 'Cancelled' }

    fs.copyFileSync(result.filePaths[0], dbPath)
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('app:getVersion', () => {
  const { app } = require('electron')
  return app.getVersion()
})