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
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated) {
    const role = (user?.userRole || user?.role || '').toLowerCase();

    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (role === 'manager') {
      return <Navigate to="/manager" replace />
    }
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
