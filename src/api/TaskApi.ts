import axiosClient from '@/lib/axios'
import type { AxiosError } from 'axios'
import { ENDPOINTS } from './endpoints'
import type { AnnotationSubmitItem } from '@/shared/types/api.types'

export interface Task {
  taskId: string
  id?: string
  taskName: string
  name?: string
  taskStatus: string
  status?: string
  createdAt: string
  datasetId?: string
  assignmentId?: string
  projectId?: string
  [key: string]: unknown
}

export interface TaskDataItem {
  id: string
  itemId?: string
  dataItemId?: string
  dataitemId?: string
  dataItem?: {
    id: string
    url: string
    fileName: string
    fileFormat: string
    dataType: string
  }
  filename: string
  fileFormat: string
  dataType: string
  uploadedAt: string
  previewUrl: string
  url?: string
}

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
    } catch (error: unknown) {
      console.error(`Failed to fetch tasks for assignmentId: ${assignmentId}`)
      const axiosError = error as AxiosError
      if (axiosError.response) {
        console.error('❌ BE Error Detail:', axiosError.response.data)
      }
      throw error
    }
  },

  submitAnnotations(payload: { taskId: string; annotations: AnnotationSubmitItem[] }) {
    try {
      const url = '/annotations/submit'
      return axiosClient.post(url, payload)
    } catch (error: unknown) {
      console.error(`Failed to submit annotations for taskId: ${payload.taskId}`)
      const axiosError = error as AxiosError
      if (axiosError.response) {
        console.error('❌ BE Error Detail:', axiosError.response.data)
      }
      throw error
    }
  }
}

export default taskApi
