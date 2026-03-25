import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Button, Typography, Space, Select, Input, Empty } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import type { AxiosError } from 'axios'

import datasetApi from '@/api/DatasetApi'
import { DatasetCard } from '@/features/manager/components/dataset/DatasetCard'
import { ReviewerProjectTabs } from '@/features/reviewer/components/ReviewerProjectTabs'

const { Title } = Typography

interface Dataset {
  datasetId: string
  datasetName: string
  totalItems: number
  createdAt: string
  description: string
  datasetStatus: string
  [key: string]: unknown
}

export default function ReviewerProjectDatasetsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [datasets, setDatasets] = useState<Dataset[]>([])
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
          const mappedDatasets = rawData
            .map((d: Record<string, unknown>) => ({
              datasetId: String(d.id || d.datasetId || ''),
              datasetName: String(d.name || d.datasetName || ''),
              totalItems: Number(d.itemCount || d.totalItems) || 0,
              createdAt: String(d.createdAt || d.created_at || d.createdDate || ''),
              description: String(d.description || ''),
              datasetStatus: String(d.datasetStatus || d.status || d.dataset_status || '')
            }))
            .filter((d) => d.datasetId && d.datasetId !== 'undefined' && d.datasetId !== 'null')
          setDatasets(mappedDatasets)
        } else {
          setDatasets([])
        }
      } catch (err: unknown) {
        const error = err as AxiosError
        console.error('Failed to fetch datasets for reviewer:', error)
        if (error.response?.status === 403) {
          setError(
            'Access Denied: You may not have permission to view all datasets for this project. Please access datasets through your assigned tasks.'
          )
        } else {
          setError('Failed to load datasets.')
        }
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

  return (
    <div className="p-6">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="text-gray-400 hover:text-white mb-6"
        onClick={() => navigate(`/reviewer/projects/${projectId}`)}
      >
        Back to Projects
      </Button>

      {projectId && <ReviewerProjectTabs projectId={projectId} activeTab="dataset" />}

      <div className="flex justify-between items-center mb-6 mt-0">
        <Title level={4} className="!text-white !m-0 !font-display">
          Project Datasets for Review
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
            className="bg-[#1A1625] border-gray-700 text-white w-64"
          />
        </Space>
      </div>

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
                onClick={() => {}} // Reviewers might not have a dataset detail view yet, or can use same as annotator
              />
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500">No datasets found.</span>}
            className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
          />
        )}
      </div>
    </div>
  )
}
