import { useParams, useNavigate } from 'react-router-dom'
import getTaskStatusStyle from './components/StatusStyle'

const MOCK_TASK_DETAIL = {
  id: 'TASK-UUID-001',
  assignmentId: 'ASGN-UUID-123',
  taskType: 'classification',
  completedCount: 5,
  flagForReview: false,
  reviewStatus: 'not_reviewed',
  status: 'completed',
  createdAt: '2024-03-07T10:00:00Z',
  dataItems: [
    {
      id: 'item-1',
      filename: 'medical_scan_01.png',
      fileFormat: 'PNG',
      dataType: 'Image',
      uploadedAt: '2024-03-07T09:00:00Z',
      previewUrl: 'https://picsum.photos/seed/scan1/100/100'
    },
    {
      id: 'item-2',
      filename: 'medical_scan_02.png',
      fileFormat: 'PNG',
      dataType: 'Image',
      uploadedAt: '2024-03-07T09:05:00Z',
      previewUrl: 'https://picsum.photos/seed/scan2/100/100'
    },
    {
      id: 'item-3',
      filename: 'medical_scan_03.png',
      fileFormat: 'PNG',
      dataType: 'Image',
      uploadedAt: '2024-03-07T09:10:00Z',
      previewUrl: 'https://picsum.photos/seed/scan3/100/100'
    }
  ]
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const task = MOCK_TASK_DETAIL // In real app, fetch by taskId
  const statusStyle = getTaskStatusStyle(task.status)

  // In a real app, this would come from the task or assignment data
  const projectId = 'PROJ-MOCK-012'

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 px-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button
        onClick={() => navigate('/reviewer/review')}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-all w-fit group"
      >
        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-violet-600 group-hover:border-violet-500 transition-all">
          <span className="material-symbols-outlined text-[18px] block transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
        </div>
        <span className="text-sm font-bold tracking-tight">Back to Review</span>
      </button>

      {/* Header / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Task Details</h1>
            <span
              className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${statusStyle.badge}`}
            >
              {task.status}
            </span>
          </div>
          <p className="text-gray-500 text-xs font-mono tracking-wider opacity-60">ID: {taskId || task.id}</p>
        </div>

        <button
          onClick={() => navigate(`/reviewer/workspace/${projectId}`)}
          className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-violet-900/20 transition-all flex items-center gap-2 group"
        >
          <span>Open Workspace</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">rocket_launch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Detail Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 blur-3xl -z-10 group-hover:bg-violet-600/10 transition-colors" />

            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Information</span>
            </div>

            <DetailItem label="Assignment ID" value={task.assignmentId} isMono />
            <DetailItem label="Task Type" value={task.taskType} isCapitalize />
            <DetailItem label="Completed Count" value={task.completedCount.toString()} />
            <DetailItem
              label="Review Status"
              value={task.reviewStatus.replace('_', ' ')}
              isCapitalize
            />
            <DetailItem label="Flag for Review" value={task.flagForReview ? 'Yes' : 'No'} />
            <DetailItem label="Created At" value={new Date(task.createdAt).toLocaleString()} />
          </div>

          {/* Quick Stats Mini Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
              </div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Quality Score</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">98.5</span>
              <span className="text-emerald-400 text-xs font-bold mb-1.5">%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
              <div className="w-[98.5%] h-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            </div>
          </div>
        </div>

        {/* Right Side: Data Items Table */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-2xl p-8 border border-white/5 h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -z-10" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-emerald-400">database</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Data Items</h3>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    {task.dataItems.length} files available for review
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4 -mt-4">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black pb-4">
                    <th className="px-6 pb-2">File Detail</th>
                    <th className="px-6 pb-2">Format</th>
                    <th className="px-6 pb-2 text-center">Type</th>
                    <th className="px-6 pb-2 text-right">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {task.dataItems.map((item) => (
                    <tr
                      key={item.id}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/reviewer/workspace/${projectId}`)}
                    >
                      <td className="px-6 py-4 bg-white/5 rounded-l-2xl border-y border-l border-white/5 group-hover:bg-white/10 group-hover:border-violet-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-2xl group-hover:scale-105 transition-transform">
                            <img
                              src={item.previewUrl}
                              alt={item.filename}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-[16px]">visibility</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                              {item.filename}
                            </span>
                            <span className="text-[10px] font-mono text-gray-600 group-hover:text-gray-400 transition-colors">ITEM-{item.id.toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 group-hover:border-violet-500/30 transition-all">
                        <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">{item.fileFormat}</span>
                      </td>
                      <td className="px-6 py-4 bg-white/5 border-y border-white/5 group-hover:bg-white/10 group-hover:border-violet-500/30 transition-all text-center">
                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                          {item.dataType}
                        </span>
                      </td>
                      <td className="px-6 py-4 bg-white/5 rounded-r-2xl border-y border-r border-white/5 group-hover:bg-white/10 group-hover:border-violet-500/30 transition-all text-right">
                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300">
                          {new Date(item.uploadedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        className={`text-sm text-gray-200 ${isMono ? 'font-mono' : 'font-medium'} ${isCapitalize ? 'capitalize' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
