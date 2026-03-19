import axiosClient from '@/lib/axios'
import { ENDPOINTS } from './endpoints'

export interface TaskDataItem {
  id: string
  filename: string
  fileFormat: string
  dataType: string
  uploadedAt: string
  previewUrl: string
  url?: string
}

import type { AnnotationSubmitItem } from '@/shared/types/api.types'

const taskApi = {
  getTaskDataItems(taskId: string) {
    try {
      const url = ENDPOINTS.TASKS.DATA_ITEMS(taskId)
      return axiosClient.get(url)
    } catch (error) {
      console.error(`Failed to fetch task data items for taskId: ${taskId}`, error)
      throw error
    }
  },

  getTaskById(taskId: string) {
    try {
      const url = ENDPOINTS.TASKS.DETAIL(taskId)
      return axiosClient.get(url)
    } catch (error) {
      console.error(`Failed to fetch task detail for taskId: ${taskId}`, error)
      throw error
    }
  },

  getTasksByAssignmentId(assignmentId: string) {
    try {
      const url = ENDPOINTS.TASKS.BY_ASSIGNMENT(assignmentId)
      return axiosClient.get(url)
    } catch (error) {
      console.error(`Failed to fetch tasks for assignmentId: ${assignmentId}`, error)
      throw error
    }
  },

  submitAnnotations(payload: { taskId: string; annotations: AnnotationSubmitItem[] }) {
    try {
      const url = '/annotations/submit'
      return axiosClient.post(url, payload)
    } catch (error) {
      console.error(`Failed to submit annotations for taskId: ${payload.taskId}`, error)
      throw error
    }
  }
}

export default taskApi
