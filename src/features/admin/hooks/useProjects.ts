import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import projectApi from '@/api/project';
import type { GetProjectsParams } from '@/api/project';

export const useProjects = (params?: GetProjectsParams) => {
    return useQuery({
        queryKey: ['projects', params],
        queryFn: () => projectApi.getProjects(params).then(res => res.data),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GetProjectsParams) => projectApi.createProject(data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: any) => {
            console.error('Create project error:', error);
        }
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: GetProjectsParams }) => projectApi.updateProject(id, data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: any) => {
            console.error('Update project error:', error);
        }
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => projectApi.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: any) => {
            console.error('Delete project error:', error);
        }
    });
};
