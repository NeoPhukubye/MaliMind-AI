import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { checkEntitlement } from '../services/revenuecat'
import { api } from '../services/api'

export function useSubscription() {
  const { user } = useAuth()
  const [isPro, setIsPro] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const maxFreeMessages = 5

  useEffect(() => {
    if (user) {
      checkEntitlement().then((data) => {
        setIsPro(data.isPro || false)
      }).catch(() => {})

      api.get('/api/subscriptions/status/' + (user.id || '')).then((res) => {
        setIsPro(res.data.isPro || false)
        setMessageCount(res.data.messageCount || 0)
      }).catch(() => {})
    }
  }, [user])

  return { isPro, messageCount, maxFreeMessages }
}
