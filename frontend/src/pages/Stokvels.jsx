import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Users, TrendingUp, Trash2, Calendar } from 'lucide-react'
import { api } from '../services/api'

export default function Stokvels() {
  const [stokvels, setStokvels] = useState([])
  const [members, setMembers] = useState({})
  const [contributions, setContributions] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedStokvel, setSelectedStokvel] = useState(null)
  const { t } = useTranslation()

  const [form, setForm] = useState({ name: '', contribution_amount: '', frequency: 'monthly', start_date: '' })
  const [memberForm, setMemberForm] = useState({ name: '', phone: '' })
  const [contribForm, setContribForm] = useState({ member_id: '', amount: '', date: '', note: '' })

  useEffect(() => {
    api.get('/api/stokvels').then((res) => setStokvels(res.data || [])).finally(() => setLoading(false))
  }, [])

  async function createStokvel(e) {
    e.preventDefault()
    await api.post('/api/stokvels', { ...form, contribution_amount: Number(form.contribution_amount) })
    setShowForm(false)
    setForm({ name: '', contribution_amount: '', frequency: 'monthly', start_date: '' })
    const res = await api.get('/api/stokvels')
    setStokvels(res.data || [])
  }

  async function selectStokvel(s) {
    setSelectedStokvel(s)
    const [membersRes, contribRes] = await Promise.all([
      api.get(`/api/stokvels/${s.id}/members`),
      api.get(`/api/stokvels/${s.id}/contributions`),
    ])
    setMembers((prev) => ({ ...prev, [s.id]: membersRes.data || [] }))
    setContributions((prev) => ({ ...prev, [s.id]: contribRes.data || [] }))
  }

  async function addMember(e) {
    e.preventDefault()
    if (!selectedStokvel) return
    await api.post(`/api/stokvels/${selectedStokvel.id}/members`, memberForm)
    setMemberForm({ name: '', phone: '' })
    const res = await api.get(`/api/stokvels/${selectedStokvel.id}/members`)
    setMembers((prev) => ({ ...prev, [selectedStokvel.id]: res.data || [] }))
  }

  async function addContribution(e) {
    e.preventDefault()
    if (!selectedStokvel) return
    await api.post(`/api/stokvels/${selectedStokvel.id}/contributions`, { ...contribForm, amount: Number(contribForm.amount) })
    setContribForm({ member_id: '', amount: '', date: '', note: '' })
    const res = await api.get(`/api/stokvels/${selectedStokvel.id}/contributions`)
    setContributions((prev) => ({ ...prev, [selectedStokvel.id]: res.data || [] }))
  }

  const totalContributions = (id) => (contributions[id] || []).reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stokvel Groups</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition">
          <Plus className="w-4 h-4" /> New Stokvel
        </button>
      </div>

      {showForm && (
        <form onSubmit={createStokvel} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <input type="text" placeholder="Stokvel name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-4 py-2" required />
          <div className="flex gap-4">
            <input type="number" placeholder="Contribution amount (R)" value={form.contribution_amount} onChange={(e) => setForm({ ...form, contribution_amount: e.target.value })} className="flex-1 border rounded-lg px-4 py-2" required min="1" />
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="border rounded-lg px-4 py-2">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="border rounded-lg px-4 py-2" />
          <div className="flex gap-3">
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">Create Stokvel</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 hover:text-gray-700">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading stokvels...</div>
      ) : stokvels.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No stokvels yet. Create your first group savings circle!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stokvels.map((s) => (
            <div key={s.id} className={`bg-white rounded-xl p-6 shadow-sm cursor-pointer transition ${selectedStokvel?.id === s.id ? 'ring-2 ring-primary-500' : ''}`} onClick={() => selectStokvel(s)}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.frequency} • Started {s.start_date ? new Date(s.start_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-medium">R{s.contribution_amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {(members[s.id] || []).length} members</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> R{totalContributions(s.id).toLocaleString()} collected</span>
              </div>
              {s.payout_rotation && s.payout_rotation.length > 0 && (
                <div className="mt-3 text-xs text-gray-500">
                  Next payout: {s.payout_rotation[s.current_payout_index] || 'TBD'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedStokvel && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold">{selectedStokvel.name} — Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Members</h4>
              <form onSubmit={addMember} className="flex gap-2 mb-3">
                <input type="text" placeholder="Name" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} className="flex-1 border rounded-lg px-3 py-1.5 text-sm" required />
                <input type="text" placeholder="Phone" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} className="w-28 border rounded-lg px-3 py-1.5 text-sm" />
                <button type="submit" className="text-sm bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition">Add</button>
              </form>
              <div className="space-y-2">
                {(members[selectedStokvel.id] || []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span>{m.name}</span>
                    <span className="text-gray-500">{m.phone || 'No phone'}</span>
                  </div>
                ))}
                {(members[selectedStokvel.id] || []).length === 0 && <p className="text-sm text-gray-500">No members yet.</p>}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Contributions</h4>
              <form onSubmit={addContribution} className="flex flex-wrap gap-2 mb-3">
                <select value={contribForm.member_id} onChange={(e) => setContribForm({ ...contribForm, member_id: e.target.value })} className="border rounded-lg px-3 py-1.5 text-sm" required>
                  <option value="">Member</option>
                  {(members[selectedStokvel.id] || []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="number" placeholder="Amount" value={contribForm.amount} onChange={(e) => setContribForm({ ...contribForm, amount: e.target.value })} className="w-24 border rounded-lg px-3 py-1.5 text-sm" required min="1" />
                <input type="date" value={contribForm.date} onChange={(e) => setContribForm({ ...contribForm, date: e.target.value })} className="border rounded-lg px-3 py-1.5 text-sm" required />
                <button type="submit" className="text-sm bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition">Add</button>
              </form>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(contributions[selectedStokvel.id] || []).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <span className="font-medium">R{c.amount.toLocaleString()}</span>
                      <span className="text-gray-500 ml-2">{c.date}</span>
                    </div>
                    {c.note && <span className="text-xs text-gray-400">{c.note}</span>}
                  </div>
                ))}
                {(contributions[selectedStokvel.id] || []).length === 0 && <p className="text-sm text-gray-500">No contributions yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
