'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  address?: {
    line1: string
    locality: string
    city: string
    state: string
    country: string
    pincode: string
  }
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('jc_token')
    if (saved) {
      setToken(saved)
      axios.defaults.headers.common['Authorization'] = `Bearer ${saved}`
    }
    // Always verify the session against the server. This also picks up the
    // httpOnly cookie set by Google OAuth login (which never touches
    // localStorage), so the UI reflects a logged-in state after the redirect.
    axios.get('/api/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('jc_token')
        setToken(null)
        delete axios.defaults.headers.common['Authorization']
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await axios.post('/api/auth/login', { email, password })
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('jc_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
  }

  const register = async (formData: RegisterData) => {
    const { data } = await axios.post('/api/auth/register', formData)
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('jc_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jc_token')
    delete axios.defaults.headers.common['Authorization']
    axios.delete('/api/auth/me')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
