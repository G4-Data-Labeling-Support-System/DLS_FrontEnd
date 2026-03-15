import { useQuery, useQueryClient } from '@tanstack/react-query'
import projectApi from '@/api/ProjectApi'
import assignmentApi, { type GetAssignmentsParams } from '@/api/AssignmentApi'
import guidelineApi from '@/api/GuidelineApi'
import datasetApi from '@/api/DatasetApi'

export const useProjectById = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () =>
      projectApi.getProjectById(projectId).then((res) => {
        const data = res.data?.data || res.data
        return {
          projectId: String(data.projectId || data.id),
          projectName: String(data.projectName || data.name),
          projectStatus: String(data.projectStatus || data.status),
          description: data.description ? String(data.description) : undefined,
          createdAt: data.createdAt ? String(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
          users: data.users || data.members || data.assignees || []
        }
      }),
    enabled: !!projectId
  })
}

export const useDatasetsByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['datasets', 'project', projectId],
    queryFn: () =>
      datasetApi.getDatasetsByProjectId(projectId).then((res) => {
        const data = res.data?.data || res.data || []
        return Array.isArray(data) ? data : []
      }),
    enabled: !!projectId
  })
}

const mapAssignment = (a: Record<string, unknown>): GetAssignmentsParams => ({
  assignmentId: String(a.assignmentId || a.id || ''),
  assignmentName: String(a.assignmentName || a.name || ''),
  status: String(a.assignmentStatus || a.status || ''),
  description: String(a.descriptionAssignment || a.description || ''),
  projectId: String(a.projectId || a.project_id || ''),
  datasetId: String(a.datasetId || a.dataset_id || ''),
  createdAt: String(a.createdAt || a.created_at || a.createdDate || ''),
  updatedAt: String(a.updatedAt || ''),
  assignedTo: String(a.assignedTo || a.user_id || a.annotatorId || ''),
  reviewedBy: String(a.reviewedBy || a.reviewerId || ''),
  dueDate: String(a.dueDate || a.due_date || ''),
  assignedBy: String(a.assignedBy || a.creatorId || '')
})

export const useAssignmentsByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['assignments', 'project', projectId],
    queryFn: () =>
      assignmentApi.getAssignmentsByProjectId(projectId).then((res) => {
        const data = res.data?.data || res.data || []
        return (Array.isArray(data) ? data : []).map(mapAssignment)
      }),
    enabled: !!projectId
  })
}

export const useGuidelinesByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['guidelines', 'project', projectId],
    queryFn: () =>
      guidelineApi.getGuidelines(projectId).then((res) => {
        const data = res.data?.data || res.data
        return Array.isArray(data) ? data : data ? [data] : []
      }),
    enabled: !!projectId
  })
}

export const useProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: () =>
      projectApi.getProjectMembers(projectId).then((res) => {
        const data = res.data?.data || res.data || []
        return Array.isArray(data) ? data : []
      }),
    enabled: !!projectId
  })
}


export const useAllAssignments = () => {
  return useQuery({
    queryKey: ['assignments', 'all'],
    queryFn: () =>
      assignmentApi.getAssignments().then((res) => {
        const data = res.data?.data || res.data || []
        return (Array.isArray(data) ? data : []).map(mapAssignment)
      }),
    staleTime: 0
  })
}

export const useInvalidateAssignments = () => {
  const queryClient = useQueryClient()

  return (projectId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['assignments', 'all'] })
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['assignments', 'project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    }
  }
}

export const useInvalidateProjectDetail = () => {
  const invalidateAssignments = useInvalidateAssignments()
  const queryClient = useQueryClient()

  return (projectId: string) => {
    invalidateAssignments(projectId)
    queryClient.invalidateQueries({ queryKey: ['guidelines', 'project', projectId] })
    queryClient.invalidateQueries({ queryKey: ['datasets', 'project', projectId] })
  }
}
