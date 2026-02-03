// API Types
import type { AxiosInstance } from 'axios'

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  getToken?: () => string | null
  onUnauthorized?: () => void
  onForbidden?: () => void
}

export type ApiClient = AxiosInstance

// ============ User Types ============

export interface User {
  id: string; // or number, depends on BE. Usually string for UUID
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
  password?: string; // Optional because UI might generate or backend generic
  role: string;
}

