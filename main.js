const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const isDev = !app.isPackaged

// Keep dev and packaged builds in separate userData dirs so they never
// share a database or license file on the developer's machine.
if (isDev) {
  app.setPath('userData', app.getPath('userData') + '-dev')
}

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
    title: 'Lista',
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

  return win
}

function setupAutoUpdater(win) {
  if (isDev) return

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  const isMac = process.platform === 'darwin'

  if (isMac) {
    // macOS auto-update requires a paid Apple Developer ID code-signing
    // certificate ($99/year) which isn't set up yet. Rather than silently
    // failing or erroring, we detect the update and send the user to the
    // GitHub releases page to download manually. Revisit this branch if/when
    // there is an actual Mac client with a signing cert.
    autoUpdater.on('update-available', (info) => {
      const choice = dialog.showMessageBoxSync(win, {
        type: 'info',
        title: 'Update Available',
        message: `Lista ${info.version} is available`,
        detail: 'Download the latest version from the Lista releases page.',
        buttons: ['View Download Page', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      if (choice === 0) {
        shell.openExternal(
          'https://github.com/lenarrt/Lista-by-Kurtishi-Solutions/releases/latest'
        )
      }
    })
  } else {
    // Windows: full silent-download flow with progress and restart prompt.
    autoUpdater.on('update-available', (info) => {
      const choice = dialog.showMessageBoxSync(win, {
        type: 'info',
        title: 'Update Available',
        message: `Lista ${info.version} is available`,
        detail: 'Would you like to download it now?',
        buttons: ['Download Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      if (choice === 0) {
        autoUpdater.downloadUpdate()
      }
    })

    autoUpdater.on('download-progress', ({ percent }) => {
      win.setProgressBar(percent / 100)
      win.setTitle(`Lista — Downloading update ${Math.round(percent)}%`)
    })

    autoUpdater.on('update-downloaded', () => {
      win.setProgressBar(-1)
      win.setTitle('Lista')
      const choice = dialog.showMessageBoxSync(win, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded',
        detail: 'Restart Lista now to install the update?',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      if (choice === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  }

  autoUpdater.on('error', (err) => {
    console.error('[auto-updater]', err)
  })

  setTimeout(() => autoUpdater.checkForUpdates(), 5000)
}

app.whenReady().then(() => {
  require('./src/database/database.js')
  require('./src/database/ipcHandlers.js')
  require('./src/database/licenseHandlers.js')
  const win = createWindow()
  setupAutoUpdater(win)
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