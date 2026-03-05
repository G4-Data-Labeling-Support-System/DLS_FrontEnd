// Guest Guard - Only allow non-authenticated users
import { UserRole } from '@/shared/constants/user_role'
import { useAuthStore } from '@/store'
import { Navigate } from 'react-router-dom'

interface GuestGuardProps {
  children: React.ReactNode
}

/**
 * GuestGuard – only allows unauthenticated users.
 * Used for /login and /forgot-password.
 * Redirects authenticated users to their role-specific dashboard.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated) {
    const role = (user?.role ?? '').toLowerCase()

    switch (role) {
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" replace />
      case UserRole.MANAGER:
        return <Navigate to="/manager" replace />
      case UserRole.ANNOTATOR:
        return <Navigate to="/annotator" replace />
      case UserRole.REVIEWER:
        return <Navigate to="/reviewer" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
