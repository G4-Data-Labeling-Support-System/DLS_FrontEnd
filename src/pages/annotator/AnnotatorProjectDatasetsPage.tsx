import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, Button, Typography, Space, Select, Input, Empty } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons'

import datasetApi, { type GetDatasetsParams } from '@/api/DatasetApi'
import { DatasetCard } from '@/features/manager/components/dataset/DatasetCard'
import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'
import AnnotatorDatasetDetailPage from './AnnotatorDatasetDetailPage'

const { Title } = Typography

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
        type="text"
        icon={<ArrowLeftOutlined />}
        className="text-gray-400 hover:text-white mb-6"
        onClick={() => navigate(`/annotator/projects/${projectId}`)}
      >
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
          {/* Header with Filters */}
          <div className="flex justify-between items-center mb-6 mt-0">
            <Title level={4} className="!text-white !m-0 !font-display">
              Project Datasets
            </Title>
            <Space>
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                className="w-36"
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
              />
              <Input
                placeholder="Search datasets..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64"
              />
            </Space>
          </div>

          {/* Tab Content */}
          <div className="mt-0 w-full">
            {loading && datasets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
                <span className="mt-4 text-violet-400 font-mono">Loading Datasets...</span>
              </div>
            ) : error ? (
              <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
                {error}
              </div>
            ) : filteredDatasets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 items-stretch w-full">
                {filteredDatasets.map((ds) => (
                  <DatasetCard
                    key={ds.datasetId}
                    {...ds}
                    onClick={() => handleDatasetClick(ds.datasetId || '')}
                  />
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-gray-500">No datasets found matching your filters.</span>}
                className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
