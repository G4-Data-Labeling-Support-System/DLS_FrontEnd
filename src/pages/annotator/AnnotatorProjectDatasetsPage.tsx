import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Search, FilterX } from 'lucide-react'



import datasetApi, { type GetDatasetsParams } from '@/services/DatasetApi'
import { DatasetCard } from '@/features/manager/components/dataset/DatasetCard'
import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'
import AnnotatorDatasetDetailPage from './AnnotatorDatasetDetailPage'



export default function AnnotatorProjectDatasetsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedDatasetId = searchParams.get('datasetId')

  const [datasets, setDatasets] = useState<GetDatasetsParams[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    const fetchDatasets = async () => {
      if (!projectId) return

      try {
        setLoading(true)
        setError(null)

        const response = await datasetApi.getDatasetsByProjectId(projectId)
        const rawData = response.data?.data || response.data || []

        if (Array.isArray(rawData)) {
          const mappedDatasets: GetDatasetsParams[] = rawData
            .map((d: Record<string, unknown>) => ({
              datasetId: String(d.id || d.datasetId || ''),
              datasetName: String(d.name || d.datasetName || ''),
              totalItems: Number(d.itemCount || d.totalItems) || 0,
              createdAt: String(d.createdAt || d.created_at || d.createdDate || ''),
              description: String(d.description || ''),
              datasetStatus: String(d.datasetStatus || d.status || d.dataset_status || '')
            }) as unknown as GetDatasetsParams)
            .filter((d) => d.datasetId && d.datasetId !== 'undefined' && d.datasetId !== 'null')
          setDatasets(mappedDatasets)
        } else {
          setDatasets([])
        }
      } catch (err) {
        console.error('Failed to fetch datasets:', err)
        setError('Failed to load datasets.')
      } finally {
        setLoading(false)
      }
    }

    fetchDatasets()
  }, [projectId])

  const filteredDatasets = datasets
    .filter((ds) => {
      const status = (ds.datasetStatus || '').toUpperCase()
      return status !== 'INACTIVE'
    })
    .filter((ds) =>
      !searchText || (ds.datasetName && ds.datasetName.toLowerCase().includes(searchText.toLowerCase()))
    )
    .filter((ds) => statusFilter === 'ALL' || (ds.datasetStatus && ds.datasetStatus.toUpperCase() === statusFilter))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

  const handleDatasetClick = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('datasetId', id)
      return next
    })
  }

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/annotator/projects/${projectId}`)}
        className="text-gray-500 hover:text-[#111] mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>


      {/* Tabs Menu */}
      {projectId && <AnnotatorProjectTabs projectId={projectId} activeTab="dataset" />}

      {selectedDatasetId ? (
        <div className="mt-0">
          <AnnotatorDatasetDetailPage />
        </div>
      ) : (
        <>
      {selectedDatasetId ? (
        <div className="mt-0">
          <AnnotatorDatasetDetailPage />
        </div>
      ) : (
        <>
          {/* Header with Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-0">
            <h1 className="text-2xl font-bold text-[#111] tracking-tight">Project Datasets</h1>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search datasets..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9 w-full md:w-64 bg-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
                <SelectTrigger className="w-[160px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-0 w-full">
            {loading && datasets.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredDatasets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch w-full">
                {filteredDatasets.map((ds) => (
                  <DatasetCard
                    key={ds.datasetId}
                    {...ds}
                    onClick={() => handleDatasetClick(ds.datasetId || '')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FilterX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No datasets found matching your filters.</p>
              </div>
            )}
          </div>
        </>
      )}

        </>
      )}
    </div>
  )
}

