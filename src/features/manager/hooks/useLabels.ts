import { useQuery, useQueryClient } from '@tanstack/react-query'
import labelApiClient, { type GetLabelsParams } from '@/services/LabelApi'

const mapLabel = (l: Record<string, unknown>): GetLabelsParams => {
  const mapped: GetLabelsParams = {}
  if (l.labelId || l.id) {
    mapped.labelId = String(l.labelId || l.id)
  }
  if (l.labelName || l.name) {
    mapped.labelName = String(l.labelName || l.name)
  }
  const status = String(l.labelStatus || l.status || l.label_status || '')
    .trim()
    .toUpperCase()
  mapped.labelStatus = status
  if (l.description) {
    mapped.description = String(l.description)
  }
  if (l.color) {
    mapped.color = String(l.color)
  }
  if (l.datasetId || l.dataset_id) {
    mapped.datasetId = String(l.datasetId || l.dataset_id)
  }
  if (l.projectId || l.project_id) {
    mapped.projectId = String(l.projectId || l.project_id)
  }
  if (l.createdAt || l.created_at || l.createdDate) {
    mapped.createdAt = String(l.createdAt || l.created_at || l.createdDate)
  }
  if (l.updatedAt) {
    mapped.updatedAt = String(l.updatedAt)
  }
  return mapped
}

export const useAllLabels = () => {
  return useQuery({
    queryKey: ['labels', 'all'],
    queryFn: () =>
      labelApiClient.getLabels().then((res) => {
        const data = res.data?.data || res.data?.content || res.data || []
        if (Array.isArray(data)) {
          return data
            .map(mapLabel)
            .filter((l) => {
              const status = String(l.labelStatus || '').toUpperCase()
              return status !== 'DELETED' && status !== 'DISABLED'
            })
        }
        return []
      })
  })
}

export const useLabelsByDataset = (datasetId: string) => {
  return useQuery({
    queryKey: ['labels', 'dataset', datasetId],
    queryFn: () =>
      labelApiClient.getLabelsByDatasetId(datasetId).then((res) => {
        const data = res.data?.data || res.data || []
        if (Array.isArray(data)) {
          return data
            .map(mapLabel)
            .filter((l) => {
              const status = String(l.labelStatus || '').toUpperCase()
              return status !== 'DELETED' && status !== 'DISABLED'
            })
        }
        return []
      }),
    enabled: !!datasetId
  })
}

export const useInvalidateLabels = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['labels'] })
  }
}
