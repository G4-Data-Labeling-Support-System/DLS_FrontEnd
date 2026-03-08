import React from 'react'

export type DatasetTabType = 'dataset' | 'upload'

interface DatasetTabsProps {
  activeTab: DatasetTabType
  onTabChange: (tab: DatasetTabType) => void
}

export const DatasetTabs: React.FC<DatasetTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-8 border-b border-gray-800 mb-6 pb-2">
      <button
        onClick={() => onTabChange('dataset')}
        className={`text-lg font-medium transition-colors relative pb-2 ${activeTab === 'dataset' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        Datasets
        {activeTab === 'dataset' && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
        )}
      </button>
    </div>
  )
}
