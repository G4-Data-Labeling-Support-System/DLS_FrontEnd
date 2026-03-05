import React from 'react';
import { AllAnnotations } from '@/features/reviewer/components/dashboard/AllAnnotations';
import { ReviewerFilters } from '@/features/reviewer/components/ReviewerFilters';

const ReviewerDashboardPage: React.FC = () => {
    return (
        <div className="p-6">
            <div className="flex border-b border-gray-800 mb-6 font-display overflow-x-auto">
                <button
                    className="pb-4 px-4 whitespace-nowrap transition-colors border-b-2 text-violet-400 border-violet-500 font-medium"
                >
                    Annotations
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
                {/* Main Content (3 cols) */}
                <div className="xl:col-span-3 pb-6">
                    <AllAnnotations />
                </div>

                {/* Sidebar (1 col) - Matches QuickActions placement in Manager */}
                <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
                    <ReviewerFilters />
                </div>
            </div>
        </div>
    );
};

export default ReviewerDashboardPage;
