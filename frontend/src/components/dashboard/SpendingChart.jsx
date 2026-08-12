import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function SpendingChart({ data }) {
  if (!data || data.length === 0 || (data.length === 1 && data[0].amount === 0)) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Spending by Category</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full mb-4 flex items-center justify-center">
            <span className="text-2xl">R0</span>
          </div>
          <p className="text-sm">Log expenses in your budget to see spending breakdown</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`R${value.toLocaleString()}`, '']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <span className="text-gray-600 truncate">{item.name}</span>
            <span className="text-gray-400 ml-auto">R{item.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 mt-3 font-medium">
        Total: R{total.toLocaleString()}
      </p>
    </div>
  )
}
