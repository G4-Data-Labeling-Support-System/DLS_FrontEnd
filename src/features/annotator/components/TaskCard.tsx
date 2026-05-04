import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import getTaskStatusStyle, {
  getAnnotationStatusLabel,
  getAnnotationStatusStyle
} from './StatusStyle'
import { useTaskDetail } from '@/features/annotator/hooks/useTaskDetail'
import annotationApi from '@/api/annotation'

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

export default function TaskCard({ task, assignmentId }: { task: Task; assignmentId?: string }) {
  const navigate = useNavigate()
  if (!task.id) return null // Guard against missing ID
  const taskStatus = task.taskStatus || task.status || task.reviewStatus || 'NOT_STARTED'
  const taskName = task.name || task.filename || 'Untitled Task'

  const { data: dataItems = [] } = useTaskDetail(task.id)
  const [sessionAnnotations, setSessionAnnotations] = useState<any[]>([])
  const [remoteStatuses, setRemoteStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task.id) {
      const saved = localStorage.getItem(`annotation_session_${task.id}`)
      if (saved) {
        try {
          setSessionAnnotations(JSON.parse(saved))
        } catch (e) {}
      }
    }
  }, [task.id])

  useEffect(() => {
    if (dataItems.length === 0) return
    dataItems.forEach(async (item: any) => {
      const id = item.dataItemId || item.dataitemId || item.itemId || item.dataItem?.itemId || item.id
      if (!id) return
      try {
        const res = await annotationApi.getAnnotationByDataItemId(id)
        const remoteAnno = res.data?.data || res.data
        if (remoteAnno && (remoteAnno.annotationStatus || remoteAnno.annotation_status || remoteAnno.status)) {
          const status = (remoteAnno.annotationStatus || remoteAnno.annotation_status || remoteAnno.status).toUpperCase()
          setRemoteStatuses(prev => ({ ...prev, [id]: status }))
        }
      } catch (err) {}
    })
  }, [dataItems])

  const getAnnotatedCount = () => {
    if (!dataItems.length) return task.completedItems ?? 0
    const annotatedIds = new Set<string>()

    dataItems.forEach((item: any) => {
      if (item.taskDataItemStatus === 'COMPLETED') annotatedIds.add(item.dataItemId)
    })

    Object.entries(remoteStatuses).forEach(([id, status]) => {
      if (status === 'SUBMITTED' || status === 'APPROVED' || status === 'COMPLETED') {
        annotatedIds.add(id)
      }
    })

    sessionAnnotations.forEach((anno) => {
      if (anno.annotationStatus === 'SUBMITTED' || anno.annotationStatus === 'APPROVED') {
        annotatedIds.add(anno.dataitemId)
      }
    })

    return annotatedIds.size
  }

  const completed = getAnnotatedCount()
  const total = dataItems.length > 0 ? dataItems.length : (task.totalItems ?? 0)
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const statusStyle = getTaskStatusStyle(taskStatus)
  const annotationLabel = getAnnotationStatusLabel(task.annotationStatus || '')
  const annotationStyle = getAnnotationStatusStyle(task.annotationStatus || '')

  return (
    <div
      onClick={() => navigate(`/annotator/task/${task.id}`, { state: { assignmentId } })}
      className="relative group rounded-xl p-5 cursor-pointer overflow-hidden bg-[#1A1625]/60 backdrop-blur-md border border-gray-200 hover:border-violet-500/50 hover:bg-[#1A1625]/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 shadow-xl"
    >
      {/* Top row: status info */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 mb-0.5">
          <span className="font-semibold text-gray-500">Task_Status:</span>
          <span
            className={`font-semibold ${statusStyle.badge.includes('emerald') ? 'text-emerald-400' : statusStyle.badge.includes('amber') ? 'text-amber-400' : statusStyle.badge.includes('violet') ? 'text-violet-400' : 'text-gray-500'}`}
          >
            {taskStatus}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <span className="font-semibold text-gray-500">Annotation_Status:</span>
          <span className={`font-semibold ${annotationStyle}`}>{annotationLabel}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 mb-3" />

      {/* Task name + action */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-[#111]">{taskName}</h4>
        <button className="flex items-center gap-1 text-[10px] font-bold text-violet-300 hover:text-[#111] transition-colors opacity-0 group-hover:opacity-100">
          <span>Open</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-500 font-medium">Progress</span>
          <span className="text-violet-400 font-bold">
            {completed}/{total} items
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-gray-200">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-violet-500/5 rounded-tl-full pointer-events-none" />
    </div>
  )
}

