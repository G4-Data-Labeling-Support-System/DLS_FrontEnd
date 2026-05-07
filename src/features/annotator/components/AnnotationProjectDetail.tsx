import { FolderOpen, Flag } from 'lucide-react'

interface Project {

  id?: string
  projectId?: string
  name?: string
  projectName?: string
  status?: string
  projectStatus?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export default function AnnotatorProjectDetail({ project }: { project: Project }) {
  if (!project) return null

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
      case 'COMPLETED':
        return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
      case 'PAUSED':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
      case 'ARCHIVE':
        return 'border-red-500/30 bg-red-500/10 text-red-400'
      default:
        return 'border-gray-500/30 bg-gray-500/10 text-gray-500'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="glass-panel rounded-2xl p-7 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-[50px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-3.5 h-3.5 text-violet-400" />

              <span className="text-xs font-mono text-violet-400 tracking-widest uppercase">
                Project
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111] tracking-tight">
              {project.projectName || project.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              {project.projectId || project.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusColor(project.projectStatus || project.status)}`}
            >
              <Flag className="w-3.5 h-3.5" />

              {project.projectStatus || project.status || 'UNKNOWN'}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#111] mb-2">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            {project.description || (
              <span className="text-gray-500 italic">
                No description provided for this project.
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-300 pt-6">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Created At</p>
            <p className="text-sm font-semibold text-gray-600">{formatDate(project.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
            <p className="text-sm font-semibold text-gray-600">{formatDate(project.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

