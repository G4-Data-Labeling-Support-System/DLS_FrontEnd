import { mainClient } from './apiClients'
import { ENDPOINTS } from './endpoints'
import assignmentApi from './AssignmentApi'
import taskApi, { type Task, type TaskDataItem } from './TaskApi'
import annotationApi from './annotation'

export interface HistoryEvent {
  id: string
  action: string
  user: string
  timestamp: string
  time?: string
  type?: 'success' | 'error' | 'info' | string
  details?: string
  comment?: string
  message?: string
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
  annotationId: string
  taskId: string
  dataItemId: string
  userId: string
  confidence: 'Low' | 'Medium' | 'High'
  comment: string
  annotationType: 'classification' | 'bounding_box' | 'polygon' | 'segmentation'
  annotationData: string | unknown
  annotationStatus: 'submitted' | 'approved' | 'rejected' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface ReviewerItem {
  id: string
  filename: string
  status: string
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
  reviewStatus: 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'INACTIVE'
  envidence?: string[] // or File[]
}

export interface ReviewUpdateRequest {
  reviews: ReviewItemRequest[]
}

export const reviewerApi = {
  getDashboardStats: async (): Promise<ReviewerStats> => {
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

  getProjectItems: async (projectId: string): Promise<ReviewerItem[]> => {
    try {
      const assignRes = await assignmentApi.getAssignmentsByProjectId(projectId)
      const assignments = assignRes.data?.data || assignRes.data || []
      if (assignments.length === 0) return []
      const assignmentId = assignments[0].assignmentId || assignments[0].id
      const taskRes = await taskApi.getTasksByAssignmentId(assignmentId)
      const tasks: Task[] = taskRes.data?.data || taskRes.data || []
      return tasks.map((t: Task) => ({
        id: t.taskId || t.id || '',
        filename: t.taskName || t.name || `Task ${t.taskId}`,
        status: (t.taskStatus || 'pending').toLowerCase(),
        imageUrl: '',
        lastModified: t.createdAt || ''
      }))
    } catch (error) {
      throw error
    }
  },

  getItemDetail: async (taskId: string): Promise<ReviewerItemDetail> => {
    try {
      const taskRes = await taskApi.getTaskById(taskId)
      const task: Task = taskRes.data?.data || taskRes.data
      const itemsRes = await taskApi.getTaskDataItems(taskId)
      const items: TaskDataItem[] = itemsRes.data?.data || itemsRes.data || []
      const firstItem = items[0]
      if (!firstItem) throw new Error('No data items found for task')

      const dataItemId = firstItem.dataItemId || firstItem.dataitemId || firstItem.id || firstItem.dataItem?.id
      let annotations: Annotation[] = []

      if (dataItemId) {
        try {
          const annoRes = await annotationApi.getAnnotationByDataItemId(dataItemId)
          const annoData = annoRes.data?.data || annoRes.data
          if (annoData) {
            annotations = (Array.isArray(annoData) ? annoData : [annoData]).map((ann: unknown) => {
              const a = ann as Record<string, unknown>
              return {
                annotationId: (a.annotationId as string) || (a.id as string) || '',
                taskId: (a.taskId as string) || '',
                dataItemId: (a.dataItemId as string) || '',
                userId: (a.userId as string) || '',
                confidence: (a.confidence as 'Low' | 'Medium' | 'High') || 'Medium',
                comment: (a.comment as string) || '',
                annotationType: (a.annotationType as 'classification' | 'bounding_box' | 'polygon' | 'segmentation') || 'bounding_box',
                annotationData: a.annotationData,
                annotationStatus: (a.annotationStatus as 'submitted' | 'approved' | 'rejected' | 'inactive') || 'submitted',
                createdAt: (a.createdAt as string) || '',
                updatedAt: (a.updatedAt as string) || ''
              }
            })
          }
        } catch (e) {
          console.warn(`Failed to fetch specific annotation for data item ${dataItemId}`, e)
        }
      }

      return {
        id: taskId,
        filename: task.taskName || task.name || `Task ${taskId}`,
        status: (task.taskStatus || 'pending').toLowerCase(),
        imageUrl: firstItem?.url || '',
        lastModified: task.createdAt || '',
        annotations,
        history: []
      }
    } catch (error) {
      console.error('Failed to fetch item details', error)
      throw error
    }
  },

  getReviewsByAnnotationId: async (annotationId: string) => {
    try {
      const response = await mainClient.get(ENDPOINTS.REVIEWS.BY_ANNOTATION(annotationId))
      return response.data
    } catch (error) {
      throw error
    }
  },

  submitReviewDecision: async (formData: FormData) => {
    try {
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
