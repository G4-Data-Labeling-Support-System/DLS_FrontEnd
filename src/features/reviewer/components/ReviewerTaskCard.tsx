import { useNavigate } from 'react-router-dom'
import { Tag } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'

interface Task {
  id: string
  taskStatus?: string
  status?: string
  name?: string
  filename?: string
  annotationStatus?: string
  completedItems?: number
  totalItems?: number
  reviewStatus?: string
  [key: string]: string | number | boolean | undefined | object | null
}

export default function ReviewerTaskCard({ task, assignmentId }: { task: Task; assignmentId?: string }) {
  const navigate = useNavigate()
  if (!task.id) return null

  const rawStatus = task.taskStatus || task.status || task.reviewStatus || 'PENDING'
  const taskStatus = String(rawStatus).toUpperCase()
  const taskName = task.name || task.filename || `Task ${task.id.split('-').pop()}`

  const completed = Number(task.completedItems ?? 0)
  const total = Number(task.totalItems ?? 0)
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <Tag icon={<CheckCircleOutlined />} color="success">APPROVED</Tag>
      case 'REJECTED':
        return <Tag icon={<ExclamationCircleOutlined />} color="error">REJECTED</Tag>
      case 'IN_PROGRESS':
        return <Tag icon={<PlayCircleOutlined />} color="processing">IN PROGRESS</Tag>
      case 'IN_REVIEW':
        return <Tag icon={<ClockCircleOutlined />} color="processing">IN REVIEW</Tag>
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="default">PENDING</Tag>
      default:
        return <Tag color="default">{status}</Tag>
    }
  }

  return (
    <div
      onClick={() => navigate(`/reviewer/task/${task.id}`, { state: { assignmentId } })}
      className="relative group rounded-xl p-5 cursor-pointer overflow-hidden bg-[#1A1625]/60 backdrop-blur-md border border-white/5 hover:border-violet-500/50 hover:bg-[#1A1625]/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 shadow-xl"
    >
      <div className="mb-3 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Status</span>
          {getStatusTag(taskStatus)}
        </div>
        <ArrowRightOutlined className="text-gray-600 group-hover:text-violet-400 transition-colors mt-1" />
      </div>

      <div className="border-t border-white/10 mb-3" />

      <h4 className="text-base font-bold text-white mb-4 line-clamp-1">{taskName}</h4>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-500 font-medium">Progress</span>
          <span className="text-violet-400 font-bold">
            {completed}/{total} items
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-12 h-12 bg-violet-500/5 rounded-tl-full pointer-events-none group-hover:bg-violet-500/10 transition-colors" />
    </div>
  )
}
