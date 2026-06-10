const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: 'hiddenInset',
    title: 'F2A Plastering'
  })

  win.loadURL('http://localhost:5173')
}

app.whenReady().then(() => {
  // Initialize database
  require('./src/database/database.js')

  // Register all IPC handlers
  require('./src/database/ipcHandlers.js')

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})