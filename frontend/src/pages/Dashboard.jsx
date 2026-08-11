import { useEffect, useState } from 'react'
import { TrendingUp, Wallet, PiggyBank, AlertCircle, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react'
import { api } from '../services/api'
import StatCard from '../components/dashboard/StatCard'
import SpendingChart from '../components/dashboard/SpendingChart'
import FinancialScore from '../components/dashboard/FinancialScore'

const insightIcons = {
  warning: AlertTriangle,
  tip: Lightbulb,
  success: CheckCircle,
}

const insightColors = {
  warning: 'bg-red-50 border-red-200 text-red-800',
  tip: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
}

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
          insights: [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-primary-200 rounded-full animate-bounce" />
          <p className="text-gray-500">Loading your finances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Monthly Budget" value={`R${stats.totalBudget.toLocaleString()}`} color="blue" />
        <StatCard icon={AlertCircle} label="Total Spent" value={`R${stats.totalSpent.toLocaleString()}`} color="red" />
        <StatCard icon={PiggyBank} label="Total Savings" value={`R${stats.totalSavings.toLocaleString()}`} color="green" />
        <StatCard icon={TrendingUp} label="Financial Score" value={`${stats.financialScore}/100`} color="yellow" />
      </div>

      {/* AI Insights */}
      {stats.insights && stats.insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Smart Insights</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {stats.insights.map((insight, idx) => {
              const Icon = insightIcons[insight.type] || Lightbulb
              const colorClass = insightColors[insight.type] || insightColors.tip
              return (
                <div key={idx} className={`rounded-xl p-4 border ${colorClass}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm">{insight.title}</h3>
                      <p className="text-sm mt-1 opacity-90">{insight.message}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={stats.spendingByCategory} />
        <FinancialScore score={stats.financialScore} />
      </div>
    </div>
  )
}
