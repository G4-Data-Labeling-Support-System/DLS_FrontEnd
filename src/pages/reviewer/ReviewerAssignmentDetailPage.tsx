import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Table, ConfigProvider, theme } from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import assignmentApi from '@/api/AssignmentApi'
import taskApi from '@/api/TaskApi'

export default function ReviewerAssignmentDetailPage() {
  const { projectId, assignmentId } = useParams<{ projectId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (!assignmentId) return

        const [assignRes, taskRes] = await Promise.all([
          assignmentApi.getAssignmentById(assignmentId),
          taskApi.getTasksByAssignmentId(assignmentId)
        ])

        const rawAssign = assignRes.data?.data || assignRes.data
        setAssignment({
          ...rawAssign,
          id: rawAssign.assignmentId || rawAssign.id,
          name: rawAssign.assignmentName || rawAssign.name || rawAssign.title,
          status: rawAssign.assignmentStatus || rawAssign.status
        })

        const rawTasks = taskRes.data?.data || taskRes.data || []
        setTasks(rawTasks.map((t: any) => ({
          ...t,
          id: t.taskId || t.id,
          name: t.taskName || t.name,
          status: t.taskStatus || t.status
        })))
      } catch (err) {
        console.error('Failed to fetch assignment details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [assignmentId])

  const getStatusTag = (status: string) => {
    const s = status?.toUpperCase()
    switch (s) {
      case 'COMPLETED':
      case 'APPROVED':
        return <Tag icon={<CheckCircleOutlined />} color="success">APPROVED</Tag>
      case 'REJECTED':
        return <Tag icon={<ExclamationCircleOutlined />} color="error">REJECTED</Tag>
      case 'IN_PROGRESS':
        return <Tag icon={<PlayCircleOutlined />} color="processing">IN PROGRESS</Tag>
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="default">PENDING</Tag>
      default:
        return <Tag color="default">{s || 'UNKNOWN'}</Tag>
    }
  }

  const columns = [
    {
      title: 'TASK NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="text-white font-medium">{text}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'CREATED AT',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-gray-400 text-xs font-mono">
          {date ? new Date(date).toLocaleString() : 'N/A'}
        </span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          className="bg-violet-600 hover:bg-violet-500 border-none rounded-lg text-xs font-black uppercase tracking-tighter"
          onClick={() => navigate(`/reviewer/task/${record.id}`)}
        >
          Review
        </Button>
      )
    }
  ]

  return (
    <div className="p-6">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="text-gray-400 hover:text-white mb-6"
        onClick={() => navigate(`/reviewer/projects/${projectId}/assignments`)}
      >
        Back to Assignments
      </Button>

      <div className="glass-panel p-6 rounded-2xl border border-white/5 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-fuchsia-400 tracking-widest uppercase font-bold">
                Assignment Details
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {assignment?.name || 'Loading...'}
            </h1>
          </div>
          {assignment && (
            <Tag color="processing" className="m-0 rounded-full px-4 py-1 uppercase font-black tracking-tighter shadow-lg">
              {assignment.status}
            </Tag>
          )}
        </div>
        <p className="text-gray-400 text-sm max-w-2xl">
          {assignment?.descriptionAssignment || assignment?.description || 'No description provided.'}
        </p>
      </div>

      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 bg-[#1A1625]/40">
          <Table
            columns={columns}
            dataSource={tasks}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            className="custom-table"
          />
        </div>
      </ConfigProvider>

      <style>{`
        .custom-table .ant-table {
          background: transparent !important;
          color: white !important;
        }
        .custom-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.03) !important;
          color: rgba(255, 255, 255, 0.4) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: rgba(124, 58, 237, 0.05) !important;
        }
      `}</style>
    </div>
  )
}
