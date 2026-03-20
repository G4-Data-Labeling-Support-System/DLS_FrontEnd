import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, Table, Descriptions, Tag, Typography, Spin, Button } from 'antd'
import { DatabaseOutlined, InfoCircleOutlined, ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons'
import taskApi from '@/api/TaskApi'
import assignmentApi from '@/api/AssignmentApi'
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
  taskItemId?: string // Added for rowKey in table
}

interface TaskDetailProps {
  task: any | null
  loading: boolean
  onItemClick?: (item: TaskDataItemRecord, index: number) => void
  onBack?: () => void
  onStartLabeling?: () => void
}

/**
 * Reusable Task Detail Component
 * Used in both Annotator and Manager flows
 */
export const TaskDetail: React.FC<TaskDetailProps> = ({ task, loading, onItemClick, onBack, onStartLabeling }) => {
  const {
    data: dataItems = [],
    isLoading: itemsLoading,
    error: itemsError
  } = useTaskDetail(task?.taskId || '')

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
      width: '20%',
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
      width: '12%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Tag className="bg-blue-500/10 border-blue-500/20 text-blue-400 font-medium rounded-md px-2 py-0.5">
          {record.dataItem.fileFormat}
        </Tag>
      )
    },
    {
      title: 'Data Type',
      key: 'dataType',
      width: '12%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Tag className="bg-violet-500/10 border-violet-500/20 text-violet-400 font-medium rounded-md px-2 py-0.5">
          {record.dataItem.dataType}
        </Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: '12%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Tag
          className={`
              rounded-md px-2 py-0.5 font-bold border
              ${
                record.taskDataItemStatus === 'COMPLETED'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : record.taskDataItemStatus === 'IN_PROGRESS'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
              }
            `}
        >
          {record.taskDataItemStatus || 'NOT_STARTED'}
        </Tag>
      )
    },
    {
      title: 'Uploaded At',
      key: 'uploadedAt',
      width: '18%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Text className="text-gray-400 text-sm">
          {record.dataItem.uploadedAt
            ? new Date(record.dataItem.uploadedAt).toLocaleDateString()
            : 'N/A'}
        </Text>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: '6%',
      render: (_: any, record: TaskDataItemRecord, index: number) => (
        <button
          onClick={() => onItemClick?.(record, index)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-violet-400 transition-all cursor-pointer"
        >
          <InfoCircleOutlined className="text-lg" />
        </button>
      )
    }
  ]

  if (loading || !task) {
    return (
      <div className="py-32 flex flex-col items-center gap-4">
        <Spin
          indicator={
            <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          }
        />
        <span className="text-gray-500 font-medium tracking-widest text-[10px] uppercase">
          Loading Task Details...
        </span>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10"
            >
              <ArrowLeftOutlined className="text-xs group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">Back</span>
            </button>
          )}
          <div className="flex flex-col">
            <Title level={4} className="!text-white !mb-0 tracking-tight font-bold">
              {task.taskName || 'Untitled Task'}
            </Title>
            <Text className="text-gray-500 font-mono text-xs select-all">ID: {task.taskId}</Text>
          </div>
        </div>
        {onStartLabeling && (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onStartLabeling}
            className="bg-violet-600 border-none hover:bg-violet-500 rounded-xl h-auto py-2 h-[38px] flex items-center"
          >
            <span className="text-sm font-medium">Start Labeling</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left Column: Metrics and Info */}
        <div className="lg:col-span-12">
          <Card className="bg-[#16161a]/60 border-white/5 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden hover:border-white/10 transition-all duration-500">
            <div className="p-2">
              <Descriptions
                column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                layout="vertical"
                className="custom-descriptions"
              >
                <Descriptions.Item label="Assignment">
                  <div className="flex items-center gap-2">
                    <DatabaseOutlined className="text-violet-400" />
                    <span className="text-gray-200 font-medium">
                      {task.assignmentName || 'N/A'}
                    </span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Progress">
                  <div className="flex flex-col gap-1 w-full max-w-[200px]">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-violet-400">
                        {Math.round(
                          (dataItems.filter((i: TaskDataItemRecord) => i.taskDataItemStatus === 'COMPLETED').length /
                            (dataItems.length || 1)) *
                            100
                        )}
                        %
                      </span>
                      <span className="text-gray-500">
                        {dataItems.filter((i: TaskDataItemRecord) => i.taskDataItemStatus === 'COMPLETED').length} /{' '}
                        {dataItems.length}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${(dataItems.filter((i: TaskDataItemRecord) => i.taskDataItemStatus === 'COMPLETED').length / (dataItems.length || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  <span className="text-gray-400 text-xs font-mono">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </div>

        {/* Full Width Table for Items */}
        <div className="lg:col-span-12 mt-6">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <DatabaseOutlined className="text-violet-400 text-sm" />
            </div>
            <Title level={5} className="!text-white !mb-0 tracking-tight font-bold">
              Task Data Items
            </Title>
            <Tag className="bg-white/5 border-white/10 text-gray-400 rounded-lg font-mono">
              {dataItems.length}
            </Tag>
          </div>

          <Card className="bg-[#16161a]/40 border-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
            <Table
              dataSource={dataItems}
              columns={columns}
              loading={itemsLoading}
              rowKey={(record) => record.taskItemId || record.dataItemId}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                className: 'custom-pagination !mt-8 !mb-4 !px-6'
              }}
              className="manager-task-table"
            />
            {itemsError && <div className="p-8 text-red-400 text-center">{itemsError}</div>}
          </Card>
        </div>
      </div>

      <style>{`
        .custom-descriptions .ant-descriptions-item-label {
          color: #6b7280 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-weight: 700 !important;
          padding-bottom: 8px !important;
        }
        .manager-task-table .ant-table {
          background: transparent !important;
        }
        .manager-task-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.02) !important;
          color: #9ca3af !important;
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

  const [task, setTask] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!taskId) {
        setError('Task ID is missing.')
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const assignmentId = location.state?.assignmentId || taskId

        // 1. Fetch task details
        const tasksRes = await taskApi.getTasksByAssignmentId(assignmentId)
        const tasksData = tasksRes.data?.data || tasksRes.data || []

        let currentTask = Array.isArray(tasksData)
          ? tasksData.find((t: any) => String(t.taskId || t.id) === String(taskId))
          : tasksData

        if (!currentTask && Array.isArray(tasksData) && tasksData.length > 0) {
          currentTask = tasksData[0]
        }

        if (!currentTask) {
          setError('Task not found.')
          setLoading(false)
          return
        }

        // 2. Resolve the real assignment ID from the task if needed
        const realAssignmentId = currentTask.assignmentId || assignmentId

        // 3. Fetch assignment details to get the name
        let assignmentName = currentTask.assignmentName || location.state?.assignmentName
        if (!assignmentName && realAssignmentId) {
          try {
            const assignRes = await assignmentApi.getAssignmentById(realAssignmentId)
            const assignData = assignRes.data?.data || assignRes.data
            assignmentName = assignData.assignmentName || assignData.name || assignData.title
          } catch (e) {
            console.warn('Could not fetch assignment details for name:', e)
          }
        }

        setTask({
          ...currentTask,
          assignmentName: assignmentName || 'N/A'
        })
      } catch (err) {
        console.error('Failed to load task details:', err)
        setError('Failed to load task details from the server.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [taskId, location.state])

  const handleStartLabeling = () => {
    if (!taskId) return
    const savedIndex = localStorage.getItem(`annotation_index_${taskId}`)
    const startIndex = savedIndex !== null ? parseInt(savedIndex) : 0
    navigate(`/annotator/task/${taskId}/annotate`, {
      state: { startIndex, assignmentId: task?.assignmentId }
    })
  }

  const handleItemClick = (_item: TaskDataItemRecord, index: number) => {
    navigate(`/annotator/task/${taskId}/annotate`, {
      state: { startIndex: index, assignmentId: task?.assignmentId }
    })
  }

  if (error || (!task && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-screen bg-[#0f0e17]">
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

  return (
    <div className="min-h-screen bg-[#0f0e17] p-8">
      <TaskDetail
        task={
          task
            ? {
                ...task,
                taskId: String(task.taskId || task.id),
                taskName: String(task.taskName || task.name || 'Untitled Task')
              }
            : null
        }
        loading={loading}
        onItemClick={handleItemClick}
        onBack={() => navigate(-1)}
        onStartLabeling={handleStartLabeling}
      />
    </div>
  )
}
