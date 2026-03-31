import React from 'react'

export type DashboardTabType = 'project' | 'assignments' | 'datasets' | 'labels' | 'assignment'

interface DashboardTabsProps {
  activeTab: DashboardTabType
  onTabChange: (tab: DashboardTabType) => void
  allowedTabs?: DashboardTabType[]
  tabLabels?: Partial<Record<DashboardTabType, string>>
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange, allowedTabs, tabLabels }) => {
  const showTab = (tab: DashboardTabType) => {
    if (!allowedTabs) return true
    return allowedTabs.includes(tab)
  }

  return (
    <div className="flex items-center gap-8 border-b border-gray-800 mb-6 pb-2">
      {showTab('project') && (
        <button
          onClick={() => onTabChange('project')}
          className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${activeTab === 'project' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {tabLabels?.project || 'Projects'}
          {activeTab === 'project' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
          )}
        </button>
      )}
      {showTab('datasets') && (
        <button
          onClick={() => onTabChange('datasets')}
          className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${activeTab === 'datasets' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {tabLabels?.datasets || 'Datasets'}
          {activeTab === 'datasets' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
          )}
        </button>
      )}
      {showTab('labels') && (
        <button
          onClick={() => onTabChange('labels')}
          className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${activeTab === 'labels' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {tabLabels?.labels || 'Labels'}
          {activeTab === 'labels' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
          )}
        </button>
      )}
      {(showTab('assignments') || showTab('assignment')) && (
        <button
          onClick={() => onTabChange(allowedTabs?.includes('assignment') ? 'assignment' : 'assignments')}
          className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${['assignments', 'assignment'].includes(activeTab) ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {tabLabels?.assignments || (allowedTabs?.includes('assignment') ? 'Assignment' : 'Assignments')}
          {['assignments', 'assignment'].includes(activeTab) && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
          )}
        </button>
      )}
    </div>
  )
}

