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

        if (response.data) {
          // console.log(`Success! Data from ${url}:`, response.data);
          return response.data
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.warn(`Failed attempt for ${url}:`, error.response?.status || error.message)
          // Continue to next URL if it's 403 or 404
          if (error.response?.status === 403 || error.response?.status === 404) {
            continue
          }
        } else {
          console.warn(`Unexpected error for ${url}:`, error)
        }
        break // Stop on major errors like 500
      }
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
      // console.log("Attempting to aggregate from assignments as fallback...");
      const response = await axios.get(`${API_BASE_URL}/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const assignments = response.data?.data || response.data || []
      if (Array.isArray(assignments)) {
        const totalCompleted = assignments.reduce(
          (acc: number, curr: { completedItems?: number }) => acc + (curr.completedItems || 0),
          0
        )
        // console.log("Aggregated label count from assignments:", totalCompleted);
        return { total: totalCompleted }
      }
    } catch (e) {
      console.warn('Failed to aggregate from assignments:', e)
    }
  }
}

export default labelApiClient
export { labelApiClient as labelApi }
