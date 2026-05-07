import { useQuery } from '@tanstack/react-query'
import logsApi, { type LogEntry } from '@/services/LogsApi'

export const useLogs = (options?: { enabled?: boolean; pollingInterval?: number }) => {
  return useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const response = await logsApi.getLogs()
      const data = response.data?.data || response.data || []
      return (Array.isArray(data) ? data : []).sort((a: LogEntry, b: LogEntry) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ) as LogEntry[]
    },
    enabled: options?.enabled !== false,
    refetchInterval: options?.pollingInterval || 30000, // Default 30s polling
    staleTime: 5000
  })
}
