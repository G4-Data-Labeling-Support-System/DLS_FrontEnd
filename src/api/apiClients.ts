// API Clients
import { API_BASE_URL, createApiClient, getStoredToken, handleUnauthorized } from '@/lib/axios'

/**
 * Auth Client - Cho các API authentication
 */
export const authClient = createApiClient({
  baseURL: `${API_BASE_URL}/auth`,
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
