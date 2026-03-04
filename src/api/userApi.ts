import { mainClient } from '@/api/apiClients';
import type { CreateUserRequest, UpdateUserRequest, User } from '@/shared/types/api.types';

// ============ User API Service ============

export const userApi = {
    // [POST] Create new user
    createUser: async (data: CreateUserRequest): Promise<User> => {
        const response = await mainClient.post('/users', data);
        return response.data;
    },

    // [GET] Get all users
    getUsers: async (): Promise<User[]> => {
        const response = await mainClient.get('/users');
        // Backend trả về { code, data: [...] } hoặc trực tiếp là mảng
        return response.data.data ?? response.data;
    },

    // [PUT] Update user
    updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
        const response = await mainClient.put(`/users/${id}`, data);
        return response.data;
    },

    // [PATCH] Deactivate user (change status to INACTIVE)
    deleteUser: async (id: string): Promise<void> => {
        await mainClient.patch(`/users/${id}/deactivate`);
    },

    // [PATCH] Activate user (change status to ACTIVE)
    activateUser: async (id: string): Promise<void> => {
        await mainClient.patch(`/users/${id}/activate`);
    }
};
