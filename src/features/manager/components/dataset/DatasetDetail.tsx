import React, { useEffect, useState } from 'react'
import { App, Spin, Typography, Card, Descriptions, Button } from 'antd'
import { FolderOutlined } from '@ant-design/icons'
import datasetApi from '@/api/DatasetApi'
import projectApi from '@/api/ProjectApi'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { UserRole } from '@/shared/constants/user_role'
import { PATH_ANNOTATOR } from '@/routes/paths'

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
  const { user } = useAuthStore()
  const [dataset, setDataset] = useState<DatasetDetailData | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [datasetItems, setDatasetItems] = useState<any[]>([])
  const [itemsLoading, setItemsLoading] = useState<boolean>(false)
  const { projectId: urlProjectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)
        let data: any = null

        if (user?.role === UserRole.ANNOTATOR && urlProjectId) {
          // Fallback for Annotators: fetch from project list (which is authorized)
          const response = await datasetApi.getDatasetsByProjectId(urlProjectId)
          const datasets = response.data?.data || response.data || []
          data = Array.isArray(datasets) 
            ? datasets.find((d: any) => String(d.datasetId || d.id) === String(datasetId))
            : null
        } else {
          // Default for Managers/Admins
          const response = await datasetApi.getDatasetById(datasetId)
          data = response.data?.data || response.data
        }

        if (data && isMounted) {
          setDataset({
            datasetId: String(data.datasetId || data.id),
            datasetName: String(data.datasetName || data.name || ''),
            description: data.description ? String(data.description) : undefined,
            projectId: data.projectId ? String(data.projectId) : undefined,
            totalItems: Number(data.totalItems || data.itemCount) || 0,
            createdAt: data.createdAt ? String(data.createdAt) : undefined
          })

          // Safety check: Only fetch project info for Managers/Admins to avoid 403 logout for Annotators
          // Note: For annotators we already have the urlProjectId, but they might not have permission for ProjectDetail API anyway
          if (data.projectId && (user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN)) {
            try {
              const projRes = await projectApi.getProjectById(data.projectId)
              const projData = projRes.data?.data || projRes.data
              if (projData && isMounted) {
                setProjectName(String(projData.projectName || projData.name || data.projectId))
              }
            } catch (projErr: any) {
              console.warn('Could not fetch project name:', projErr)
            }
          }
        } else if (isMounted) {
            throw new Error('Dataset not found')
        }
      } catch (error: any) {
        if (isMounted) {
          console.error('Error fetching dataset details:', error)
          if (error?.response?.status !== 403) {
            message.error('Cannot load dataset details.')
          }
          onBack()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const fetchItems = async () => {
      try {
        setItemsLoading(true)
        const response = await datasetApi.getDatasetItems(datasetId)
        const data = response.data?.data || response.data || []
        if (isMounted) {
          setDatasetItems(data)
        }
      } catch (error) {
        console.error('Error fetching dataset items:', error)
      } finally {
        if (isMounted) {
          setItemsLoading(false)
        }
      }
    }

    if (datasetId) {
      fetchDetail()
      fetchItems()
    }

    return () => {
      isMounted = false
    }
  }, [datasetId, user?.role, message, onBack, urlProjectId])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" tip="Loading dataset details..." />
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="w-full text-center py-10 text-gray-400 glass-panel rounded-2xl">
        Error loading dataset information.
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<span className="material-symbols-outlined">arrow_back</span>}
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          />
          <div>
            <Title level={3} className="!text-white !m-0 !font-display">
              {dataset.datasetName || 'Unnamed Dataset'}
            </Title>
          </div>
        </div>
      </div>

      <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6 p-0 overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row w-full">
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
                    className="text-blue-400 hover:text-blue-300 cursor-pointer transition-all hover:translate-x-1 inline-flex items-center gap-1"
                    onClick={() => {
                      if (user?.role === UserRole.ANNOTATOR) {
                        navigate(PATH_ANNOTATOR.project)
                      } else {
                        navigate(`/manager/projects/${dataset.projectId}`)
                      }
                    }}
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

          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-lg font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">description</span>
                Description
              </span>
            </div>
            <div className="flex-1 bg-[#231e31] p-4 rounded-xl border border-white/5 min-h-[100px]">
              <div className="text-gray-400 text-sm whitespace-pre-wrap">
                {dataset.description || (
                  <span className="text-gray-600 italic">No description provided.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card
        className="bg-[#1A1625] border-gray-800 rounded-xl p-6 shadow-xl"
        title={
          <span className="text-white text-lg font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">imagesmode</span>
            Dataset Items
          </span>
        }
      >
        {itemsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin tip="Loading items..." />
          </div>
        ) : datasetItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 rounded-2xl border-dashed border border-gray-800">
            <span className="material-symbols-outlined text-4xl mb-4 opacity-20">image_not_supported</span>
            <p>No items found in this dataset.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {datasetItems.map((item) => (
              <div
                key={item.itemId || item.id}
                className="relative group rounded-xl overflow-hidden border border-white/5 bg-black/20 aspect-square flex items-center justify-center hover:border-violet-500/50 transition-all cursor-pointer shadow-lg"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors">
                  <span className="material-symbols-outlined text-gray-600 text-3xl opacity-20">
                    image
                  </span>
                </div>
                <img
                  src={item.previewUrl || item.url || (item.fileName ? `https://picsum.photos/seed/${item.itemId}/200/200` : 'https://picsum.photos/seed/placeholder/200/200')}
                  alt={item.fileName || item.name || item.filename}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[10px] text-white truncate font-medium">
                    {item.fileName || item.name || item.filename}
                  </span>
                </div>
                {item.labeled && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <style>{`
        .custom-descriptions .ant-descriptions-title {
          margin-bottom: 20px;
        }
        .custom-descriptions .ant-descriptions-item-container {
          border-bottom: 1px solid #2d263b;
          padding-bottom: 12px;
          margin-bottom: 12px;
          display: flex;
        }
        .custom-descriptions .ant-descriptions-item-label {
          flex-shrink: 0;
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
