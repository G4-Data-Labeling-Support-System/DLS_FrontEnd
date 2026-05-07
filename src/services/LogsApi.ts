import axiosClient from '@/utils/axios'
import { ENDPOINTS } from './endpoints'

export interface LogEntry {
  username: string
  action: string
  entityName: string
  entityId: string
  description: string
  ipAddress: string
  timestamp: string
}

const logsApi = {
  getLogs() {
    try {
      const url = ENDPOINTS.LOGS.LIST
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch logs', error)
      throw error
    }
  }
}

export default logsApi
