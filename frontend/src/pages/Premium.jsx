import { Check, Crown } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'

const plans = [
  {
    name: 'Free',
    price: 'R0',
    period: '/month',
    features: ['Budget Planner', 'Expense Tracker', '3 Savings Goals', 'AI Financial Score', '5 AI Coach Messages/day'],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    name: 'MaliMind Pro',
    price: 'R99',
    period: '/month',
    features: [
      'Unlimited AI Coaching',
      'Debt Optimization',
      'AI Statement Analysis',
      'Spending Predictions',
      'Smart Alerts',
      'Premium Reports',
      'Unlimited Savings Goals',
      'Priority Support',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
]

export default function Premium() {
  const { isPro, subscribe } = useSubscription()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Crown className="w-12 h-12 text-accent-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Upgrade Your Financial Future</h1>
        <p className="text-gray-500 mt-2">Unlock the full power of AI-driven financial coaching</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl p-6 ${plan.highlighted ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-500' : 'bg-white shadow-sm border'}`}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className={`text-sm ${plan.highlighted ? 'text-primary-200' : 'text-gray-500'}`}>{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className={`w-4 h-4 ${plan.highlighted ? 'text-accent-300' : 'text-primary-500'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={plan.highlighted && !isPro ? subscribe : undefined}
              disabled={!plan.highlighted || isPro}
              className={`w-full py-3 rounded-lg font-medium transition ${
                plan.highlighted
                  ? 'bg-white text-primary-700 hover:bg-gray-100'
                  : 'bg-gray-100 text-gray-500 cursor-default'
              } disabled:opacity-60`}
            >
              {isPro && plan.highlighted ? 'Active' : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
