import { mainClient } from '@/api/apiClients';
import type { CreateUserRequest, User } from '@/shared/types/api.types';

// ============ User API Service ============

export const userApi = {
    // [POST] Create new user
    createUser: async (data: CreateUserRequest): Promise<User> => {
        const response = await mainClient.post('/users', data);
        return response.data;
    },

    // [GET] Get all users
    getUsers: async (): Promise<User[]> => {
        const token = localStorage.getItem('accessToken');
        console.log('[userApi] getUsers - token present:', !!token, token?.substring(0, 20) + '...');
        const response = await mainClient.get('/users');
        console.log('[userApi] getUsers - response:', response.data);
        // Backend trả về { code, data: [...] } hoặc trực tiếp là mảng
        return response.data.data ?? response.data;
    }
};
