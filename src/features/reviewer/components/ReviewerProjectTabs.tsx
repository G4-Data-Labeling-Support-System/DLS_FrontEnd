import React from 'react'
import { useNavigate } from 'react-router-dom'

export type ReviewerProjectTabType = 'detail' | 'assignment' | 'dataset' | null

interface ReviewerProjectTabsProps {
  projectId: string
  activeTab?: ReviewerProjectTabType
}

export const ReviewerProjectTabs: React.FC<ReviewerProjectTabsProps> = ({
  projectId,
  activeTab
}) => {
  const navigate = useNavigate()

  const tabs = [
    { key: 'detail', label: 'Project Detail', path: `/reviewer/projects/${projectId}` },
    { key: 'assignment', label: 'Assignments', path: `/reviewer/projects/${projectId}/assignments` },
    { key: 'dataset', label: 'Datasets', path: `/reviewer/projects/${projectId}/datasets` }
  ]

  return (
    <div className="flex items-center gap-8 border-b border-gray-800 mb-6 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => navigate(tab.path)}
          className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${
            activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
          )}
        </button>
      ))}
    </div>
  )
}
