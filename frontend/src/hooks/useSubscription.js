import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { checkSubscription, purchaseSubscription } from '../services/revenuecat'

export function useSubscription() {
  const { user } = useAuth()
  const [isPro, setIsPro] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const maxFreeMessages = 5

  useEffect(() => {
    if (user) {
      checkSubscription(user.id || user.email).then((data) => {
        setIsPro(data.isPro || false)
        setMessageCount(data.messageCount || 0)
      })
    }
  }, [user])

  async function subscribe() {
    if (!user) return
    const result = await purchaseSubscription(user.id || user.email)
    if (result.success) setIsPro(true)
  }

  return { isPro, subscribe, messageCount, maxFreeMessages }
}
