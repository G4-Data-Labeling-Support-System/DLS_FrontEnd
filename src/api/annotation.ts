import axiosClient from '@/lib/axios'
import { ENDPOINTS } from './endpoints'

export interface GetAnnotationsParams {
  id?: string
  annotationId?: string
  projectId?: string
  datasetId?: string
  name?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

const annotationApi = {
  getAnnotations(params?: GetAnnotationsParams) {
    try {
      const url = ENDPOINTS.ANNOTATIONS.LIST
      return axiosClient.get(url, { params })
    } catch (error) {
      console.error('Failed to fetch annotations', error)
      throw error
    }
  },
  getAnnotationById(id: string) {
    try {
      const url = ENDPOINTS.ANNOTATIONS.DETAIL(id)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch annotation by id', error)
      throw error
    }
  }
}

export default annotationApi
