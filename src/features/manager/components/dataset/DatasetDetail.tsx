import React, { useEffect, useState, useCallback } from 'react'
import {
  App,
  Spin,
  Empty,
  Pagination,
  Image,
  Button
} from 'antd'
import { EditOutlined } from '@ant-design/icons'
import datasetApi from '@/api/DatasetApi'
import projectApi from '@/api/ProjectApi'
import { ProjectDetail } from '../dashboard/ProjectDetail'
import { useSearchParams } from 'react-router-dom'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { CreateDatasetModal } from './CreateDatasetModal'
import { useLabelsByDataset } from '@/features/manager/hooks/useLabels'
import { themeClasses } from '@/styles'

// Dataset Detail Component

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
  status?: string
}

export const DatasetDetail: React.FC<DatasetDetailProps> = ({ datasetId, onBack }) => {
  const { message } = App.useApp()
  const [dataset, setDataset] = useState<DatasetDetailData | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const { data: labels = [] } = useLabelsByDataset(datasetId)
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
      />
    )
  }

  return (
    <div className="relative overflow-hidden min-h-[600px] animate-fade-in pr-2">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-blue-400">database</span>
              <span className="text-xs font-mono text-blue-400 tracking-widest uppercase">
                Dataset Detail
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{dataset.datasetName}</h1>
            <p className="text-sm text-gray-400 mt-1 font-mono">{dataset.datasetId}</p>
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="bg-violet-600 hover:bg-violet-500 border-none shadow-[0_0_20px_rgba(139,92,246,0.3)] h-10 px-6 rounded-xl transition-all"
            onClick={() => setIsEditModalVisible(true)}
          >
            Edit Dataset
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-6 relative z-10">

        {/* Top Row: Main Info (2 columns) matching Annotator structure */}
        <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row items-stretch`}>
          {/* Left: Information */}
          <div className="flex-1 p-7 border-b md:border-b-0 md:border-r border-white/10 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-violet-500/5 blur-[50px] pointer-events-none" />
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-violet-400">info</span>
              Dataset Information
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Dataset ID</label>
                <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded border border-violet-500/20">
                  {dataset.datasetId}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Total Items</label>
                <span className="text-sm text-gray-200 font-bold">{(dataset.totalItems ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Created At</label>
                <span className="text-sm text-gray-300">{formatDate(dataset.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Status</label>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-${getStatusColor(dataset.datasetStatus) === 'success' ? 'emerald' : getStatusColor(dataset.datasetStatus) === 'warning' ? 'orange' : getStatusColor(dataset.datasetStatus) === 'error' ? 'red' : 'violet'}-500/10 border border-${getStatusColor(dataset.datasetStatus) === 'success' ? 'emerald' : getStatusColor(dataset.datasetStatus) === 'warning' ? 'orange' : getStatusColor(dataset.datasetStatus) === 'error' ? 'red' : 'violet'}-500/20 text-[10px] font-bold text-${getStatusColor(dataset.datasetStatus) === 'success' ? 'emerald' : getStatusColor(dataset.datasetStatus) === 'warning' ? 'orange' : getStatusColor(dataset.datasetStatus) === 'error' ? 'red' : 'violet'}-400 uppercase tracking-widest`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-${getStatusColor(dataset.datasetStatus) === 'success' ? 'emerald' : getStatusColor(dataset.datasetStatus) === 'warning' ? 'orange' : getStatusColor(dataset.datasetStatus) === 'error' ? 'red' : 'violet'}-400 animate-pulse`} />
                  {dataset.datasetStatus || 'UNKNOWN'}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Description */}
          <div className="flex-1 p-7 flex flex-col relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-fuchsia-500/5 blur-[50px] pointer-events-none" />
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-fuchsia-400">description</span>
              Description
            </h3>
            <div className="flex-1 bg-black/20 p-5 rounded-2xl border border-white/5 min-h-[120px]">
              <p className="text-sm text-gray-300 leading-relaxed italic">
                {dataset.description || 'No description provided for this dataset.'}
              </p>
            </div>
          </div>
        </div>

        {/* Middle Row: Project & Labels (2 columns) matching Annotator structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Associated Project */}
          <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-400">folder_special</span>
              Associated Project
            </h3>
            {dataset.projectId ? (
              <div
                className="bg-black/20 p-5 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-black/30 transition-all cursor-pointer group"
                onClick={() => setViewProjectId(dataset.projectId || null)}
              >
                <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">
                  {projectName || `Project ID: ${dataset.projectId}`}
                </h4>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">visibility</span>
                  Click to view project details
                </p>
              </div>
            ) : (
              <div className="bg-black/20 p-5 rounded-xl border border-white/5 text-center italic text-gray-500">
                No associated project
              </div>
            )}
          </div>

          {/* Labels Section */}
          <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">label</span>
              Dataset Labels
            </h3>
            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
              {labels.length === 0 ? (
                <p className="text-gray-500 text-sm italic py-2">No labels defined.</p>
              ) : (
                labels.map((label) => (
                  <div
                    key={label.labelId}
                    className="flex items-center gap-2.5 bg-black/20 px-3 py-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: label.color || '#6366f1' }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-200 font-medium">{label.labelName}</span>
                      {label.description && (
                        <span className="text-[9px] text-gray-500 truncate max-w-[100px]">{label.description}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Data Items Grid (Full Width) */}
        <div
          className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-7 flex flex-col shadow-xl min-h-[550px]`}
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-blue-400">grid_view</span>
              </span>
              Data Items
            </h3>
            <span className="text-xs font-mono bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-blue-400 font-medium tracking-tight">
              {dataItems.length} items total
            </span>
          </div>

          {itemsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Spin size="large" />
            </div>
          ) : dataItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-2xl bg-black/10">
              <span className="material-symbols-outlined text-gray-600 text-6xl mb-4 opacity-10">
                image_not_supported
              </span>
              <p className="text-gray-400 text-base font-medium">No data items found</p>
              <p className="text-gray-600 text-xs mt-2">Images will appear here once uploaded.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar p-1 flex-1">
                {dataItems
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item, index) => (
                    <div
                      key={item.dataItemId || item.id || item.itemId || index}
                      className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-square flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/5"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                        <span className="material-symbols-outlined text-gray-700 text-4xl opacity-10">
                          image
                        </span>
                      </div>
                      <img
                        src={
                          item.imageUrl ||
                          item.url ||
                          item.previewUrl ||
                          item.path ||
                          `https://picsum.photos/seed/${item.dataItemId || item.id || index}/300/300`
                        }
                        alt={item.name || item.filename || item.fileName || item.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://picsum.photos/seed/placeholder/300/300'
                        }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <span className="text-[11px] text-white line-clamp-2 font-medium leading-snug font-mono">
                          {item.name || item.filename || item.fileName || item.title}
                        </span>
                      </div>

                      {/* Badges */}
                      {(item.labeled || item.status?.toUpperCase() === 'ACTIVE' || item.status?.toUpperCase() === 'COMPLETED') && (
                        <div className={`absolute top-2 right-2 flex items-center gap-1.5 bg-${item.status?.toLowerCase() === 'active' || item.labeled ? 'emerald' : 'gray'}-500/20 border border-${item.status?.toLowerCase() === 'active' || item.labeled ? 'emerald' : 'gray'}-500/50 text-${item.status?.toLowerCase() === 'active' || item.labeled ? 'emerald' : 'gray'}-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md backdrop-blur-md shadow-lg shadow-black/20`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${item.status?.toLowerCase() === 'active' || item.labeled ? 'emerald' : 'gray'}-400 animate-pulse`} />
                          {item.status || (item.labeled ? 'Labeled' : 'Pending')}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={dataItems.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="custom-pagination"
                />
              </div>
            </>
          )}
        </div>
      </div>

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
              <span className="material-symbols-outlined text-emerald-400">database</span>
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
                  <span className="material-symbols-outlined text-5xl text-gray-600 opacity-50">image</span>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Item ID</label>
                    <span className="font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 text-xs">
                      {selectedItem.dataItemId || selectedItem.id || selectedItem.itemId || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Filename</label>
                    <span className="text-sm text-gray-200 truncate max-w-[300px]">
                      {selectedItem.name || selectedItem.filename || selectedItem.fileName || selectedItem.title || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Status</label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${selectedItem.status?.toLowerCase() === 'active'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : selectedItem.status?.toLowerCase() === 'inactive'
                            ? 'bg-red-500'
                            : selectedItem.labeled
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : 'bg-gray-500'
                          }`}
                      />
                      <span
                        className={`text-xs font-medium ${selectedItem.status?.toLowerCase() === 'active'
                          ? 'text-emerald-400'
                          : selectedItem.status?.toLowerCase() === 'inactive'
                            ? 'text-red-400'
                            : selectedItem.labeled
                              ? 'text-emerald-400'
                              : 'text-gray-400'
                          }`}
                      >
                        {selectedItem.status
                          ? selectedItem.status.toUpperCase()
                          : selectedItem.labeled
                            ? 'COMPLETED'
                            : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
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
        .custom-pagination .ant-pagination-item {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .custom-pagination .ant-pagination-item a {
          color: #9ca3af;
        }
        .custom-pagination .ant-pagination-item-active {
          background: rgba(59, 130, 246, 0.2) !important;
          border-color: rgba(59, 130, 246, 0.5) !important;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: #60a5fa !important;
        }
        .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
        .custom-pagination .ant-pagination-next .ant-pagination-item-link {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #9ca3af !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px;
        }
        .custom-pagination .ant-pagination-disabled .ant-pagination-item-link {
          opacity: 0.3;
        }
        .custom-pagination .ant-pagination-jump-prev .ant-pagination-item-container .ant-pagination-item-ellipsis,
        .custom-pagination .ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-ellipsis {
          color: #4b5563;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
