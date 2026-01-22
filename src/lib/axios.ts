// API Client - Axios instance factory
import type { ApiClientConfig } from '@/shared/types'
import axios, { type AxiosInstance } from 'axios'

// ============ Config ============

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ============ Auth Handlers ============

export const getStoredToken = (): string | null => localStorage.getItem('accessToken')

export const handleUnauthorized = (): void => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
}

// ============ Factory ============

export function createApiClient({
  baseURL,
  timeout = 10000,
  headers = {},
  getToken,
  onUnauthorized,
  onForbidden
}: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
    headers: { 'Content-Type': 'application/json', ...headers }
  })

  client.interceptors.request.use((config) => {
    const token = getToken?.()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status
      if (status === 401) onUnauthorized?.()
      if (status === 403) onForbidden?.()
      return Promise.reject(error)
    }
  )

  return client
}
