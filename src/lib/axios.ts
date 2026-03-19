import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store'

// ============ Types ============
// Định nghĩa lại Config để không phụ thuộc file bên ngoài nếu chưa có
export interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  getToken?: () => string | null
  getRefreshToken?: () => string | null // Thêm function lấy refresh token
  onUnauthorized?: (error?: AxiosError) => void
  onForbidden?: (error?: AxiosError) => void
}

// Mở rộng type cho Request Config để thêm cờ _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// ============ Config & State ============
export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL

// Biến trạng thái cho logic Refresh Token
let isRefreshing = false

interface FailedQueueItem {
  resolve: (token: string | null) => void
  reject: (error: AxiosError | null) => void
}

let failedQueue: FailedQueueItem[] = []

// Hàm xử lý hàng đợi các request bị lỗi
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ============ Auth Helpers (Mặc định) ============
export const getStoredToken = () => localStorage.getItem('accessToken')
const defaultGetRefreshToken = () => localStorage.getItem('refreshToken')

export const handleUnauthorized = (error?: AxiosError) => {
  // Log specific error details for debugging before logout
  if (error) {
    console.error('🚨 AUTH ERROR DETECTED', {
      url: error.config?.url,
      status: error.response?.status,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data
    })
  }

  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')

  // Đồng bộ với Zustand Store
  useAuthStore.getState().logout()

  // Chỉ redirect nếu chưa ở trang login để tránh lặp vô tận
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
}

// ============ Factory Function ============
export function createApiClient({
  baseURL = API_BASE_URL,
  timeout = 3000000, // 3000s (50 minutes) for large uploads
  headers = {},
  getToken = getStoredToken,
  getRefreshToken = defaultGetRefreshToken,
  onUnauthorized = handleUnauthorized,
  onForbidden
}: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
    headers: { 'Content-Type': 'application/json', ...headers }
  })

  // 1. Request Interceptor: Gắn Token
  client.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 2. Response Interceptor: Xử lý lỗi & Refresh Token
  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig
      const status = error.response?.status

      // Xử lý lỗi 403 Forbidden
      if (status === 403) {
        if (onForbidden) {
          onForbidden(error)
        } else {
          // Nếu không có handler riêng, coi như unauthorized (hết hạn session)
          onUnauthorized(error)
        }
        return Promise.reject(error)
      }

      // Xử lý lỗi 401 Unauthorized (Token hết hạn)
      if (status === 401 && originalRequest && !originalRequest._retry) {
        // Nếu đang refresh thì đẩy request này vào hàng đợi
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              return client(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = getRefreshToken()
          // Gọi API refresh token (Sử dụng instance axios mới để tránh loop interceptor)
          const response = await axios.post(`${baseURL}/auth/refresh-token`, {
            refreshToken
          })

          const { accessToken } = response.data

          // Lưu token mới
          localStorage.setItem('accessToken', accessToken)

          // Set lại header cho request gốc
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }

          // Xử lý hàng đợi đang chờ
          processQueue(null, accessToken)

          // Gọi lại request gốc
          return client(originalRequest)
        } catch (refreshError) {
          // Nếu refresh fail thì force logout
          processQueue(refreshError as AxiosError, null)
          onUnauthorized(refreshError as AxiosError)
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )

  return client
}

// ============ Default Instance Export ============
// Tạo sẵn một instance để dùng ngay trong app (Singleton)
const axiosClient = createApiClient({
  baseURL: API_BASE_URL
})

export default axiosClient
