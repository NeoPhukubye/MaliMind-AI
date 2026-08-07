import { useEffect, useState } from 'react'
import { TrendingUp, Wallet, PiggyBank, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import StatCard from '../components/dashboard/StatCard'
import SpendingChart from '../components/dashboard/SpendingChart'
import FinancialScore from '../components/dashboard/FinancialScore'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get('/api/users/dashboard')
        setStats(res.data)
      } catch {
        setStats({
          totalBudget: 0,
          totalSpent: 0,
          totalSavings: 0,
          financialScore: 0,
          spendingByCategory: [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Monthly Budget" value={`R${stats.totalBudget.toLocaleString()}`} color="blue" />
        <StatCard icon={AlertCircle} label="Total Spent" value={`R${stats.totalSpent.toLocaleString()}`} color="red" />
        <StatCard icon={PiggyBank} label="Total Savings" value={`R${stats.totalSavings.toLocaleString()}`} color="green" />
        <StatCard icon={TrendingUp} label="Financial Score" value={`${stats.financialScore}/100`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={stats.spendingByCategory} />
        <FinancialScore score={stats.financialScore} />
      </div>
    </div>
  )
}
