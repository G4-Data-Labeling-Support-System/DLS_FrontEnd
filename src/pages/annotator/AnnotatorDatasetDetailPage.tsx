import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import datasetApi from '@/api/DatasetApi'
import { labelApi } from '@/api/LabelApi'
import { themeClasses } from '@/styles'

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
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
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
            <h1 className="text-3xl font-bold text-white tracking-tight">{dataset.datasetName}</h1>
            <p className="text-sm text-gray-400 mt-1 font-mono">{dataset.datasetId}</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-6 relative z-10">
        
        {/* Top Row: Main Info (2 columns) */}
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
                 <span className="text-sm text-gray-200 font-bold">{(dataset.totalItems || items.length).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                 <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Created At</label>
                 <span className="text-sm text-gray-300">{formatDate(dataset.createdAt)}</span>
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

        {/* Middle Row: Project & Labels (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
           {/* Associated Project */}
           <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-xl`}>
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px] text-blue-400">folder_special</span>
               Associated Project
             </h3>
             <div 
               className="bg-black/20 p-5 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-black/30 transition-all cursor-pointer group"
               onClick={() => navigate(`/annotator/projects/${projectId}`)}
             >
               <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">
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
                     <span className="text-xs text-gray-200 font-medium">{label.labelName}</span>
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
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
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
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-2xl bg-black/10">
              <span className="material-symbols-outlined text-gray-600 text-6xl mb-4 opacity-10">
                image_not_supported
              </span>
              <p className="text-gray-400 text-base font-medium">No data items found</p>
              <p className="text-gray-600 text-xs mt-2">Images will appear here once uploaded by the manager.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar p-1">
              {items.map((item) => (
                <div
                  key={item.itemId || item.id}
                  className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-square flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/5"
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
                    <span className="text-[11px] text-white line-clamp-2 font-medium leading-snug font-mono">
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
          )}
        </div>
      </div>
    </div>
  )
}
