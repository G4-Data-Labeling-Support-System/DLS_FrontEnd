import { useState, useMemo, useEffect } from 'react'
import TaskCard from './TaskCard'
import type { Task } from '../types'


interface TasksSectionProps {
  tasks?: Task[]
  assignmentId?: string
  role?: 'annotator' | 'reviewer'
  title?: string
}

export default function TasksSection({
  tasks: initialTasks = [],
  assignmentId,
  role = 'annotator',
  title = 'Tasks'
}: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    const mappedTasks: Task[] = initialTasks.map((t: any, idx: number) => {
      let status = String(t.task_status || t.taskStatus || t.status || t.reviewStatus || 'PENDING').toUpperCase()
      if (status === 'NOT_STARTED') status = 'PENDING'

      const completedItems = Number(
        t.completedItems ?? t.completed_items ?? t.completedCount ?? t.completed_count ?? 0
      )
      const totalItems = Number(
        t.totalItems ?? t.total_items ?? t.itemsCount ?? t.totalCount ?? 0
      )

      return {
        ...t,
        id: String(t.taskId || t.id || t.dataItemId || t.dataitemId || `task-${idx}`),
        name: String(t.taskName || t.name || t.filename || `Task ${idx + 1}`),
        batchLabel: String(t.batchLabel || t.taskType || 'Unbatched'),
        taskStatus: status,
        completedItems,
        totalItems
      }
    })
    setTasks(mappedTasks)
  }, [initialTasks])

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

    return filtered.sort((a, b) => {
      const aName = a.name || a.filename || ''
      const bName = b.name || b.filename || ''
      const aMatch = aName.match(/TASK-(\d+)/i)
      const bMatch = bName.match(/TASK-(\d+)/i)

      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1])
      }
      return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
    })
  }, [tasks, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage)

  const groupedPaginated = useMemo(() => {
    return paginatedTasks.reduce<Record<string, Task[]>>((acc, task) => {
      const batch = task.batchLabel || 'Unbatched'
      if (!acc[batch]) acc[batch] = []
      acc[batch].push(task)
      return acc
    }, {})
  }, [paginatedTasks])

  const availableStatuses = role === 'reviewer' 
    ? ['ALL', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'REJECTED']
    : ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED']

  if (!tasks || tasks.length === 0) {
    return (
      <div className="w-full py-10 text-center glass-panel rounded-2xl border border-gray-200">
        <span className="material-symbols-outlined text-gray-500 text-4xl mb-4">folder_open</span>
        <h3 className="text-xl font-bold text-gray-500 mb-2">No Tasks Found</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          There are currently no tasks available.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col h-full mt-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-violet-400">
              grid_view
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111] tracking-tight">{title}</h2>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              {filteredTasks.length} of {tasks.length} tasks matched
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex p-1 bg-white/5 rounded-xl border border-gray-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-violet-600 text-[#111] shadow-lg'
                    : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative group w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-500 group-focus-within:text-violet-400 transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-white/5 border border-gray-300 rounded-xl py-2 pl-10 pr-4 text-sm text-[#111] focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-gray-200">
          <span className="material-symbols-outlined text-gray-600 text-5xl mb-4 opacity-20">
            manage_search
          </span>
          <p className="text-gray-500 text-base font-medium">No tasks found</p>
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
            <div key={batchLabel}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-400/80">
                  {batchLabel}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {batchTasks.map((task, idx) => (
                  <TaskCard
                    key={`${batchLabel}-${task.id}-${idx}`}
                    task={task}
                    assignmentId={assignmentId}
                    role={role}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="text-gray-600">{startIndex + 1}</span> -{' '}
            <span className="text-gray-600">
              {Math.min(startIndex + itemsPerPage, filteredTasks.length)}
            </span>{' '}
            of <span className="text-gray-600">{filteredTasks.length}</span> tasks
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-gray-300 text-gray-500 hover:text-[#111] disabled:opacity-20 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            <div className="flex items-center gap-1.5 px-4 h-9 bg-white/5 border border-gray-200 rounded-xl">
              <span className="text-sm font-bold text-violet-400">{currentPage}</span>
              <span className="text-xs text-gray-600">/</span>
              <span className="text-xs text-gray-500">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-gray-300 text-gray-500 hover:text-[#111] disabled:opacity-20 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
