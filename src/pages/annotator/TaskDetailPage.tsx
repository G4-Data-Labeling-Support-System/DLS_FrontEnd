import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, Table, Descriptions, Tag, Typography, Spin } from 'antd'
import { DatabaseOutlined, InfoCircleOutlined } from '@ant-design/icons'
import taskApi from '@/api/TaskApi'
import { useTaskDetail } from '@/features/annotator/hooks/useTaskDetail'
import type { Task } from '@/features/annotator/components/TaskSection'

const { Title, Text } = Typography

export interface TaskDataItemRecord {
  dataItemId: string
  taskDataItemStatus?: string
  dataItem: {
    fileName: string
    url: string
    fileFormat: string
    dataType: string
    uploadedAt: string
    previewUrl?: string
  }
}

interface TaskDetailProps {
  task: {
    taskId: string
    taskName?: string
    taskStatus?: string
    reviewStatus?: string
    taskType?: string
    assignmentId?: string
    assignmentName?: string
    completedCount?: number
    totalItems?: number
    createdAt?: string
  }
  onItemClick?: (item: TaskDataItemRecord, index: number) => void
  onBack?: () => void
}

/**
 * Reusable Task Detail Component
 * Used in both Annotator and Manager flows
 */
export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onItemClick }) => {
  const {
    data: dataItems = [],
    isLoading: itemsLoading,
    error: itemsError
  } = useTaskDetail(task.taskId)

  const columns = [
    {
      title: 'Preview',
      key: 'preview',
      width: '10%',
      render: (_: string, record: TaskDataItemRecord) => (
        <div className="w-10 h-10 rounded-lg border border-white/5 overflow-hidden bg-black/20 flex items-center justify-center transition-all hover:border-violet-500/30">
          {record.dataItem.url || record.dataItem.previewUrl ? (
            <img
              src={record.dataItem.url || record.dataItem.previewUrl}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-gray-600 text-sm">image</span>
          )}
        </div>
      )
    },
    {
      title: 'Filename',
      key: 'filename',
      width: '30%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Text
          className="text-gray-200 font-medium truncate block max-w-[200px]"
          title={record.dataItem.fileName}
        >
          {record.dataItem.fileName}
        </Text>
      )
    },
    {
      title: 'Format',
      key: 'fileFormat',
      width: '18%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Tag className="bg-blue-500/10 border-blue-500/20 text-blue-400 font-medium rounded-md px-2 py-0.5">
          {record.dataItem.fileFormat}
        </Tag>
      )
    },
    {
      title: 'Data Type',
      key: 'dataType',
      width: '18%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Tag className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium rounded-md px-2 py-0.5">
          {record.dataItem.dataType}
        </Tag>
      )
    },
    {
      title: 'Uploaded At',
      key: 'uploadedAt',
      width: '24%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Text className="text-gray-400 text-sm">
          {record.dataItem.uploadedAt
            ? new Date(record.dataItem.uploadedAt).toLocaleDateString()
            : 'N/A'}
        </Text>
      )
    }
  ]

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Title level={4} className="!text-white !m-0 !font-bold tracking-tight">
            Task Details: {task.taskName || task.taskId}
          </Title>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <Text className="text-gray-500 font-mono text-xs select-all">ID: {task.taskId}</Text>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Task Metadata Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 h-fit">
          <Card
            className="bg-[#1A1625]/80 backdrop-blur-xl border-white/5 rounded-2xl shadow-2xl overflow-hidden group"
            title={
              <div className="py-1">
                <span className="text-white flex items-center gap-2.5 font-semibold text-base">
                  <div className="p-2 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                    <InfoCircleOutlined className="text-violet-400" />
                  </div>
                  Task Metadata
                </span>
              </div>
            }
          >
            <Descriptions column={1} size="small" className="mt-2">
              <Descriptions.Item label={<span className="text-gray-400 font-medium">Status</span>}>
                <Tag
                  className={`
                  rounded-full px-3 py-0.5 border-none font-semibold text-[10px] tracking-wider uppercase
                  ${
                    task.taskStatus === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : task.taskStatus === 'IN_PROGRESS'
                        ? 'bg-blue-500/10 text-blue-400'
                        : task.taskStatus === 'INACTIVE'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-gray-500/10 text-gray-400'
                  }
                `}
                >
                  {(task.taskStatus || task.reviewStatus || 'NOT_STARTED').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={<span className="text-gray-400 font-medium">Assignment</span>}
              >
                <span className="text-gray-200 font-medium">{task.assignmentName || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item
                label={<span className="text-gray-400 font-medium">Progress</span>}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-200 font-bold">
                    {
                      dataItems.filter(
                        (item: TaskDataItemRecord) =>
                          item.taskDataItemStatus?.toUpperCase() === 'COMPLETED'
                      ).length
                    }
                  </span>
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-500">{dataItems.length} items</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-gray-400 font-medium">Created</span>}>
                <span className="text-gray-400 text-xs">
                  {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {/* Task Data Items Table Card */}
        <div className="lg:col-span-8">
          <Card
            className="bg-[#1A1625]/80 backdrop-blur-xl border-white/5 rounded-2xl shadow-2xl overflow-hidden"
            title={
              <div className="flex items-center justify-between py-1">
                <span className="text-white flex items-center gap-2.5 font-semibold text-base">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <DatabaseOutlined className="text-emerald-400" />
                  </div>
                  Data Items
                </span>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-tighter">
                    {dataItems.length} Records
                  </span>
                </div>
              </div>
            }
          >
            {itemsLoading ? (
              <div className="py-32 flex flex-col items-center gap-4">
                <Spin
                  indicator={
                    <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                  }
                />
                <span className="text-gray-500 font-medium tracking-widest text-[10px] uppercase">
                  Retrieving Dataset...
                </span>
              </div>
            ) : itemsError ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-red-500/10">
                  <InfoCircleOutlined className="text-red-400 text-2xl" />
                </div>
                <span className="text-red-400/80 font-medium">Failed to synchronize task data</span>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={dataItems as TaskDataItemRecord[]}
                rowKey={(record) => record.dataItemId || Math.random().toString()}
                pagination={{
                  pageSize: 5,
                  className: 'custom-pagination px-4'
                }}
                className="manager-task-table"
                size="large"
                onRow={(record, index) => ({
                  onClick: () => onItemClick?.(record, index ?? 0),
                  className: onItemClick ? 'cursor-pointer' : ''
                })}
              />
            )}
          </Card>
        </div>
      </div>

      <style>{`
        .manager-task-table .ant-table {
          background: transparent !important;
        }
        .manager-task-table .ant-table-thead > tr > th {
          background: #231e31/40 !important;
          color: #6b7280 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          padding: 16px 20px !important;
        }
        .manager-task-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
          background: transparent !important;
          padding: 16px 20px !important;
        }
        .manager-task-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .custom-pagination.ant-pagination .ant-pagination-item {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .custom-pagination.ant-pagination .ant-pagination-item a {
          color: #9ca3af;
        }
        .custom-pagination.ant-pagination .ant-pagination-item-active {
          background: rgba(139, 92, 246, 0.1);
          border-color: #8b5cf6;
        }
        .custom-pagination.ant-pagination .ant-pagination-item-active a {
          color: #a78bfa;
        }
        .custom-pagination.ant-pagination .ant-pagination-prev button,
        .custom-pagination.ant-pagination .ant-pagination-next button {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.05);
          color: #9ca3af;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!taskId) return
      setLoading(true)
      try {
        const assignmentId = location.state?.assignmentId || taskId

        // 1. Fetch task details
        const tasksRes = await taskApi.getTasksByAssignmentId(assignmentId)
        const tasksData = tasksRes.data?.data || tasksRes.data || []

        let currentTask = Array.isArray(tasksData)
          ? tasksData.find((t: Task) => String(t.taskId || t.id) === String(taskId))
          : tasksData

        if (!currentTask && Array.isArray(tasksData) && tasksData.length > 0) {
          currentTask = tasksData[0]
        }

        if (!currentTask) {
          throw new Error('Task not found')
        }

        setTask(currentTask)
      } catch (err) {
        console.error('Failed to load task details:', err)
        setError('Failed to load task details from the server.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [taskId, location.state?.assignmentId])

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading task details..." />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-red-500 text-5xl opacity-80">error</span>
        <span className="text-red-400 font-medium">{error || 'Task not found.'}</span>
        <button
          onClick={() => navigate(-1)}
          className="text-white text-sm font-bold px-6 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  const handleItemClick = (_item: TaskDataItemRecord, index: number) => {
    navigate(`/annotator/task/${task.taskId || task.id}/annotate`, {
      state: { startIndex: index, assignmentId: task.assignmentId || task.id }
    })
  }

  return (
    <div className="p-6">
      <TaskDetail
        task={{
          ...task,
          taskId: String(task.taskId || task.id),
          taskName: String(task.taskName || task.name || task.filename || 'Untitled Task')
        }}
        onItemClick={handleItemClick}
        onBack={() => navigate(-1)}
      />
    </div>
  )
}
