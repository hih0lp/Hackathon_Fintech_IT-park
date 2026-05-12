import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user has valid token on mount
    const token = auth.getToken()
    setIsAuthenticated(!!token)
    
    // Try to get user data from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (access, refresh, userData) => {
    auth.setTokens(access, refresh)
    setIsAuthenticated(true)
    if (userData) {
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const logout = () => {
    auth.clearTokens()
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
