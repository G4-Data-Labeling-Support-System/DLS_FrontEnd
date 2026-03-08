import { useEffect, useState } from 'react'
import { Space, Typography, Spin, Input, Select, Empty, App } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { LabelCard } from './LabelCard'

import labelApiClient, { type GetLabelsParams } from '@/api/LabelApi'
const { Title } = Typography

interface AllLabelsProps {
  selectedLabelId?: string | null
  onLabelSelect?: (id: string | null) => void
}

export const AllLabels: React.FC<AllLabelsProps> = ({ selectedLabelId: _selectedLabelId, onLabelSelect }) => {
  const { message, modal } = App.useApp()
  const [labels, setLabels] = useState<GetLabelsParams[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [_internalLabelId, setInternalLabelId] = useState<string | null>(null)

  const handleLabelSelect = (id: string | null) => {
    if (onLabelSelect) {
      onLabelSelect(id)
    } else {
      setInternalLabelId(id)
    }
  }

  const fetchLabels = async () => {
    try {
      setLoading(true)
      const response = await labelApiClient.getLabels()
      const data = response.data?.data || response.data?.content || response.data || []

      if (Array.isArray(data)) {
        const mappedLabels: GetLabelsParams[] = data.map((l: Record<string, unknown>) => {
          const mapped: GetLabelsParams = {}
          if (l.labelId || l.id) {
            mapped.labelId = String(l.labelId || l.id)
          }
          if (l.labelName || l.name) {
            mapped.labelName = String(l.labelName || l.name)
          }
          if (l.labelStatus || l.status) {
            mapped.labelStatus = String(l.labelStatus || l.status)
          }
          if (l.description) {
            mapped.description = String(l.description)
          }
          if (l.projectId || l.project_id) {
            mapped.projectId = String(l.projectId || l.project_id)
          }
          if (l.createdAt) {
            mapped.createdAt = String(l.createdAt)
          }
          if (l.updatedAt) {
            mapped.updatedAt = String(l.updatedAt)
          }
          return mapped
        })
        setLabels(mappedLabels)
      } else {
        console.warn('API returned non-array data:', data)
        setLabels([])
      }
    } catch (error) {
      const labelError = error as Record<string, unknown>
      const responseData = labelError?.response as Record<string, unknown>
      const data = responseData?.data as Record<string, unknown>
      const isNotFoundError = data?.code === 404 && data?.message === 'Label not found'

      if (isNotFoundError) {
        setLabels([])
      } else {
        console.error('Failed to load labels.', error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLabels()
  }, [])

  const handleDelete = (id?: string) => {
    if (!id) return

    modal.confirm({
      title: 'Delete Label',
      content: 'Are you sure you want to delete this label?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await labelApiClient.deleteLabel(id)
          message.success('Label deleted successfully!')
          setLabels((prev) => prev.filter((l) => l.labelId !== id))
        } catch (error) {
          console.error('Delete label error:', error)
          message.error('An error occurred while deleting the label.')
        }
      }
    })
  }

  const handleEdit = (id?: string) => {
    if (!id) return
    message.info(`Editing label ID: ${id} is currently not supported.`)
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
          All Labels
        </Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-36"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'DRAFT', label: 'Draft' }
            ]}
          />
          <Input
            placeholder="Search labels..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64"
          />
        </Space>
      </div>

      {labels.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No labels created yet.</span>}
          className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-stretch">
          {labels
            .filter(
              (l) =>
                !searchText ||
                (l.labelName && l.labelName.toLowerCase().includes(searchText.toLowerCase()))
            )
            .filter(
              (l) =>
                statusFilter === 'ALL' ||
                (l.labelStatus && l.labelStatus.toUpperCase() === statusFilter)
            )
            .map((l, index) => {
              const uniqueId = l.labelId || String(index)
              return (
                <LabelCard
                  key={uniqueId}
                  {...l}
                  onClick={() => handleLabelSelect(uniqueId)}
                  onEdit={() => handleEdit(uniqueId)}
                  onDelete={() => handleDelete(uniqueId)}
                />
              )
            })}
        </div>
      )}
    </div>
  )
}
