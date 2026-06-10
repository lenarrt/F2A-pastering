import { useState, useEffect } from 'react'

function Settings() {
  const [settings, setSettings] = useState({
    business_name: '',
    receipt_footer: '',
    tax_rate: '0',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const result = await window.api.getSettings()
    if (result.success) setSettings(result.data)
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        window.api.updateSetting({
          key: 'business_name',
          value: settings.business_name,
        }),
        window.api.updateSetting({
          key: 'receipt_footer',
          value: settings.receipt_footer,
        }),
        window.api.updateSetting({ key: 'tax_rate', value: settings.tax_rate }),
      ])
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 mt-1">Configure your business details</p>
      </div>

      {/* Success Message */}
      {success && (
        <div
          className="bg-green-500/20 border border-green-500 text-green-400
                        rounded-lg p-3 text-sm"
        >
          ✅ {success}
        </div>
      )}

      {/* Business Details */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg mb-4">
          🏢 Business Details
        </h3>

        {/* Business Name */}
        <div>
          <label className="text-gray-400 text-sm mb-1 block">
            Business Name
          </label>
          <input
            value={settings.business_name}
            onChange={(e) =>
              setSettings({ ...settings, business_name: e.target.value })
            }
            placeholder="e.g. F2A Plastering"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                       outline-none focus:ring-2 focus:ring-blue-500
                       placeholder-gray-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Appears on all printed receipts
          </p>
        </div>

        {/* Tax Rate */}
        <div>
          <label className="text-gray-400 text-sm mb-1 block">
            Tax Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={settings.tax_rate}
            onChange={(e) =>
              setSettings({ ...settings, tax_rate: e.target.value })
            }
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                       outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-500 text-xs mt-1">
            Set to 0 if prices already include tax
          </p>
        </div>
      </div>

      {/* Receipt Settings */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg mb-4">
          🧾 Receipt Settings
        </h3>

        {/* Receipt Footer */}
        <div>
          <label className="text-gray-400 text-sm mb-1 block">
            Receipt Footer Message
          </label>
          <textarea
            value={settings.receipt_footer}
            onChange={(e) =>
              setSettings({ ...settings, receipt_footer: e.target.value })
            }
            placeholder="e.g. Thank you for your business!"
            rows={3}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                       outline-none focus:ring-2 focus:ring-blue-500
                       placeholder-gray-500 resize-none"
          />
          <p className="text-gray-500 text-xs mt-1">
            Printed at the bottom of every receipt
          </p>
        </div>

        {/* Receipt Preview */}
        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            Receipt Preview
          </label>
          <div
            className="bg-white text-black rounded-lg p-4 font-mono text-xs
                          max-w-xs mx-auto"
          >
            <p className="text-center font-bold text-sm">
              {settings.business_name || 'Your Business Name'}
            </p>
            <p className="text-center text-gray-500 text-xs">
              {new Date().toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-center text-xs">Cashier: Owner</p>
            <div className="border-t border-dashed border-gray-400 my-2" />
            <div className="flex justify-between">
              <span>Sample Product</span>
              <span>1x 100.00 den</span>
            </div>
            <div className="flex justify-between">
              <span></span>
              <span>100.00 den</span>
            </div>
            <div className="border-t border-dashed border-gray-400 my-2" />
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>100.00 den</span>
            </div>
            {parseFloat(settings.tax_rate) > 0 && (
              <p className="text-center text-xs text-gray-500 mt-1">
                Includes {settings.tax_rate}% tax
              </p>
            )}
            <p className="text-center text-xs text-gray-500 mt-2">
              {settings.receipt_footer || 'Your footer message here'}
            </p>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-white font-semibold text-lg mb-4">
          ℹ️ App Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">App Name</span>
            <span className="text-white text-sm">F2A Plastering</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Version</span>
            <span className="text-white text-sm">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Built with</span>
            <span className="text-white text-sm">
              Electron + React + SQLite
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Developer</span>
            <span className="text-white text-sm">lenarrt</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800
                   disabled:cursor-not-allowed text-white font-semibold
                   rounded-xl py-3 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}

export default Settings
