import { useState, useEffect } from 'react'
import { Plus, Trash2, Receipt } from 'lucide-react'
import { api } from '../services/api'

export default function Budget() {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState({ name: '', amount: '' })
  const [income, setIncome] = useState('')
  const [expenseForm, setExpenseForm] = useState({ categoryIdx: null, amount: '' })

  useEffect(() => {
    api.get('/api/budget').then((res) => {
      setCategories(res.data.categories || [])
      setIncome(res.data.income || '')
    })
  }, [])

  async function saveBudget(updatedCategories) {
    await api.post('/api/budget', { categories: updatedCategories, income: Number(income) })
  }

  async function addCategory(e) {
    e.preventDefault()
    if (!newCategory.name || !newCategory.amount) return
    const updated = [...categories, { name: newCategory.name, amount: Number(newCategory.amount), spent: 0 }]
    setCategories(updated)
    setNewCategory({ name: '', amount: '' })
    await saveBudget(updated)
  }

  async function removeCategory(idx) {
    const updated = categories.filter((_, i) => i !== idx)
    setCategories(updated)
    await saveBudget(updated)
  }

  async function logExpense(e) {
    e.preventDefault()
    const { categoryIdx, amount } = expenseForm
    if (categoryIdx === null || !amount) return
    const updated = categories.map((c, i) =>
      i === Number(categoryIdx) ? { ...c, spent: c.spent + Number(amount) } : c
    )
    setCategories(updated)
    setExpenseForm({ categoryIdx: null, amount: '' })
    await saveBudget(updated)
  }

  const totalBudget = categories.reduce((sum, c) => sum + c.amount, 0)
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)
  const remaining = totalBudget - totalSpent

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budget Planner</h1>

      {/* Quick Expense Logger */}
      {categories.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-5 shadow-sm border border-primary-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary-600" /> Log an Expense
          </h3>
          <form onSubmit={logExpense} className="flex flex-wrap gap-3">
            <select
              value={expenseForm.categoryIdx ?? ''}
              onChange={(e) => setExpenseForm({ ...expenseForm, categoryIdx: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              required
            >
              <option value="" disabled>Select category</option>
              {categories.map((c, i) => (
                <option key={i} value={i}>{c.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount (R)"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              className="border rounded-lg px-4 py-2 w-36 focus:ring-2 focus:ring-primary-500 outline-none"
              required
              min="1"
            />
            <button type="submit" className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition font-medium">
              Log Expense
            </button>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-2xl font-bold text-gray-800">R{totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-600' : 'text-gray-800'}`}>
              R{totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Remaining</p>
            <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-primary-600'}`}>
              R{remaining.toLocaleString()}
            </p>
          </div>
        </div>
      )}

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
            placeholder="Budget amount"
            value={newCategory.amount}
            onChange={(e) => setNewCategory({ ...newCategory, amount: e.target.value })}
            className="border rounded-lg px-4 py-2 w-32 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </form>

        <div className="space-y-3">
          {categories.map((cat, idx) => {
            const pct = cat.amount > 0 ? Math.min((cat.spent / cat.amount) * 100, 100) : 0
            const isOver = cat.spent > cat.amount
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.name}</span>
                    <span className={isOver ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      R{cat.spent.toLocaleString()} / R{cat.amount.toLocaleString()}
                      {isOver && ' (over!)'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full">
                    <div
                      className={`h-2.5 rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 90 ? 'bg-yellow-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
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
      </div>
    </div>
  )
}
