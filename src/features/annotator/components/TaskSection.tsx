import { useState, useMemo, useEffect } from 'react'
import TaskCard from './TaskCard'
import taskApi from '@/api/TaskApi'

/** Groups tasks by their batchLabel */
export interface Task {
  id: string
  taskId?: string
  assignmentId?: string
  batchId?: string
  batchLabel: string
  taskName?: string
  name?: string
  filename?: string
  taskStatus?: string
  status?: string
  annotationStatus?: string
  completedItems?: number
  totalItems?: number
  reviewStatus?: string
  [key: string]: string | number | boolean | undefined | object | null
}

interface TasksSectionProps {
  tasks?: Task[]
  assignmentId?: string
}

export default function TasksSection({
  tasks: initialTasks = [],
  assignmentId
}: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchTasks = async () => {
      if (!assignmentId) return

      try {
        setLoading(true)
        setError(null)
        const response = await taskApi.getTasksByAssignmentId(assignmentId)
        const rawData = response.data?.data || response.data || []

        if (Array.isArray(rawData)) {
          const mappedTasks: Task[] = (rawData as Record<string, unknown>[]).map((t) => {
            let status = String(t.task_status || t.taskStatus || t.status || 'PENDING').toUpperCase()
            if (status === 'NOT_STARTED') status = 'PENDING'

            // Robustly map progress fields from various possible API responses
            const completedItems = Number(
              t.completedItems ?? t.completed_items ?? t.completedCount ?? t.completed_count ?? 0
            )
            const totalItems = Number(
              t.totalItems ?? t.total_items ?? t.itemsCount ?? t.totalCount ?? 0
            )
            
            return {
              ...t,
              id: String(t.taskId || t.id || ''),
              name: String(t.taskName || t.name || ''),
              batchLabel: String(t.batchLabel || t.taskType || 'Unbatched'),
              taskStatus: status,
              completedItems,
              totalItems
            }
          })
          setTasks(mappedTasks)
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err)
        setError('Failed to load tasks from server.')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [assignmentId])

  // 1. Filter tasks based on search and status
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const name = (task.name || task.filename || '').toLowerCase()
      const taskStatus = (
        task.taskStatus ||
        task.status ||
        task.reviewStatus ||
        'PENDING'
      ).toUpperCase()
      const matchesSearch = name.includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || taskStatus === statusFilter
      return matchesSearch && matchesStatus
    })

    // Sort by TASK-XX number
    return filtered.sort((a, b) => {
      const aName = a.name || a.filename || ''
      const bName = b.name || b.filename || ''

      const aMatch = aName.match(/TASK-(\d+)/i)
      const bMatch = bName.match(/TASK-(\d+)/i)

      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1])
      }

      // Fallback for non-matching names
      return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
    })
  }, [tasks, searchTerm, statusFilter])

  // 2. Paginate filtered tasks
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage)

  // 3. Group ONLY the paginated tasks by batch for display
  const groupedPaginated = useMemo(() => {
    return paginatedTasks.reduce<Record<string, Task[]>>((acc, task) => {
      const batch = task.batchLabel || 'Unbatched'
      if (!acc[batch]) acc[batch] = []
      acc[batch].push(task)
      return acc
    }, {})
  }, [paginatedTasks])

  const availableStatuses = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED']

  if (loading && tasks.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
        <span className="text-gray-400 text-sm font-mono animate-pulse">Fetching tasks...</span>
      </div>
    )
  }

  if (error && tasks.length === 0) {
    return (
      <div className="w-full py-10 text-center glass-panel rounded-2xl border border-red-500/10">
        <span className="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-violet-400 text-xs font-bold hover:underline"
        >
          Try Reloading
        </button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col h-full">
      {/* Section Header + Search & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-fuchsia-400">
              grid_view
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Tasks</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                {filteredTasks.length} of {tasks.length} tasks matched
              </span>
              {loading && <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Status Filter */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  setCurrentPage(1)
                }}
                className={`
                                    px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                                    ${
                                      statusFilter === status
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }
                                `}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative group w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-500 group-focus-within:text-fuchsia-400 transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search tasks by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tasks List (Grouped by batch but only for current page) */}
      {filteredTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-white/5">
          <span className="material-symbols-outlined text-gray-600 text-5xl mb-4 opacity-20">
            manage_search
          </span>
          <p className="text-gray-400 text-base font-medium">No tasks found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or search term</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('ALL')
              setCurrentPage(1)
            }}
            className="mt-6 text-violet-400 text-xs font-bold hover:text-violet-300 underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8 flex-1">
          {Object.entries(groupedPaginated).map(([batchLabel, batchTasks]) => (
            <div
              key={batchLabel}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Batch label */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-400/80">
                  {batchLabel}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/20 to-transparent" />
              </div>

              {/* Grid space */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {batchTasks.map((task) => (
                  <TaskCard
                    key={`${batchLabel}-${task.id}`}
                    task={task}
                    assignmentId={assignmentId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="text-gray-300">{startIndex + 1}</span> -{' '}
            <span className="text-gray-300">
              {Math.min(startIndex + itemsPerPage, filteredTasks.length)}
            </span>{' '}
            of <span className="text-gray-300">{filteredTasks.length}</span> tasks
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            <div className="flex items-center gap-1.5 px-4 h-9 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-sm font-bold text-violet-400">{currentPage}</span>
              <span className="text-xs text-gray-600">/</span>
              <span className="text-xs text-gray-500">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
