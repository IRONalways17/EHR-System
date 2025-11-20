import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Hardcoded credentials (for demo purposes)
const VALID_CREDENTIALS = {
  username: 'doctor',
  password: 'HealthCare@2025',
  name: 'Dr. Aaryan Choudhary',
  email: 'rampyaaryan17@gmail.com',
  role: 'Senior Physician',
  department: 'General Medicine'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      // Generate a simple JWT-like token (in production, this would come from backend)
      const token = btoa(JSON.stringify({
        username,
        timestamp: Date.now(),
        expiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }))

      const userData = {
        username: VALID_CREDENTIALS.username,
        name: VALID_CREDENTIALS.name,
        email: VALID_CREDENTIALS.email,
        role: VALID_CREDENTIALS.role,
        department: VALID_CREDENTIALS.department,
        loginTime: new Date().toLocaleString()
      }

      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true, user: userData }
    }
    
    return { success: false, error: 'Invalid username or password' }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
