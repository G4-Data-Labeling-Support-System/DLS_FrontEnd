import React from 'react'

export type ManageProjectThingsTabType = 'assignment' | 'dataset' | 'upload' | 'label'

interface ManageProjectThingsTabsProps {
  activeTab: ManageProjectThingsTabType
  onTabChange: (tab: ManageProjectThingsTabType) => void
}

export const ManageProjectThingsTabs: React.FC<ManageProjectThingsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-8 border-b border-gray-800 mb-6 pb-2">
      <button
        onClick={() => onTabChange('assignment')}
        className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${activeTab === 'assignment' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        Assignments
        {activeTab === 'assignment' && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
        )}
      </button>
      <button
        onClick={() => onTabChange('dataset')}
        className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${activeTab === 'dataset' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        Datasets
        {activeTab === 'dataset' && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
        )}
      </button>
      <button
        onClick={() => onTabChange('label')}
        className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${activeTab === 'label' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        Labels
        {activeTab === 'label' && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
        )}
      </button>
    </div>
  )
}
