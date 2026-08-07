export default function FinancialScore({ score }) {
  const getColor = (s) => {
    if (s >= 80) return 'text-green-600'
    if (s >= 60) return 'text-yellow-600'
    if (s >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent'
    if (s >= 60) return 'Good'
    if (s >= 40) return 'Fair'
    return 'Needs Work'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Financial Health Score</h3>
      <div className="flex flex-col items-center py-4">
        <div className={`text-5xl font-bold ${getColor(score)}`}>{score}</div>
        <p className="text-sm text-gray-500 mt-2">out of 100</p>
        <p className={`text-lg font-medium mt-2 ${getColor(score)}`}>{getLabel(score)}</p>
      </div>
      <div className="h-3 bg-gray-100 rounded-full mt-4">
        <div
          className={`h-3 rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
