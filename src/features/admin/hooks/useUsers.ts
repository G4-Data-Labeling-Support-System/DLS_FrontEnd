import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import type { CreateUserRequest, UpdateUserRequest } from '@/shared/types/api.types';

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

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => userApi.deleteUser(userId),
        onSuccess: () => {
            // Update the user list cache
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            console.error('Delete user error:', error);
        }
    });
};

export const useActivateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => userApi.activateUser(userId),
        onSuccess: () => {
            // Update the user list cache
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            console.error('Activate user error:', error);
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) => userApi.updateUser(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            console.error('Update user error:', error);
        }
    });
};
