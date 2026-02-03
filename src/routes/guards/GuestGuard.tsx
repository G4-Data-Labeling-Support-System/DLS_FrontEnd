// Guest Guard - Only allow non-authenticated users
import { useAuthStore } from '@/store'
import { Navigate } from 'react-router-dom'

interface GuestGuardProps {
  children: React.ReactNode
}

/**
 * GuestGuard - Chỉ cho phép guest (chưa login)
 * Dùng cho login/register page - redirect về home nếu đã login
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
