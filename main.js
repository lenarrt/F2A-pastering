const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  // Create the desktop window
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hiddenInset',
    title: 'F2A Plastering'
  })

  // Load our React app
  win.loadURL('http://localhost:5173')
}

// When Electron is ready, create the window
app.whenReady().then(() => {
  createWindow()
})

// Close the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})