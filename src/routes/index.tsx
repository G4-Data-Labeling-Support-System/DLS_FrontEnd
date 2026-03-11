import { UserRole } from '@/shared/constants/user_role'
import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PATH_ANNOTATOR, PATH_MANAGER } from './paths'
import { CreateProjectPage } from '@/pages/manager'
import DatasetSetupPage from '@/pages/manager/DatasetSetupPage'
import ManagerLayout from '@/components/layout/ManagerLayout'
import GuidelinesSetupPage from '@/pages/manager/GuidelinesSetupPage'
import { GuestGuard, RoleGuard } from './guards'
import { Header } from '@/components/common/Header'
import { LazyPage } from '@/components/common/LazyPage'
import { Layout } from 'antd'
import ReviewerDashboardPage from '@/pages/reviewer/ReviewerDashboardPage'

// Lazy load pages for code splitting
const ProfilePage = lazy(() => import('@/pages/common/ProfilePage'))
const HomePage = lazy(() => import('@/pages/homepage/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ManagerDashboardPage = lazy(() => import('@/pages/manager/ManagerDashboardPage'))
const DatasetManagementPage = lazy(() => import('@/pages/manager/DatasetManagementPage'))
const CreateDatasetPage = lazy(() => import('@/pages/manager/CreateDatasetPage'))
const DatasetDetailPage = lazy(() => import('@/pages/manager/DatasetDetailPage'))

// Admin pages
const AdminLayout = lazy(() => import('@/features/admin/components/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const UserManagement = lazy(() => import('@/pages/admin/UserManagementPage'))
const ProjectManagement = lazy(() => import('@/pages/admin/ProjectManagementPage'))
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettingsPage'))

// Annotator pages
const AnnotatorLayout = lazy(() => import('@/components/layout/AnnotatorLayout'))
const AnnotatorDashboardPage = lazy(() => import('@/pages/annotator/AnnotatorDashboardPage'))
const TaskDetailPage = lazy(() => import('@/pages/annotator/TaskDetailPage'))
const AnnotationPage = lazy(() => import('@/pages/annotator/AnnotationPage'))

// Reviewer pages
const ReviewerLayout = lazy(() => import('@/components/layout/ReviewerLayout'))
const ReviewerWorkspacePage = lazy(() => import('@/pages/reviewer/ReviewerWorkspacePage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LazyPage>
        <HomePage />
      </LazyPage>
    )
  },
  {
    path: '/login',
    element: (
      <LazyPage>
        <GuestGuard>
          <LoginPage />
        </GuestGuard>
      </LazyPage>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <LazyPage>
        <GuestGuard>
          <ForgotPasswordPage />
        </GuestGuard>
      </LazyPage>
    )
  },
  {
    path: '/profile',
    element: (
      <LazyPage>
        <RoleGuard
          allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.REVIEWER, UserRole.ANNOTATOR]}
        >
          <Layout className={`min-h-screen bg-[#0f0e17]`} style={{ background: '#0f0e17' }}>
            <Header />
            <Layout.Content className="w-full max-w-[1600px] mx-auto p-6 overflow-auto bg-transparent">
              <ProfilePage />
            </Layout.Content>
          </Layout>
        </RoleGuard>
      </LazyPage>
    )
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
        element: <AdminDashboard />
      },
      {
        path: 'users',
        element: <UserManagement />
      },
      {
        path: 'projects',
        element: <ProjectManagement />
      },
      {
        path: 'settings',
        element: <SystemSettings />
      }
    ]
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
        element: (
          <LazyPage>
            <ManagerDashboardPage />
          </LazyPage>
        )
      },
      {
        path: PATH_MANAGER.createProject,
        element: (
          <LazyPage>
            <CreateProjectPage />
          </LazyPage>
        )
      },
      {
        path: PATH_MANAGER.editProject,
        element: (
          <LazyPage>
            <CreateProjectPage />
          </LazyPage>
        )
      },
      {
        path: PATH_MANAGER.datasetSetup,
        element: (
          <LazyPage>
            <DatasetSetupPage />
          </LazyPage>
        )
      },
      {
        path: PATH_MANAGER.guidelinesSetup,
        element: (
          <LazyPage>
            <GuidelinesSetupPage />
          </LazyPage>
        )
      },
      {
        path: PATH_MANAGER.editGuidelines,
        element: (
          <LazyPage>
            <GuidelinesSetupPage />
          </LazyPage>
        )
      },
      {
        path: PATH_MANAGER.datasetManagement,
        element: (
          <LazyPage>
            <DatasetManagementPage />
          </LazyPage>
        )
      },
      {
        path: PATH_MANAGER.createDataset,
        element: (
          <LazyPage>
            <CreateDatasetPage />
          </LazyPage>
        )
      },
      {
        path: PATH_MANAGER.datasetDetail,
        element: (
          <LazyPage>
            <DatasetDetailPage />
          </LazyPage>
        )
      }
    ]
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
        index: true,
        element: <Navigate to={PATH_ANNOTATOR.project} replace />
      },
      {
        path: PATH_ANNOTATOR.project,
        element: (
          <LazyPage>
            <AnnotatorDashboardPage />
          </LazyPage>
        )
      },
      {
        path: `${PATH_ANNOTATOR.project}/:assignmentId`,
        element: (
          <LazyPage>
            <AnnotatorDashboardPage />
          </LazyPage>
        )
      },
      {
        path: PATH_ANNOTATOR.assignment,
        element: (
          <LazyPage>
            <AnnotatorDashboardPage />
          </LazyPage>
        )
      },
      {
        path: `${PATH_ANNOTATOR.assignment}/:assignmentId`,
        element: (
          <LazyPage>
            <AnnotatorDashboardPage />
          </LazyPage>
        )
      },
      {
        path: 'task/:taskId',
        element: (
          <LazyPage>
            <TaskDetailPage />
          </LazyPage>
        )
      },
      {
        path: 'task/:taskId/annotate',
        element: (
          <LazyPage>
            <AnnotationPage />
          </LazyPage>
        )
      },
    ]
  },

  // ─── Reviewer routes (reviewer only) ──────────────────────────────────────
  {
    path: '/reviewer',
    element: (
      <LazyPage>
        <RoleGuard allowedRoles={[UserRole.REVIEWER]}>
          <ReviewerLayout />
        </RoleGuard>
      </LazyPage>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <ReviewerDashboardPage />
          </LazyPage>
        )
      },
      {
        path: 'workspace',
        element: (
          <LazyPage>
            <ReviewerWorkspacePage />
          </LazyPage>
        )
      }
    ]
  },

  // ─── 404 ──────────────────────────────────────────────────────────────────
  {
    path: '*',
    element: (
      <LazyPage>
        <NotFoundPage />
      </LazyPage>
    )
  }
])
