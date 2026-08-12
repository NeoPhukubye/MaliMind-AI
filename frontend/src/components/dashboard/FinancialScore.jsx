import { useEffect, useState } from 'react'

export default function FinancialScore({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let current = 0
    const step = Math.max(1, Math.ceil(score / 40))
    const timer = setInterval(() => {
      current += step
      if (current >= score) { setAnimatedScore(score); clearInterval(timer) }
      else setAnimatedScore(current)
    }, 30)
    return () => clearInterval(timer)
  }, [score])

  const getColor = (s) => {
    if (s >= 80) return { text: 'text-green-600', stroke: '#22c55e', bg: 'bg-green-50' }
    if (s >= 60) return { text: 'text-yellow-600', stroke: '#eab308', bg: 'bg-yellow-50' }
    if (s >= 40) return { text: 'text-orange-600', stroke: '#f97316', bg: 'bg-orange-50' }
    return { text: 'text-red-600', stroke: '#ef4444', bg: 'bg-red-50' }
  }

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent'
    if (s >= 60) return 'Good'
    if (s >= 40) return 'Fair'
    return 'Needs Work'
  }

  const getTip = (s) => {
    if (s >= 80) return 'You\'re in great shape! Consider investing surplus income.'
    if (s >= 60) return 'Solid foundation. Boost savings to reach excellent.'
    if (s >= 40) return 'Room to grow. Focus on reducing non-essential spending.'
    return 'Start small: track every expense this week.'
  }

  const colors = getColor(score)
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Financial Health Score</h3>
      <div className="flex flex-col items-center py-2">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={colors.stroke}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${colors.text}`}>{animatedScore}</span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
        </div>
        <p className={`text-lg font-semibold mt-3 ${colors.text}`}>{getLabel(score)}</p>
        <p className="text-sm text-gray-500 mt-2 text-center max-w-[220px]">{getTip(score)}</p>
      </div>
    </div>
  )
}
