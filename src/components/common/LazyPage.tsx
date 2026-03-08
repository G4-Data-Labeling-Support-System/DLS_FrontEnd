import { Suspense } from 'react'
import { LoadingOverlay, PageErrorBoundary } from '@/shared/components/ui'

export function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<LoadingOverlay message="Loading..." />}>{children}</Suspense>
    </PageErrorBoundary>
  )
}
