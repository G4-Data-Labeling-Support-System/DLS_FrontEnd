import React, { useEffect, useState, useCallback } from 'react'
import { App, Spin, Typography, Card, Descriptions, Empty, Pagination, Image, Button, Tag } from 'antd'
import { FolderOutlined, DatabaseOutlined, PictureOutlined, EditOutlined } from '@ant-design/icons'
import datasetApi from '@/api/DatasetApi'
import projectApi from '@/api/ProjectApi'
import { ProjectDetail } from '../dashboard/ProjectDetail'
import { useSearchParams } from 'react-router-dom'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { CreateDatasetModal } from './CreateDatasetModal'

const { Title } = Typography

interface DatasetDetailData {
  datasetId?: string
  projectId?: string
  datasetName?: string
  description?: string
  totalItems?: number
  createdAt?: string
  datasetStatus?: string
}

interface DatasetDetailProps {
  datasetId: string
  onBack: () => void
}

interface DataItem {
  id?: string | number
  dataItemId?: string | number
  itemId?: string | number
  name?: string
  filename?: string
  fileName?: string
  title?: string
  url?: string
  imageUrl?: string
  previewUrl?: string
  path?: string
  labeled?: boolean
}

export const DatasetDetail: React.FC<DatasetDetailProps> = ({ datasetId, onBack }) => {
  const { message } = App.useApp()
  const [dataset, setDataset] = useState<DatasetDetailData | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [itemsLoading, setItemsLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [itemDetailLoading, setItemDetailLoading] = useState<boolean>(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const itemsPerPage = 12

  const viewProjectId = searchParams.get('viewProjectId')
  const setViewProjectId = (id: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) {
        next.set('viewProjectId', id)
      } else {
        next.delete('viewProjectId')
      }
      return next
    })
  }

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true)
      const response = await datasetApi.getDatasetById(datasetId)
      const data = response.data?.data || response.data

      if (data) {
        const extractedProjectId = data.projectId || data.project?.id || data.project?.projectId

        setDataset({
          datasetId: String(data.datasetId || data.id),
          datasetName: String(data.datasetName || data.name || ''),
          description: data.description ? String(data.description) : undefined,
          projectId: extractedProjectId ? String(extractedProjectId) : undefined,
          totalItems: Number(data.totalItems || data.itemCount) || 0,
          createdAt: data.createdAt ? String(data.createdAt) : undefined,
          datasetStatus: String(data.datasetStatus || data.status || data.dataset_status || '')
        })

        if (extractedProjectId) {
          try {
            const projRes = await projectApi.getProjectById(extractedProjectId)
            const projData = projRes.data?.data || projRes.data
            if (projData) {
              setProjectName(String(projData.projectName || projData.name || extractedProjectId))
            }
          } catch (projErr) {
            console.error('Failed to fetch associated project details:', projErr)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dataset details:', error)
      message.error('Cannot load dataset details.')
      onBack()
    } finally {
      setLoading(false)
    }
  }, [datasetId, onBack, message])

  const fetchItems = useCallback(async () => {
    try {
      setItemsLoading(true)
      const response = await datasetApi.getDatasetItems(datasetId)
      const data = response.data?.data || response.data || []
      setDataItems(Array.isArray(data) ? data : [data])
    } catch (error) {
      console.error('Error fetching data items:', error)
    } finally {
      setItemsLoading(false)
    }
  }, [datasetId])

  useEffect(() => {
    if (datasetId) {
      fetchDetail()
      fetchItems()
    }
  }, [datasetId, fetchDetail, fetchItems])

  const handleItemClick = async (item: DataItem) => {
    const itemId = item.dataItemId || item.id || item.itemId
    const itemName = item.name || item.filename || item.fileName || item.title

    // Set basic info immediately to show in modal
    setSelectedItem({
      ...item,
      id: itemId || undefined,
      name: itemName || undefined
    })
    setModalVisible(true)

    // If we have an ID, fetch full details
    if (itemId) {
      setItemDetailLoading(true)
      try {
        const response = await datasetApi.getDataItemById(String(itemId))
        const data = response.data?.data || response.data
        setSelectedItem({
          ...data,
          id: data.dataItemId || data.id || data.itemId || itemId, // Prefer new ID if available
          name: data.name || data.filename || data.fileName || data.title || itemName
        })
      } catch (error) {
        console.error('Error fetching item details:', error)
        // Keep showing whatever we gathered from the list
      } finally {
        setItemDetailLoading(false)
      }
    }
  }

  const handleNextItem = () => {
    if (!selectedIdForNav || dataItems.length <= 1) return
    const currentIndex = dataItems.findIndex(
      (i: DataItem) => (i.dataItemId || i.id || i.itemId) === selectedIdForNav
    )
    if (currentIndex < dataItems.length - 1) {
      handleItemClick(dataItems[currentIndex + 1])
    } else {
      handleItemClick(dataItems[0]) // Loop to first
    }
  }
  const handlePrevItem = () => {
    if (!selectedIdForNav || dataItems.length <= 1) return
    const currentIndex = dataItems.findIndex(
      (i: DataItem) => (i.dataItemId || i.id || i.itemId) === selectedIdForNav
    )
    if (currentIndex > 0) {
      handleItemClick(dataItems[currentIndex - 1])
    } else {
      handleItemClick(dataItems[dataItems.length - 1]) // Loop to last
    }
  }

  const selectedIdForNav = selectedItem
    ? selectedItem.dataItemId || selectedItem.id || selectedItem.itemId
    : null

  const handleModalClose = () => {
    setModalVisible(false)
    setTimeout(() => {
      setSelectedItem(null)
      setItemDetailLoading(false)
    }, 300)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusColor = (s?: string) => {
    switch (s?.toUpperCase()) {
      case 'INACTIVE':
      case 'ARCHIVE':
        return 'error'
      case 'COMPLETED':
        return 'success'
      case 'PAUSED':
        return 'warning'
      case 'ACTIVE':
      case 'ASSIGNED':
      case 'UNASSIGNED':
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

  if (!dataset) {
    return (
      <div className="w-full text-center py-10 text-gray-400">
        Error loading dataset information.
      </div>
    )
  }

  if (viewProjectId) {
    return (
      <ProjectDetail
        projectId={viewProjectId}
        onBack={() => setViewProjectId(null)}
        isInline={true}
      />
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
        <Button
          type="primary"
          icon={<EditOutlined />}
          className="bg-violet-600 hover:bg-violet-500 border-none"
          onClick={() => setIsEditModalVisible(true)}
        >
          Edit
        </Button>
      </div>

      {/* Main Info Card */}
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
              <Descriptions.Item label="Status">
                <Tag
                  color={getStatusColor(dataset.datasetStatus)}
                  className="m-0 font-medium px-2 py-0 border-0 rounded"
                >
                  {(dataset.datasetStatus || 'UNKNOWN').toUpperCase()}
                </Tag>
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

      <div className="grid grid-cols-1 mb-6 mt-1">
        <Card className="bg-[#1A1625] border-gray-800 rounded-xl h-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-lg font-display flex items-center gap-2">
              <FolderOutlined className="text-blue-400" />
              Associated Project
            </span>
          </div>
          {dataset.projectId ? (
            <div
              className="flex flex-col gap-2 bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer"
              onClick={() => setViewProjectId(dataset.projectId || null)}
            >
              <h4 className="text-white font-bold text-sm truncate">
                {projectName ? projectName : `Project ID: ${dataset.projectId}`}
              </h4>
              <div className="text-gray-400 text-xs mt-1">Click to view project details</div>
            </div>
          ) : (
            <div className="text-gray-500 italic py-4 text-center">No associated project</div>
          )}
        </Card>
      </div>

      {/* Data Items Section */}
      <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="text-white text-lg font-display flex items-center gap-2">
            <DatabaseOutlined className="text-emerald-400" />
            Data Items
          </span>
          <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/20">
            Total: {dataItems.length}
          </div>
        </div>

        {itemsLoading ? (
          <div className="w-full h-40 flex justify-center items-center">
            <Spin />
          </div>
        ) : dataItems.length === 0 ? (
          <Empty
            description={<span className="text-gray-500">No data items found</span>}
            className="my-10"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {dataItems
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((item: DataItem, index: number) => (
                  <div
                    key={item.dataItemId || item.id || item.itemId || `item-${index}`}
                    className="relative group rounded-xl overflow-hidden border border-white/5 bg-[#231e31] aspect-square flex flex-col cursor-pointer transition-all hover:border-emerald-500/30"
                    onClick={() => handleItemClick(item)}
                  >
                    {/* Thumbnail / Image preview */}
                    <div className="flex-1 bg-black/40 overflow-hidden relative">
                      {item.imageUrl || item.url || item.previewUrl || item.path ? (
                        <img
                          src={item.imageUrl || item.url || item.previewUrl || item.path}
                          alt={
                            item.name || item.filename || item.fileName || item.title || 'Data Item'
                          }
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            if (!target.src.includes('picsum.photos')) {
                              target.src = `https://picsum.photos/seed/${item.id || item.dataItemId || index}/200/200`
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900/50">
                          <PictureOutlined className="text-3xl opacity-50" />
                        </div>
                      )}

                      {/* Status Badge */}
                      {item.labeled !== undefined && (
                        <div className="absolute top-2 right-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${item.labeled ? 'bg-emerald-500' : 'bg-gray-400'}`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-3 border-t border-white/5 bg-[#2a2438]">
                      <div
                        className="text-xs text-gray-300 truncate font-mono"
                        title={
                          item.name ||
                          item.filename ||
                          item.fileName ||
                          item.title ||
                          `Item ${index + 1}`
                        }
                      >
                        {item.name ||
                          item.filename ||
                          item.fileName ||
                          item.title ||
                          item.dataItemId ||
                          item.id ||
                          item.itemId ||
                          `Item ${index + 1}`}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={dataItems.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                className="custom-pagination"
              />
            </div>
          </>
        )}
      </Card>

      {/* Data Item Detail Modal */}
      <GlassModal
        title={<span className="font-display text-lg text-white">Data Item Details</span>}
        open={modalVisible}
        onCancel={handleModalClose}
        width={700}
        destroyOnHidden
      >
        <div className="px-8 pt-10 pb-8 min-h-[400px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <h2 className="text-white text-xl font-bold font-display flex items-center gap-2">
              <DatabaseOutlined className="text-emerald-400" />
              {selectedItem
                ? selectedItem.name || selectedItem.filename || 'Item Details'
                : 'Item Details'}
            </h2>
            <button
              onClick={handleModalClose}
              className="text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {selectedItem ? (
            <div className="flex flex-col gap-6 relative">
              {/* Background loading indicator */}
              {itemDetailLoading && (
                <div className="absolute -top-4 right-0 flex items-center gap-2 text-xs text-emerald-400 animate-pulse bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10 z-20">
                  <Spin size="small" />
                  <span>Loading full details...</span>
                </div>
              )}

              <div className="bg-black/40 w-full h-80 rounded-xl flex items-center justify-center overflow-hidden border border-white/5 relative group/item">
                <div className="absolute inset-y-0 left-0 flex items-center p-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevItem()
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 text-white hover:bg-violet-500/80 transition-all flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover/item:opacity-100"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                </div>

                {selectedItem.imageUrl ||
                  selectedItem.url ||
                  selectedItem.previewUrl ||
                  selectedItem.path ? (
                  <Image
                    src={
                      selectedItem.imageUrl ||
                      selectedItem.url ||
                      selectedItem.previewUrl ||
                      selectedItem.path
                    }
                    alt={
                      selectedItem.name ||
                      selectedItem.filename ||
                      selectedItem.fileName ||
                      selectedItem.title ||
                      'Item'
                    }
                    className="max-w-full max-h-full object-contain"
                    rootClassName="w-full h-full flex items-center justify-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('picsum.photos')) {
                        target.src = `https://picsum.photos/seed/${selectedItem.id || selectedItem.dataItemId || 'err'}/400/300`
                      }
                    }}
                  />
                ) : (
                  <PictureOutlined className="text-5xl text-gray-600 opacity-50" />
                )}

                <div className="absolute inset-y-0 right-0 flex items-center p-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextItem()
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 text-white hover:bg-violet-500/80 transition-all flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover/item:opacity-100"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                {/* Visual loading mask for image if applicable */}
                {itemDetailLoading && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <Spin size="large" />
                  </div>
                )}
              </div>

              <div className="bg-[#231e31]/50 border border-white/5 rounded-xl p-4">
                <Descriptions
                  column={1}
                  className="custom-descriptions"
                  styles={{
                    label: { color: '#9ca3af', fontWeight: 500, width: '140px' },
                    content: { color: '#d1d5db' }
                  }}
                >
                  <Descriptions.Item label="Item ID">
                    <span className="font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                      {selectedItem.dataItemId || selectedItem.id || selectedItem.itemId || 'N/A'}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Filename">
                    {selectedItem.name ||
                      selectedItem.filename ||
                      selectedItem.fileName ||
                      selectedItem.title ||
                      'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${selectedItem.labeled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-500'}`}
                      />
                      <span
                        className={`text-xs font-medium ${selectedItem.labeled ? 'text-emerald-400' : 'text-gray-400'}`}
                      >
                        {selectedItem.labeled ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          ) : itemDetailLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Spin size="large" />
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              <Empty description="No details available" />
            </div>
          )}
        </div>
      </GlassModal>

      <CreateDatasetModal
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        isEdit={true}
        initialData={{
          datasetId: dataset.datasetId!,
          datasetName: dataset.datasetName!,
          description: dataset.description,
          projectId: dataset.projectId
        }}
        onSuccess={() => {
          setIsEditModalVisible(false)
          fetchDetail()
          fetchItems()
        }}
      />

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
        .custom-pagination .ant-pagination-item {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .custom-pagination .ant-pagination-item a {
          color: #9ca3af;
        }
        .custom-pagination .ant-pagination-item-active {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
        }
        .custom-pagination .ant-pagination-item-active a {
          color: #60a5fa;
        }
        .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
        .custom-pagination .ant-pagination-next .ant-pagination-item-link {
          background: rgba(255, 255, 255, 0.05);
          color: #9ca3af;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .custom-pagination .ant-pagination-disabled .ant-pagination-item-link {
          opacity: 0.5;
        }
      `}</style>
    </div>
  )
}
