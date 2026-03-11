import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography } from 'antd'
import { DatasetDetail } from '@/features/manager/components/dataset/DatasetDetail'
import { DatasetTabs, type DatasetTabType } from '@/features/manager/components/dataset/DatasetTabs'
import { AnnotatorDatasetQuickActions } from '@/features/annotator/components/AnnotatorDatasetQuickActions'
import { AnnotatorLabelList } from '@/features/annotator/components/AnnotatorLabelList'
import { PATH_ANNOTATOR } from '@/routes/paths'
import projectApi from '@/api/ProjectApi'
import { useEffect } from 'react'

const { Title } = Typography

const AnnotatorDatasetDetailPage: React.FC = () => {
  const { projectId, datasetId } = useParams<{ projectId: string; datasetId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DatasetTabType>('dataset')
  const [projectName, setProjectName] = useState<string>('')

  useEffect(() => {
    const fetchProjectInfo = async () => {
      if (!projectId) return
      try {
        const response = await projectApi.getProjectById(projectId)
        const data = response.data?.data || response.data
        if (data) {
          setProjectName(data.projectName || data.name || '')
        }
      } catch (err) {
        console.error('Failed to fetch project info:', err)
      }
    }
    fetchProjectInfo()
  }, [projectId])

  if (!datasetId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <p className="text-lg font-display">Dataset not found.</p>
      </div>
    )
  }

  const handleBack = () => {
    if (projectId) {
      navigate(`/annotator/project/${projectId}`)
    } else {
      navigate(PATH_ANNOTATOR.project)
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Tab Navigation */}
      <DatasetTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area (3/4) */}
        <div className="flex-grow lg:w-3/4">
          <div className="mb-6">
            <Title level={2} className="!text-white !m-0 !font-display tracking-tight">
              {activeTab === 'dataset' 
                ? (projectName ? `Project: ${projectName}` : 'Dataset Detail') 
                : 'Project Labels'}
            </Title>
            {projectName && activeTab === 'dataset' && (
                <p className="text-gray-400 text-sm mt-1">Viewing data items for the selected dataset</p>
            )}
          </div>

          {activeTab === 'dataset' ? (
            <DatasetDetail
              datasetId={datasetId}
              onBack={handleBack}
            />
          ) : (
            <AnnotatorLabelList datasetId={datasetId} />
          )}
        </div>

        {/* Sidebar (1/4) */}
        <div className="lg:w-1/4">
          <AnnotatorDatasetQuickActions />
        </div>
      </div>
    </div>
  )
}

export default AnnotatorDatasetDetailPage
