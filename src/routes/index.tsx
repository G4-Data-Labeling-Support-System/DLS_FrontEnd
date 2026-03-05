import { LoadingOverlay, PageErrorBoundary } from '@/shared/components/ui'
import { UserRole } from '@/shared/constants/user_role'
import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PATH_ANNOTATOR, PATH_MANAGER } from './paths'
import { CreateProjectPage } from '@/pages/manager'
import DatasetSetupPage from '@/pages/manager/DatasetSetupPage'
import ManagerLayout from '@/components/layout/ManagerLayout'
import GuidelinesSetupPage from '@/pages/manager/GuidelinesSetupPage'
import { GuestGuard, RoleGuard } from './guards'

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
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const UserManagement = lazy(() => import('@/pages/admin/UserManagementPage'))
const ProjectManagement = lazy(() => import('@/pages/admin/ProjectManagementPage'))
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettingsPage'))

// Annotator pages
const AnnotatorLayout = lazy(() => import('@/components/layout/AnnotatorLayout'))
const AnnotatorDashboardPage = lazy(() => import('@/pages/annotator/AnnotatorDashboardPage'))

// Reviewer pages
const ReviewerDashboard = lazy(() => import('@/pages/reviewer/ReviewerDashboard'))
const ReviewerWorkspacePage = lazy(() => import('@/pages/reviewer/ReviewerWorkspacePage'))

// Wrapper component for lazy loaded pages
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<LoadingOverlay message="Loading..." />}>
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

  // ─── Admin routes (admin only) ────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <LazyPage>
        <RoleGuard allowedRoles={[UserRole.ADMIN]}>
          <AdminLayout />
        </RoleGuard>
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

  // ─── Manager routes (manager only) ────────────────────────────────────────
  {
    path: PATH_MANAGER.root,
    element: (
      <LazyPage>
        <RoleGuard allowedRoles={[UserRole.MANAGER]}>
          <ManagerLayout />
        </RoleGuard>
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
        path: PATH_MANAGER.editProject,
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
        path: PATH_MANAGER.editGuidelines,
        element: <LazyPage><GuidelinesSetupPage /></LazyPage>,
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

  // ─── Annotator routes (annotator only) ────────────────────────────────────
  {
    path: PATH_ANNOTATOR.root,
    element: (
      <LazyPage>
        <RoleGuard allowedRoles={[UserRole.ANNOTATOR]}>
          <AnnotatorLayout />
        </RoleGuard>
      </LazyPage>
    ),
    children: [
      {
        path: PATH_ANNOTATOR.project,
        element: <LazyPage><AnnotatorDashboardPage /></LazyPage>,
      },
      {
        path: PATH_ANNOTATOR.assignment,
        element: <LazyPage><AnnotatorDashboardPage /></LazyPage>,
      },
    ],
  },

  // ─── Reviewer routes (reviewer only) ──────────────────────────────────────
  {
    path: '/reviewer',
    element: (
      <LazyPage>
        <RoleGuard allowedRoles={[UserRole.REVIEWER]}>
          {/* Reviewer uses its own dashboard as the layout root */}
          <ReviewerDashboard />
        </RoleGuard>
      </LazyPage>
    ),
  },
  {
    path: '/reviewer/workspace',
    element: (
      <LazyPage>
        <RoleGuard allowedRoles={[UserRole.REVIEWER]}>
          <ReviewerWorkspacePage />
        </RoleGuard>
      </LazyPage>
    ),
  },

  // ─── 404 ──────────────────────────────────────────────────────────────────
  {
    path: '*',
    element: (
      <LazyPage>
        <NotFoundPage />
      </LazyPage>
    ),
  },
])
