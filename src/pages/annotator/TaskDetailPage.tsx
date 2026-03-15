import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { StatusStyle as getTaskStatusStyle } from '@/features/annotator'
import assignmentApi from '@/api/AssignmentApi'
import type { Task } from '@/features/annotator/components/TaskSection'

interface DataItem {
  itemId?: string
  id?: string
  url?: string
  previewUrl?: string
  fileName?: string
  filename?: string
  fileFormat?: string
  dataType?: string
  uploadedAt?: string
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!taskId) return
      setLoading(true)
      try {
        const assignmentId = location.state?.assignmentId || taskId

        // 1. Fetch task details
        const tasksRes = await assignmentApi.getTasksByAssignmentId(assignmentId)
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

        // 2. Fetch data items using taskId directly
        const itemsRes = await assignmentApi.getTaskById(taskId)
        const itemsData = itemsRes.data?.data || itemsRes.data || []
        setDataItems(Array.isArray(itemsData) ? itemsData : [])
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
      <div className="w-full flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 animate-pulse pt-20">
          <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-mono text-sm">Loading task details...</p>
        </div>
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

  const statusStyle = getTaskStatusStyle(task.status || task.taskStatus || 'PENDING')

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 px-4 pt-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit group"
      >
        <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">
          arrow_back
        </span>
        <span className="text-sm font-medium">Back to Assignment</span>
      </button>

      {/* Header / Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Task Details</h1>
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusStyle.badge}`}
          >
            {task.status || task.taskStatus || 'PENDING'}
          </span>
        </div>
        <p className="text-gray-500 text-sm font-mono">{task.taskId || task.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Detail Cards */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 border border-white/5">
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span className="text-xs font-bold uppercase tracking-wider">Information</span>
            </div>

            <DetailItem label="Assignment ID" value={String(task.assignmentId || 'N/A')} isMono />
            <DetailItem label="Task Type" value={String(task.taskType || 'N/A')} isCapitalize />
            <DetailItem
              label="Completed / Total"
              value={`${task.completedItems || 0} / ${task.totalItems || 0}`}
            />
            <DetailItem
              label="Review Status"
              value={task.reviewStatus ? String(task.reviewStatus).replace('_', ' ') : 'N/A'}
              isCapitalize
            />
            <DetailItem label="Flag for Review" value={task.flagForReview ? 'Yes' : 'No'} />
            <DetailItem
              label="Created At"
              value={task.createdAt ? new Date(String(task.createdAt)).toLocaleString() : 'N/A'}
            />
          </div>
        </div>

        {/* Right Side: Data Items Table */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl p-6 border border-white/5 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="material-symbols-outlined text-[18px]">database</span>
                <span className="text-xs font-bold uppercase tracking-wider">Data Items</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {dataItems.length} items total
              </span>
            </div>

            <div className="overflow-x-auto">
              {dataItems.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm border-t border-white/5 mt-4">
                  No data items found for this task's dataset.
                </div>
              ) : (
                <table className="w-full text-left border-separate border-spacing-y-3 -mt-3">
                  <thead>
                    <tr className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      <th className="px-4 pb-2">File</th>
                      <th className="px-4 pb-2">Format</th>
                      <th className="px-4 pb-2">Type</th>
                      <th className="px-4 pb-2">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataItems.map((item, index) => (
                      <tr
                        key={item.itemId || item.id || index}
                        className="group cursor-pointer"
                        onClick={() =>
                          navigate(`/annotator/task/${task.taskId || task.id}/annotate`, {
                            state: { startIndex: index, assignmentId: task.assignmentId || task.id }
                          })
                        }
                      >
                        <td className="px-4 py-3 bg-white/5 rounded-l-xl border-y border-l border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-lg bg-black/40 flex items-center justify-center">
                              {item.url || item.previewUrl ? (
                                <img
                                  src={item.url || item.previewUrl}
                                  alt={item.fileName || item.filename}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-gray-500 text-sm">
                                  image
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-200 truncate max-w-[150px]">
                              {item.fileName || item.filename || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 bg-white/5 border-y border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                          <span className="text-xs font-mono text-gray-400">
                            {item.fileFormat || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 bg-white/5 border-y border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                            {item.dataType || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-4 py-3 bg-white/5 rounded-r-xl border-y border-r border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                          <span className="text-[11px] text-gray-500">
                            {item.uploadedAt
                              ? new Date(item.uploadedAt).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
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
        className={`text-sm text-gray-200 ${isMono ? 'font-mono' : 'font-medium'} ${
          isCapitalize ? 'capitalize' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}
