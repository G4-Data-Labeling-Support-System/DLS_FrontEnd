import React from 'react';

export type DashboardTabType = 'project' | 'assignment';

interface DashboardTabsProps {
    activeTab: DashboardTabType;
    onTabChange: (tab: DashboardTabType) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex items-center gap-8 border-b border-gray-800 mb-6 pb-2">
            <button
                onClick={() => onTabChange('project')}
                className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${activeTab === 'project' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Project
                {activeTab === 'project' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
                )}
            </button>
            <button
                onClick={() => onTabChange('assignment')}
                className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${activeTab === 'assignment' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Assignment
                {activeTab === 'assignment' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
                )}
            </button>
        </div>
    );
};
