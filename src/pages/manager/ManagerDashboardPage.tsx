import React from 'react';
import { ActiveProjects } from '@/features/manager/components/dashboard/ActiveProjects';
import { QuickActions } from '@/features/manager/components/dashboard/QuickActions';


const ManagerDashboardPage: React.FC = () => {
    return (
        <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
                {/* Active Projects - Main Content (3 cols) */}
                <div className="xl:col-span-3">
                    <ActiveProjects />
                </div>

                {/* Quick Actions - Sticky Sidebar (1 col) */}
                <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
                    <QuickActions />
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboardPage;
