import { useState, useMemo } from 'react'
import ReviewerTaskCard from './ReviewerTaskCard'
import { Empty, Button, Input } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'

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

interface ReviewerTasksSectionProps {
  tasks?: Task[]
  assignmentId?: string
}

export default function ReviewerTasksSection({
  tasks: initialTasks = [],
  assignmentId
}: ReviewerTasksSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const mappedTasks = useMemo(() => {
    return initialTasks.map((t: Record<string, unknown>, idx: number) => {
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
      } as Task
    })
  }, [initialTasks])

  const filteredTasks = useMemo(() => {
    const filtered = mappedTasks.filter((task) => {
      const name = (task.name || task.filename || '').toLowerCase()
      const taskStatus = (task.taskStatus || 'PENDING').toUpperCase()
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
  }, [mappedTasks, searchTerm, statusFilter])

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

  const availableStatuses = ['ALL', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'REJECTED']

  if (!mappedTasks || mappedTasks.length === 0) {
    return (
      <div className="w-full py-10 text-center glass-panel rounded-2xl border border-white/5">
        <Empty description={<span className="text-gray-500">No tasks available for review.</span>} />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col h-full mt-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
             <FilterOutlined className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Tasks for Review</h2>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              {filteredTasks.length} tasks matched
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Input
            placeholder="Search tasks..."
            prefix={<SearchOutlined className="text-gray-500" />}
            className="bg-white/5 border-white/10 text-white rounded-xl w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-white/5">
          <p className="text-gray-400">No tasks found matching your filters.</p>
          <Button type="link" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>
            Clear Filters
          </Button>
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
                  <ReviewerTaskCard
                    key={`${batchLabel}-${task.id}-${idx}`}
                    task={task}
                    assignmentId={assignmentId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl"
            >
              Previous
            </Button>
            <div className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-xl text-sm text-violet-400 font-bold">
              {currentPage} / {totalPages}
            </div>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
