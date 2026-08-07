import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function SpendingChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Spending by Category</h3>
        <p className="text-gray-500 text-sm text-center py-8">No spending data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `R${value}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
