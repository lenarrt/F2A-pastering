const { ipcMain, app } = require('electron')
const { createClient } = require('@supabase/supabase-js')
const WebSocket = require('ws')
const fs = require('fs')
const path = require('path')

// Public Supabase keys — safe to embed in compiled builds (protected by RLS).
// Dev mode can still override these via .env; packaged builds use the constants.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lhlhsonziausynkzqrys.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_hj_lB78bOsSP3enS-AkEhQ_Zj2NLCJH'

function getLicensePath() {
  return path.join(app.getPath('userData'), 'license.json')
}

function readLicenseFile() {
  try {
    return JSON.parse(fs.readFileSync(getLicensePath(), 'utf8'))
  } catch {
    return null
  }
}

function writeLicenseFile(data) {
  fs.writeFileSync(getLicensePath(), JSON.stringify(data, null, 2), 'utf8')
}

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket },
  })
}

function isNetworkError(err) {
  const msg = (err.message || '').toLowerCase()
  return (
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    err.code === 'ENOTFOUND' ||
    err.code === 'ECONNREFUSED' ||
    err.code === 'ETIMEDOUT'
  )
}

ipcMain.handle('license:checkStored', () => {
  try {
    const data = readLicenseFile()
    if (!data?.license_key) return { success: false }
    return { success: true, data }
  } catch (err) {
    return { success: false, message: err.message }
  }
})

ipcMain.handle('license:save', (event, { license_key }) => {
  try {
    writeLicenseFile({ license_key, last_verified_at: new Date().toISOString() })
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
})

ipcMain.handle('license:verifyOnline', async (event, { license_key }) => {
  console.log('[licenseHandlers] license:verifyOnline called with key:', license_key)
  const supabase = getSupabase()
  if (!supabase) {
    console.log('[licenseHandlers] Supabase client is null — env vars missing')
    return { success: false, offline: true, message: 'Supabase not configured' }
  }

  try {
    console.log('[licenseHandlers] querying Supabase licenses table...')
    const response = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', license_key)
      .eq('is_active', true)
      .limit(1)

    console.log('[licenseHandlers] raw Supabase response:', JSON.stringify(response, null, 2))

    const { data: rows, error } = response

    if (error) {
      console.error('[licenseHandlers] Supabase returned an error object:', error)
      throw error
    }

    if (!rows || rows.length === 0) {
      console.log('[licenseHandlers] no matching rows found')
      return { success: false, message: 'Invalid or inactive license key' }
    }

    const license = rows[0]
    console.log('[licenseHandlers] license row found:', JSON.stringify(license, null, 2))

    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      console.log('[licenseHandlers] license is expired, expires_at:', license.expires_at)
      return { success: false, message: 'License has expired' }
    }

    await supabase
      .from('licenses')
      .update({ last_checked_in: new Date().toISOString() })
      .eq('id', license.id)

    writeLicenseFile({ license_key, last_verified_at: new Date().toISOString() })

    return { success: true, data: license }
  } catch (err) {
    console.error('[licenseHandlers] caught exception:', err)
    console.error('[licenseHandlers] err.name:', err?.name)
    console.error('[licenseHandlers] err.message:', err?.message)
    console.error('[licenseHandlers] err.code:', err?.code)
    console.error('[licenseHandlers] err.stack:', err?.stack)
    return {
      success: false,
      offline: isNetworkError(err),
      message: err.message,
    }
  }
})
