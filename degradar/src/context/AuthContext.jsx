import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user has valid token on mount
    const token = auth.getToken()
    setIsAuthenticated(!!token)
  }, [])

  const login = (access, refresh) => {
    auth.setTokens(access, refresh)
    setIsAuthenticated(true)
  }

  const logout = () => {
    auth.clearTokens()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
