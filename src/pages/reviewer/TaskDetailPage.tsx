import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Button, Tag } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined, RocketOutlined, InfoCircleOutlined, DatabaseOutlined, CheckCircleOutlined } from '@ant-design/icons'
import taskApi from '@/api/TaskApi'

export default function ReviewerTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true)
        if (!taskId) return
        const res = await taskApi.getTaskById(taskId)
        setTask(res.data?.data || res.data)
      } catch (err) {
        console.error('Failed to fetch task details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [taskId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
        <span className="mt-4 text-violet-400 font-mono">Loading Task Details...</span>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="text-gray-400 hover:text-white mb-6"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <div className="text-center text-gray-400 py-20 glass-panel rounded-xl border border-dashed border-gray-700">
          Task not found.
        </div>
      </div>
    )
  }

  const projectId = task.projectId || task.project?.projectId || task.project?.id || ''
  const assignmentId = task.assignmentId || ''

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 px-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="text-gray-400 hover:text-white mb-2 w-fit"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      {/* Header / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Task Details</h1>
            <Tag color="processing" className="m-0 rounded-full px-3 uppercase font-black tracking-tighter text-[10px]">
              {task.taskStatus || task.status}
            </Tag>
          </div>
          <p className="text-gray-500 text-xs font-mono tracking-wider opacity-60">
            ID: {taskId}
          </p>
        </div>

        <Button
          type="primary"
          icon={<RocketOutlined />}
          size="large"
          className="bg-violet-600 hover:bg-violet-500 border-none rounded-xl font-bold h-auto py-2.5 px-6"
          onClick={() => navigate(`/reviewer/workspace/${projectId}`)}
        >
          Open Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Detail Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 blur-3xl -z-10 group-hover:bg-violet-600/10 transition-colors" />

            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <InfoCircleOutlined />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Information</span>
            </div>

            <DetailItem label="Assignment ID" value={assignmentId} isMono />
            <DetailItem label="Task Name" value={task.taskName || task.name} />
            <DetailItem label="Created At" value={task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'} />
          </div>

          {/* Quick Stats Mini Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                 <CheckCircleOutlined className="text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Status
              </span>
            </div>
            <div className="flex items-end gap-2 text-white font-bold">
               {task.taskStatus || task.status}
            </div>
          </div>
        </div>

        {/* Right Side: Data Items */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-2xl p-8 border border-white/5 h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -z-10" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <DatabaseOutlined className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Data Content</h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Task media content
                  </span>
                </div>
              </div>
            </div>

            {/* If task has data items, list them here. Assuming task object might have an array of data items */}
            {task.dataItems && task.dataItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.dataItems.map((item: any) => (
                        <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                            <img src={item.imageUrl} alt={item.filename} className="w-16 h-16 object-cover rounded-lg" />
                            <div className="flex flex-col">
                                <span className="text-white font-medium">{item.filename}</span>
                                <span className="text-gray-500 text-xs">{item.fileType}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-10">
                    No individual data items listed for this task detail.
                    Use the workspace to view and review content.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({
  label,
  value,
  isMono = false,
  isCapitalize = false
}: {
  label: string
  value: string
  isMono?: boolean
  isCapitalize?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</span>
      <span
        className={`text-sm text-gray-200 ${isMono ? 'font-mono' : 'font-medium'} ${isCapitalize ? 'capitalize' : ''}`}
      >
        {value || 'N/A'}
      </span>
    </div>
  )
}
