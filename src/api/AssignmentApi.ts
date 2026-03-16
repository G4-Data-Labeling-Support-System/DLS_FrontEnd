import axiosClient from '@/lib/axios'
import { ENDPOINTS } from './endpoints'

interface GetAssignmentsParams {
  assignmentId?: string
  projectId?: string
  datasetId?: string
  assignmentName?: string
  assignedTo?: string
  assignedBy?: string
  reviewerId?: string
  reviewedBy?: string
  totalItems?: number
  completedItems?: number
  description?: string
  status?: string
  assignmentStatus?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

const assignmentApi = {
  getAssignments(params?: GetAssignmentsParams) {
    try {
      const url = ENDPOINTS.ASSIGNMENTS.LIST
      return axiosClient.get(url, { params })
    } catch (error) {
      console.error('Failed to fetch assignments', error)
      throw error
    }
  },
  async getAssignmentById(id: string) {
    try {
      // Temporary workaround for 500 error (Method Not Supported) on GET /assignments/{id}
      const url = ENDPOINTS.ASSIGNMENTS.LIST
      const response = await axiosClient.get(url)
      const data = response.data?.data || response.data || []
      if (Array.isArray(data)) {
        const found = data.find(
          (a: Record<string, unknown>) => String(a.assignmentId || a.id) === String(id)
        )
        if (found) {
          return { data: { data: found } }
        }
      }
      throw new Error('Assignment not found in list')
    } catch (error) {
      console.error('Failed to fetch assignment by id', error)
      throw error
    }
  },
  getAssignmentsByAnnotator(annotatorId: string) {
    try {
      const url = ENDPOINTS.ASSIGNMENTS.BY_ANNOTATOR(annotatorId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch assignments by annotator', error)
      throw error
    }
  },
  getAssignmentsByReviewer(reviewerId: string) {
    try {
      // Giả sử lấy assignments tổng có thể filter theo reviewer
      // Hiện tại API assignments của Annotator đang dùng `BY_ANNOTATOR`, do backend quyết định
      // Theo ý người dùng, api này dùng chung với annotator
      const url = ENDPOINTS.ASSIGNMENTS.BY_ANNOTATOR(reviewerId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch assignments by reviewer', error)
      throw error
    }
  },
  createAssignment(assignmentData?: GetAssignmentsParams) {
    try {
      const url = ENDPOINTS.ASSIGNMENTS.CREATE_BY_PROJECT(assignmentData?.projectId || '')
      return axiosClient.post(url, assignmentData)
    } catch (error) {
      console.error('Failed to create assignment', error)
      throw error
    }
  },
  updateAssignment(id: string, assignmentData?: GetAssignmentsParams) {
    try {
      const url = ENDPOINTS.ASSIGNMENTS.UPDATE(id)
      return axiosClient.put(url, assignmentData)
    } catch (error) {
      console.error('Failed to update assignment', error)
      throw error
    }
  },
  deleteAssignment(id: string) {
    try {
      const url = ENDPOINTS.ASSIGNMENTS.DELETE(id)
      return axiosClient.patch(url)
    } catch (error) {
      console.error('Failed to delete assignment', error)
      throw error
    }
  },
  getAssignmentsByProjectId(projectId: string) {
    try {
      const url = ENDPOINTS.ASSIGNMENTS.BY_PROJECT(projectId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch assignments by project id', error)
      throw error
    }
  },
  createAssignmentForProject(projectId: string, assignmentData?: GetAssignmentsParams) {
    try {
      const url = ENDPOINTS.ASSIGNMENTS.CREATE_BY_PROJECT(projectId)
      return axiosClient.post(url, assignmentData)
    } catch (error) {
      console.error('Failed to create assignment for project', error)
      throw error
    }
  },
  getLabelsByAssignmentId(assignmentId: string) {
    try {
      const url = ENDPOINTS.ASSIGNMENTS.LABELS(assignmentId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch labels for assignment', error)
      throw error
    }
  }
}

export default assignmentApi
export type { GetAssignmentsParams }
