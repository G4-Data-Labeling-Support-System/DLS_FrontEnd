import axiosClient from '@/lib/axios'
import { ENDPOINTS } from './endpoints'

export interface GetLabelsParams {
  labelId?: string
  labelName?: string
  description?: string
  labelStatus?: string
  projectId?: string
  createdAt?: string
  updatedAt?: string
}

const labelApiClient = {
  getLabels(params?: GetLabelsParams) {
    try {
      const url = ENDPOINTS.LABELS.LIST
      return axiosClient.get(url, { params })
    } catch (error) {
      console.error('Failed to fetch labels', error)
      throw error
    }
  },
  getLabelById(id: string) {
    try {
      const url = ENDPOINTS.LABELS.DETAIL(id)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch label by id', error)
      throw error
    }
  },
  createLabel(labelData?: GetLabelsParams) {
    try {
      const url = ENDPOINTS.LABELS.CREATE
      return axiosClient.post(url, labelData)
    } catch (error) {
      console.error('Failed to create label', error)
      throw error
    }
  },
  updateLabel(id: string, labelData?: GetLabelsParams) {
    try {
      const url = ENDPOINTS.LABELS.DETAIL(id)
      return axiosClient.put(url, labelData)
    } catch (error) {
      console.error('Failed to update label', error)
      throw error
    }
  },
  deleteLabel(id: string) {
    try {
      const url = ENDPOINTS.LABELS.DELETE(id)
      return axiosClient.delete(url)
    } catch (error) {
      console.error('Failed to delete label', error)
      throw error
    }
  }
}

export default labelApiClient
export { labelApiClient as labelApi }
