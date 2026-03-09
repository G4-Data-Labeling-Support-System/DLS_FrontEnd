import React, { useEffect, useState } from 'react'
import { App, Spin, Typography, Card, Descriptions, Tag } from 'antd'
import { FolderOutlined } from '@ant-design/icons'
import labelApiClient from '@/api/LabelApi'
import projectApi from '@/api/ProjectApi'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

interface LabelDetailData {
  labelId?: string
  labelName?: string
  description?: string
  labelStatus?: string
  projectId?: string
  createdAt?: string
  updatedAt?: string
}

interface LabelDetailProps {
  labelId: string
  onBack: () => void
}

export const LabelDetail: React.FC<LabelDetailProps> = ({ labelId, onBack }) => {
  const { message } = App.useApp()
  const [label, setLabel] = useState<LabelDetailData | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const response = await labelApiClient.getLabelById(labelId)
        const data = response.data?.data || response.data

        if (data && isMounted) {
          setLabel({
            labelId: String(data.labelId || data.id),
            labelName: String(data.labelName || data.name || ''),
            description: data.description ? String(data.description) : undefined,
            labelStatus: data.labelStatus || data.status ? String(data.labelStatus || data.status) : undefined,
            projectId: data.projectId ? String(data.projectId) : undefined,
            createdAt: data.createdAt ? String(data.createdAt) : undefined,
            updatedAt: data.updatedAt ? String(data.updatedAt) : undefined
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
          console.error('Error fetching label details:', error)
          message.error('Cannot load label details.')
          onBack()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (labelId) {
      fetchDetail()
    }

    return () => {
      isMounted = false
    }
  }, [labelId, onBack, message])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'processing'
      case 'COMPLETED':
        return 'success'
      case 'INACTIVE':
        return 'error'
      case 'DRAFT':
        return 'default'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!label) {
    return (
      <div className="w-full text-center py-10 text-gray-400">
        Error loading label information.
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div>
            <Title level={3} className="!text-white !m-0 !font-display">
              {label.labelName || 'Unnamed Label'}
            </Title>
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6 p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full w-full">
          {/* Left: Label Information */}
          <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-800">
            <Descriptions
              title={
                <span className="text-white text-lg font-display flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-400">info</span>
                  Label Information
                </span>
              }
              column={1}
              className="custom-descriptions"
              styles={{
                label: { color: '#9ca3af', fontWeight: 500, width: '150px' },
                content: { color: '#d1d5db' }
              }}
            >
              <Descriptions.Item label="Label ID">
                <span className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  {label.labelId}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {label.labelStatus ? (
                  <Tag color={getStatusColor(label.labelStatus)} className="m-0 font-medium">
                    {label.labelStatus}
                  </Tag>
                ) : (
                  <span className="text-gray-600 italic">N/A</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {formatDate(label.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {formatDate(label.updatedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Associated Project">
                {label.projectId ? (
                  <span
                    className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                    onClick={() => navigate(`/manager/projects/${label.projectId}`)}
                  >
                    <FolderOutlined className="mr-1" />
                    {projectName || `Project ID: ${label.projectId}`}
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
                {label.description || (
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
