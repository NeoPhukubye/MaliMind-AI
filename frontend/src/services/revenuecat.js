import { api } from './api'

const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY

export async function checkSubscription(userId) {
  try {
    const res = await api.get(`/api/subscriptions/status/${userId}`)
    return res.data
  } catch {
    return { isPro: false }
  }
}

export async function purchaseSubscription(userId) {
  const res = await api.post('/api/subscriptions/purchase', { userId })
  return res.data
}

export async function restorePurchases(userId) {
  const res = await api.post('/api/subscriptions/restore', { userId })
  return res.data
}
