# F2A Plastering — Inventory & POS System

A full-featured desktop inventory and point-of-sale (POS) application built for a plastering warehouse business. Developed as a real client project using modern web technologies packaged as a native desktop app.

![Electron](https://img.shields.io/badge/Electron-33-blue?logo=electron)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss)

---

## 📸 Screenshots

> Dashboard, POS Screen, Stock Overview, Analytics

---

## ✨ Features

### 🔐 Authentication & Role Management

- Secure login with JWT tokens and bcrypt password hashing
- Two user roles: **Owner** (full access) and **Cashier** (POS only)
- Session persistence across app restarts
- Owner can add, edit and delete users

### 🛒 Point of Sale (POS)

- Search products by name or barcode
- Add items to cart with quantity controls
- Per-item discounts (percentage or fixed amount)
- **Pay Later** — save sales as pending for customers who pay later
- **Internal Use** — deduct stock without counting as a sale
- Receipt generation with print support
- Customer name tracking

### 📦 Product Management

- Full CRUD for products and categories
- Barcode support (compatible with USB barcode scanners)
- Stock levels with low stock thresholds
- Units of measure (bags, kg, liters, etc.)

### 📋 Stock Overview

- Real-time stock levels with color-coded progress bars
- Filter by category and status (In Stock / Low / Out of Stock)
- Quick restock directly from the stock overview page
- Summary cards showing total items, low stock count, etc.

### 📊 Sales History

- Complete history of all transactions
- Filter by date range, payment status, and sale type
- **Void sales** — cancels sale and restores stock
- **Mark as Paid** — for Pay Later sales
- **Delete** — permanently remove a transaction
- Reprint receipts for any past sale

### 🚚 Restock Log

- Log incoming deliveries and automatically update stock
- Full delivery history with notes
- Low stock products highlighted for quick restocking

### 📈 Analytics

- Revenue over time (7, 30, 90 day periods)
- Top products by revenue
- Transactions per day
- Sales breakdown by status (Paid, Pending, Voided, Internal)

### ⚙️ Settings

- Business name and receipt footer customization
- Tax rate configuration
- Live receipt preview
- **Backup & Restore** — export/import database file

---

## 🛠 Tech Stack

| Layer             | Technology                |
| ----------------- | ------------------------- |
| Desktop Framework | Electron 33               |
| Frontend          | React 19 + Tailwind CSS 3 |
| State Management  | Redux Toolkit             |
| Database          | SQLite via better-sqlite3 |
| Authentication    | JWT + bcrypt              |
| Charts            | Recharts                  |
| Build Tool        | Vite 5                    |
| Packaging         | Electron Builder          |
| CI/CD             | GitHub Actions            |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/lenarrt/F2A-pastering.git
cd F2A-pastering

# Install dependencies
npm install --legacy-peer-deps

# Rebuild native modules for Electron
./node_modules/.bin/electron-rebuild -f -w better-sqlite3

# Start development mode
npm run electron:dev
```

### Default Login

```
Username: owner
Password: owner123
```

> ⚠️ Change the password immediately after first login!

---

## 📦 Building

### Windows (.exe installer)

```bash
npm run build:win
```

### macOS (.dmg)

```bash
npm run build:mac
```

### Automated Windows Build (GitHub Actions)

Every push to `main` automatically builds a Windows installer via GitHub Actions. Download from the **Actions** tab → latest run → **Artifacts**.

---

## 🗄️ Database

The SQLite database is stored locally on the user's machine:

- **Windows:** `C:\Users\[name]\AppData\Roaming\f2a-plastering\`
- **macOS:** `~/Library/Application Support/f2a-plastering/`

Data persists across app updates. Use the built-in **Backup & Restore** feature in Settings to keep your data safe.

---

## 📁 Project Structure

```
F2A-pastering/
├── main.js                 # Electron main process
├── preload.js              # IPC bridge
├── src/
│   ├── pages/              # All application pages
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── POS.jsx
│   │   ├── StockOverview.jsx
│   │   ├── SalesHistory.jsx
│   │   ├── Restock.jsx
│   │   ├── Analytics.jsx
│   │   ├── Users.jsx
│   │   └── Settings.jsx
│   ├── layouts/            # MainLayout with sidebar
│   ├── context/            # Redux store and auth slice
│   └── database/           # SQLite schema and IPC handlers
├── .github/workflows/      # GitHub Actions CI/CD
└── package.json
```

---

## 👨‍💻 Developer

Built by **[@lenarrt](https://github.com/lenarrt)**

- CS Bachelor's degree
- Master's in Business Analytics
- Built as a real client project for a plastering warehouse

---

## 📄 License

MIT License — feel free to use this as a reference or starting point for similar projects.
