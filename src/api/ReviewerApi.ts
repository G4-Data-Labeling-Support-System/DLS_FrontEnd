import { mainClient } from './apiClients'
import { ENDPOINTS } from './endpoints'
import assignmentApi from './AssignmentApi'
import taskApi from './TaskApi'

export interface HistoryEvent {
  id: string
  action: string
  user: string
  timestamp: string
  time?: string
  type?: 'success' | 'error' | 'info' | string
  details?: string
  comment?: string
}

export interface ReviewerStats {
  totalSubmissions: number
  totalSubmissionsTrend: number // percentage
  pendingReviews: number
  averageAccuracy: number
  averageAccuracyTrend: number // percentage
  topPerformer: {
    name: string
    precision: number
    avatar?: string
  }
}

export interface Annotation {
  id: string
  label: string
  confidence: number
  color: string
  bbox: { x: number; y: number; w: number; h: number }
}

export interface ReviewerItem {
  id: string
  filename: string
  status: 'approved' | 'rejected' | 'pending'
  imageUrl: string
  lastModified: string
}

export interface ReviewerItemDetail extends ReviewerItem {
  annotations: Annotation[]
  history: HistoryEvent[]
  annotator?: {
    name: string
    role: string
    level: number
    accuracy: string
    speed: string
    avatar?: string
  }
}

export interface ReviewItemRequest {
  annotationId: string
  comment?: string
  reviewStatus: 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'INACTIVE'
  envidence?: string[] // or File[]
}

export interface ReviewUpdateRequest {
  reviews: ReviewItemRequest[]
}

export const reviewerApi = {
  getDashboardStats: async (): Promise<ReviewerStats> => {
    // Mocking for now since there's no official endpoint
    return {
      totalSubmissions: 0,
      totalSubmissionsTrend: 0,
      pendingReviews: 0,
      averageAccuracy: 0,
      averageAccuracyTrend: 0,
      topPerformer: {
        name: 'N/A',
        precision: 0
      }
    }
  },

  // New: Get assignments for a project, then tasks (Real API flow)
  getProjectItems: async (projectId: string): Promise<ReviewerItem[]> => {
    try {
      // 1. Get assignments for the project
      const assignRes = await assignmentApi.getAssignmentsByProjectId(projectId)
      const assignments = assignRes.data?.data || assignRes.data || []
      
      // 2. For simplicity, get tasks of the first assignment
      if (assignments.length === 0) return []
      const assignmentId = assignments[0].assignmentId || assignments[0].id
      
      const taskRes = await taskApi.getTasksByAssignmentId(assignmentId)
      const tasks = taskRes.data?.data || taskRes.data || []
      
      return tasks.map((t: any) => ({
        id: t.taskId || t.id,
        filename: t.taskName || t.name || `Task ${t.taskId}`,
        status: (t.taskStatus || 'pending').toLowerCase() as any,
        imageUrl: '', // Will be loaded in detail
        lastModified: t.createdAt || ''
      }))
    } catch (error) {
      console.error('Failed to fetch project items via assignment/task flow', error)
      throw error
    }
  },

  getItemDetail: async (taskId: string): Promise<ReviewerItemDetail> => {
    try {
      // 1. Get task details
      const taskRes = await taskApi.getTaskById(taskId)
      const task = taskRes.data?.data || taskRes.data

      // 2. Get data items of the task to get the Image URL
      const itemsRes = await taskApi.getTaskDataItems(taskId)
      const items = itemsRes.data?.data || itemsRes.data || []
      const firstItem = items[0]?.dataItem || items[0]

      // 3. Return normalized detail
      return {
        id: taskId,
        filename: task.taskName || task.name || `Task ${taskId}`,
        status: (task.taskStatus || 'pending').toLowerCase() as any,
        imageUrl: firstItem?.url || '',
        lastModified: task.createdAt || '',
        annotations: (firstItem?.annotationResponseList || firstItem?.annotations || []).map((ann: any) => ({
           id: ann.annotationId || ann.id,
           label: ann.labelName || ann.labelId || 'Unknown',
           confidence: ann.annotationConfidence === 'HIGH' ? 0.9 : 0.5,
           color: '#f5222d',
           bbox: typeof ann.annotationData === 'string' ? JSON.parse(ann.annotationData).bbox : ann.annotationData?.bbox || { x: 0, y: 0, w: 100, h: 100 }
        })),
        history: []
      }
    } catch (error) {
      console.error('Failed to fetch item details via task flow', error)
      throw error
    }
  },

  getReviewsByAnnotationId: async (annotationId: string) => {
    try {
      const response = await mainClient.get(ENDPOINTS.REVIEWS.BY_ANNOTATION(annotationId))
      return response.data
    } catch (error) {
      console.error('Failed to fetch reviews for annotation', error)
      throw error
    }
  },

  submitReviewDecision: async (payload: ReviewUpdateRequest) => {
    try {
      // Dựa theo api-docs.json thì PUT /api/v1/reviews/update là dạng multipart/form-data
      // Để tương thích trước mắt nếu không có file, ta có can convert JSON or use as config data
      // Chú ý backend: Nếu swagger là multipart form data, ta sẽ làm 1 parser sang FormData
      const formData = new FormData()
      
      formData.append('reviews', new Blob([JSON.stringify(payload.reviews)], { type: 'application/json' }))

      const response = await mainClient.put(ENDPOINTS.REVIEWS.UPDATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      console.error('Failed to submit review decision', error)
      throw error
    }
  }
}
