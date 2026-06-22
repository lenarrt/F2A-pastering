const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const isDev = !app.isPackaged
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    title: 'F2A Plastering',
    show: false,
  })

  // Show window when ready to avoid white flash
  win.once('ready-to-show', () => {
    win.show()
  })

 if (isDev) {
  win.loadURL('http://localhost:5173')
} else {
  win.loadFile(path.join(__dirname, 'dist/index.html'))
}
}

app.whenReady().then(() => {
  require('./src/database/database.js')
  require('./src/database/ipcHandlers.js')
  require('./src/database/licenseHandlers.js')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})