import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import { PATH_MANAGER } from './paths'
import { CreateProjectPage } from '@/pages/manager'
import DatasetSetupPage from '@/pages/manager/DatasetSetupPage'
import ManagerLayout from '@/components/layout/ManagerLayout'
import GuidelinesSetupPage from '@/pages/manager/GuidelinesSetupPage'
import TeamAssignmentPage from '@/pages/manager/TeamAssignmentPage'
import { LazyPage } from '@/components/common/LazyPage'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/homepage/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Manager pages
const CreateDatasetPage = lazy(() => import('@/pages/manager/CreateDatasetPage'))
const ManagerDashboardPage = lazy(() => import('@/pages/manager/ManagerDashboardPage'))

// Admin pages
const AdminLayout = lazy(() => import('@/features/admin/components/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const UserManagement = lazy(() => import('@/features/admin/UserManagement'))
const ProjectManagement = lazy(() => import('@/features/admin/ProjectManagement'))
const SystemSettings = lazy(() => import('@/features/admin/SystemSettings'))

// Reviewer Pages
const ReviewerLayout = lazy(() => import('@/components/layout/ReviewerLayout'))
const ReviewerDashboard = lazy(() => import('@/pages/reviewer/ReviewerDashboard'))

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
    path: PATH_MANAGER.root,
    element: (
      <LazyPage>
        <ManagerLayout /> {/* Sử dụng Layout ở đây */}
      </LazyPage>
    ),
    children: [
      {
        path: PATH_MANAGER.dashboard,
        element: <LazyPage><ManagerDashboardPage /></LazyPage>,
      },
      {
        path: PATH_MANAGER.createProject,
        element: <LazyPage><CreateProjectPage /></LazyPage>,
      },
      {
        path: PATH_MANAGER.createDataset,
        element: <LazyPage><CreateDatasetPage /></LazyPage>,
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
        path: PATH_MANAGER.teamAssignment,
        element: <LazyPage><TeamAssignmentPage /></LazyPage>,
      },
    ],
  },
  {
    path: '/reviewer',
    element: (
      <LazyPage>
        <ReviewerLayout />
      </LazyPage>
    ),
    children: [
      {
        path: 'dashboard',
        element: <LazyPage><ReviewerDashboard /></LazyPage>
      }
    ]
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
