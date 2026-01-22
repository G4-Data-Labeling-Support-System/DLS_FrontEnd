// Auth Service - Business Logic
import { publicAuthClient } from '@/api/clients'
import { ENDPOINTS } from '@/api/endpoints'
import { useAuthStore } from '@/store'
import type { LoginInformation } from '../types/auth.types'

export class AuthService {
  /**
   * Handle user login
   */
  async login(loginInfo: LoginInformation): Promise<boolean> {
    try {
      const response = await publicAuthClient.post(ENDPOINTS.AUTH.LOGIN, loginInfo)
      const { user, accessToken } = response.data

      useAuthStore.getState().setUser(user)
      useAuthStore.getState().setToken(accessToken)
      localStorage.setItem('accessToken', accessToken)

      return true
    } catch {
      return false
    }
  }
}

export const authService = new AuthService()
