import { useState } from 'react'
import { useLanguage } from '../context/languageContext'

function SetupWizard({ onComplete }) {
  const { changeLanguage } = useLanguage()
  const [businessName, setBusinessName] = useState('')
  const [language, setLanguage] = useState('en')
  const [taxRate, setTaxRate] = useState('0')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!businessName.trim()) {
      setError('Business name is required.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await Promise.all([
        window.api.updateSetting({ key: 'business_name', value: businessName.trim() }),
        window.api.updateSetting({ key: 'tax_rate', value: taxRate || '0' }),
      ])
      changeLanguage(language)
      onComplete()
    } catch {
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-white">Set Up Your Business</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Just a few details to get you started.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Business Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3
                         outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-500"
              autoFocus
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Language</label>
            <div className="flex gap-3">
              {['en', 'al'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                    language === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {lang === 'en' ? 'English' : 'Albanian'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Tax Rate (%) <span className="text-gray-500 font-normal">— optional</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="0"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3
                         outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800
                       disabled:cursor-not-allowed text-white font-semibold
                       rounded-lg px-4 py-3 mt-2 transition-colors duration-200"
          >
            {saving ? 'Saving…' : 'Get Started'}
          </button>
        </form>

        <p className="text-gray-600 text-xs text-center mt-8">
          Lista by Kurtishi Solutions
        </p>
      </div>
    </div>
  )
}

export default SetupWizard
