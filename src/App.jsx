import { useState } from 'react'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout'

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [currentPage, setCurrentPage] = useState('dashboard')

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage} />
  )
}

export default App