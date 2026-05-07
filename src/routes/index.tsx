import { UserRole } from '@/shared/constants/user_role'
import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PATH_ANNOTATOR, PATH_MANAGER } from './paths'
import ManagerLayout from '@/components/layout/ManagerLayout'
import { GuestGuard, RoleGuard } from './guards'
import { Header } from '@/components/layout/Header'
import { LazyPage } from '@/components/layout/LazyPage'
import { Layout } from 'antd'
// import ReviewerDashboardPage from '@/pages/reviewer/ReviewerDashboardPage'

// Lazy load pages for code splitting
const ProfilePage = lazy(() => import('@/pages/common/ProfilePage'))
const HomePage = lazy(() => import('@/pages/homepage/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ManagerDashboardPage = lazy(() => import('@/pages/manager/ManagerDashboardPage'))
const ManageProjectThingsPage = lazy(() => import('@/pages/manager/ManageProjectThingsPage'))
const DatasetDetailPage = lazy(() => import('@/pages/manager/DatasetDetailPage'))

// Admin pages
const AdminLayout = lazy(() => import('@/features/admin/components/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const UserManagement = lazy(() => import('@/pages/admin/UserManagementPage'))
const ProjectManagement = lazy(() => import('@/pages/admin/ProjectManagementPage'))
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettingsPage'))

// Annotator pages
const AnnotatorLayout = lazy(() => import('@/components/layout/AnnotatorLayout'))
const AnnotatorAllProjectsPage = lazy(() => import('@/pages/annotator/AnnotatorAllProjectsPage'))
const AnnotatorProjectDetailPage = lazy(() => import('@/pages/annotator/AnnotatorProjectDetailPage'))
const AnnotatorProjectAssignmentsPage = lazy(() => import('@/pages/annotator/AnnotatorProjectAssignmentsPage'))
const AnnotatorProjectDatasetsPage = lazy(() => import('@/pages/annotator/AnnotatorProjectDatasetsPage'))
const AnnotatorAssignmentDetailPage = lazy(() => import('@/pages/annotator/AnnotatorAssignmentDetailPage'))
const AnnotatorDatasetDetailPage = lazy(
  () => import('@/pages/annotator/AnnotatorDatasetDetailPage')
)
const TaskDetailPage = lazy(() => import('@/pages/annotator/TaskDetailPage'))
const AnnotationPage = lazy(() => import('@/pages/annotator/AnnotationPage'))

// Reviewer pages
const ReviewerLayout = lazy(() => import('@/components/layout/ReviewerLayout'))
const ReviewerAllProjectsPage = lazy(() => import('@/pages/reviewer/ReviewerAllProjectsPage'))
const ReviewerProjectDetailPage = lazy(() => import('@/pages/reviewer/ReviewerProjectDetailPage'))
const ReviewerProjectAssignmentsPage = lazy(
  () => import('@/pages/reviewer/ReviewerProjectAssignmentsPage')
)
const ReviewerProjectDatasetsPage = lazy(
  () => import('@/pages/reviewer/ReviewerProjectDatasetsPage')
)
const ReviewerAssignmentDetailPage = lazy(
  () => import('@/pages/reviewer/ReviewerAssignmentDetailPage')
)
const ReviewerWorkspacePage = lazy(() => import('@/pages/reviewer/ReviewerWorkspacePage'))
const ReviewerTaskDetailPage = lazy(() => import('@/pages/reviewer/TaskDetailPage'))
const ReviewerAnnotationPage = lazy(() => import('@/pages/reviewer/ReviewPage'))
const ReviewerDatasetDetailPage = lazy(
  () => import('@/pages/reviewer/ReviewerDatasetDetailPage')
)

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
            <Layout.Content className="w-full max-w-400 mx-auto p-6 overflow-auto bg-transparent">
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
        path: PATH_MANAGER.manageProjectThings,
        element: (
          <LazyPage>
            <ManageProjectThingsPage />
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
        element: <Navigate to={PATH_ANNOTATOR.projects} replace />
      },
      {
        path: 'projects',
        element: (
          <LazyPage>
            <AnnotatorAllProjectsPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId',
        element: (
          <LazyPage>
            <AnnotatorProjectDetailPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId/assignments',
        element: (
          <LazyPage>
            <AnnotatorProjectAssignmentsPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId/datasets',
        element: (
          <LazyPage>
            <AnnotatorProjectDatasetsPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId/assignments/:assignmentId',
        element: (
          <LazyPage>
            <AnnotatorAssignmentDetailPage />
          </LazyPage>
        )
      },
      {
        path: PATH_ANNOTATOR.datasetDetail,
        element: (
          <LazyPage>
            <AnnotatorDatasetDetailPage />
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
      }
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
        element: <Navigate to="/reviewer/projects" replace />
      },
      {
        path: 'projects',
        element: (
          <LazyPage>
            <ReviewerAllProjectsPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId',
        element: (
          <LazyPage>
            <ReviewerProjectDetailPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId/assignments',
        element: (
          <LazyPage>
            <ReviewerProjectAssignmentsPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId/datasets',
        element: (
          <LazyPage>
            <ReviewerProjectDatasetsPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId/datasets/:datasetId',
        element: (
          <LazyPage>
            <ReviewerDatasetDetailPage />
          </LazyPage>
        )
      },
      {
        path: 'projects/:projectId/assignments/:assignmentId',
        element: (
          <LazyPage>
            <ReviewerAssignmentDetailPage />
          </LazyPage>
        )
      },
      {
        path: 'task/:taskId',
        element: (
          <LazyPage>
            <ReviewerTaskDetailPage />
          </LazyPage>
        )
      },
      {
        path: 'task/:taskId/annotate',
        element: (
          <LazyPage>
            <ReviewerAnnotationPage />
          </LazyPage>
        )
      },
      {
        path: 'workspace/:projectId',
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
