// Auth Service - Business Logic
import { publicAuthClient } from '@/api/apiClients'
import { ENDPOINTS } from '@/api/endpoints'
import { useAuthStore } from '@/store'
import type { LoginInformation } from '../types/auth.types'
import type { User } from '@/shared/types/api.types'

export class AuthService {
  /**
   * Handle user login
   */
  async login(loginInfo: LoginInformation): Promise<unknown | null> {
    try {
      // 1. Gửi login request
      // console.log('Sending login request to:', ENDPOINTS.AUTH.LOGIN);
      const response = await publicAuthClient.post(ENDPOINTS.AUTH.LOGIN, loginInfo)
      // console.log('Login response data:', response.data);

      // Lấy token từ cấu trúc lồng: { code, data: { authenticate, token } }
      const finalToken = response.data?.data?.token || response.data?.token

      if (!finalToken) {
        console.error('No token found in login response structure:', response.data)
        return null
      }

      // 2. Lưu token ngay lập tức
      localStorage.setItem('accessToken', finalToken)
      useAuthStore.getState().setToken(finalToken)

      // 3. Decode JWT để lấy thông tin cơ bản (sub = email, role nếu có)
      let jwtUser: unknown = null
      try {
        const payloadBase64 = finalToken.split('.')[1]
        const decodedPayload = JSON.parse(atob(payloadBase64))
        // console.log('Decoded JWT Payload:', decodedPayload);
        jwtUser = {
          id: decodedPayload.sub || decodedPayload.id,
          email: decodedPayload.sub || decodedPayload.email,
          userRole:
            decodedPayload.role ||
            decodedPayload.userRole ||
            decodedPayload.authorities?.[0]?.replace('ROLE_', ''),
          ...decodedPayload
        }
        // console.log('JWT User:', jwtUser);
      } catch (jwtErr) {
        console.error('Failed to decode JWT:', jwtErr)
      }

      // 4. Gọi API profile (Sử dụng authClient vì đã có token trong localStorage)
      try {
        const { authClient } = await import('@/api/apiClients')
        const profileResponse = await authClient.get(ENDPOINTS.AUTH.PROFILE)
        const user = profileResponse.data.data || profileResponse.data

        // Merge JWT info with API Profile (API profile is more detailed)
        const finalUser = { ...(jwtUser as User), ...user }
        useAuthStore.getState().setUser(finalUser as User)
        localStorage.setItem('user', JSON.stringify(finalUser))
        // console.log('Final User from API:', finalUser);
        return finalUser
      } catch (profileErr) {
        console.warn('Profile endpoint error, falling back to JWT data:', profileErr)
        if (jwtUser) {
          useAuthStore.getState().setUser(jwtUser as User)
          return jwtUser
        }
      }

      return { userRole: 'USER' } // Last resort
    } catch (err: any) {
      const errorDetail = err.response?.data || err.message || err
      console.error('🚨 LOGIN FAILED:', errorDetail)
      // Ném lỗi ra ngoài kèm message chi tiết từ BE nếu có
      throw err
    }
  }
}

export const authService = new AuthService()
