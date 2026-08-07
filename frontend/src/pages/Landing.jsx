import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, Shield, Brain, Target } from 'lucide-react'

const features = [
  { icon: Brain, title: 'AI Financial Coach', desc: 'Get personalized advice powered by AI that understands your goals' },
  { icon: Target, title: 'Smart Budgeting', desc: 'Create intelligent budgets that adapt to your spending patterns' },
  { icon: TrendingUp, title: 'Savings Goals', desc: 'Set and track savings goals with AI-powered recommendations' },
  { icon: Shield, title: 'Debt Optimizer', desc: 'Get a custom plan to pay off debt faster and save on interest' },
]

export default function Landing() {
  const { isAuthenticated, login } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white">MaliMind AI</h1>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <Link to="/app" className="bg-accent-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-accent-600 transition">
              Go to Dashboard
            </Link>
          ) : (
            <button onClick={login} className="bg-accent-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-accent-600 transition">
              Get Started
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your AI Financial Coach<br />
            <span className="text-accent-400">for Africa</span>
          </h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Build healthier financial habits with intelligent budgeting, savings planning,
            and personalized guidance powered by AI.
          </p>
          <button
            onClick={login}
            className="bg-accent-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition shadow-lg"
          >
            Start Free Today
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <f.icon className="w-10 h-10 text-accent-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-primary-200 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-primary-300 text-sm">
        &copy; 2024 MaliMind AI. Built by Neo Phukubye.
      </footer>
    </div>
  )
}
