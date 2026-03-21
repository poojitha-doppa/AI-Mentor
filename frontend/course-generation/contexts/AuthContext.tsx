'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role?: 'learner' | 'educator' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const ADMIN_EMAILS = new Set([
  'harishbonu3@gmail.com',
  'poojithadoppa8@gmail.com'
])

function normalizeUserRole(rawUser: any): User {
  const email = String(rawUser?.email || '').trim().toLowerCase()
  const role = ADMIN_EMAILS.has(email) ? 'admin' : (rawUser?.role || 'learner')

  return {
    ...rawUser,
    email,
    role,
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Extract auth from URL parameters on mount (for cross-domain navigation)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const authToken = urlParams.get('auth_token')
      const authUser = urlParams.get('auth_user')
      
      if (authToken && authUser) {
        console.log('✅ Auth found in URL, storing in localStorage')
        localStorage.setItem('careersync_token', authToken)
        try {
          const parsed = JSON.parse(authUser)
          const normalizedUser = normalizeUserRole(parsed)
          localStorage.setItem('careersync_user', JSON.stringify(normalizedUser))
          setUser(normalizedUser)
          setIsAuthenticated(true)
        } catch {
          localStorage.setItem('careersync_user', authUser)
        }
        
        // Parse and set user
        try {
          const userData = normalizeUserRole(JSON.parse(authUser))
          setUser(userData)
          setIsAuthenticated(true)
        } catch (e) {
          console.error('Error parsing auth_user from URL:', e)
        }
        
        // Clean URL by removing auth parameters
        const cleanUrl = window.location.pathname + 
          (urlParams.toString() === '' ? '' : '?' + 
           Array.from(urlParams.entries())
                .filter(([key]) => !key.startsWith('auth_'))
                .map(([key, val]) => `${key}=${val}`)
                .join('&'))
        window.history.replaceState({}, document.title, cleanUrl)
      }
    }

    // Check authentication on mount
    checkAuth()

    // Poll auth status every 10 seconds
    const authCheckInterval = setInterval(checkAuth, 10000)
    
    return () => {
      clearInterval(authCheckInterval)
    }
  }, [])

  const checkAuth = async () => {
    try {
      // Get token from localStorage for cross-domain auth
      const token = typeof window !== 'undefined' ? localStorage.getItem('careersync_token') : null
      
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Try backend API first
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include', // Include cookies
        headers
      })

      if (response.ok) {
        const data = await response.json()
        const userData = normalizeUserRole(data.user || data)
        setUser(userData)
        setIsAuthenticated(true)
        // Store user data for other apps to access
        if (typeof window !== 'undefined') {
          localStorage.setItem('careersync_user', JSON.stringify(userData))
        }
        return
      }
    } catch (error) {
      console.log('Backend auth check failed, trying localStorage fallback:', error)
    }

    // Fallback to localStorage if backend fails
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('careersync_user')
      const storedToken = localStorage.getItem('careersync_token')
      
      if (storedUser) {
        try {
          const userData = normalizeUserRole(JSON.parse(storedUser))
          console.log('✅ Using localStorage auth:', userData)
          setUser(userData)
          setIsAuthenticated(true)
          localStorage.setItem('careersync_user', JSON.stringify(userData))
          return
        } catch (e) {
          console.error('Error parsing stored user:', e)
        }
      }
    }

    // No auth found
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const userData = normalizeUserRole(data.user || data)
        
        // Store token if provided
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('careersync_token', data.token)
          console.log('✅ Token stored:', data.token.substring(0, 20) + '...')
        }
        
        // Store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('careersync_user', JSON.stringify(userData))
          console.log('✅ User stored:', userData)
        }
        
        setUser(userData)
        setIsAuthenticated(true)
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('careersync_token')
      localStorage.removeItem('careersync_user')
    }
    
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
