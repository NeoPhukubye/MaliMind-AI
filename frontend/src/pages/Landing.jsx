import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, Shield, Brain, Target, Users, Star, ArrowRight, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

const features = [
  { icon: Brain, title: 'AI Financial Coach', desc: 'Personalized advice powered by AI that knows your budget, savings goals, and spending habits' },
  { icon: Target, title: 'Smart Budgeting', desc: 'Track spending by category with real-time progress bars and overspending alerts' },
  { icon: TrendingUp, title: 'Savings Goals', desc: 'Set targets with deadlines and get intelligent recommendations to reach them faster' },
  { icon: Shield, title: 'Financial Health Score', desc: 'Dynamic score that reflects your income, spending, savings rate, and debt health' },
]

const stats = [
  { value: '60%', label: 'of South Africans live paycheck to paycheck' },
  { value: 'R99', label: '/month for unlimited AI coaching' },
  { value: '5', label: 'free AI messages daily' },
]

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const num = parseInt(target)
    if (isNaN(num)) { setCount(target); return }
    let current = 0
    const step = Math.ceil(num / 30)
    const timer = setInterval(() => {
      current += step
      if (current >= num) { setCount(num); clearInterval(timer) }
      else setCount(current)
    }, 40)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count}{suffix}</span>
}

export default function Landing() {
  const { isAuthenticated, login } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          MaliMind AI
        </h1>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <Link to="/app" className="bg-accent-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-accent-600 transition flex items-center gap-2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button onClick={login} className="bg-accent-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-accent-600 transition">
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-primary-100 text-sm px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 text-accent-400" />
            Built for Africa, by Africans
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your AI Financial Coach<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">
              for Africa
            </span>
          </h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Build healthier financial habits with intelligent budgeting, savings planning,
            and personalized guidance — all tailored to the South African financial landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={login}
              className="bg-accent-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition shadow-lg shadow-accent-500/30 flex items-center justify-center gap-2"
            >
              Start Free Today <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center gap-2 text-primary-200 text-sm">
              <CheckCircle className="w-4 h-4" /> No credit card required
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-3xl mx-auto">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-accent-400">{s.value}</p>
              <p className="text-primary-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((f) => (
            <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/15 transition group">
              <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-500/30 transition">
                <f.icon className="w-6 h-6 text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-primary-200 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Set Your Budget', desc: 'Enter your income and create spending categories' },
              { step: '2', title: 'Track & Save', desc: 'Log expenses and set savings goals with deadlines' },
              { step: '3', title: 'Get AI Coaching', desc: 'Ask your AI coach for personalized financial advice' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-white font-semibold text-lg mb-2">{item.title}</h4>
                <p className="text-primary-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-accent-400 fill-accent-400" />)}
          </div>
          <p className="text-white text-lg italic mb-4">
            "MaliMind helped me save R15,000 for my emergency fund in just 4 months. The AI coach keeps me accountable in a way no app ever has."
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-200" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Thandi M.</p>
              <p className="text-primary-300 text-xs">Cape Town, South Africa</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-primary-300 text-sm border-t border-white/10">
        &copy; 2024 MaliMind AI. Built by Neo Phukubye.
      </footer>
    </div>
  )
}
