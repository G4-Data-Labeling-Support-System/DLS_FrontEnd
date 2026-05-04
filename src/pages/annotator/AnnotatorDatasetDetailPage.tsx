import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import datasetApi from '@/api/DatasetApi'
import { labelApi } from '@/api/LabelApi'
import { themeClasses } from '@/styles'
import { Pagination, Image, Spin } from 'antd'
import { GlassModal } from '@/shared/components/ui/GlassModal'

interface Dataset {
  datasetId: string
  datasetName: string
  description?: string
  totalItems?: number
  createdAt?: string
  project?: {
    projectId: string
    projectName: string
  }
  dataitems?: DatasetItem[]
}

interface DatasetItem {
  itemId: string
  id?: string
  fileName?: string
  name?: string
  filename?: string
  previewUrl?: string
  url?: string
  imageUrl?: string
  path?: string
  status?: string
  labeled?: boolean
}

interface Label {
  labelId: string
  labelName: string
  color: string
  description?: string
}

export default function AnnotatorDatasetDetailPage() {
  const { projectId, datasetId: paramDatasetId } = useParams<{ projectId: string; datasetId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Support both param and search param
  const datasetId = paramDatasetId || searchParams.get('datasetId')

  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [items, setItems] = useState<DatasetItem[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<DatasetItem | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [itemDetailLoading, setItemDetailLoading] = useState(false)
  const itemsPerPage = 12

  useEffect(() => {
    const fetchDatasetData = async () => {
      if (!projectId || !datasetId) return
      try {
        setLoading(true)
        setError(null)

        // Fetch Dataset Detail
        const datasetRes = await datasetApi.getDatasetsByProjectId(projectId)
        const data = datasetRes.data?.data || datasetRes.data || []
        const datasets = Array.isArray(data) ? data : [data]
        const matchedDataset = datasets.find((d: Dataset) => d.datasetId === datasetId)

        if (matchedDataset) {
          setDataset(matchedDataset)
          if (
            matchedDataset.dataitems &&
            Array.isArray(matchedDataset.dataitems) &&
            matchedDataset.dataitems.length > 0
          ) {
            setItems(matchedDataset.dataitems)
          }
        } else {
          setError('Dataset not found in this project')
          return
        }

        // Fetch Labels
        try {
          const labelsRes = await labelApi.getLabelsByDatasetId(datasetId)
          const labelsData = labelsRes.data?.data || labelsRes.data || []
          setLabels(Array.isArray(labelsData) ? labelsData : [labelsData])
        } catch (labelErr) {
          console.error('Failed to fetch labels:', labelErr)
          // Don't set global error if only labels fail
        }
      } catch (err) {
        console.error('Failed to fetch dataset details:', err)
        setError('Failed to load dataset details.')
      } finally {
        setLoading(false)
      }
    }

    fetchDatasetData()
  }, [datasetId, projectId])

  // Pagination calculations
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleItemClick = async (item: DatasetItem) => {
    const itemId = item.itemId || item.id
    setSelectedItem({ ...item, id: itemId })
    setModalVisible(true)

    if (itemId) {
      setItemDetailLoading(true)
      try {
        const response = await datasetApi.getDataItemById(String(itemId))
        const data = response.data?.data || response.data
        setSelectedItem({
          ...data,
          id: data.dataItemId || data.id || data.itemId || itemId,
          name: data.name || data.filename || data.fileName || item.fileName || item.name || item.filename
        })
      } catch (error) {
        console.error('Error fetching item details:', error)
      } finally {
        setItemDetailLoading(false)
      }
    }
  }

  const handleNextItem = () => {
    const currentId = selectedItem?.itemId || selectedItem?.id
    if (!currentId || items.length <= 1) return
    const currentIndex = items.findIndex((i) => (i.itemId || i.id) === currentId)
    if (currentIndex < items.length - 1) {
      handleItemClick(items[currentIndex + 1])
    } else {
      handleItemClick(items[0])
    }
  }

  const handlePrevItem = () => {
    const currentId = selectedItem?.itemId || selectedItem?.id
    if (!currentId || items.length <= 1) return
    const currentIndex = items.findIndex((i) => (i.itemId || i.id) === currentId)
    if (currentIndex > 0) {
      handleItemClick(items[currentIndex - 1])
    } else {
      handleItemClick(items[items.length - 1])
    }
  }

  const handleModalClose = () => {
    setModalVisible(false)
    setTimeout(() => {
      setSelectedItem(null)
      setItemDetailLoading(false)
    }, 300)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const handleBack = () => {
    if (searchParams.get('datasetId')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('datasetId')
        return next
      })
    } else {
      navigate(`/annotator/projects/${projectId}/datasets`)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="animate-pulse flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-white/10 rounded-xl" />
          <div className="h-8 bg-white/10 rounded w-1/4" />
        </div>
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    )
  }

  if (error || !dataset) {
    return (
      <div>
        <div className="glass-panel border border-red-500/20 bg-red-500/5 rounded-2xl p-6 text-center">
          <p className="text-red-400">{error || 'Dataset not found'}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[#111] text-sm transition-colors"
          >
            Back to Datasets
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden min-h-[600px]">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header & Breadcrumb removed as requested */}
      <div className="mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-blue-400">database</span>
              <span className="text-xs font-mono text-blue-400 tracking-widest uppercase">
                Dataset Detail
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#111] tracking-tight">{dataset.datasetName}</h1>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-6 relative z-10">

        {/* Top Row: Main Info (2 columns) */}
        <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row items-stretch`}>
          {/* Left: Information */}
          <div className="flex-1 p-7 border-b md:border-b-0 md:border-r border-gray-300 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-violet-500/5 blur-[50px] pointer-events-none" />
            <h3 className="text-lg font-semibold text-[#111] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-violet-400">info</span>
              Dataset Information
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Dataset ID</label>
                <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded border border-violet-500/20">
                  {dataset.datasetId}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Total Items</label>
                <span className="text-sm text-gray-700 font-bold">{(dataset.totalItems || items.length).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Created At</label>
                <span className="text-sm text-gray-600">{formatDate(dataset.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Status</label>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* Right: Description */}
          <div className="flex-1 p-7 flex flex-col relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-fuchsia-500/5 blur-[50px] pointer-events-none" />
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-fuchsia-400">description</span>
              Description
            </h3>
            <div className="flex-1 bg-black/20 p-5 rounded-2xl border border-gray-200 min-h-[120px]">
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {dataset.description || 'No description provided for this dataset.'}
              </p>
            </div>
          </div>
        </div>

        {/* Middle Row: Project & Labels (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Associated Project */}
          <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-xl`}>
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-400">folder_special</span>
              Associated Project
            </h3>
            <div
              className="bg-black/20 p-5 rounded-xl border border-gray-300 hover:border-blue-500/50 hover:bg-black/30 transition-all cursor-pointer group"
              onClick={() => navigate(`/annotator/projects/${projectId}`)}
            >
              <h4 className="text-[#111] font-bold group-hover:text-blue-400 transition-colors">
                {dataset.project?.projectName || 'No Project Assigned'}
              </h4>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">visibility</span>
                Click to view project details
              </p>
            </div>
          </div>

          {/* Labels Section */}
          <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-xl`}>
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
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
                    className="flex items-center gap-2.5 bg-black/20 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: label.color || '#6366f1' }}
                    />
                    <span className="text-xs text-gray-700 font-medium">{label.labelName}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Data Items Grid (Full Width) */}
        <div
          className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-7 flex flex-col shadow-xl min-h-[500px]`}
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-[#111] flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-blue-400">grid_view</span>
              </span>
              Data Items
            </h3>
            <span className="text-xs font-mono bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-blue-400 font-medium tracking-tight">
              {items.length} items loaded
            </span>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-black/10">
              <span className="material-symbols-outlined text-gray-600 text-6xl mb-4 opacity-10">
                image_not_supported
              </span>
              <p className="text-gray-500 text-base font-medium">No data items found</p>
              <p className="text-gray-600 text-xs mt-2">Images will appear here once uploaded by the manager.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar p-1 flex-1">
                {paginatedItems.map((item) => (
                  <div
                    key={item.itemId || item.id}
                    onClick={() => handleItemClick(item)}
                    className="relative group rounded-xl overflow-hidden border border-gray-300 bg-black/40 aspect-square flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                      <span className="material-symbols-outlined text-gray-700 text-4xl opacity-10">
                        image
                      </span>
                    </div>
                    <img
                      src={
                        item.previewUrl ||
                        item.url ||
                        (item.fileName
                          ? `https://picsum.photos/seed/${item.itemId}/300/300`
                          : 'https://picsum.photos/seed/placeholder/300/300')
                      }
                      alt={item.fileName || item.name || item.filename}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                      <span className="text-[11px] text-[#111] line-clamp-2 font-medium leading-snug font-mono">
                        {item.fileName || item.name || item.filename}
                      </span>
                    </div>

                    {/* Badges */}
                    {item.labeled && (
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md backdrop-blur-md shadow-lg shadow-black/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Labeled
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={items.length}
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
        title={<span className="font-display text-lg text-[#111]">Data Item Details</span>}
        open={modalVisible}
        onCancel={handleModalClose}
        width={700}
        destroyOnHidden
      >
        <div className="px-8 pt-10 pb-8 min-h-[400px]">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-[#111] text-xl font-bold font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">database</span>
              {selectedItem
                ? selectedItem.name || selectedItem.filename || selectedItem.fileName || 'Item Details'
                : 'Item Details'}
            </h2>
            <button
              onClick={handleModalClose}
              className="text-gray-500 hover:text-[#111] transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {selectedItem ? (
            <div className="flex flex-col gap-6 relative">
              {itemDetailLoading && (
                <div className="absolute -top-4 right-0 flex items-center gap-2 text-xs text-emerald-400 animate-pulse bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10 z-20">
                  <Spin size="small" />
                  <span>Loading full details...</span>
                </div>
              )}

              <div className="bg-black/40 w-full h-80 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 relative group/item">
                <div className="absolute inset-y-0 left-0 flex items-center p-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevItem()
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 text-[#111] hover:bg-violet-500/80 transition-all flex items-center justify-center backdrop-blur-md border border-gray-300 opacity-0 group-hover/item:opacity-100"
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
                      'Item'
                    }
                    className="max-w-full max-h-full object-contain"
                    rootClassName="w-full h-full flex items-center justify-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('picsum.photos')) {
                        target.src = `https://picsum.photos/seed/${selectedItem.id || selectedItem.itemId || 'err'}/400/300`
                      }
                    }}
                  />
                ) : (
                  <img
                    src={selectedItem.fileName ? `https://picsum.photos/seed/${selectedItem.itemId}/400/300` : 'https://picsum.photos/seed/placeholder/400/300'}
                    alt="placeholder"
                    className="max-w-full max-h-full object-contain"
                  />
                )}

                <div className="absolute inset-y-0 right-0 flex items-center p-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextItem()
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 text-[#111] hover:bg-violet-500/80 transition-all flex items-center justify-center backdrop-blur-md border border-gray-300 opacity-0 group-hover/item:opacity-100"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                {itemDetailLoading && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <Spin size="large" />
                  </div>
                )}
              </div>

              <div className="bg-[#231e31]/50 border border-gray-200 rounded-xl p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Item ID</label>
                    <span className="font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 text-xs">
                      {selectedItem.id || selectedItem.itemId || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Filename</label>
                    <span className="text-sm text-gray-700 truncate max-w-[300px]">
                      {selectedItem.name || selectedItem.filename || selectedItem.fileName || 'N/A'}
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
                              : 'text-gray-500'
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
              No details available
            </div>
          )}
        </div>
      </GlassModal>
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
      `}</style>
    </div>
  )
}

