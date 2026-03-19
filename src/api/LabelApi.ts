import axiosClient from '@/lib/axios'
import { ENDPOINTS } from './endpoints'

export interface GetLabelsParams {
  labelId?: string
  labelName?: string
  color?: string
  description?: string
  labelStatus?: string
  projectId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateLabelPayload {
  labelName: string
  color: string
  description: string
}

export interface UpdateLabelPayload {
  labelName?: string
  color?: string
  description?: string
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
  createLabel(datasetId: string, labelData: CreateLabelPayload) {
    try {
      const url = ENDPOINTS.LABELS.CREATE(datasetId)
      return axiosClient.post(url, labelData)
    } catch (error) {
      console.error('Failed to create label', error)
      throw error
    }
  },
  updateLabel(id: string, labelData: UpdateLabelPayload) {
    try {
      const url = ENDPOINTS.LABELS.UPDATE(id)
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
  },
  getLabelsByDatasetId(datasetId: string) {
    try {
      const url = ENDPOINTS.LABELS.BY_DATASET(datasetId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch labels by dataset id', error)
      throw error
    }
  }
}

export default labelApiClient
export { labelApiClient as labelApi }
