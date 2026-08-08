import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function NoAuthProvider({ children }) {
  const login = () => alert('Authentication not configured. Set VITE_CLERK_PUBLISHABLE_KEY to enable login.')
  return (
    <AuthContext.Provider value={{ user: null, isAuthenticated: false, isLoading: false, login, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export const useAuth = () => useContext(AuthContext)
