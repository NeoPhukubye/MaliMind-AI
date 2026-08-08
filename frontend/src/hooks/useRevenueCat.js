import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  initRevenueCat,
  checkEntitlement,
  getCustomerInfo,
  getOfferings,
  presentPaywall,
  purchasePackage,
  closeRevenueCat,
  isRevenueCatConfigured,
} from '../services/revenuecat'

export function useRevenueCat() {
  const { user } = useAuth()
  const [isPro, setIsPro] = useState(false)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [offerings, setOfferings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize SDK when user is available
  useEffect(() => {
    if (!user) {
      setIsPro(false)
      setCustomerInfo(null)
      setLoading(false)
      return
    }

    const userId = user.id || user.email || 'anonymous'

    try {
      initRevenueCat(userId)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    async function loadData() {
      setLoading(true)
      try {
        const [entitlement, info, offers] = await Promise.all([
          checkEntitlement(),
          getCustomerInfo(),
          getOfferings(),
        ])

        setIsPro(entitlement.isPro)
        setCustomerInfo(info)
        setOfferings(offers)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    return () => {
      closeRevenueCat()
    }
  }, [user])

  // Refresh customer info
  const refresh = useCallback(async () => {
    if (!isRevenueCatConfigured()) return
    try {
      const [entitlement, info] = await Promise.all([
        checkEntitlement(),
        getCustomerInfo(),
      ])
      setIsPro(entitlement.isPro)
      setCustomerInfo(info)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // Show RevenueCat Paywall
  const showPaywall = useCallback(async (options = {}) => {
    if (!isRevenueCatConfigured()) {
      setError('RevenueCat not configured')
      return { success: false }
    }

    const result = await presentPaywall({
      customerEmail: user?.email,
      ...options,
    })

    if (result.success) {
      await refresh()
    }
    return result
  }, [user, refresh])

  // Purchase a specific package
  const purchase = useCallback(async (rcPackage, htmlTarget) => {
    if (!isRevenueCatConfigured()) {
      setError('RevenueCat not configured')
      return { success: false }
    }

    const result = await purchasePackage(rcPackage, user?.email, htmlTarget)

    if (result.success) {
      await refresh()
    }
    return result
  }, [user, refresh])

  // Get packages from the current/default offering
  const getPackages = useCallback(() => {
    if (!offerings?.current) return []
    return offerings.current.availablePackages || []
  }, [offerings])

  return {
    isPro,
    customerInfo,
    offerings,
    loading,
    error,
    showPaywall,
    purchase,
    refresh,
    getPackages,
  }
}
