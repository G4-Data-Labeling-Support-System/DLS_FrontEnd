import { useMemo } from 'react'
import { ClipboardList, FolderOpen, Clock } from 'lucide-react'


interface Assignment {
  id?: string
  assignmentId?: string
  name?: string
  assignmentName?: string
  title?: string
  status?: string
  completedTasks?: number
  totalTasks?: number
  dataset?: { totalItems?: number }
  dueDate?: string
  deadline?: string
  updatedAt?: string
  project?: {
    id?: string
    projectId?: string
    name?: string
    projectName?: string
  }
  description?: string
  descriptionAssignment?: string
}

export default function AssignmentHeader({ assignment }: { assignment: Assignment }) {
  const completed = assignment.completedTasks ?? 0
  const total = assignment.totalTasks ?? assignment.dataset?.totalItems ?? 1
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const deadlineStr =
    assignment.dueDate || assignment.deadline || assignment.updatedAt || new Date().toISOString()

  const daysLeft = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const diff = new Date(deadlineStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [deadlineStr])

  const title =
    assignment.assignmentName || assignment.name || assignment.title || 'Untitled Assignment'
  const id = assignment.assignmentId || assignment.id || 'N/A'
  const description =
    assignment.descriptionAssignment || assignment.description || 'No description provided.'

  return (
    <div className="glass-panel rounded-2xl p-7 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-[50px] pointer-events-none" />

      <div className="relative z-10">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            {/* Breadcrumb label */}
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-3.5 h-3.5 text-violet-400" />

              <span className="text-xs font-mono text-violet-400 tracking-widest uppercase">
                Assignment
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111] tracking-tight">{title}</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">{id}</p>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-gray-300 text-xs text-gray-600">
              <FolderOpen className="w-3.5 h-3.5 text-violet-400" />

              {assignment.project?.projectName ||
                assignment.project?.name ||
                (typeof assignment.project === 'string' ? assignment.project : 'Unknown Project')}
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border text-xs font-bold ${daysLeft <= 2 ? 'border-red-500/30 text-red-400' : daysLeft <= 5 ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'}`}
            >
              <Clock className="w-3.5 h-3.5" />

              {daysLeft > 0
                ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                : 'Deadline passed'}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-3xl">{description}</p>

        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-violet-400 shrink-0">
            {completed}/{total} tasks · {progress}%
          </span>
        </div>
      </div>
    </div>
  )
}

