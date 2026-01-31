import { LoadingOverlay, PageErrorBoundary } from '@/shared/components/ui'
import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/homepage/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Admin pages
const AdminLayout = lazy(() => import('@/features/admin/components/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const UserManagement = lazy(() => import('@/features/admin/UserManagement'))
const ProjectManagement = lazy(() => import('@/features/admin/ProjectManagement'))
const SystemSettings = lazy(() => import('@/features/admin/SystemSettings'))

// Wrapper component for lazy loaded pages
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<LoadingOverlay message="Đang tải trang..." />}>
        {children}
      </Suspense>
    </PageErrorBoundary>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LazyPage>
        <HomePage />
      </LazyPage>
    ),
  },
  {
    path: '/login',
    element: (
      <LazyPage>
        <LoginPage />
      </LazyPage>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <LazyPage>
        <ForgotPasswordPage />
      </LazyPage>
    ),
  },
  {
    path: '/admin',
    element: (
      <LazyPage>
        <AdminLayout />
      </LazyPage>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <UserManagement />,
      },
      {
        path: 'projects',
        element: <ProjectManagement />,
      },
      {
        path: 'settings',
        element: <SystemSettings />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <LazyPage>
        <NotFoundPage />
      </LazyPage>
    ),
  },
])
