import axiosClient from '@/lib/axios'
import { ENDPOINTS } from './endpoints'

interface GetGuidelinesParams {
  guide_id?: string
  content?: string
  createdAt?: string
  status?: string
  title?: string
  version?: string
  projectId?: string
  user_id?: string
}

const guidelineApi = {
  getGuidelines(projectId: string) {
    try {
      const url = ENDPOINTS.GUIDELINES.LIST(projectId)
      return axiosClient.get(url)
    } catch (error) {
      console.error('Failed to fetch guidelines', error)
      throw error
    }
  },
  createGuideline(projectId: string, guidelineData?: GetGuidelinesParams) {
    try {
      const url = ENDPOINTS.GUIDELINES.CREATE(projectId)
      return axiosClient.post(url, guidelineData, {
        headers: {
          user_id: guidelineData?.user_id
        }
      })
    } catch (error) {
      console.error('Failed to create project', error)
      throw error
    }
  },
  updateGuideline(guidelineId: string, guidelineData?: GetGuidelinesParams) {
    try {
      const url = ENDPOINTS.GUIDELINES.UPDATE(guidelineId)
      return axiosClient.put(url, guidelineData)
    } catch (error) {
      console.error('Failed to update guideline', error)
      throw error
    }
  },
  deleteGuideline(guidelineId: string) {
    try {
      const url = ENDPOINTS.GUIDELINES.DELETE(guidelineId)
      return axiosClient.patch(url)
    } catch (error) {
      console.error('Failed to delete guideline', error)
      throw error
    }
  }
}

export default guidelineApi
export type { GetGuidelinesParams }
