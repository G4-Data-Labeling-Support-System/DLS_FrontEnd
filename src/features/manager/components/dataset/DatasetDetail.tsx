import React, { useEffect, useState } from 'react'
import { App, Spin, Typography, Card, Descriptions } from 'antd'
import { FolderOutlined } from '@ant-design/icons'
import datasetApi from '@/api/DatasetApi'
import projectApi from '@/api/ProjectApi'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

interface DatasetDetailData {
  datasetId?: string
  projectId?: string
  datasetName?: string
  description?: string
  totalItems?: number
  createdAt?: string
}

interface DatasetDetailProps {
  datasetId: string
  onBack: () => void
}

export const DatasetDetail: React.FC<DatasetDetailProps> = ({ datasetId, onBack }) => {
  const { message } = App.useApp()
  const [dataset, setDataset] = useState<DatasetDetailData | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const response = await datasetApi.getDatasetById(datasetId)
        const data = response.data?.data || response.data

        if (data && isMounted) {
          setDataset({
            datasetId: String(data.datasetId || data.id),
            datasetName: String(data.datasetName || data.name || ''),
            description: data.description ? String(data.description) : undefined,
            projectId: data.projectId ? String(data.projectId) : undefined,
            totalItems: Number(data.totalItems || data.itemCount) || 0,
            createdAt: data.createdAt ? String(data.createdAt) : undefined
          })

          if (data.projectId) {
            try {
              const projRes = await projectApi.getProjectById(data.projectId)
              const projData = projRes.data?.data || projRes.data
              if (projData && isMounted) {
                setProjectName(String(projData.projectName || projData.name || data.projectId))
              }
            } catch (projErr) {
              console.error('Failed to fetch associated project details:', projErr)
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching dataset details:', error)
          message.error('Cannot load dataset details.')
          onBack()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (datasetId) {
      fetchDetail()
    }

    return () => {
      isMounted = false
    }
  }, [datasetId, onBack, message])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="w-full text-center py-10 text-gray-400">
        Error loading dataset information.
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Header - same layout as ProjectDetail */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div>
            <Title level={3} className="!text-white !m-0 !font-display">
              {dataset.datasetName || 'Unnamed Dataset'}
            </Title>
          </div>
        </div>
      </div>

      {/* Main Info Card - split layout like ProjectDetail */}
      <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6 p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full w-full">
          {/* Left: Dataset Information */}
          <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-800">
            <Descriptions
              title={
                <span className="text-white text-lg font-display flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-400">info</span>
                  Dataset Information
                </span>
              }
              column={1}
              className="custom-descriptions"
              styles={{
                label: { color: '#9ca3af', fontWeight: 500, width: '150px' },
                content: { color: '#d1d5db' }
              }}
            >
              <Descriptions.Item label="Dataset ID">
                <span className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  {dataset.datasetId}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Total Items">
                {(dataset.totalItems ?? 0).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {formatDate(dataset.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Associated Project">
                {dataset.projectId ? (
                  <span
                    className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                    onClick={() => navigate(`/manager/projects/${dataset.projectId}`)}
                  >
                    <FolderOutlined className="mr-1" />
                    {projectName || `Project ID: ${dataset.projectId}`}
                  </span>
                ) : (
                  <span className="text-gray-600 italic">No project associated</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Right: Description */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-lg font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400">description</span>
                Description
              </span>
            </div>
            <div className="flex-1 bg-[#231e31] p-4 rounded-xl border border-white/5">
              <div className="text-gray-400 text-sm whitespace-pre-wrap">
                {dataset.description || (
                  <span className="text-gray-600 italic">No description provided.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        .custom-descriptions .ant-descriptions-title {
          margin-bottom: 20px;
        }
        .custom-descriptions .ant-descriptions-item-container {
          border-bottom: 1px solid #2d263b;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .custom-descriptions .ant-descriptions-item-container:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  )
}
