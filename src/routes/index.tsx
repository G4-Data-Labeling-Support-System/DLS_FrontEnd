import { LoadingOverlay, PageErrorBoundary } from '@/shared/components/ui'
import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

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
])

