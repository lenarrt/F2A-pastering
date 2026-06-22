import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../context/authSlice'
import { useLanguage } from '../context/languageContext'

function Login() {
  const dispatch = useDispatch()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [businessName, setBusinessName] = useState('Lista')
  const { t } = useLanguage()

  useEffect(() => {
    window.api.getSettings().then((result) => {
      if (result.data?.business_name) setBusinessName(result.data.business_name)
    }).catch(() => {})
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await window.api.login({ username, password })

      if (result.success) {
        dispatch(loginSuccess({ user: result.user, token: result.token }))
        if (window.resetPage) window.resetPage()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(t.somethingWentWrong)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏗️</div>
          <h1 className="text-3xl font-bold text-white">{businessName}</h1>
          <p className="text-gray-400 mt-2">{t.signIn}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-500/20 border border-red-500 text-red-400 
                          rounded-lg p-3 mb-6 text-sm text-center"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              {t.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.username}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 
                         outline-none focus:ring-2 focus:ring-blue-500 
                         placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 
                         outline-none focus:ring-2 focus:ring-blue-500 
                         placeholder-gray-500"
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 
                       disabled:cursor-not-allowed text-white font-semibold 
                       rounded-lg px-4 py-3 mt-2 transition-colors duration-200"
          >
            {loading ? t.signingIn : t.signIn}
          </button>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs text-center mt-8">
          Lista by Kurtishi Solutions
        </p>
      </div>
    </div>
  )
}

export default Login
