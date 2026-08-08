import { createContext, useContext, useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { loginWithClerk, getCurrentUser } from '../services/auth'

const AuthContext = createContext(null)

export function NoAuthProvider({ children }) {
  const login = () => alert('Authentication not configured. Set VITE_CLERK_PUBLISHABLE_KEY to enable login.')
  return (
    <AuthContext.Provider value={{ user: null, isAuthenticated: false, isLoading: false, login, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }) {
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

export const useAuth = () => useContext(AuthContext)
