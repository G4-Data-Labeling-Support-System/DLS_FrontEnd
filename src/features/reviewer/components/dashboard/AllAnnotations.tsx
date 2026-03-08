import { useEffect, useState } from 'react'
import { Space, Typography, Spin, Input, Select, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { AnnotationCard } from './AnnotationCard'
import annotationApi, { type GetAnnotationsParams } from '@/api/annotation'

const { Title } = Typography

interface AllAnnotationsProps {
  onAnnotationSelect?: (id: string | null) => void
}

export const AllAnnotations: React.FC<AllAnnotationsProps> = ({ onAnnotationSelect }) => {
  const [annotations, setAnnotations] = useState<GetAnnotationsParams[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const fetchAnnotations = async () => {
    try {
      setLoading(true)
      const response = await annotationApi.getAnnotations()
      const data = response.data?.data || response.data || []

      if (Array.isArray(data)) {
        const mapped: GetAnnotationsParams[] = data.map((a: Record<string, unknown>) => ({
          id: String(a.id || ''),
          annotationId: String(a.annotationId || a.id || ''),
          name: String(a.name || ''),
          status: String(a.status || ''),
          createdAt: String(a.createdAt || ''),
          updatedAt: String(a.updatedAt || ''),
          projectId: String(a.projectId || a.project_id || ''),
          datasetId: String(a.datasetId || a.dataset_id || '')
        }))
        // Filter out items without an ID
        setAnnotations(mapped.filter((a) => a.id !== 'undefined' && a.id !== ''))
      } else {
        console.warn('API returned non-array data:', data)
        setAnnotations([])
      }
    } catch (error) {
      console.error('Failed to load annotations.', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnotations()
  }, [])

  const handleSelect = (id: string) => {
    if (onAnnotationSelect) {
      onAnnotationSelect(id)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!text-white !m-0 !font-display">
          All Annotations
        </Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-36"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'NEW', label: 'New' },
              { value: 'REVIEWING', label: 'Reviewing' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' }
            ]}
          />
          <Input
            placeholder="Search annotations..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64"
          />
        </Space>
      </div>

      {annotations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No annotations available.</span>}
          className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-stretch">
          {annotations
            .filter(
              (a) =>
                !searchText ||
                (a.name && a.name.toLowerCase().includes(searchText.toLowerCase())) ||
                (a.annotationId && a.annotationId.toLowerCase().includes(searchText.toLowerCase()))
            )
            .filter(
              (a) => statusFilter === 'ALL' || (a.status && a.status.toUpperCase() === statusFilter)
            )
            .map((a, index) => {
              const uniqueId = a.annotationId || a.id || String(index)
              return <AnnotationCard key={uniqueId} {...a} onClick={() => handleSelect(uniqueId)} />
            })}
        </div>
      )}
    </div>
  )
}
