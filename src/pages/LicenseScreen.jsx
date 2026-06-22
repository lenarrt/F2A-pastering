import { useState } from 'react'

function LicenseScreen({ initialError, onActivated }) {
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState(initialError || '')
  const [loading, setLoading] = useState(false)

  const handleActivate = async (e) => {
    e.preventDefault()
    const key = licenseKey.trim()
    if (!key) {
      setError('Please enter a license key.')
      return
    }
    setError('')
    setLoading(true)
    try {
      console.log('[LicenseScreen] calling verifyLicenseOnline with key:', key)
      const result = await window.api.verifyLicenseOnline({ license_key: key })
      console.log('[LicenseScreen] verifyLicenseOnline result:', result)
      if (result.success) {
        onActivated()
      } else if (result.offline) {
        setError('Could not reach the license server. Please check your internet connection and try again.')
      } else {
        setError(result.message || 'Invalid license key.')
      }
    } catch (err) {
      console.error('[LicenseScreen] verifyLicenseOnline threw an exception:', err)
      console.error('[LicenseScreen] error name:', err?.name)
      console.error('[LicenseScreen] error message:', err?.message)
      console.error('[LicenseScreen] error stack:', err?.stack)
      setError('Unexpected error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold text-white">Activate Lista</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Enter your license key to continue.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">License Key</label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3
                         outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-500 font-mono tracking-widest"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800
                       disabled:cursor-not-allowed text-white font-semibold
                       rounded-lg px-4 py-3 mt-2 transition-colors duration-200"
          >
            {loading ? 'Activating…' : 'Activate'}
          </button>
        </form>

        <p className="text-gray-600 text-xs text-center mt-8">
          Lista by Kurtishi Solutions
        </p>
      </div>
    </div>
  )
}

export default LicenseScreen
