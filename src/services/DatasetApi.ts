import axiosClient from '@/utils/axios'
import type { AxiosProgressEvent } from 'axios'
import { ENDPOINTS } from './endpoints'

export interface GetDatasetsParams {
  datasetId?: string
  projectId?: string
  datasetName?: string
  description?: string
  totalItems?: number
  createdAt?: string
  dataItemStatus?: string
  datasetStatus?: string
  files?: string[]
}

const datasetApi = {
  getDatasets(params?: GetDatasetsParams) {
    try {
      const url = ENDPOINTS.DATASETS.LIST
      return axiosClient.get(url, { params })
    } catch (error) {
      console.error('Failed to fetch datasets', error)
      throw error
    }
  },
  getDatasetById(id: string) {
    try {
      // Nếu có ENDPOINTS.DATASETS.DETAIL thì dùng, nếu không thì ghép chuỗi
      const url = ENDPOINTS.DATASETS.DETAIL
        ? ENDPOINTS.DATASETS.DETAIL(id)
        : `${ENDPOINTS.DATASETS.LIST}/${id}`
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch dataset by id', error)
      throw error
    }
  },
  createDataset(
    data: { projectId: string; datasetName: string; description?: string; files?: File[] },
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ) {
    try {
      const url = ENDPOINTS.DATASETS.CREATE
      const formData = new FormData()
      formData.append('projectId', data.projectId)
      formData.append('datasetName', data.datasetName)
      if (data.description) {
        formData.append('description', data.description)
      }
      if (data.files) {
        data.files.forEach((file) => {
          formData.append('files', file)
        })
      }
      return axiosClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
      })
    } catch (error) {
      console.error('Failed to create dataset', error)
      throw error
    }
  },
  getDatasetsByProjectId(projectId: string) {
    try {
      const url = ENDPOINTS.DATASETS.BY_PROJECT(projectId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch datasets by project id', error)
      throw error
    }
  },
  getDatasetItems(datasetId: string) {
    try {
      const url = ENDPOINTS.DATAITEMS.BY_DATASET(datasetId)
      return axiosClient.get(url)
    } catch (error) {
      throw error
    }
  },
  getDataItemById(id: string) {
    try {
      const url = ENDPOINTS.DATA_ITEMS.DETAIL(id)
      return axiosClient.get(url)
    } catch (error) {
      throw error
    }
  },
  async updateDataset(
    id: string,
    data: {
      projectId?: string
      datasetName?: string
      description?: string
      files?: File[]
      deleteDataItemId?: string[]
    },
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ) {
    try {
      const url = ENDPOINTS.DATASETS.UPDATE(id)
      const formData = new FormData()

      const request: {
        projectId?: string
        datasetName?: string
        description?: string
        deleteDataItemId?: string[]
      } = {}
      if (data.projectId) request.projectId = data.projectId
      if (data.datasetName) request.datasetName = data.datasetName
      if (data.description !== undefined && data.description !== null) request.description = data.description
      if (data.deleteDataItemId && data.deleteDataItemId.length > 0) request.deleteDataItemId = data.deleteDataItemId

      const requestData = JSON.stringify(request)


      formData.append('request', requestData)

      if (data.files) {
        data.files.forEach((file) => {
          formData.append('files', file)
        })
      }

      const response = await axiosClient.put(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
      })
      return response
    } catch (error) {
      console.error('Failed to update dataset', error)
      throw error
    }
  },
  deleteDataset(id: string) {
    try {
      const url = ENDPOINTS.DATASETS.DELETE(id)
      return axiosClient.delete(url)
    } catch (error) {
      console.error('Failed to delete dataset', error)
      throw error
    }
  },
  deleteItem(id: string) {
    try {
      const url = ENDPOINTS.DATAITEMS.DELETE(id)
      return axiosClient.delete(url)
    } catch (error) {
      console.error('Failed to delete dataset item', error)
      throw error
    }
  }
}

export default datasetApi
