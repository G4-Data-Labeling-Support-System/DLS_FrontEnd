import { useEffect, useState } from 'react'
import datasetApi from '@/api/DatasetApi'
import assignmentApi from '@/api/AssignmentApi'
import { themeClasses } from '@/styles'
import { useNavigate } from 'react-router-dom'
import { PATH_ANNOTATOR } from '@/routes/paths'

interface Dataset {
  datasetId: string
  datasetName: string
  description?: string
  totalItems?: number
  createdAt?: string
  datasetStatus?: string
  dataitems?: DatasetItem[]
  project?: {
    projectId: string
    [key: string]: unknown
  }
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

interface AnnotatorDatasetCardProps {
  projectId?: string
  assignmentId?: string
}

export default function AnnotatorDatasetCard({
  projectId,
  assignmentId
}: AnnotatorDatasetCardProps) {
  const navigate = useNavigate()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedDatasetId, setExpandedDatasetId] = useState<string | null>(null)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchDatasets = async () => {
      if (!projectId && !assignmentId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        let data: unknown
        if (assignmentId) {
          const response = await assignmentApi.getDatasetByAssignmentId(assignmentId)
          data = response.data?.data || response.data || []
        } else if (projectId) {
          const response = await datasetApi.getDatasetsByProjectId(projectId)
          data = response.data?.data || response.data || []
        }

        setDatasets(Array.isArray(data) ? data : [data])
      } catch (err) {
        console.error('Failed to fetch datasets:', err)
        setError('Failed to load datasets')
      } finally {
        setLoading(false)
      }
    }

    fetchDatasets()
  }, [projectId, assignmentId])

  const filteredDatasets = datasets.filter((d) => {
    const status = (d.datasetStatus || '').toUpperCase()
    return status !== 'INACTIVE' && d.datasetName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const totalPages = Math.ceil(filteredDatasets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDatasets = filteredDatasets.slice(startIndex, startIndex + itemsPerPage)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const toggleExpand = (id: string) => {
    setExpandedDatasetId(expandedDatasetId === id ? null : id)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="glass-panel border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-white/5 rounded w-full"></div>
          <div className="h-4 bg-white/5 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel border border-red-500/20 bg-red-500/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <p className="text-red-400 text-sm font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div
      className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full`}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-[50px] pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-400">database</span>
            <h3 className="text-sm font-mono text-blue-400 tracking-widest uppercase">Datasets</h3>
          </div>

          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 group-focus-within:text-blue-400 transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all w-full sm:w-48"
            />
          </div>
        </div>

        {filteredDatasets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-gray-500 text-4xl mb-3 opacity-20">
              search_off
            </span>
            <p className="text-gray-500 text-sm italic">
              {searchTerm
                ? `No datasets matching "${searchTerm}"`
                : 'No datasets associated with this project'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {paginatedDatasets.map((dataset) => (
                <div
                  key={dataset.datasetId}
                  className={`flex flex-col rounded-xl border ${themeClasses.borders.violet10} bg-white/5 hover:bg-white/10 transition-all duration-300 group ${expandedDatasetId === dataset.datasetId ? 'ring-1 ring-blue-500/30 bg-white/[0.07]' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-semibold text-base">{dataset.datasetName}</h4>
                      <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-tighter">
                        {dataset.datasetId}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                      {dataset.description || 'No description provided.'}
                    </p>

                    <div className="flex justify-end mb-3">
                      <button
                        onClick={() => {
                          const targetProjectId =
                            projectId || dataset.project?.projectId || 'unknown'
                          navigate(
                            PATH_ANNOTATOR.datasetDetail
                              .replace(':projectId', targetProjectId)
                              .replace(':datasetId', dataset.datasetId)
                          )
                        }}
                        className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-violet-500/20"
                      >
                        <span>View Detail</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-gray-500">
                            layers
                          </span>
                          <span className="text-[11px] text-gray-300 font-medium">
                            {dataset.totalItems || 0} items
                          </span>
                        </div>
                        <button
                          onClick={() => toggleExpand(dataset.datasetId)}
                          className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${expandedDatasetId === dataset.datasetId ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {expandedDatasetId === dataset.datasetId
                              ? 'keyboard_arrow_up'
                              : 'keyboard_arrow_down'}
                          </span>
                          {expandedDatasetId === dataset.datasetId ? 'Hide Items' : 'Show Items'}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-gray-500">
                          calendar_today
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {formatDate(dataset.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items View */}
                  {expandedDatasetId === dataset.datasetId && (
                    <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="pt-4 border-t border-white/5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {(dataset.dataitems || []).length > 0 ? (
                            (dataset.dataitems || []).map((item: DatasetItem) => (
                              <div
                                key={item.itemId || item.id}
                                className="relative group/item rounded-lg overflow-hidden border border-white/5 bg-black/20 aspect-square flex items-center justify-center"
                              >
                                <div className="absolute inset-0 flex items-center justify-center bg-violet-500/5 group-hover/item:bg-violet-500/10 transition-colors">
                                  <span className="material-symbols-outlined text-gray-600 text-3xl opacity-20">
                                    image
                                  </span>
                                </div>
                                <img
                                  src={
                                    item.previewUrl ||
                                    item.url ||
                                    (item.fileName
                                      ? `https://picsum.photos/seed/${item.itemId}/150/150`
                                      : 'https://picsum.photos/seed/placeholder/150/150')
                                  }
                                  alt={item.fileName || item.name || item.filename}
                                  className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                  <span className="text-[10px] text-white truncate font-medium">
                                    {item.fileName || item.name || item.filename}
                                  </span>
                                </div>
                                {item.labeled && (
                                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full py-4 text-center text-gray-500 text-xs italic">
                              No items in this dataset.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <span className="text-[11px] text-gray-500 font-medium">
                  Showing <span className="text-gray-300">{startIndex + 1}</span> -{' '}
                  <span className="text-gray-300">
                    {Math.min(startIndex + itemsPerPage, filteredDatasets.length)}
                  </span>{' '}
                  of <span className="text-gray-300">{filteredDatasets.length}</span> datasets
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-xs font-bold text-blue-400">{currentPage}</span>
                    <span className="text-xs text-gray-600">/</span>
                    <span className="text-xs text-gray-500">{totalPages}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
