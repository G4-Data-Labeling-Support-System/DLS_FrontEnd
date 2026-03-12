import axiosClient from '@/lib/axios'
import { ENDPOINTS } from './endpoints'

export interface GetDatasetsParams {
  datasetId?: string
  projectId?: string
  datasetName?: string
  description?: string
  totalItems?: number
  createdAt?: string
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
  createDataset(data: { projectId: string; datasetName: string; description?: string; files?: File[] }) {
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
        headers: { 'Content-Type': 'multipart/form-data' }
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
      console.error('Failed to fetch dataset items', error)
      throw error
    }
  },
  getDataItemById(id: string) {
    try {
      const url = ENDPOINTS.DATA_ITEMS.DETAIL(id)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch data item by id', error)
      throw error
    }
  },
  async updateDataset(id: string, datasetData: GetDatasetsParams) {
    try {
      const url = ENDPOINTS.DATASETS.UPDATE(id)
      console.log(url)
      console.log(datasetData)
      const response = await axiosClient.put(url, datasetData)
      return response
    } catch (error) {
      console.error('Failed to update dataset', error)
      throw error
    }
  },
  deleteDataset(id: string) {
    try {
      const url = ENDPOINTS.DATASETS.DETAIL
        ? ENDPOINTS.DATASETS.DETAIL(id)
        : `${ENDPOINTS.DATASETS.LIST}/${id}`
      return axiosClient.delete(url)
    } catch (error) {
      console.error('Failed to delete dataset', error)
      throw error
    }
  }
}

export default datasetApi
