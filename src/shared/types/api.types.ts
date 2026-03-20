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
  projectStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'INACTIVE' | string
  createdAt?: string
  updatedAt?: string
}

export interface Label {
  labelId: string
  datasetId: string
  labelName: string
  color: string
  description?: string
  labelStatus?: 'ACTIVE' | 'INACTIVE' | string
  status?: 'ACTIVE' | 'INACTIVE' | string
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
  dataItemStatus?: 'ACTIVE' | 'INACTIVE' | string
  uploadedAt?: string
}

export interface Dataset {
  datasetId: string
  datasetName: string
  description?: string
  totalItems: number
  datasetStatus?: 'ACTIVE' | 'INACTIVE' | string
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
  assignmentStatus: 'ASSIGNED' | 'IN_PROGRESS' | 'REVIEWING' | 'COMPLETED' | 'INACTIVE' | string
  assignedBy: string
  assignedTo: string
  reviewedBy?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  project?: Project
  dataset?: Dataset
}

export interface Task {
  taskId: string
  taskName: string
  taskType: 'BATCH' | 'ClASSIFICATION' | string
  completedItems?: number
  totalItems?: number
  flagForReview?: boolean
  taskStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'INACTIVE' | string
  createdAt?: string
  assignmentId?: string
  assignment?: Assignment
  annotations?: any[]
  taskDataitems?: TaskDataItem[]
}

export interface TaskDataItem {
  taskItemId: string
  itemIndex: number
  task?: Task
  dataitem?: DataItem
  taskDataItemStatus: 'IN_PROGRESS' | 'COMPLETED' | string
  assignedAt?: string
  completedAt?: string
}

export interface Review {
  reviewId: string
  reviewStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'INACTIVE' | string
  comment?: string
  reviewedAt?: string
  user?: User
  annotation?: any
  evidences?: string[]
}

export interface Guideline {
  guideId: string
  title: string
  content: string
  version?: number
  guidelineStatus?: 'ACTIVE' | 'INACTIVE' | string
  status?: 'ACTIVE' | 'INACTIVE' | string
  createdAt?: string
  updatedAt?: string
  project?: Project
  projectId?: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface AnnotationSubmitItem {
  annotationConfidence: 'LOW' | 'MEDIUM' | 'HIGH' | string
  annotationData: Record<string, unknown>
  annotationStatus: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'INACTIVE' | string
  annotationType: 'CLASSIFICATION' | 'BOUNDING_BOX' | 'POLYGON' | 'SEGMENTATION' | string
  comment: string
  dataitemId: string
  labelIds: string[]
}

export interface AnnotationSubmitPayload {
  taskId: string
  annotations: AnnotationSubmitItem[]
}
