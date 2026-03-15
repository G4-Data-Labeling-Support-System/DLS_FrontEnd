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

const taskApi = {
  async getTaskDataItems(taskId: string) {
    try {
      const url = ENDPOINTS.TASKS.DATA_ITEMS(taskId)
      const response = await axiosClient.get(url)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch task data items for taskId: ${taskId}`, error)
      throw error
    }
  }
}

export default taskApi
