import type { UserRole } from '../constants/user_role'

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
