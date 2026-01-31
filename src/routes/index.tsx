import { LoadingOverlay, PageErrorBoundary } from '@/shared/components/ui'
import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PATH_MANAGER } from './paths'
import { CreateProjectPage } from '@/pages/manager'
import DatasetSetupPage from '@/pages/manager/DatasetSetupPage'
import ManagerLayout from '@/components/layout/ManagerLayout'
import GuidelinesSetupPage from '@/pages/manager/GuidelinesSetupPage'
import TeamAssignmentPage from '@/pages/manager/TeamAssignmentPage'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/customer/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

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
        <ManagerLayout /> {/* Sử dụng Layout ở đây */}
      </LazyPage>
    ),
    children: [
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
    ],
  },
])

