import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/features/admin/api/userApi';
import type { CreateUserRequest } from '@/shared/types/api.types';

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: userApi.getUsers,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
        onSuccess: () => {
            // Update the user list cache
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            console.error('Create user error:', error);
            // Error handling is managed by the component
        }
    });
};
