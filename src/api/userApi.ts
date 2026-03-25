import { mainClient } from '@/api/apiClients'
import { ENDPOINTS } from '@/api/endpoints'
import type { CreateUserRequest, UpdateUserRequest, User } from '@/shared/types/api.types'

// ============ User API Service ============

export const userApi = {
  // [POST] Create new user
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await mainClient.post('/users', data)
    return response.data
  },

  // [GET] Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await mainClient.get('/users')
    // Backend trả về { code, data: [...] } hoặc trực tiếp là mảng
    return response.data.data ?? response.data
  },

  // [PUT] Update user
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await mainClient.put(`/users/update/${id}`, data)
    return response.data
  },

  // [PATCH] Deactivate user (change status to INACTIVE)
  deactivateUser: async (id: string): Promise<void> => {
    await mainClient.patch(`/users/${id}/deactivate`)
  },

  // [DELETE] Remove user permanently
  deleteUser: async (id: string): Promise<void> => {
    await mainClient.delete(`/users/${id}`)
  },

  // [DELETE] Remove user avatar
  deleteAvatar: async (id: string): Promise<void> => {
    await mainClient.delete(`/users/${id}/avatar/delete`)
  },

  // [PATCH] Activate user (change status to ACTIVE)
  activateUser: async (id: string): Promise<void> => {
    await mainClient.patch(ENDPOINTS.USERS.ACTIVATE(id))
  },

  // [PUT] Update user avatar
  updateAvatar: async (id: string, file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await mainClient.put(ENDPOINTS.USERS.UPDATE_AVATAR(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Unwrap the data from ApiResponse structure if needed
    const result = response.data.data ?? response.data
    return result
  }
}
