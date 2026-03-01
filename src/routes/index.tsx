import { LoadingOverlay, PageErrorBoundary } from '@/shared/components/ui'
import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PATH_MANAGER } from './paths'
import { CreateProjectPage } from '@/pages/manager'
import DatasetSetupPage from '@/pages/manager/DatasetSetupPage'
import ManagerLayout from '@/components/layout/ManagerLayout'
import GuidelinesSetupPage from '@/pages/manager/GuidelinesSetupPage'
import TeamAssignmentPage from '@/pages/manager/TeamAssignmentPage'
import { AuthGuard, GuestGuard } from './guards'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/homepage/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ManagerDashboardPage = lazy(() => import('@/pages/manager/ManagerDashboardPage'))
const DatasetManagementPage = lazy(() => import('@/pages/manager/DatasetManagementPage'))
const CreateDatasetPage = lazy(() => import('@/pages/manager/CreateDatasetPage'))

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
        <GuestGuard>
          <LoginPage />
        </GuestGuard>
      </LazyPage>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <LazyPage>
        <GuestGuard>
          <ForgotPasswordPage />
        </GuestGuard>
      </LazyPage>
    ),
  },
  {
    path: '/admin',
    element: (
      <LazyPage>
        <AuthGuard>
          <AdminLayout />
        </AuthGuard>
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

  {
    path: PATH_MANAGER.root,
    element: (
      <LazyPage>
        <AuthGuard>
          <ManagerLayout /> {/* Sử dụng Layout ở đây */}
        </AuthGuard>
      </LazyPage>
    ),
    children: [
      {
        index: true,
        element: <LazyPage><ManagerDashboardPage /></LazyPage>,
      },
      {
        path: PATH_MANAGER.createProject,
        element: <LazyPage><CreateProjectPage /></LazyPage>,
      },
      {
        path: PATH_MANAGER.datasetSetup,
        element: <LazyPage><DatasetSetupPage /></LazyPage>,
      },
      {
        path: PATH_MANAGER.guidelinesSetup,
        element: <LazyPage><GuidelinesSetupPage /></LazyPage>,
      },
      {
        path: PATH_MANAGER.teamAssignment,
        element: <LazyPage><TeamAssignmentPage /></LazyPage>,
      },
      {
        path: PATH_MANAGER.datasetManagement,
        element: <LazyPage><DatasetManagementPage /></LazyPage>,
      },
      {
        path: PATH_MANAGER.createDataset,
        element: <LazyPage><CreateDatasetPage /></LazyPage>,
      },
    ],
  },
])
