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
  userRole?: string; // Some BE responses use this field
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  coverImage?: string;
  specialization?: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
  password?: string; // Optional because UI might generate or backend generic
  role: string;
}

export interface UpdateUserRequest {
  email?: string;
  role?: string;
  userRole?: string;
  specialization?: string;
}

