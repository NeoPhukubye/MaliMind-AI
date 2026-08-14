import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Crown, Check, MessageCircle, BarChart3, Sparkles } from 'lucide-react'
import { useRevenueCat } from '../hooks/useRevenueCat'
import Paywall from '../components/paywall/Paywall'
import CustomerCenter from '../components/paywall/CustomerCenter'

export default function Premium() {
  const { isPro, loading } = useRevenueCat()
  const [showPaywall, setShowPaywall] = useState(false)
  const [showCustomerCenter, setShowCustomerCenter] = useState(false)
  const { t } = useTranslation()

  const FREE_FEATURES = [
    t('premium.freeFeatures.messages'),
    t('premium.freeFeatures.budget'),
    t('premium.freeFeatures.savings'),
    t('premium.freeFeatures.score'),
  ]

  const PRO_FEATURES = [
    t('premium.proFeatures.unlimited'),
    t('premium.proFeatures.priority'),
    t('premium.proFeatures.analytics'),
    t('premium.proFeatures.strategies'),
    t('premium.proFeatures.debt'),
    t('premium.proFeatures.export'),
    t('premium.proFeatures.support'),
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Crown className="w-12 h-12 text-accent-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900">
          {isPro ? t('premium.proTitle') : t('premium.upgradeTitle')}
        </h1>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          {isPro ? t('premium.proDesc') : t('premium.upgradeDesc')}
        </p>
      </div>

      {isPro ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-8 text-white text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">{t('premium.proActive')}</h2>
            <p className="text-primary-100">{t('premium.proAccess')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">{t('premium.yourFeatures')}</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {PRO_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowCustomerCenter(true)}
            className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            {t('premium.manageSubscription')}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-800">{t('premium.free')}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              R0<span className="text-sm font-normal text-gray-500">{t('premium.perMonth')}</span>
            </p>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-gray-400" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500"
            >
              {t('premium.currentPlan')}
            </button>
          </div>

          <div className="border-2 border-primary-500 rounded-2xl p-6 relative">
            <span className="absolute -top-3 left-4 bg-accent-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
              {t('premium.recommended')}
            </span>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-800">{t('premium.pro')}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              R99<span className="text-sm font-normal text-gray-500">{t('premium.perMonth')}</span>
            </p>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowPaywall(true)}
              className="w-full mt-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
            >
              {t('premium.upgradeNow')}
            </button>
          </div>
        </div>
      )}

      {showPaywall && (
        <Paywall
          onClose={() => setShowPaywall(false)}
          onSuccess={() => setShowPaywall(false)}
        />
      )}

      {showCustomerCenter && (
        <CustomerCenter onClose={() => setShowCustomerCenter(false)} />
      )}
    </div>
  )
}
