import React, { useState } from 'react';
import { AllProjects } from '@/features/manager/components/dashboard/AllProjects';
import { QuickActions } from '@/features/manager/components/dashboard/QuickActions';
import { DashboardTabs, type DashboardTabType } from '@/features/manager/components/dashboard/DashboardTabs';


const ManagerDashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DashboardTabType>('project');

    return (
        <div className="p-6">
            {/* Custom Tab Navigation */}
            <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'project' && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
                    {/* All Projects - Main Content (3 cols) */}
                    <div className="xl:col-span-3">
                        <AllProjects />
                    </div>

                    {/* Quick Actions - Sticky Sidebar (1 col) */}
                    <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
                        <QuickActions />
                    </div>
                </div>
            )}

            {activeTab === 'assignment' && (
                <div className="text-gray-400 py-10 text-center font-display border-2 border-dashed border-gray-800 rounded-xl bg-[#1A1625]/50 flex flex-col items-center justify-center min-h-[300px]">
                    <span className="material-symbols-outlined text-4xl mb-4 text-violet-500 opacity-50">assignment</span>
                    <p>Assignment functionality is currently under development.</p>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboardPage;
