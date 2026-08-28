import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Shield, AlertTriangle } from 'lucide-react'
import { api } from '../services/api'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { t } = useTranslation()

  const [form, setForm] = useState({
    amount: '',
    category: 'Uncategorized',
    description: '',
    transaction_type: 'expense',
    merchant: '',
    recipient: '',
  })

  useEffect(() => {
    api.get('/api/transactions').then((res) => setTransactions(res.data || [])).finally(() => setLoading(false))
  }, [])

  async function createTransaction(e) {
    e.preventDefault()
    await api.post('/api/transactions', {
      ...form,
      amount: Number(form.amount),
    })
    setShowForm(false)
    setForm({ amount: '', category: 'Uncategorized', description: '', transaction_type: 'expense', merchant: '', recipient: '' })
    const res = await api.get('/api/transactions')
    setTransactions(res.data || [])
  }

  const filtered = transactions.filter((t) => {
    if (filter === 'flagged') return t.flagged
    if (filter === 'income') return t.transaction_type === 'income'
    if (filter === 'expense') return t.transaction_type === 'expense'
    return true
  }).filter((t) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (t.description || '').toLowerCase().includes(q) || (t.merchant || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q)
  })

  const totalIncome = transactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition">
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600">R{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">R{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={createTransaction} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" placeholder="Amount (R)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="border rounded-lg px-4 py-2" required min="1" />
            <select value={form.transaction_type} onChange={(e) => setForm({ ...form, transaction_type: e.target.value })} className="border rounded-lg px-4 py-2">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded-lg px-4 py-2" />
            <input type="text" placeholder="Merchant (optional)" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} className="border rounded-lg px-4 py-2" />
            <input type="text" placeholder="Recipient (optional)" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="border rounded-lg px-4 py-2" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-4 py-2">
              <option value="Uncategorized">Uncategorized</option>
              <option value="Groceries">Groceries</option>
              <option value="Transport">Transport</option>
              <option value="Bills & Utilities">Bills & Utilities</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Income">Income</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">Save Transaction</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 hover:text-gray-700">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded-lg pl-10 pr-4 py-2" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg px-4 py-2">
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading transactions...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No transactions found.</div>
          ) : (
            <div className="divide-y">
              {filtered.map((t) => (
                <div key={t.id} className={`p-4 flex items-center gap-4 ${t.flagged ? 'bg-red-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.transaction_type === 'income' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {t.transaction_type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.description || t.merchant || 'Transaction'}</p>
                    <p className="text-sm text-gray-500">{t.smart_category || t.category} • {new Date(t.created_at).toLocaleDateString()}</p>
                    {t.recipient && <p className="text-xs text-gray-400">To: {t.recipient}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${t.transaction_type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                      {t.transaction_type === 'income' ? '+' : '-'}R{t.amount.toLocaleString()}
                    </p>
                    {t.flagged && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                        <AlertTriangle className="w-3 h-3" /> Flagged ({t.fraud_score})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
