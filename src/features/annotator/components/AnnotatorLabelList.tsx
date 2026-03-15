import React, { useEffect, useState } from 'react'
import { Typography, Spin, Empty, App, Input, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import labelApiClient, { type GetLabelsParams } from '@/api/LabelApi'
import { LabelCard } from '@/features/manager/components/dashboard/LabelCard'

const { Title } = Typography

interface AnnotatorLabelListProps {
  datasetId: string
}

export const AnnotatorLabelList: React.FC<AnnotatorLabelListProps> = ({ datasetId }) => {
  const { message } = App.useApp()
  const [labels, setLabels] = useState<GetLabelsParams[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setLoading(true)
        const response = await labelApiClient.getLabels()
        const data = response.data?.data || response.data?.content || response.data || []

        if (Array.isArray(data)) {
          const mappedLabels: GetLabelsParams[] = (data as Record<string, unknown>[]).map((l) => ({
            labelId: String(l.labelId || l.id),
            labelName: String(l.labelName || l.name),
            color: String(l.color),
            description: String(l.description || ''),
            createdAt: String(l.createdAt || '')
          }))
          setLabels(mappedLabels)
        }
      } catch (error: unknown) {
        console.error('Failed to load labels.', error)
        // Only show error if it's not a 403 (avoid double logout msg)
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          (error as { response: { status: number } }).response.status !== 403
        ) {
          message.error('Failed to load labels.')
        }
        // If 403, we just show empty or a notice
      } finally {
        setLoading(false)
      }
    }

    if (datasetId) {
      fetchLabels()
    }
  }, [datasetId, message])

  const filteredLabels = labels.filter(
    (label) => !searchText || label.labelName?.toLowerCase().includes(searchText.toLowerCase())
  )

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Spin size="large" tip="Loading labels..." />
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!text-white !m-0 !font-display">
          Dataset Labels
        </Title>
        <Space>
          <Input
            placeholder="Search labels..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64 h-10 rounded-xl"
          />
        </Space>
      </div>

      {filteredLabels.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No labels found for this dataset.</span>}
          className="my-10 p-20 bg-[#1A1625]/40 rounded-2xl border border-dashed border-gray-800"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLabels.map((label) => (
            <LabelCard
              key={label.labelId}
              {...label}
              // Read-only for annotators, so we don't pass onEdit or onDelete
            />
          ))}
        </div>
      )}
    </div>
  )
}
