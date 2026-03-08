import React, { Suspense } from 'react';
import { LoadingOverlay, PageErrorBoundary } from '@/shared/components/ui';

interface LazyPageProps {
    children: React.ReactNode;
}

export function LazyPage({ children }: LazyPageProps) {
    return (
        <PageErrorBoundary>
            <Suspense fallback={<LoadingOverlay message="Loading ..." />}>
                {children}
            </Suspense>
        </PageErrorBoundary>
    );
}
