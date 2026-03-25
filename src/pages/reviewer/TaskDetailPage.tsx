import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, Table, Descriptions, Tag, Typography, Spin, Button } from 'antd'
import {
  DatabaseOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  ArrowRightOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import taskApi from '@/api/TaskApi'
import assignmentApi from '@/api/AssignmentApi'
import { useTaskDetail } from '@/features/annotator/hooks/useTaskDetail'

const { Title, Text } = Typography

export interface TaskDataItem {
  taskItemId: string
  dataItemId: string
  taskDataItemStatus?: string
  dataItem?: {
    id?: string
    name?: string
    fileName?: string
    url?: string
    previewUrl?: string
    [key: string]: unknown
  }
  [key: string]: unknown
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
  const [, setError] = useState<string | null>(null)

  const {
    data: dataItems = [],
    isLoading: itemsLoading,
  } = useTaskDetail(taskId || '')

  useEffect(() => {
    async function load() {
      if (!taskId) {
        setError('Task ID is missing.')
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const assignmentId = (location.state?.assignmentId || '') as string

        // 1. Fetch task details
        const res = await taskApi.getTaskById(taskId)
        const currentTask = res.data?.data || res.data

        if (!currentTask) {
          setError('Task not found.')
          setLoading(false)
          return
        }

        // 2. Fetch assignment details to get the name
        const realAssignmentId = (currentTask.assignmentId || assignmentId) as string
        let assignmentName = (location.state as { assignmentName?: string })?.assignmentName

        if (!assignmentName && realAssignmentId) {
          try {
            const assignRes = await assignmentApi.getAssignmentById(realAssignmentId)
            const assignData = assignRes.data?.data || assignRes.data
            assignmentName = assignData.assignmentName || assignData.name || assignData.title
          } catch (e) {
            console.warn('Could not fetch assignment details for reviewer task name:', e)
          }
        }

        setTask({
          ...currentTask,
          taskId: String(currentTask.taskId || currentTask.id),
          taskName: String(currentTask.taskName || currentTask.name || 'Untitled Task'),
          assignmentName: assignmentName || 'N/A'
        })
      } catch (err) {
        console.error('Failed to load reviewer task details:', err)
        setError('Failed to load task details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [taskId, location.state])

  const handleStartReview = () => {
    if (!taskId) return
    navigate(`/reviewer/workspace/${task?.projectId || 'all'}`)
  }

  const columns = [
    {
      title: 'Preview',
      key: 'preview',
      width: '10%',
      render: (_: string, record: TaskDataItem) => (
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
      width: '30%',
      render: (_: unknown, record: TaskDataItem) => (
        <Text className="text-gray-200 font-medium truncate block max-w-[300px]">
          {record.dataItem?.fileName || record.dataItem?.name || 'N/A'}
        </Text>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: '20%',
      render: (_: unknown, record: TaskDataItem) => {
        const status = String(record.taskDataItemStatus || 'PENDING').toUpperCase()
        return (
          <Tag color={status === 'COMPLETED' ? 'success' : 'processing'}>
            {status}
          </Tag>
        )
      }
    },
     {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: () => (
        <Button
          type="text"
          icon={<ArrowRightOutlined />}
          className="text-gray-400 hover:text-violet-400"
          onClick={handleStartReview}
        />
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

  return (
    <div className="min-h-screen bg-[#0f0e17] p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="text-gray-400 hover:text-white bg-white/5"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <div className="flex flex-col">
            <Title level={4} className="!text-white !mb-0 tracking-tight font-bold">
              {task.taskName}
            </Title>
            <Text className="text-gray-500 font-mono text-xs select-all">ID: {task.taskId}</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleStartReview}
          className="bg-violet-600 border-none hover:bg-violet-500 rounded-xl py-2 px-6 h-auto flex items-center"
        >
          <span className="text-sm font-bold">Start Reviewing</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-[#16161a]/60 border-white/5 rounded-2xl shadow-xl">
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
            <Descriptions.Item label="Status">
               <Tag color="processing">{task.reviewStatus || task.status || 'PENDING'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              <span className="text-gray-400 text-xs font-mono">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <div className="mt-6">
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

          <Card className="bg-[#16161a]/40 border-white/5 rounded-2xl shadow-2xl overflow-hidden">
            <Table
              dataSource={dataItems}
              columns={columns}
              loading={itemsLoading}
              rowKey={(record) => String(record.taskItemId || record.dataItemId || '')}
              pagination={{ pageSize: 10 }}
              className="manager-task-table"
            />
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
          font-weight: 700;
        }
        .manager-task-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
          background: transparent !important;
        }
        .manager-task-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  )
}
