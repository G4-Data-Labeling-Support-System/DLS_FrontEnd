import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Card, Descriptions, Tag, Empty, Typography, Button } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons'

import { useAuthStore } from '@/store/auth.store'
import projectApi from '@/api/ProjectApi'
import guidelineApi from '@/api/GuidelineApi'
import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'

const { Title } = Typography

export default function AnnotatorProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [projectDetail, setProjectDetail] = useState<any>(null)
  const [guidelines, setGuidelines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !user?.id) return

      try {
        setLoading(true)
        setError(null)

        // 1. Fetch Project Details
        const projectRes = await projectApi.getProjectById(projectId)
        const rawProj = projectRes.data?.data || projectRes.data
        const pStatus = (rawProj.projectStatus || rawProj.status || '').toUpperCase()

        if (pStatus && pStatus !== 'INACTIVE') {
          setProjectDetail({
            ...rawProj,
            id: rawProj.projectId || rawProj.id,
            name: rawProj.projectName || rawProj.name,
            status: rawProj.projectStatus || rawProj.status
          })
        } else {
          setError('Project is inactive or not found.')
          return
        }

        // 2. Fetch all Guidelines
        const guidelineRes = await guidelineApi.getGuidelines(projectId)
        const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
        setGuidelines(Array.isArray(guidelinesList) ? guidelinesList : [guidelinesList].filter(Boolean))
      } catch (err) {
        console.error('Failed to fetch project details:', err)
        setError('Failed to load project details.')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId, user?.id])

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'processing'
      case 'COMPLETED': return 'success'
      case 'PAUSED': return 'warning'
      case 'INACTIVE': return 'error'
      default: return 'default'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  if (loading && !projectDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
        <span className="mt-4 text-violet-400 font-mono">Loading Project...</span>
      </div>
    )
  }

  if (error || !projectDetail) {
    return (
      <div className="p-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="text-gray-400 hover:text-white mb-6"
          onClick={() => navigate('/annotator/projects')}
        >
          Back to Projects
        </Button>
        <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
          {error || 'Project not found.'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="text-gray-400 hover:text-white mb-4"
        onClick={() => navigate('/annotator/projects')}
      >
        Back to Projects
      </Button>

      {/* Tabs Menu */}
      {projectId && <AnnotatorProjectTabs projectId={projectId} activeTab={null} />}

      {/* Project Title + Status */}
      <div className="flex justify-between items-start mt-6 mb-4">
        <div>
          <Title level={3} className="!text-white !m-0 !font-display">
            {projectDetail.name || projectDetail.projectName}
          </Title>
          <div className="mt-2">
            <Tag
              color={getStatusColor(projectDetail.status)}
              className="m-0 font-medium text-sm px-3 py-1"
            >
              {projectDetail.status || 'UNKNOWN'}
            </Tag>
          </div>
        </div>
      </div>

      {/* Main Card: Project Information + Guidelines */}
      <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-4 p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full w-full">

          {/* Left: Project Information */}
          <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-800">
            <Descriptions
              title={
                <span className="text-white text-lg font-display flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-400">info</span>
                  Project Information
                </span>
              }
              column={1}
              className="custom-descriptions"
              styles={{
                label: { color: '#9ca3af', fontWeight: 500, width: '150px' },
                content: { color: '#d1d5db' }
              }}
            >
              <Descriptions.Item label="Project ID">
                <span className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  {projectDetail.id || projectDetail.projectId}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {projectDetail.description || projectDetail.descriptionProject || (
                  <span className="text-gray-600 italic">No description</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {formatDate(projectDetail.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {formatDate(projectDetail.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Right: Project Guidelines */}
          <div className="flex-1 p-6">
            <h3 className="text-white text-lg font-display flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-green-400">menu_book</span>
              Project Guidelines
            </h3>

            {guidelines.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[150px]">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span className="text-gray-500">No guidelines available</span>}
                />
              </div>
            ) : (
              <div
                className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 custom-scrollbar"
                style={{ maxHeight: '300px' }}
              >
                {guidelines.map((guideline: any, index: number) => (
                  <div
                    key={guideline.guideId || index}
                    className="flex flex-col gap-2 bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors"
                  >
                    <h4
                      className="text-white font-bold text-sm truncate"
                      title={guideline.title || 'Unnamed Guideline'}
                    >
                      {guideline.title || 'Unnamed Guideline'}
                    </h4>
                    <div className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">
                      {guideline.content || 'No content provided.'}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                      <span className="text-gray-500 text-xs">
                        {formatDate(guideline.createdAt)}
                      </span>
                      {guideline.version && (
                        <span className="text-gray-600 text-xs">v{guideline.version}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
