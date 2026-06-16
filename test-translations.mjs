import { _electron as electron } from 'playwright-core'
import { spawn } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHOT_DIR = '/tmp/shots'
fs.mkdirSync(SHOT_DIR, { recursive: true })

const electronBin = path.join(__dirname, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')
let shotIndex = 0

async function ss(page, name) {
  const f = path.join(SHOT_DIR, `${String(shotIndex++).padStart(2,'0')}-${name}.png`)
  await page.screenshot({ path: f, fullPage: false })
  console.log('  📸', f)
}

async function clickText(page, text, waitMs = 1000) {
  const r = await page.evaluate(t => {
    const els = [...document.querySelectorAll('button, a, [role="button"]')]
    const el = els.find(e => e.textContent?.trim() === t) ?? els.find(e => e.textContent?.includes(t))
    if (!el) return null
    el.click()
    return el.textContent?.trim().slice(0, 60)
  }, text)
  if (!r) console.log(`  ⚠️  could not find "${text}"`)
  else console.log(`  ✓ clicked "${r}"`)
  await page.waitForTimeout(waitMs)
}

async function fillInput(page, sel, value) {
  await page.evaluate(([s, v]) => {
    const el = document.querySelector(s)
    if (!el) return
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, [sel, value])
}

async function navTo(page, navText, waitMs = 800) {
  await clickText(page, navText, waitMs)
}

// ---- Start Vite ----
console.log('▶ Starting Vite dev server...')
const vite = spawn('npm', ['run', 'dev'], { cwd: __dirname, stdio: 'pipe' })
vite.stdout.on('data', d => process.stdout.write('  vite: ' + d))
vite.stderr.on('data', d => {})

// Wait for Vite to be ready
await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Vite timeout')), 30_000)
  vite.stdout.on('data', d => {
    if (d.toString().includes('localhost:5173') || d.toString().includes('Local:')) {
      clearTimeout(timeout)
      resolve()
    }
  })
})
console.log('  ✓ Vite ready\n')
await new Promise(r => setTimeout(r, 1000))

// ---- Launch Electron ----
console.log('▶ Launching Electron...')
const app = await electron.launch({
  executablePath: electronBin,
  args: ['--no-sandbox', __dirname],
  env: { ...process.env },
  timeout: 30_000,
})

const page = await app.firstWindow()
await page.waitForLoadState('domcontentloaded')
await page.waitForTimeout(3000)
console.log('  ✓ Window ready, URL:', page.url(), '\n')

// ---- LOGIN ----
console.log('▶ Testing Login page (English)...')
await ss(page, 'login-en')

// check the welcome text renders correctly (not literal "t.welcomeBack")
const subtitle = await page.evaluate(() => document.querySelector('.text-gray-400.mt-2')?.textContent)
console.log('  subtitle text:', JSON.stringify(subtitle))
if (subtitle === 't.signIn' || subtitle === 't.welcomeBack') {
  console.log('  ❌ FAIL — subtitle is a raw key string, not translated')
} else {
  console.log('  ✓ subtitle looks translated')
}

// fill login form
await fillInput(page, 'input[type="text"]', 'owner')
await fillInput(page, 'input[type="password"]', '123456')
await clickText(page, 'Sign In', 2500)
await ss(page, 'dashboard-en')
console.log()

// ---- DASHBOARD English ----
console.log('▶ Dashboard (English)...')
const dashH2 = await page.evaluate(() => document.querySelector('h2')?.textContent)
console.log('  h2:', JSON.stringify(dashH2))

// check greeting is translated (not "Good morning" literal vs key)
const greeting = await page.evaluate(() => {
  const h2 = document.querySelector('h2')
  return h2?.textContent
})
console.log('  greeting:', JSON.stringify(greeting))

// ---- Navigate to Settings and switch language ----
console.log('\n▶ Switching language to Albanian...')
await navTo(page, 'Settings', 1000)
await ss(page, 'settings-en')

// Click the Albanian button
await clickText(page, '🇦🇱 Shqip', 1200)
await ss(page, 'settings-al')
console.log()

// ---- Check Dashboard in Albanian ----
console.log('▶ Dashboard (Albanian)...')
await navTo(page, 'Paneli Kryesor', 1000)
await ss(page, 'dashboard-al')
const dashH2Al = await page.evaluate(() => document.querySelector('h2')?.textContent)
console.log('  h2:', JSON.stringify(dashH2Al))

// ---- Check POS in Albanian ----
console.log('\n▶ POS (Albanian)...')
await navTo(page, 'Shitje e Re', 1000)
await ss(page, 'pos-al')
const posPlaceholder = await page.evaluate(() =>
  document.querySelector('input[placeholder]')?.placeholder)
console.log('  search placeholder:', JSON.stringify(posPlaceholder))

// ---- Check Products in Albanian ----
console.log('\n▶ Products (Albanian)...')
await navTo(page, 'Produktet', 1000)
await ss(page, 'products-al')
const productsH2 = await page.evaluate(() => document.querySelector('h2')?.textContent)
console.log('  h2:', JSON.stringify(productsH2))

// ---- Check Stock Overview in Albanian ----
console.log('\n▶ Stock Overview (Albanian)...')
await navTo(page, 'Pasqyra e Stokut', 1000)
await ss(page, 'stock-al')
const stockH2 = await page.evaluate(() => document.querySelector('h2')?.textContent)
console.log('  h2:', JSON.stringify(stockH2))

// ---- Check Sales History in Albanian ----
console.log('\n▶ Sales History (Albanian)...')
await navTo(page, 'Historiku i Shitjeve', 1000)
await ss(page, 'sales-al')
const salesH2 = await page.evaluate(() => document.querySelector('h2')?.textContent)
console.log('  h2:', JSON.stringify(salesH2))

// ---- Switch back to English and check ----
console.log('\n▶ Switching back to English...')
await navTo(page, 'Cilësimet', 1000)
await clickText(page, '🇬🇧 English', 1200)
await navTo(page, 'Dashboard', 1000)
await ss(page, 'dashboard-en-back')
const dashH2EnBack = await page.evaluate(() => document.querySelector('h2')?.textContent)
console.log('  h2:', JSON.stringify(dashH2EnBack))

// ---- Done ----
console.log('\n✅ Done. Screenshots in', SHOT_DIR)
await app.close()
vite.kill()
process.exit(0)
