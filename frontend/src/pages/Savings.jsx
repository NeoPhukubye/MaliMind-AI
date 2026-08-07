import { useState, useEffect } from 'react'
import { Plus, Target } from 'lucide-react'
import { api } from '../services/api'

export default function Savings() {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', deadline: '' })

  useEffect(() => {
    api.get('/api/savings').then((res) => setGoals(res.data.goals || []))
  }, [])

  async function createGoal(e) {
    e.preventDefault()
    const goal = { name: form.name, target: Number(form.target), saved: 0, deadline: form.deadline }
    const updated = [...goals, goal]
    setGoals(updated)
    setShowForm(false)
    setForm({ name: '', target: '', deadline: '' })
    await api.post('/api/savings', { goals: updated })
  }

  async function addSavings(idx, amount) {
    const updated = goals.map((g, i) => (i === idx ? { ...g, saved: g.saved + amount } : g))
    setGoals(updated)
    await api.post('/api/savings', { goals: updated })
  }

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
              placeholder="Target amount"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
            Create Goal
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal, idx) => {
          const pct = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0
          return (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{goal.name}</h3>
                  {goal.deadline && <p className="text-sm text-gray-500">By {goal.deadline}</p>}
                </div>
                <Target className="w-5 h-5 text-primary-500" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>R{goal.saved.toLocaleString()}</span>
                  <span className="text-gray-500">R{goal.target.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full">
                  <div className="h-3 bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{pct.toFixed(0)}% complete</p>
              </div>
              <button
                onClick={() => addSavings(idx, 100)}
                className="mt-3 text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-lg hover:bg-primary-100 transition"
              >
                + Add R100
              </button>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No savings goals yet. Create your first one!</p>
        </div>
      )}
    </div>
  )
}
