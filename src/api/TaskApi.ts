import axiosClient from '@/lib/axios'
import { ENDPOINTS } from './endpoints'

const taskApi = {
  getTasksByAssignmentId(assignmentId: string) {
    try {
      const url = ENDPOINTS.TASKS.BY_ASSIGNMENT(assignmentId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch tasks for assignment', error)
      throw error
    }
  },

  getTaskById(taskId: string) {
    try {
      const url = ENDPOINTS.TASKS.DETAIL(taskId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch task elements', error)
      throw error
    }
  }
}

export default taskApi
