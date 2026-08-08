import { useState } from 'react'
import { User, CreditCard, Calendar, ExternalLink, RefreshCw } from 'lucide-react'
import { useRevenueCat } from '../../hooks/useRevenueCat'

export default function CustomerCenter({ onClose }) {
  const { customerInfo, isPro, refresh, loading } = useRevenueCat()
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const activeSubscriptions = customerInfo?.activeSubscriptions || []
  const expirationDates = customerInfo?.allExpirationDates || {}
  const managementUrl = customerInfo?.managementUrl

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Subscription</h2>
              <p className="text-sm text-gray-500">Manage your MaliMind Pro plan</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Status */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPro ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {isPro ? 'Pro Active' : 'Free Plan'}
            </span>
          </div>

          {/* Active subscriptions */}
          {activeSubscriptions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Active Subscriptions
              </h3>
              {activeSubscriptions.map((sub) => (
                <div key={sub} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800">{sub}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {expirationDates[sub]
                        ? `Renews ${formatDate(expirationDates[sub])}`
                        : 'Lifetime'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No active subscription */}
          {!isPro && activeSubscriptions.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No active subscription.</p>
              <p className="text-xs mt-1">Upgrade to Pro for unlimited AI coaching.</p>
            </div>
          )}

          {/* Management link */}
          {managementUrl && (
            <a
              href={managementUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-3 border border-gray-200 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Subscription
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
          >
            Close
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">
            Need help? Contact support@malimind.ai
          </p>
        </div>
      </div>
    </div>
  )
}
