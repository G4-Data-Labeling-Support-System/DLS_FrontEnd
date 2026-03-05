// Role Guard - Protects routes by requiring specific user roles
import { UserRole } from '@/shared/constants/user_role'
import { useAuthStore } from '@/store'
import { Navigate, useLocation } from 'react-router-dom'

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles: UserRole[]
}

/** Returns the home dashboard path for a given role */
function getRoleDashboard(role: string): string {
    switch (role) {
        case UserRole.ADMIN:
            return '/admin/dashboard'
        case UserRole.MANAGER:
            return '/manager'
        case UserRole.ANNOTATOR:
            return '/annotator'
        case UserRole.REVIEWER:
            return '/reviewer'
        default:
            return '/'
    }
}

/**
 * RoleGuard – ensures the authenticated user has one of the allowed roles.
 *
 * - Not authenticated  → redirect to /login
 * - Wrong role         → redirect to the user's own dashboard
 * - Correct role       → render children
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { isAuthenticated, user } = useAuthStore()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    const userRole = (user?.role ?? '').toLowerCase() as UserRole

    if (!allowedRoles.includes(userRole)) {
        // Redirect the user to their own dashboard instead of showing a blank page
        return <Navigate to={getRoleDashboard(userRole)} replace />
    }

    return <>{children}</>
}
