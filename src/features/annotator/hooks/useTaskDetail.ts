import { useQuery } from '@tanstack/react-query'
import taskApi from '@/api/TaskApi'

export const useTaskDetail = (taskId: string | undefined) => {
  return useQuery({
    queryKey: ['taskDetail', taskId],
    queryFn: () => taskApi.getTaskDataItems(taskId!),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
