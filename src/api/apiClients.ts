// API Clients
import { API_BASE_URL, createApiClient, getStoredToken, handleUnauthorized } from '@/lib/axios'

/**
 * Public Auth Client - Cho các API authentication không cần token (Login, Register...)
 */
export const publicAuthClient = createApiClient({
  baseURL: API_BASE_URL,
  // Không truyền getToken để tránh gửi kèm token
  // Không truyền onUnauthorized để tránh redirect loop nếu login thất bại
})

/**
 * Auth Client - Cho các API authentication cần token
 */
export const authClient = createApiClient({
  baseURL: API_BASE_URL,
  getToken: getStoredToken,
  onUnauthorized: handleUnauthorized
})

/**
 * Main Client - Cho các API chung
 */
export const mainClient = createApiClient({
  baseURL: API_BASE_URL,
  getToken: getStoredToken,
  onUnauthorized: handleUnauthorized
})
