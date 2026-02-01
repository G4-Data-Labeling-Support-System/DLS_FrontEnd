import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/features/admin/api/userApi';
import type { CreateUserRequest } from '@/shared/types/api.types';

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
        onSuccess: () => {
            // Update the user list cache
            queryClient.invalidateQueries({ queryKey: ['users'] });
            // Note: Success modal handling is done in the component
        },
        onError: (error: any) => {
            console.error('Create user error:', error);
            // Error handling moved to component level to avoid static message context warning
        }
    });
};
