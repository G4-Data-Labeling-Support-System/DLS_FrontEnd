import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Button, Tag } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined, RocketOutlined, InfoCircleOutlined, DatabaseOutlined, CheckCircleOutlined } from '@ant-design/icons'
import taskApi from '@/api/TaskApi'
import assignmentApi from '@/api/AssignmentApi'
import annotationApi from '@/api/annotation'
import { useTaskDetail } from '@/features/annotator/hooks/useTaskDetail'
import type { AxiosError } from 'axios'

const { Title, Text } = Typography

export interface TaskDataItemRecord {
  dataItemId: string
  dataitemId?: string // Aliases for different API response formats
  itemId?: string
  id?: string
  taskDataItemStatus?: string
  dataItem: {
    id?: string
    name?: string
    fileName: string
    url: string
    fileFormat: string
    dataType: string
    uploadedAt: string
    previewUrl?: string
    itemId?: string
  }
  taskItemId?: string
}

export interface Task {
  taskId: string
  id?: string
  taskName?: string
  name?: string
  assignmentName?: string
  status?: string
  reviewStatus?: string
  description?: string
  assignmentId?: string
  projectId?: string
  datasetId?: string
  createdAt?: string
  [key: string]: unknown
}

export default function ReviewerTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    data: dataItems = [],
    isLoading: itemsLoading,
    error: itemsError
  } = useTaskDetail(taskId || '')

  const [remoteStatuses, setRemoteStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      if (!taskId) {
        setError('Task ID is missing.')
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const assignmentIdFromState = (location.state?.assignmentId || '') as string

        // 1. Try to fetch tasks by assignment ID first (more reliable)
        let currentTask: Task | null = null
        let assignmentName = (location.state as { assignmentName?: string })?.assignmentName
        let resolvedAssignmentId = assignmentIdFromState

        if (resolvedAssignmentId) {
          try {
            const tasksRes = await taskApi.getTasksByAssignmentId(resolvedAssignmentId)
            const tasksData = tasksRes.data?.data || tasksRes.data || []
            if (Array.isArray(tasksData)) {
              currentTask = tasksData.find((t: Task) => String(t.taskId || t.id) === String(taskId)) || null
            }
          } catch (e) {
            console.warn('Failed to fetch tasks by assignmentId, falling back to direct ID', e)
          }
        }

        // 2. Fallback to direct task fetch if not found
        if (!currentTask && taskId) {
          try {
            const res = await taskApi.getTaskById(taskId)
            currentTask = res.data?.data || res.data
          } catch (e) {
            console.error('Direct task fetch also failed:', e)
          }
        }

        if (!currentTask) {
          setError('Task not found or server error.')
          setLoading(false)
          return
        }

        // 3. Resolve assignment details if missing
        resolvedAssignmentId = (currentTask.assignmentId || resolvedAssignmentId) as string
        if (!assignmentName && resolvedAssignmentId) {
          try {
            const assignRes = await assignmentApi.getAssignmentById(resolvedAssignmentId)
            const assignData = assignRes.data?.data || assignRes.data
            assignmentName = assignData.assignmentName || assignData.name || assignData.title
            
            // Add assignment status to the task object for UI logic
            currentTask.assignmentStatus = assignData.assignmentStatus || assignData.status
          } catch (e) {
            console.warn('Could not fetch assignment details for reviewer task:', e)
          }
        }

        setTask({
          ...currentTask,
          taskId: String(currentTask.taskId || currentTask.id),
          taskName: String(currentTask.taskName || currentTask.name || 'Untitled Task'),
          assignmentName: assignmentName || 'N/A'
        })
      } catch (err: unknown) {
        const error = err as AxiosError
        console.error('Failed to load reviewer task details:', error)
        setError('Failed to load task details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [taskId, location.state])

  // Background fetch remote statuses for all items to calculate progress correctly
  useEffect(() => {
    if (dataItems.length === 0) return

    dataItems.forEach(async (item: TaskDataItemRecord) => {
      const id = item.dataItemId || item.dataitemId || item.itemId || item.dataItem?.itemId || item.dataItem?.id || item.id
      if (!id) return

      try {
        const res = await annotationApi.getAnnotationByDataItemId(id)
        const remoteAnno = res.data?.data || res.data
        if (remoteAnno && (remoteAnno.annotationStatus || remoteAnno.annotation_status || remoteAnno.status)) {
          const status = (remoteAnno.annotationStatus || remoteAnno.annotation_status || remoteAnno.status).toUpperCase()
          setRemoteStatuses(prev => ({
            ...prev,
            [id]: status
          }))
        }
      } catch {
        // Silently skip
      }
    })
  }, [dataItems])

  const getAnnotatedCount = () => {
    if (!dataItems.length) return 0
    const annotatedIds = new Set<string>()

    dataItems.forEach((item: TaskDataItemRecord) => {
      if (item.taskDataItemStatus === 'COMPLETED') {
        annotatedIds.add(item.dataItemId)
      }
    })

    Object.entries(remoteStatuses).forEach(([id, status]) => {
      if (status === 'SUBMITTED' || status === 'APPROVED' || status === 'COMPLETED') {
        annotatedIds.add(id)
      }
    })

    return annotatedIds.size
  }

  const annotatedCount = getAnnotatedCount()
  const progressPercent = Math.round((annotatedCount / (dataItems.length || 1)) * 100)

  const handleStartReview = () => {
    if (!taskId) return
    // Navigate to workspace with specific state if needed
    navigate(`/reviewer/workspace/${task?.projectId || 'all'}`, {
      state: { taskId, assignmentId: task?.assignmentId }
    })
  }

  const columns = [
    {
      title: 'Preview',
      key: 'preview',
      width: '10%',
      render: (_: string, record: TaskDataItemRecord) => (
        <div className="w-10 h-10 rounded-lg border border-white/5 overflow-hidden bg-black/20 flex items-center justify-center transition-all hover:border-violet-500/30">
          {record.dataItem?.url || record.dataItem?.previewUrl ? (
            <img
              src={record.dataItem?.url || record.dataItem?.previewUrl}
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
          title={record.dataItem?.fileName || record.dataItem?.name}
        >
          {record.dataItem?.fileName || record.dataItem?.name || 'N/A'}
        </Text>
      )
    },
    {
      title: 'Format',
      key: 'fileFormat',
      width: '12%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Tag className="bg-blue-500/10 border-blue-500/20 text-blue-400 font-medium rounded-md px-2 py-0.5">
          {record.dataItem?.fileFormat || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Data Type',
      key: 'dataType',
      width: '12%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Tag className="bg-violet-500/10 border-violet-500/20 text-violet-400 font-medium rounded-md px-2 py-0.5">
          {record.dataItem?.dataType || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: '12%',
      render: (_: unknown, record: TaskDataItemRecord) => {
        const canonicalId = (record.dataItemId || record.dataitemId || record.itemId || record.id || '') as string
        const status = (
          (canonicalId ? remoteStatuses[canonicalId] : undefined) ||
          record.taskDataItemStatus ||
          'NOT_STARTED'
        ).toUpperCase()

        const isApprove = status === 'APPROVED'
        const isSubmitted = status === 'COMPLETED' || status === 'SUBMITTED'
        const isRejected = status === 'REJECTED' || status === 'NEEDS_EDITING'
        const isInProgress = status === 'IN_PROGRESS' || status === 'IN_EDITING'
        const isInReview = status === 'IN_REVIEW'

        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isApprove || isInReview ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]' :
              isSubmitted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                isRejected ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                  isInProgress ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                    'bg-gray-600'
              }`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${isApprove || isInReview ? 'text-violet-400' :
              isSubmitted ? 'text-emerald-400' :
                isRejected ? 'text-rose-400' :
                  isInProgress ? 'text-amber-400' :
                    'text-gray-500'
              }`}>
              {status}
            </span>
          </div>
        )
      }
    },
    {
      title: 'Uploaded At',
      key: 'uploadedAt',
      width: '18%',
      render: (_: unknown, record: TaskDataItemRecord) => (
        <Text className="text-gray-400 text-sm">
          {record.dataItem?.uploadedAt
            ? new Date(record.dataItem.uploadedAt).toLocaleDateString()
            : 'N/A'}
        </Text>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: '6%',
      render: () => (
        <button
          onClick={handleStartReview}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-violet-400 transition-all cursor-pointer flex items-center justify-center"
        >
          <ArrowRightOutlined className="text-lg" />
        </button>
      )
    }
  ]

  if (loading || !task) {
    return (
      <div className="py-32 flex flex-col items-center gap-4 bg-[#0f0e17] min-h-screen">
        <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
        <span className="text-gray-500 font-medium tracking-widest text-[10px] uppercase">
          Loading Task Details...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-screen bg-[#0f0e17]">
        <span className="material-symbols-outlined text-red-500 text-5xl opacity-80">error</span>
        <span className="text-red-400 font-medium">{error}</span>
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
    <div className="min-h-screen bg-[#0f0e17] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10"
          >
            <ArrowLeftOutlined className="text-xs group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </button>
          <div className="flex flex-col">
            <Title level={4} className="!text-white !mb-0 tracking-tight font-bold">
              {task.taskName}
            </Title>
            <Text className="text-gray-500 font-mono text-xs select-all">ID: {task.taskId}</Text>
          </div>
        </div>
        {task.assignmentStatus === 'REVIEWING' && (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleStartReview}
            className="bg-violet-600 border-none hover:bg-violet-500 rounded-xl h-[38px] flex items-center shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
          >
            <span className="text-sm font-medium">Start Reviewing</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
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
                    <span className="text-gray-200 font-medium">{task.assignmentName}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Progress">
                  <div className="flex flex-col gap-1 w-full max-w-[200px]">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-violet-400">{progressPercent}%</span>
                      <span className="text-gray-500">
                        {annotatedCount} / {dataItems.length}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="processing" className="bg-blue-500/10 border-blue-500/20 text-blue-400 font-bold uppercase tracking-wider text-[10px] rounded px-2 py-0.5">
                    {task.reviewStatus || task.status || 'PENDING'}
                  </Tag>
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

        <div className="lg:col-span-12 mt-6">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <DatabaseOutlined className="text-violet-400 text-sm" />
            </div>
            <Title level={5} className="!text-white !mb-0 tracking-tight font-bold">
              Task Data Content for Review
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
              rowKey={(record) => String(record.taskItemId || record.dataItemId || '')}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                className: 'custom-pagination !mt-8 !mb-4 !px-6'
              }}
              className="manager-task-table"
            />
            {itemsError && <div className="p-8 text-red-400 text-center">{String(itemsError)}</div>}
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
