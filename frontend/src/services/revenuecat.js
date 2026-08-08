import { Purchases, LogLevel } from '@revenuecat/purchases-js'

const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || 'test_nWlWofeCMvLPvUMZRLNkUXsZdxW'
const ENTITLEMENT_ID = 'MaliMind AI Pro'

let purchasesInstance = null

/**
 * Initialize RevenueCat SDK with the given user ID.
 * Call this after authentication.
 */
export function initRevenueCat(appUserId) {
  if (purchasesInstance) return purchasesInstance

  Purchases.setLogLevel(LogLevel.Debug)

  purchasesInstance = Purchases.configure({
    apiKey: RC_API_KEY,
    appUserId: appUserId,
  })

  purchasesInstance.preload()
  return purchasesInstance
}

/**
 * Get the Purchases instance (must call initRevenueCat first).
 */
export function getPurchases() {
  if (!purchasesInstance) {
    throw new Error('RevenueCat not initialized. Call initRevenueCat(userId) first.')
  }
  return purchasesInstance
}

/**
 * Check if RevenueCat is initialized.
 */
export function isRevenueCatConfigured() {
  return Purchases.isConfigured()
}

/**
 * Check if the current user has the Pro entitlement.
 */
export async function checkEntitlement() {
  try {
    const purchases = getPurchases()
    const isEntitled = await purchases.isEntitledTo(ENTITLEMENT_ID)
    return { isPro: isEntitled }
  } catch (error) {
    console.error('Error checking entitlement:', error)
    return { isPro: false }
  }
}

/**
 * Get full customer info including entitlements and subscriptions.
 */
export async function getCustomerInfo() {
  try {
    const purchases = getPurchases()
    const customerInfo = await purchases.getCustomerInfo()

    const proEntitlement = customerInfo.entitlements.all[ENTITLEMENT_ID]
    const isPro = proEntitlement?.isActive ?? false

    return {
      isPro,
      entitlements: customerInfo.entitlements,
      activeSubscriptions: [...customerInfo.activeSubscriptions],
      allExpirationDates: customerInfo.allExpirationDatesByProduct,
      managementUrl: customerInfo.managementURL || null,
    }
  } catch (error) {
    console.error('Error getting customer info:', error)
    return { isPro: false, entitlements: null, activeSubscriptions: [], allExpirationDates: {}, managementUrl: null }
  }
}

/**
 * Get available offerings (products configured in RevenueCat dashboard).
 */
export async function getOfferings() {
  try {
    const purchases = getPurchases()
    const offerings = await purchases.getOfferings()
    return offerings
  } catch (error) {
    console.error('Error fetching offerings:', error)
    return null
  }
}

/**
 * Purchase a package using RevenueCat's built-in checkout UI.
 * @param {object} rcPackage - Package from offerings
 * @param {string} customerEmail - Optional email
 * @param {HTMLElement} htmlTarget - Optional mount point
 */
export async function purchasePackage(rcPackage, customerEmail, htmlTarget) {
  try {
    const purchases = getPurchases()
    const result = await purchases.purchase({
      rcPackage,
      customerEmail,
      htmlTarget,
    })
    return { success: true, customerInfo: result.customerInfo }
  } catch (error) {
    if (error.errorCode === 'UserCancelledError') {
      return { success: false, cancelled: true }
    }
    console.error('Purchase error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Present the RevenueCat Paywall UI.
 * @param {object} options - Paywall options
 */
export async function presentPaywall(options = {}) {
  try {
    const purchases = getPurchases()
    const result = await purchases.presentPaywall({
      ...options,
    })
    return { success: true, customerInfo: result.customerInfo }
  } catch (error) {
    if (error.errorCode === 'UserCancelledError') {
      return { success: false, cancelled: true }
    }
    console.error('Paywall error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Change user (e.g., after login/logout).
 */
export async function changeUser(newUserId) {
  try {
    const purchases = getPurchases()
    const customerInfo = await purchases.changeUser(newUserId)
    return customerInfo
  } catch (error) {
    console.error('Error changing user:', error)
    return null
  }
}

/**
 * Close the SDK instance (on logout).
 */
export function closeRevenueCat() {
  if (purchasesInstance) {
    purchasesInstance.close()
    purchasesInstance = null
  }
}
