import React from 'react'
import { useNavigate } from 'react-router-dom'

export type AnnotatorProjectTabType = 'detail' | 'assignment' | 'dataset' | null

interface AnnotatorProjectTabsProps {
  projectId: string
  activeTab?: AnnotatorProjectTabType
}

export const AnnotatorProjectTabs: React.FC<AnnotatorProjectTabsProps> = ({
  projectId,
  activeTab
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-8 border-b border-gray-800 mb-6 pb-2">
      <button
        onClick={() => navigate(`/annotator/projects/${projectId}`)}
        className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${
          activeTab === 'detail' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        Project Detail
        {activeTab === 'detail' && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
        )}
      </button>
      <button
        onClick={() => navigate(`/annotator/projects/${projectId}/assignments`)}
        className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${
          activeTab === 'assignment' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        Assignments
        {activeTab === 'assignment' && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
        )}
      </button>
      <button
        onClick={() => navigate(`/annotator/projects/${projectId}/datasets`)}
        className={`text-lg font-medium transition-colors cursor-pointer relative pb-2 ${
          activeTab === 'dataset' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        Datasets
        {activeTab === 'dataset' && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-md"></div>
        )}
      </button>
    </div>
  )
}

