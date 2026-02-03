// Auth Guard - Protect routes that require authentication
import { useAuthStore } from '@/store'
import { Navigate, useLocation } from 'react-router-dom'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * AuthGuard - Bảo vệ routes cần đăng nhập
 *
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
