import { useSelector } from 'react-redux'
import Login from './pages/Login'

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome back! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Dashboard coming soon...
        </p>
      </div>
    </div>
  )
}

export default App