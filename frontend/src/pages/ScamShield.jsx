import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { api } from '../services/api'

export default function ScamShield() {
  const [flagged, setFlagged] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    Promise.all([
      api.get('/api/transactions/flagged'),
      api.get('/api/transactions/summary'),
    ]).then(([flagRes, sumRes]) => {
      setFlagged(flagRes.data || [])
      setStats(sumRes.data)
    }).finally(() => setLoading(false))
  }, [])

  async function checkTransaction(id) {
    const res = await api.get(`/api/transactions/${id}/scam-shield`)
    alert(`Scam Shield Report:\n\nRisk: ${res.data.risk_level.toUpperCase()}\nScore: ${res.data.fraud_score}/100\n\nReasons:\n- ${res.data.reasons.join('\n- ')}\n\nRecommendation: ${res.data.recommendation}`)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading Scam Shield...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Scam Shield</h1>
          <p className="text-sm text-gray-500">Real-time fraud detection on every transaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Flagged Transactions</p>
          <p className="text-2xl font-bold text-red-600">{stats?.flagged_count || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Scanned</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.transaction_count || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Protection Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {stats?.transaction_count ? Math.round((1 - (stats.flagged_count || 0) / stats.transaction_count) * 100) : 100}%
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-5 text-white">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Shield className="w-5 h-5" /> How Scam Shield Works</h3>
        <p className="text-sm text-primary-100">Every outgoing transaction is scored using 5 fraud detection rules: velocity checks, reported numbers database, scam keyword detection, unusual amount analysis, and new recipient alerts. Transactions scoring 40+ are automatically flagged for your review.</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Flagged Transactions</h3>
        {flagged.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p>No suspicious transactions detected. You're safe!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flagged.map((t) => (
              <div key={t.id} className="border border-red-100 bg-red-50 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-800">R{t.amount.toLocaleString()}</span>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Score: {t.fraud_score}/100</span>
                    </div>
                    <p className="text-sm text-gray-700">{t.description || t.merchant || 'Transaction'}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.smart_category || t.category} • {new Date(t.created_at).toLocaleDateString()}</p>
                    {t.fraud_reasons && t.fraud_reasons.length > 0 && (
                      <ul className="mt-2 text-xs text-red-700 list-disc list-inside">
                        {t.fraud_reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                  <button onClick={() => checkTransaction(t.id)} className="text-sm bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
