import { create } from 'zustand'
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
  getRefreshToken,
  BASE_URL,
} from '@/api/client'
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '@/api/auth'
import type { User } from '@/types/api'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  async initialize() {
    const rt = getRefreshToken()
    if (!rt) {
      set({ isInitializing: false })
      return
    }
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      })
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { accessToken: string; refreshToken: string; user: User }
      setAccessToken(data.accessToken)
      setRefreshToken(data.refreshToken)
      set({ user: data.user, isAuthenticated: true })
    } catch {
      clearTokens()
    } finally {
      set({ isInitializing: false })
    }
  },

  async login(email, password) {
    const data = await apiLogin(email, password)
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    set({ user: data.user, isAuthenticated: true })
  },

  async register(name, email, password) {
    const data = await apiRegister(name, email, password)
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    set({ user: data.user, isAuthenticated: true })
  },

  async logout() {
    const rt = getRefreshToken()
    if (rt) await apiLogout(rt)
    clearTokens()
    set({ user: null, isAuthenticated: false })
  },

  setUser(user) {
    set({ user })
  },
}))

export const useIsAdmin = () => useAuthStore((s) => s.user?.roleId === 2)
