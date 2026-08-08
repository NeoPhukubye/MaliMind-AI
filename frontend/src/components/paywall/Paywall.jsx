import { useState, useRef } from 'react'
import { Crown, Check, Zap, Star, Shield } from 'lucide-react'
import { useRevenueCat } from '../../hooks/useRevenueCat'

const PLAN_DETAILS = {
  monthly: { badge: 'Popular', icon: Zap, color: 'primary' },
  yearly: { badge: 'Best Value', icon: Star, color: 'accent' },
  lifetime: { badge: 'Forever', icon: Shield, color: 'green' },
}

const PRO_FEATURES = [
  'Unlimited AI coaching messages',
  'Priority AI response speed',
  'Advanced financial analytics',
  'Custom savings strategies',
  'Debt optimization plans',
  'Export financial reports',
]

export default function Paywall({ onClose, onSuccess }) {
  const { showPaywall, purchase, getPackages, loading } = useRevenueCat()
  const [purchasing, setPurchasing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const checkoutRef = useRef(null)

  const packages = getPackages()

  async function handleRCPaywall() {
    setPurchasing(true)
    const result = await showPaywall()
    setPurchasing(false)
    if (result.success) {
      onSuccess?.()
    }
  }

  async function handlePurchase(pkg) {
    setPurchasing(true)
    setSelectedPlan(pkg.identifier)
    const result = await purchase(pkg, checkoutRef.current)
    setPurchasing(false)
    setSelectedPlan(null)
    if (result.success) {
      onSuccess?.()
    }
  }

  function getPlanType(pkg) {
    const id = pkg.identifier?.toLowerCase() || ''
    if (id.includes('lifetime')) return 'lifetime'
    if (id.includes('annual') || id.includes('yearly')) return 'yearly'
    return 'monthly'
  }

  function formatPrice(pkg) {
    const product = pkg.rcBillingProduct || pkg.product
    if (!product) return 'Loading...'
    const price = product.currentPrice || product.price
    if (!price) return 'Loading...'
    return `${price.currencyCode} ${(price.amountMicros / 1_000_000).toFixed(2)}`
  }

  function getPeriodLabel(pkg) {
    const type = getPlanType(pkg)
    if (type === 'lifetime') return 'one-time'
    if (type === 'yearly') return '/year'
    return '/month'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-t-2xl p-8 text-center text-white">
          <Crown className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-3xl font-bold mb-2">Upgrade to MaliMind Pro</h2>
          <p className="text-primary-100 max-w-md mx-auto">
            Unlock unlimited AI financial coaching and premium features
          </p>
        </div>

        {/* Features */}
        <div className="px-8 py-6 border-b">
          <h3 className="font-semibold text-gray-800 mb-3">Everything in Pro:</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {PRO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="p-8">
          {packages.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {packages.map((pkg) => {
                  const planType = getPlanType(pkg)
                  const details = PLAN_DETAILS[planType] || PLAN_DETAILS.monthly
                  const Icon = details.icon

                  return (
                    <button
                      key={pkg.identifier}
                      onClick={() => handlePurchase(pkg)}
                      disabled={purchasing}
                      className={`relative border-2 rounded-xl p-5 text-left transition hover:shadow-lg disabled:opacity-50 ${
                        selectedPlan === pkg.identifier
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {details.badge && (
                        <span className="absolute -top-3 left-4 bg-accent-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {details.badge}
                        </span>
                      )}
                      <Icon className="w-6 h-6 text-primary-600 mb-2" />
                      <h4 className="font-semibold text-gray-800 capitalize">{planType}</h4>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatPrice(pkg)}
                        <span className="text-sm font-normal text-gray-500">{getPeriodLabel(pkg)}</span>
                      </p>
                      {purchasing && selectedPlan === pkg.identifier && (
                        <div className="mt-2 text-xs text-primary-600">Processing...</div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Divider with RC Paywall option */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={handleRCPaywall}
                disabled={purchasing}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {purchasing ? 'Loading...' : 'View Full Paywall'}
              </button>
            </>
          ) : (
            /* Fallback: use RC hosted paywall directly */
            <button
              onClick={handleRCPaywall}
              disabled={purchasing}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {purchasing ? 'Loading...' : 'Subscribe to Pro'}
            </button>
          )}
        </div>

        {/* Checkout target */}
        <div ref={checkoutRef} id="rcb-ui-root" />

        {/* Footer */}
        <div className="px-8 pb-6 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Maybe later
          </button>
          <p className="text-xs text-gray-400">
            Secured by RevenueCat. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
