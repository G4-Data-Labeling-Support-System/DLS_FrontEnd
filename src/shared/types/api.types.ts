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
  id: string // or number, depends on BE. Usually string for UUID
  userId?: string // Some BE responses use this field
  username: string
  fullName: string
  email: string
  role: string
  userRole?: string // Some BE responses use this field
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVE' | string
  userStatus?: string // Some BE responses use this field
  avatar?: string
  coverImage?: string
  specialization?: string
  phone?: string
  createdAt?: string
}

export interface CreateUserRequest {
  username: string
  fullName: string
  email: string
  password?: string // Optional because UI might generate or backend generic
  role: string
  status?: string
  coverImage?: string
}

export interface UpdateUserRequest {
  username?: string
  fullName?: string
  email?: string
  role?: string
  userRole?: string
  specialization?: string
  phone?: string
  coverImage?: string
  userStatus?: string
}
// ============ Entity Types ============

export interface Project {
  projectId: string
  projectName: string
  description?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'ONGOING' | string
  projectStatus?: string
  createdAt?: string
  updatedAt?: string
}

export interface Label {
  labelId: string
  datasetId: string
  labelName: string
  color: string
  description?: string
  createdAt?: string
}

export interface DataItem {
  itemId: string
  datasetId: string
  fileName: string
  url: string
  fileFormat?: string
  fileSize?: number
  width?: number
  height?: number
  dataType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT' | string
  uploadedAt?: string
}

export interface Dataset {
  datasetId: string
  datasetName: string
  description?: string
  totalItems: number
  createdAt?: string
  project?: Project
  assignmentId?: string
  dataitems?: DataItem[]
  labels?: Label[]
}

export interface Assignment {
  assignmentId: string
  assignmentName: string
  description?: string
  assignmentStatus: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | string
  assignedBy: string
  assignedTo: string
  reviewedBy?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  project?: Project
  dataset?: Dataset
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface AnnotationSubmitItem {
  annotationConfidence: string
  annotationData: Record<string, any>
  annotationStatus: string
  annotationType: string
  comment: string
  dataitemId: string
  labelIds: string[]
}

export interface AnnotationSubmitPayload {
  taskId: string
  annotations: AnnotationSubmitItem[]
}