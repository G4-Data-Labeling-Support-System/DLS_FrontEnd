import React from 'react'
import { Card, Table, Descriptions, Tag, Typography, Spin, Empty } from 'antd'
import { DatabaseOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useTaskDetail } from '@/features/annotator/hooks/useTaskDetail'
import type { TaskDataItem } from '@/api/TaskApi'

const { Title, Text } = Typography

interface ManagerTaskDetailProps {
  task: {
    taskId: string
    taskName?: string
    taskStatus?: string
    reviewStatus?: string
    taskType?: string
    assignmentId?: string
    completedCount?: number
    totalItems?: number
    createdAt?: string
  }
}

export const ManagerTaskDetail: React.FC<ManagerTaskDetailProps> = ({ task }) => {
  const {
    data: taskDataItemsResponse,
    isLoading: itemsLoading,
    error: itemsError
  } = useTaskDetail(task.taskId)

  const dataItems = taskDataItemsResponse?.data || taskDataItemsResponse || []

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'success'
      case 'IN_PROGRESS':
        return 'processing'
      case 'PENDING':
        return 'default'
      case 'REJECTED':
        return 'error'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: 'Preview',
      dataIndex: 'url',
      key: 'preview',
      width: 80,
      render: (url: string, record: TaskDataItem) => (
        <div className="w-10 h-10 rounded border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center">
          {url || record.previewUrl ? (
            <img src={url || record.previewUrl} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-gray-500 text-sm">image</span>
          )}
        </div>
      )
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      render: (text: string) => <Text className="text-gray-200">{text || 'Unknown'}</Text>
    },
    {
      title: 'Format',
      dataIndex: 'fileFormat',
      key: 'fileFormat',
      render: (text: string) => <Tag color="blue">{text || 'N/A'}</Tag>
    },
    {
      title: 'Data Type',
      dataIndex: 'dataType',
      key: 'dataType',
      render: (text: string) => <Tag color="cyan">{text || 'UNKNOWN'}</Tag>
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (text: string) => (text ? new Date(text).toLocaleDateString() : 'N/A')
    }
  ]

  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <Title level={4} className="!text-white !m-0">
            Task Details: {task.taskName || task.taskId}
          </Title>
          <Text className="text-gray-500 font-mono text-xs">ID: {task.taskId}</Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-1">
          <Card
            className="bg-[#1A1625] border-gray-800 rounded-xl"
            title={
              <span className="text-white flex items-center gap-2">
                <InfoCircleOutlined className="text-violet-400" />
                Task Metadata
              </span>
            }
          >
            <Descriptions
              column={1}
              size="small"
              styles={{
                label: { color: '#9ca3af', fontWeight: 500 },
                content: { color: '#d1d5db' }
              }}
            >
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(task.taskStatus || task.reviewStatus)}>
                  {(task.taskStatus || task.reviewStatus || 'PENDING').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Type">{task.taskType || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Assignment ID">{task.assignmentId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Progress">
                {task.completedCount || 0} items completed
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            className="bg-[#1A1625] border-gray-800 rounded-xl"
            title={
              <div className="flex items-center justify-between">
                <span className="text-white flex items-center gap-2">
                  <DatabaseOutlined className="text-emerald-400" />
                  Task Data Items
                </span>
                <Tag color="green">{dataItems.length} Items</Tag>
              </div>
            }
          >
            {itemsLoading ? (
              <div className="py-20 text-center">
                <Spin tip="Loading data items..." />
              </div>
            ) : itemsError ? (
              <Empty description={<span className="text-red-400">Error loading data items</span>} />
            ) : (
              <Table
                columns={columns}
                dataSource={dataItems}
                rowKey={(record, index) => record.id?.toString() || index?.toString() || ''}
                pagination={{ pageSize: 5 }}
                className="custom-ant-table"
                size="middle"
              />
            )}
          </Card>
        </div>
      </div>

      <style>{`
        .custom-ant-table .ant-table {
          background: transparent !important;
          color: #d1d5db !important;
        }
        .custom-ant-table .ant-table-thead > tr > th {
          background: #231e31 !important;
          color: #9ca3af !important;
          border-bottom: 1px solid #2d263b !important;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .custom-ant-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #2d263b !important;
          background: transparent !important;
          color: #d1d5db !important;
        }
        .custom-ant-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .custom-ant-table .ant-pagination-item, 
        .custom-ant-table .ant-pagination-prev, 
        .custom-ant-table .ant-pagination-next {
          background: #231e31 !important;
          border-color: #2d263b !important;
        }
        .custom-ant-table .ant-pagination-item a {
          color: #9ca3af !important;
        }
        .custom-ant-table .ant-pagination-item-active {
          border-color: #7c3aed !important;
        }
        .custom-ant-table .ant-pagination-item-active a {
          color: #7c3aed !important;
        }
      `}</style>
    </div>
  )
}
