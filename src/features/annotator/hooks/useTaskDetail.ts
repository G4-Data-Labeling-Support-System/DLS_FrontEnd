import { useQuery } from '@tanstack/react-query'
import taskApi from '@/api/TaskApi'

export const useTaskDetail = (taskId: string | undefined) => {
  return useQuery({
    queryKey: ['taskDetail', taskId],
    queryFn: async () => {
      const response = await taskApi.getTaskDataItems(taskId!)
      return response.data?.data || response.data || []
    },
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
