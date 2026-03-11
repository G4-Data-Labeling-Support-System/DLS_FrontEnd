import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import datasetApi from '@/api/DatasetApi'
import { themeClasses } from '@/styles'
import { PATH_ANNOTATOR } from '@/routes/paths'

type TabType = 'detail' | 'activity'

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
  labeled?: boolean
}

export default function AnnotatorDatasetDetailPage() {
  const { projectId, datasetId } = useParams<{ projectId: string, datasetId: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>('detail')
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [items, setItems] = useState<DatasetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDatasetDetail = async () => {
      if (!projectId || !datasetId) return
      try {
        setLoading(true)
        setError(null)
        const response = await datasetApi.getDatasetsByProjectId(projectId)
        const data = response.data?.data || response.data || []
        const datasets = Array.isArray(data) ? data : [data]
        const matchedDataset = datasets.find((d: Dataset) => d.datasetId === datasetId)
        
        if (matchedDataset) {
          setDataset(matchedDataset)
          if (matchedDataset.dataitems && Array.isArray(matchedDataset.dataitems) && matchedDataset.dataitems.length > 0) {
            setItems(matchedDataset.dataitems)
          }
        } else {
          setError('Dataset not found in this project')
        }
      } catch (err) {
        console.error('Failed to fetch dataset details:', err)
        setError('Failed to load dataset details.')
      } finally {
        setLoading(false)
      }
    }

    fetchDatasetDetail()
  }, [datasetId])



  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="p-6">
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
      <div className="p-6">
        <div className="glass-panel border border-red-500/20 bg-red-500/5 rounded-2xl p-6 text-center">
          <p className="text-red-400">{error || 'Dataset not found'}</p>
          <button
            onClick={() => navigate(PATH_ANNOTATOR.project)}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto relative overflow-hidden min-h-[calc(100vh-80px)]">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header & Breadcrumb */}
      <div className="mb-8 relative z-10">
        <button
          onClick={() => navigate(PATH_ANNOTATOR.project)}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mb-4 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Dashboard
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-blue-400">
                database
              </span>
              <span className="text-xs font-mono text-blue-400 tracking-widest uppercase">
                Dataset Detail
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{dataset.datasetName}</h1>
            <p className="text-sm text-gray-400 mt-1 font-mono">{dataset.datasetId}</p>
          </div>
          {/* Label Button (Placeholder action) */}
          <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Start Labeling
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-white/10 mb-6 relative z-10">
        <button
          onClick={() => setActiveTab('detail')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'detail' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Dataset Data
          {activeTab === 'detail' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-t-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'activity' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Activity Stream
          {activeTab === 'activity' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-t-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {activeTab === 'detail' && (
          <>
            {/* Info Panel */}
            <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 h-fit shadow-xl`}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-violet-400">info</span>
                Information
              </h3>
              <div className="space-y-4">
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <label className="text-xs text-gray-500 font-mono uppercase tracking-wider block mb-1">
                    Project
                  </label>
                  <p className="text-sm text-gray-200 font-medium">{dataset.project?.projectName || 'No Project Assigned'}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <label className="text-xs text-gray-500 font-mono uppercase tracking-wider block mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {dataset.description || 'No description provided.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="flex-1 bg-black/20 p-3 rounded-lg border border-white/5">
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1">
                      Total Items
                    </label>
                    <p className="text-lg text-white font-bold">{dataset.totalItems || items.length}</p>
                  </div>
                  <div className="flex-1 bg-black/20 p-3 rounded-lg border border-white/5">
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1">
                      Created At
                    </label>
                    <p className="text-sm text-gray-300 font-medium mt-1">{formatDate(dataset.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items GridPanel */}
            <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 md:col-span-2 flex flex-col shadow-xl min-h-[500px]`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-400">grid_view</span>
                  Data Items
                </h3>
                <span className="text-xs font-mono bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 text-blue-400 font-medium">
                  {items.length} items loaded
                </span>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-xl bg-black/20">
                  <span className="material-symbols-outlined text-gray-500 text-5xl mb-4 opacity-30">
                    image_not_supported
                  </span>
                  <p className="text-gray-400 text-sm">No data items found in this dataset.</p>
                  <p className="text-gray-500 text-xs mt-2">Upload images via the manager interface.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div
                      key={item.itemId || item.id}
                      className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-square flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all shadow-lg"
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                        <span className="material-symbols-outlined text-gray-600 text-4xl opacity-20">
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
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <span className="text-xs text-white line-clamp-2 font-medium leading-snug">
                          {item.fileName || item.name || item.filename}
                        </span>
                      </div>
                      {item.labeled && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Labeled
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'activity' && (
          <div className="md:col-span-3 glass-panel border border-white/5 rounded-2xl p-16 text-center text-gray-400 italic bg-black/20 shadow-xl flex flex-col items-center justify-center">
             <span className="material-symbols-outlined text-5xl mb-4 opacity-20">
                history
             </span>
            <h3 className="text-white text-lg font-medium not-italic mb-2">Activity Stream</h3>
            <p>Activity logs and historical actions for this dataset will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
