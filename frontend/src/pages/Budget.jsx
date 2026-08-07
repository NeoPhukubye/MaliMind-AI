import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../services/api'

export default function Budget() {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState({ name: '', amount: '' })
  const [income, setIncome] = useState('')

  useEffect(() => {
    api.get('/api/budget').then((res) => setCategories(res.data.categories || []))
  }, [])

  async function addCategory(e) {
    e.preventDefault()
    if (!newCategory.name || !newCategory.amount) return
    const updated = [...categories, { name: newCategory.name, amount: Number(newCategory.amount), spent: 0 }]
    setCategories(updated)
    setNewCategory({ name: '', amount: '' })
    await api.post('/api/budget', { categories: updated, income: Number(income) })
  }

  function removeCategory(idx) {
    const updated = categories.filter((_, i) => i !== idx)
    setCategories(updated)
    api.post('/api/budget', { categories: updated, income: Number(income) })
  }

  const totalBudget = categories.reduce((sum, c) => sum + c.amount, 0)
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budget Planner</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter your monthly income"
            className="w-full md:w-64 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <form onSubmit={addCategory} className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Category name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newCategory.amount}
            onChange={(e) => setNewCategory({ ...newCategory, amount: e.target.value })}
            className="border rounded-lg px-4 py-2 w-32 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const pct = cat.amount > 0 ? Math.min((cat.spent / cat.amount) * 100, 100) : 0
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-gray-500">R{cat.spent} / R{cat.amount}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-primary-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <button onClick={() => removeCategory(idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>

        {categories.length > 0 && (
          <div className="mt-6 pt-4 border-t flex justify-between text-sm">
            <span>Total Budgeted: <strong>R{totalBudget.toLocaleString()}</strong></span>
            <span>Total Spent: <strong>R{totalSpent.toLocaleString()}</strong></span>
            <span>Remaining: <strong className="text-primary-600">R{(totalBudget - totalSpent).toLocaleString()}</strong></span>
          </div>
        )}
      </div>
    </div>
  )
}
