import { mainClient } from '@/api/ApiClients';
import { ENDPOINTS } from '@/api/Endpoints';
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
        const response = await mainClient.put(`/users/update/${id}`, data);
        return response.data;
    },

    // [PATCH] Deactivate user (change status to INACTIVE)
    deleteUser: async (id: string): Promise<void> => {
        await mainClient.patch(`/users/${id}/deactivate`);
    },

    // [PATCH] Activate user (change status to ACTIVE)
    activateUser: async (id: string): Promise<void> => {
        await mainClient.patch(ENDPOINTS.USERS.ACTIVATE(id));
    },

    // [PUT] Update user avatar
    updateAvatar: async (id: string, file: File): Promise<{ avatarUrl: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    // The base64 string includes the prefix (e.g., data:image/png;base64,...), 
                    // usually backends want only the content or the whole thing.
                    // I'll send the whole thing as it's safer.
                    const base64String = reader.result as string;
                    const response = await mainClient.put(ENDPOINTS.USERS.UPDATE_AVATAR(id), {
                        file: base64String
                    });
                    resolve(response.data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
        });
    }
};
