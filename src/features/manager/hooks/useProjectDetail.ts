import { useQuery, useQueryClient } from '@tanstack/react-query';
import projectApi from '@/api/ProjectApi';
import assignmentApi from '@/api/AssignmentApi';
import guidelineApi from '@/api/GuidelineApi';

export const useProjectById = (projectId: string) => {
    return useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectApi.getProjectById(projectId).then(res => {
            const data = res.data?.data || res.data;
            return {
                projectId: String(data.projectId || data.id),
                projectName: String(data.projectName || data.name),
                projectStatus: String(data.projectStatus || data.status),
                description: data.description ? String(data.description) : undefined,
                createdAt: data.createdAt ? String(data.createdAt) : undefined,
                updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
                users: data.users || data.members || data.assignees || [],
            };
        }),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useAssignmentsByProject = (projectId: string) => {
    return useQuery({
        queryKey: ['assignments', 'project', projectId],
        queryFn: () => assignmentApi.getAssignmentsByProjectId(projectId).then(res => {
            const data = res.data?.data || res.data || [];
            return Array.isArray(data) ? data : [];
        }),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useGuidelinesByProject = (projectId: string) => {
    return useQuery({
        queryKey: ['guidelines', 'project', projectId],
        queryFn: () => guidelineApi.getGuidelines(projectId).then(res => {
            const data = res.data?.data || res.data;
            return Array.isArray(data) ? data : data ? [data] : [];
        }),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useInvalidateProjectDetail = () => {
    const queryClient = useQueryClient();

    return (projectId: string) => {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        queryClient.invalidateQueries({ queryKey: ['assignments', 'project', projectId] });
        queryClient.invalidateQueries({ queryKey: ['guidelines', 'project', projectId] });
    };
};
