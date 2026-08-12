import { useState, useEffect } from 'react'
import { Plus, Target, Trash2, TrendingUp } from 'lucide-react'
import { api } from '../services/api'

export default function Savings() {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', deadline: '' })
  const [addAmounts, setAddAmounts] = useState({})

  useEffect(() => {
    api.get('/api/savings').then((res) => setGoals(res.data.goals || []))
  }, [])

  async function saveGoals(updated) {
    setGoals(updated)
    await api.post('/api/savings', { goals: updated })
  }

  async function createGoal(e) {
    e.preventDefault()
    const goal = { name: form.name, target: Number(form.target), saved: 0, deadline: form.deadline }
    await saveGoals([...goals, goal])
    setShowForm(false)
    setForm({ name: '', target: '', deadline: '' })
  }

  async function addSavings(idx) {
    const amount = Number(addAmounts[idx]) || 100
    const updated = goals.map((g, i) => (i === idx ? { ...g, saved: g.saved + amount } : g))
    setAddAmounts({ ...addAmounts, [idx]: '' })
    await saveGoals(updated)
  }

  async function deleteGoal(idx) {
    await saveGoals(goals.filter((_, i) => i !== idx))
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Total Savings Progress</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">R{totalSaved.toLocaleString()}</span>
            <span className="text-primary-200 mb-1">/ R{totalTarget.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full mt-3">
            <div
              className="h-2 bg-white rounded-full transition-all"
              style={{ width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={createGoal} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <input
            type="text"
            placeholder="Goal name (e.g., Emergency Fund)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
            required
          />
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Target amount (R)"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              required
              min="1"
            />
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
              Create Goal
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal, idx) => {
          const pct = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0
          const isComplete = pct >= 100
          return (
            <div key={idx} className={`bg-white rounded-xl p-6 shadow-sm ${isComplete ? 'ring-2 ring-green-200' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{goal.name}</h3>
                  {goal.deadline && <p className="text-sm text-gray-500">By {goal.deadline}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {isComplete && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Done!</span>}
                  <button onClick={() => deleteGoal(idx)} className="text-gray-300 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">R{goal.saved.toLocaleString()}</span>
                  <span className="text-gray-500">R{goal.target.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full">
                  <div
                    className={`h-3 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-primary-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{pct.toFixed(0)}% complete</p>
              </div>
              {!isComplete && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={addAmounts[idx] || ''}
                    onChange={(e) => setAddAmounts({ ...addAmounts, [idx]: e.target.value })}
                    className="w-28 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => addSavings(idx)}
                    className="text-sm bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition font-medium"
                  >
                    + Add
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">No savings goals yet. Create your first one!</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  )
}
