import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

type Role = 'admin' | 'user' | null

interface User {
  id: string
  email: string
  name: string
  role: Role
}

interface AuthContextType {
  user: User | null
  token: string | null
  role: Role
  login: (email: string, password: string, role: Role) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'zypark_token'
const ROLE_KEY = 'zypark_role'
const USER_KEY = 'zypark_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(USER_KEY)
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  const persist = useCallback((t: string, r: Role, u: User | null) => {
    localStorage.setItem(TOKEN_KEY, t)
    if (r) localStorage.setItem(ROLE_KEY, r)
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
  }, [])

  const fetchMe = useCallback(async (t: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    const res = await api.get('/auth/me')
    const data = res.data
    const u: User = { id: data.id, email: data.email, name: data.name || '', role: data.role }
    setUser(u)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    return u
  }, [])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    fetchMe(token).catch(() => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ROLE_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
    }).finally(() => setLoading(false))
  }, [token, fetchMe])

  const login = useCallback(async (email: string, password: string, role: Role) => {
    if (!role) throw new Error('Select role')
    const res = await api.post('/auth/login', { email, password, role })
    const { access_token, user_id, role: r } = res.data
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    const u: User = { id: user_id, email, name: '', role: r }
    try {
      const me = await fetchMe(access_token)
      persist(access_token, r, me)
    } catch {
      persist(access_token, r, u)
    }
  }, [persist, fetchMe])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await api.post('/auth/register', { email, password, name })
    const { access_token, user_id } = res.data
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    const u: User = { id: user_id, email, name, role: 'user' }
    persist(access_token, 'user', u)
  }, [persist])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(USER_KEY)
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }, [])

  const value: AuthContextType = {
    user,
    token,
    role: user?.role ?? null,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
