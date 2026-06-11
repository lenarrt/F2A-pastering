import { useState } from 'react'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import POS from './pages/POS'
import SalesHistory from './pages/SalesHistory'
import Restock from './pages/Restock'
import Users from './pages/Users'
import Settings from './pages/Settings'
import StockOverview from './pages/StockOverview'
import Analytics from './pages/Analytics'

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Reset page to dashboard on login
  window.resetPage = () => setCurrentPage('dashboard')
  if (!isAuthenticated) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'products':
        return <Products />
      case 'pos':
        return <POS />
      case 'sales':
        return <SalesHistory />
      case 'restock':
        return <Restock />
      case 'users':
        return <Users />
      case 'settings':
        return <Settings />
      case 'stock':
        return <StockOverview />
      case 'analytics':
        return <Analytics />
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 text-lg">
              🚧 {currentPage} page coming soon...
            </p>
          </div>
        )
    }
  }

  return (
    <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  )
}

export default App
