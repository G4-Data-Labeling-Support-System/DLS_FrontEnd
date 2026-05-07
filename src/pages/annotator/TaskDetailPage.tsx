import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  ArrowLeft, 
  PlayCircle, 
  ArrowRight, 
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  Calendar
} from 'lucide-react'

import taskApi from '@/services/TaskApi'
import assignmentApi from '@/services/AssignmentApi'
import annotationApi from '@/services/annotation'
import { useTaskDetail } from '@/features/annotator/hooks/useTaskDetail'
import { ChangeDatasetModal } from '@/features/manager/components/dataset/ChangeDatasetModal'
import { useAuthStore } from '@/store'



export interface Task {
  taskId: string
  id?: string
  taskName?: string
  name?: string
  assignmentName?: string
  status?: string
  description?: string
  assignmentId?: string
  projectId?: string
  datasetId?: string
  createdAt?: string
  assignedBy?: string
  [key: string]: unknown
}

export interface TaskDataItemRecord {
  dataItemId: string
  taskDataItemStatus?: string
  dataItem: {
    fileName: string
    url: string
    fileFormat: string
    dataType: string
    uploadedAt: string
    previewUrl?: string
  }
  taskItemId?: string // Added for rowKey in table
}

interface TaskDetailProps {
  task: Task | null
  loading: boolean
  onItemClick?: (item: TaskDataItemRecord, index: number) => void
  onBack?: () => void
  onStartLabeling?: () => void
  onRefresh?: () => void
}

/**
 * Reusable Task Detail Component
 * Used in both Annotator and Manager flows
 */
export const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  loading,
  onItemClick,
  onBack,
  onStartLabeling,
  onRefresh
}) => {
  const { user } = useAuthStore()
  const [isChangeDatasetModalOpen, setIsChangeDatasetModalOpen] = useState(false)

  const isManager =
    user?.role?.toLowerCase().includes('manager') ||
    user?.role?.toLowerCase().includes('admin') ||
    user?.userRole?.toLowerCase().includes('manager') ||
    user?.userRole?.toLowerCase().includes('admin')

  const {
    data: dataItems = [],
    isLoading: itemsLoading,
    error: itemsError
  } = useTaskDetail(task?.taskId || '')

  const getCanonicalId = (record: any) =>
    record.dataItemId || record.dataitemId || record.itemId || record.dataItem?.itemId || record.id

  const [sessionAnnotations, setSessionAnnotations] = useState<any[]>([])
  const [remoteStatuses, setRemoteStatuses] = useState<Record<string, string>>({})

  // Load local session to show real-time progress
  useEffect(() => {
    if (task?.taskId) {
      const saved = localStorage.getItem(`annotation_session_${task.taskId}`)
      if (saved) {
        try {
          setSessionAnnotations(JSON.parse(saved))
        } catch (e) {
          console.warn('Failed to parse session annotations', e)
        }
      }
    }
  }, [task?.taskId])

  // Background fetch remote statuses for all items
  useEffect(() => {
    if (dataItems.length === 0) return

    dataItems.forEach(async (item: any) => {
      const id = getCanonicalId(item)
      if (!id) return


      try {
        const res = await annotationApi.getAnnotationByDataItemId(id)
        const remoteAnno = res.data?.data || res.data
        if (remoteAnno && (remoteAnno.annotationStatus || remoteAnno.annotation_status || remoteAnno.status)) {
          const status = (remoteAnno.annotationStatus || remoteAnno.annotation_status || remoteAnno.status).toUpperCase()
          setRemoteStatuses(prev => ({
            ...prev,
            [id]: status
          }))
        }
      } catch (err) {
        // Silently skip if no annotation exists
      }
    })
  }, [dataItems])

  // Improved progress calculation
  const getAnnotatedCount = () => {
    if (!dataItems.length) return 0

    const annotatedIds = new Set<string>()

    // Server side completion (original data)
    dataItems.forEach((item: TaskDataItemRecord) => {
      if (item.taskDataItemStatus === 'COMPLETED') {
        annotatedIds.add(item.dataItemId)
      }
    })

    // Remote statuses fetched by background API calls
    Object.entries(remoteStatuses).forEach(([id, status]) => {
      if (status === 'SUBMITTED' || status === 'APPROVED' || status === 'COMPLETED') {
        annotatedIds.add(id)
      }
    })

    // Local session submission
    sessionAnnotations.forEach((anno) => {
      if (anno.annotationStatus === 'SUBMITTED' || anno.annotationStatus === 'APPROVED') {
        annotatedIds.add(anno.dataitemId)
      }
    })

    return annotatedIds.size
  }

  const annotatedCount = getAnnotatedCount()
  const progressPercent = Math.round((annotatedCount / (dataItems.length || 1)) * 100)



  if (loading || !task) {
    return (
      <div className="py-32 flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <span className="text-gray-500 font-medium tracking-widest text-[10px] uppercase animate-pulse">
          Loading Task Details...
        </span>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="group flex items-center gap-2 border-gray-200"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">Back</span>
            </Button>
          )}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-[#111] tracking-tight">
              {task.taskName || 'Untitled Task'}
            </h1>
            <span className="text-gray-500 font-mono text-xs select-all">ID: {task.taskId}</span>
          </div>
        </div>
        {onStartLabeling && (
          <Button
            onClick={onStartLabeling}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">Start Labeling</span>
          </Button>
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left Column: Metrics and Info */}
        <div className="lg:col-span-12">
          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    Assignment
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#111] font-semibold text-sm">
                      {task.assignmentName || 'N/A'}
                    </span>
                    {isManager && (
                      <Badge 
                        onClick={() => setIsChangeDatasetModalOpen(true)}
                        variant="secondary"
                        className="cursor-pointer hover:bg-violet-100 text-[9px]"
                      >
                        Change
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-violet-600">{progressPercent}%</span>
                      <span className="text-gray-500">{annotatedCount} / {dataItems.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Created At
                  </div>
                  <div className="text-[#111] text-sm font-medium">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Full Width Table for Items */}
        <div className="lg:col-span-12 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-violet-500" />
            </div>
            <h2 className="text-lg font-bold text-[#111]">Task Data Items</h2>
            <Badge variant="secondary" className="font-mono">
              {dataItems.length}
            </Badge>
          </div>

          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-[10%] px-6">Preview</TableHead>
                  <TableHead className="w-[30%] px-6">Filename</TableHead>
                  <TableHead className="w-[15%] px-6">Format/Type</TableHead>
                  <TableHead className="w-[15%] px-6">Status</TableHead>
                  <TableHead className="w-[20%] px-6">Uploaded At</TableHead>
                  <TableHead className="w-[10%] px-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataItems.map((record: any, index: number) => {
                  const canonicalId = getCanonicalId(record)
                  const localAnno = sessionAnnotations.find(a => a.dataitemId === canonicalId)
                  const status = (
                    remoteStatuses[canonicalId] ||
                    localAnno?.annotationStatus ||
                    record.taskDataItemStatus ||
                    'NOT_STARTED'
                  ).toUpperCase()

                  const statusColors: Record<string, string> = {
                    'APPROVED': 'bg-violet-500',
                    'SUBMITTED': 'bg-emerald-500',
                    'COMPLETED': 'bg-emerald-500',
                    'REJECTED': 'bg-rose-500',
                    'NEEDS_EDITING': 'bg-rose-500',
                    'IN_PROGRESS': 'bg-amber-500',
                  }
                  
                  const statusTextColors: Record<string, string> = {
                    'APPROVED': 'text-violet-600',
                    'SUBMITTED': 'text-emerald-600',
                    'COMPLETED': 'text-emerald-600',
                    'REJECTED': 'text-rose-600',
                    'NEEDS_EDITING': 'text-rose-600',
                    'IN_PROGRESS': 'text-amber-600',
                  }

                  const dotColor = statusColors[status] || 'bg-gray-400'
                  const textColor = statusTextColors[status] || 'text-gray-500'

                  return (
                    <TableRow key={canonicalId || index} className="group hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-6">
                        <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center group-hover:border-violet-500/30 transition-all">
                          {record.dataItem.url || record.dataItem.previewUrl ? (
                            <img
                              src={record.dataItem.url || record.dataItem.previewUrl}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <span className="text-[#111] font-medium text-sm line-clamp-1" title={record.dataItem.fileName}>
                          {record.dataItem.fileName}
                        </span>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[9px] bg-blue-50 border-blue-100 text-blue-600">
                            {record.dataItem.fileFormat}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-violet-50 border-violet-100 text-violet-600">
                            {record.dataItem.dataType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>
                            {status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 text-gray-500 text-xs">
                        {record.dataItem.uploadedAt ? new Date(record.dataItem.uploadedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onItemClick?.(record, index)}
                          className="h-8 w-8 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {itemsError && (
              <div className="p-12 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2 opacity-50" />
                <p className="text-red-500 font-medium">{String(itemsError)}</p>
              </div>
            )}
            {!itemsLoading && dataItems.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                No items found for this task.
              </div>
            )}
          </Card>
        </div>

      </div>

      <ChangeDatasetModal
        open={isChangeDatasetModalOpen}
        assignmentId={task?.assignmentId || ''}
        projectId={task?.projectId || ''}
        currentDatasetId={task?.datasetId}
        onCancel={() => setIsChangeDatasetModalOpen(false)}
        onSuccess={() => {
          setIsChangeDatasetModalOpen(false)
          onRefresh?.()
        }}
      />


    </div>
  )
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!taskId) {
        setError('Task ID is missing.')
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const assignmentId = (location.state?.assignmentId || taskId || '') as string

        // 1. Fetch task details
        const tasksRes = await taskApi.getTasksByAssignmentId(assignmentId)
        const tasksData = tasksRes.data?.data || tasksRes.data || []

        let currentTask = Array.isArray(tasksData)
          ? tasksData.find((t: Task) => String(t.taskId || t.id) === String(taskId))
          : tasksData

        if (!currentTask && Array.isArray(tasksData) && tasksData.length > 0) {
          currentTask = tasksData[0]
        }

        if (!currentTask) {
          setError('Task not found.')
          setLoading(false)
          return
        }

        // 2. Resolve the real assignment ID from the task if needed
        const realAssignmentId = ((currentTask as Task).assignmentId || assignmentId) as string

        // 3. Fetch assignment details to get the name
        let assignmentName =
          (currentTask as Task).assignmentName ||
          (location.state as { assignmentName?: string })?.assignmentName
        if (!assignmentName && realAssignmentId) {
          try {
            const assignRes = await assignmentApi.getAssignmentById(realAssignmentId)
            const assignData = assignRes.data?.data || assignRes.data
            assignmentName = assignData.assignmentName || assignData.name || assignData.title
          } catch (e) {
            console.warn('Could not fetch assignment details for name:', e)
          }
        }

        setTask({
          ...currentTask,
          assignmentName: assignmentName || 'N/A'
        })
      } catch (err) {
        console.error('Failed to load task details:', err)
        setError('Failed to load task details from the server.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [taskId, location.state])

  const handleStartLabeling = () => {
    if (!taskId) return
    const savedIndex = localStorage.getItem(`annotation_index_${taskId}`)
    const startIndex = savedIndex !== null ? parseInt(savedIndex) : 0
    navigate(`/annotator/task/${taskId}/annotate`, {
      state: { startIndex, assignmentId: task?.assignmentId }
    })
  }

  const handleItemClick = (_item: TaskDataItemRecord, index: number) => {
    navigate(`/annotator/task/${taskId}/annotate`, {
      state: { startIndex: index, assignmentId: task?.assignmentId }
    })
  }

  if (error || (!task && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-screen bg-white">
        <AlertCircle className="text-red-500 w-12 h-12 opacity-80" />
        <span className="text-red-500 font-bold tracking-tight text-xl">{error || 'Task not found.'}</span>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="rounded-xl px-8"
        >
          Go Back
        </Button>
      </div>

    )
  }

  return (
    <TaskDetail
      task={
        task
          ? {
            ...task,
            taskId: String(task.taskId || task.id),
            taskName: String(task.taskName || task.name || 'Untitled Task')
          }
          : null
      }
      loading={loading}
      onItemClick={handleItemClick}
      onBack={() => navigate(-1)}
      onStartLabeling={handleStartLabeling}
      onRefresh={() => {
        window.location.reload()
      }}
    />
  )
}

