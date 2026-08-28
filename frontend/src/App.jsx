import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Budget from './pages/Budget'
import Savings from './pages/Savings'
import Transactions from './pages/Transactions'
import Stokvels from './pages/Stokvels'
import ScamShield from './pages/ScamShield'
import Coach from './pages/Coach'
import Profile from './pages/Profile'
import Premium from './pages/Premium'
import Layout from './components/common/Layout'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="budget" element={<Budget />} />
        <Route path="savings" element={<Savings />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="stokvels" element={<Stokvels />} />
        <Route path="scam-shield" element={<ScamShield />} />
        <Route path="coach" element={<Coach />} />
        <Route path="profile" element={<Profile />} />
        <Route path="premium" element={<Premium />} />
      </Route>
    </Routes>
  )
}
