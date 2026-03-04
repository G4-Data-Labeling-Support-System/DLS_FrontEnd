import type { User } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Auth State Interface
interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user
        }),

      setToken: (token) =>
        set({
          accessToken: token
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false
        }),

      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
