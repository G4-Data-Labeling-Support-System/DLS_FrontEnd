import axios from 'axios'
import { API_BASE_URL, getStoredToken } from '@/lib/axios'

export const labelApi = {
  /**
   * Get all labels - Uses direct axios to bypass global logout redirect on 403
   */
  getLabels: async (): Promise<unknown> => {
    const token = getStoredToken()
    const urls = [
      `${API_BASE_URL}/labels`,
      `${API_BASE_URL}/labels/`,
      `${API_BASE_URL}/label/all`,
      `${API_BASE_URL}/labels/all`,
      `${API_BASE_URL}/annotations/count`
    ]

    for (const url of urls) {
      try {
        // console.log(`Attempting to fetch label count from: ${url}`);
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 5000
        })

        if (response.data) {
          // console.log(`Success! Data from ${url}:`, response.data);
          return response.data
        }
      } catch (error: unknown) {
        const err = error as any
        console.warn(`Failed attempt for ${url}:`, err.response?.status || err.message)
        // Continue to next URL if it's 403 or 404
        if (err.response?.status === 403 || err.response?.status === 404) {
          continue
        }
        break // Stop on major errors like 500
      }
    }

    // Final fallback: Try to sum completed items from all assignments
    try {
      // console.log("Attempting to aggregate from assignments as fallback...");
      const response = await axios.get(`${API_BASE_URL}/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const assignments = response.data?.data || response.data || []
      if (Array.isArray(assignments)) {
        const totalCompleted = assignments.reduce(
          (acc: number, curr: any) => acc + (curr.completedItems || 0),
          0
        )
        // console.log("Aggregated label count from assignments:", totalCompleted);
        return { total: totalCompleted }
      }
    } catch (e) {
      console.warn('Failed to aggregate from assignments:', e)
    }

    return null
  }
}
