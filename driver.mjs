// Electron driver for F2A Plastering — run under tmux, send-keys commands, capture-pane output
import { _electron as electron } from 'playwright-core'
import * as readline from 'node:readline'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/shots'
fs.mkdirSync(SHOT_DIR, { recursive: true })

const electronBin = path.join(__dirname, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')

let app = null
let page = null

const COMMANDS = {
  async launch() {
    if (app) return console.log('already launched')
    console.log('launching...')
    app = await electron.launch({
      executablePath: electronBin,
      args: ['--no-sandbox', __dirname],
      env: { ...process.env },
      timeout: 30_000,
    })
    // wait for the window to be ready and vite to load
    page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await new Promise(r => setTimeout(r, 3000))
    console.log('launched. windows:')
    for (const w of app.windows()) console.log(' ', w.url())
  },

  async ss(name) {
    if (!page) return console.log('ERROR: launch first')
    const f = path.join(SHOT_DIR, (name || `ss-${Date.now()}`) + '.png')
    await page.screenshot({ path: f })
    console.log('screenshot:', f)
  },

  async click(sel) {
    if (!page) return console.log('ERROR: launch first')
    const r = await page.evaluate(s => {
      const el = document.querySelector(s)
      if (!el) return 'NOT_FOUND'
      el.click(); return 'OK'
    }, sel)
    await new Promise(r => setTimeout(r, 500))
    console.log('click', sel, '→', r)
  },

  async 'click-text'(text) {
    if (!page) return console.log('ERROR: launch first')
    const r = await page.evaluate(t => {
      const els = [...document.querySelectorAll('button, a, [role="button"]')]
      const el = els.find(e => e.textContent?.trim() === t)
              ?? els.find(e => e.textContent?.includes(t))
      if (!el) return 'NOT_FOUND'
      el.click(); return 'OK: ' + el.tagName + ' "' + el.textContent?.trim().slice(0,40) + '"'
    }, text)
    await new Promise(r => setTimeout(r, 800))
    console.log('click-text', JSON.stringify(text), '→', r)
  },

  async type(text) { if (page) { await page.keyboard.type(text, { delay: 60 }); console.log('typed:', text) } },
  async press(key) { if (page) { await page.keyboard.press(key); console.log('pressed:', key) } },
  async wait(ms) { await new Promise(r => setTimeout(r, parseInt(ms) || 1000)); console.log('waited', ms, 'ms') },

  async fill(args) {
    const [sel, ...rest] = args.split(' ')
    const value = rest.join(' ')
    if (!page) return console.log('ERROR: launch first')
    const r = await page.evaluate(([s, v]) => {
      const el = document.querySelector(s)
      if (!el) return 'NOT_FOUND'
      const nativeInput = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')
      nativeInput.set.call(el, v)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return 'OK'
    }, [sel, value])
    console.log('fill', sel, '=', value, '→', r)
  },

  async text(sel) {
    if (!page) return console.log('ERROR: launch first')
    console.log(await page.evaluate(
      s => (s ? document.querySelector(s) : document.body)?.innerText?.slice(0, 500) ?? '(null)',
      sel || null))
  },

  async eval(expr) {
    if (!page) return console.log('ERROR: launch first')
    try { console.log(JSON.stringify(await page.evaluate(expr))) }
    catch (e) { console.log('ERROR:', e.message) }
  },

  async windows() {
    if (!app) return console.log('ERROR: launch first')
    for (const w of app.windows()) console.log(' ', w.url())
  },

  async quit() { if (app) await app.close().catch(() => {}); app = null; page = null; console.log('quit') },
  help() { console.log('commands:', Object.keys(COMMANDS).join(', ')) },
}

const stdin = fs.createReadStream(null, { fd: fs.openSync('/dev/stdin', 'r') })
const rl = readline.createInterface({ input: stdin, output: process.stdout, prompt: 'driver> ' })

rl.on('line', async line => {
  const [cmd, ...rest] = line.trim().split(/\s+/)
  if (!cmd) return rl.prompt()
  const fn = COMMANDS[cmd]
  if (!fn) { console.log('unknown:', cmd, '— try: help'); return rl.prompt() }
  try { await fn(rest.join(' ')) } catch (e) { console.log('ERROR:', e.message) }
  if (cmd === 'quit') { rl.close(); process.exit(0) }
  rl.prompt()
})
rl.on('close', async () => { await COMMANDS.quit(); process.exit(0) })

console.log('F2A driver — "help" for commands, "launch" to start')
rl.prompt()
