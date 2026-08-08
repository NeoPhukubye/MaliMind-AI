import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { AuthContext } from './AuthContext'
import { loginWithClerk, getCurrentUser } from '../services/auth'

export function ClerkAuthProvider({ children }) {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser()
  const { openSignIn, signOut } = useClerk()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function sync() {
      if (!isLoaded) return
      if (isSignedIn && clerkUser) {
        try {
          const token = await clerkUser.getToken?.()
          if (token) {
            await loginWithClerk(token)
          }
          const u = await getCurrentUser()
          setUser(u)
        } catch {
          setUser({ name: clerkUser.fullName, email: clerkUser.primaryEmailAddress?.emailAddress })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
    sync()
  }, [isSignedIn, isLoaded, clerkUser])

  const login = () => openSignIn()
  const logout = () => {
    localStorage.removeItem('token')
    signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
