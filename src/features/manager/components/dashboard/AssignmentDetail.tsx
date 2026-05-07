import React, { useEffect, useState } from 'react'
import { App, Spin, Button, Dropdown } from 'antd'
import { EditOutlined, DownloadOutlined } from '@ant-design/icons'
import assignmentApi, { type GetAssignmentsParams } from '@/services/AssignmentApi'
import taskApi from '@/services/TaskApi'
import projectApi from '@/services/ProjectApi'
import datasetApi from '@/services/DatasetApi'
import { ProjectDetail } from './ProjectDetail'
import { DatasetDetail } from '../dataset/DatasetDetail'
import { TaskDetail } from '@/pages/annotator/TaskDetailPage'
import { ChangeDatasetModal } from '../dataset/ChangeDatasetModal'
import { useInvalidateAssignments } from '@/features/manager/hooks/useProjectDetail'
import { useAuthStore } from '@/store'
import { useSearchParams } from 'react-router-dom'
import { themeClasses } from '@/styles'

interface AssignmentDetailProps {
  assignmentId: string
  onBack: () => void
  onEdit?: (assignment: GetAssignmentsParams) => void
}

interface Task {
  taskId: string
  completedCount?: number
  createdAt?: string
  taskName?: string
  reviewStatus?: string
  taskStatus?: string
  status?: string
  taskType?: string
  assignmentId?: string
  [key: string]: unknown
}

export const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  assignmentId,
  onBack,
  onEdit
}) => {
  const { message } = App.useApp()
  const [assignment, setAssignment] = useState<GetAssignmentsParams | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [datasetName, setDatasetName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState<boolean>(false)
  const [isChangeDatasetModalOpen, setIsChangeDatasetModalOpen] = useState(false)
  const invalidateAssignments = useInvalidateAssignments()
  const { user } = useAuthStore()

  const isManager =
    user?.role?.toLowerCase().includes('manager') ||
    user?.role?.toLowerCase().includes('admin') ||
    user?.userRole?.toLowerCase().includes('manager') ||
    user?.userRole?.toLowerCase().includes('admin')

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1)
  const [searchParams, setSearchParams] = useSearchParams()

  const viewProjectId = searchParams.get('viewProjectId')
  const viewDatasetId = searchParams.get('viewDatasetId')
  const viewTaskId = searchParams.get('viewTaskId')

  const setViewProjectId = (id: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) {
        next.set('viewProjectId', id)
      } else {
        next.delete('viewProjectId')
      }
      return next
    })
  }

  const setViewDatasetId = (id: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) {
        next.set('viewDatasetId', id)
      } else {
        next.delete('viewDatasetId')
      }
      return next
    })
  }

  const setViewTaskId = (id: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) {
        next.set('viewTaskId', id)
      } else {
        next.delete('viewTaskId')
      }
      return next
    })
  }

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const response = await assignmentApi.getAssignmentById(assignmentId)
        const data = response.data?.data || response.data

        if (data && isMounted) {
          const extractedProjectId = data.projectId || data.project?.id || data.project?.projectId
          const extractedDatasetId = data.datasetId || data.dataset?.id || data.dataset?.datasetId

          setAssignment({
            assignmentId: String(data.assignmentId || data.id),
            assignmentName: String(data.assignmentName || data.name || ''),
            status: String(data.status || data.assignmentStatus || ''),
            description: data.description
              ? String(data.description)
              : data.descriptionAssignment
                ? String(data.descriptionAssignment)
                : undefined,
            projectId: extractedProjectId ? String(extractedProjectId) : undefined,
            datasetId: extractedDatasetId ? String(extractedDatasetId) : undefined,
            createdAt: data.createdAt ? String(data.createdAt) : undefined,
            updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
            assignedTo:
              data.assignedTo || data.user_id || data.annotatorId
                ? String(data.assignedTo || data.user_id || data.annotatorId)
                : undefined,
            reviewedBy:
              data.reviewedBy || data.reviewerId
                ? String(data.reviewedBy || data.reviewerId)
                : undefined,
            dueDate:
              data.dueDate || data.due_date ? String(data.dueDate || data.due_date) : undefined,
            assignedBy:
              data.assignedBy || data.creatorId
                ? String(data.assignedBy || data.creatorId)
                : undefined
          })

          // Fetch associated project name if projectId exists
          if (extractedProjectId) {
            try {
              const projRes = await projectApi.getProjectById(extractedProjectId)
              const projData = projRes.data?.data || projRes.data
              if (projData && isMounted) {
                setProjectName(String(projData.projectName || projData.name || extractedProjectId))
              }
            } catch (projErr) {
              console.error('Failed to fetch associated project details:', projErr)
            }
          }

          // Fetch associated dataset name if datasetId exists
          if (extractedDatasetId) {
            try {
              const dsRes = await datasetApi.getDatasetById(extractedDatasetId)
              const dsData = dsRes.data?.data || dsRes.data
              if (dsData && isMounted) {
                setDatasetName(String(dsData.datasetName || dsData.name || extractedDatasetId))
              }
            } catch (dsErr) {
              console.error('Failed to fetch associated dataset details:', dsErr)
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching assignment details:', error)
          message.error('Cannot load assignment details.')
          onBack() // Fallback to list if error
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const fetchTasks = async () => {
      try {
        setTasksLoading(true)
        const response = await taskApi.getTasksByAssignmentId(assignmentId)
        const rawData = (response.data?.data || response.data || []) as Record<string, unknown>[]
        if (isMounted && Array.isArray(rawData)) {
          const mappedTasks: Task[] = rawData
            .map((t) => ({
              ...t,
              taskId: String(t.taskId || t.id || '')
            }))
            .filter((t: unknown) => {
              const taskObj = t as Task
              const status = String(taskObj.taskStatus || taskObj.status || '').toUpperCase()
              return status !== 'INACTIVE' && status !== 'DELETED'
            }) as Task[]
          setTasks(mappedTasks)
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
        // We don't necessarily want to block the whole view if tasks fail,
        // but it's good to log it.
      } finally {
        if (isMounted) {
          setTasksLoading(false)
        }
      }
    }

    if (assignmentId) {
      fetchDetail()
      fetchTasks()
    }

    return () => {
      isMounted = false
    }
  }, [assignmentId, onBack, message, refreshTrigger])

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'processing'
      case 'COMPLETED':
        return 'success'
      case 'PAUSED':
        return 'warning'
      case 'ARCHIVE':
      case 'REJECTED':
      case 'INACTIVE':
        return 'error'
      case 'PENDING':
        return 'default'
      case 'IN_PROGRESS':
        return 'processing'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const handleExport = async (format: string) => {
    if (!assignment?.assignmentId) return

    try {
      setIsExporting(true)
      const res = await assignmentApi.exportAssignment(assignment.assignmentId, format.toLowerCase())
      
      const blob = new Blob([res.data], { type: res.headers?.['content-type'] || 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${assignment.assignmentName || 'export'}_${format}_${Date.now()}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      message.success(`Assignment exported in ${format} format successfully!`)
    } catch (error) {
      const err = error as any
      console.error('Export failed', err)
      let errorMessage = 'Failed to export assignment. Please try again.'
      
      if (err.response?.data instanceof Blob && err.response.data.type === 'application/json') {
        try {
          const text = await err.response.data.text()
          const errorData = JSON.parse(text)
          if (errorData.code === 'ASSIGNMENT_NOT_COMPLETE_TO_EXPORT' || errorData.errorCode === 'ASSIGNMENT_NOT_COMPLETE_TO_EXPORT') {
            errorMessage = 'Assignment is not complete to export'
          } else if (errorData.code === 'ANNOTATION_MIXED_TYPE_NOT_SUPPORTED' || errorData.errorCode === 'ANNOTATION_MIXED_TYPE_NOT_SUPPORTED') {
            errorMessage = 'Cannot export to yolo because annotation has also bounding box and polygon'
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (e) {
          console.error('Failed to parse error blob', e)
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      message.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="w-full text-center py-10 text-gray-500">
        Error loading assignment information.
      </div>
    )
  }

  if (viewProjectId) {
    return (
      <ProjectDetail
        projectId={viewProjectId}
        onBack={() => setViewProjectId(null)}
      />
    )
  }

  if (viewDatasetId) {
    return <DatasetDetail datasetId={viewDatasetId} onBack={() => setViewDatasetId(null)} />
  }

  if (viewTaskId) {
    const selectedTask = tasks.find((t) => String(t.taskId) === String(viewTaskId))
    if (selectedTask) {
      return (
        <TaskDetail
          task={{
            ...selectedTask,
            assignmentName: assignment.assignmentName
          }}
          loading={false}
          onBack={() => setViewTaskId(null)}
          onRefresh={handleRefresh}
        />
      )
    }

    if (tasksLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Spin size="large" />
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
            Loading Task Details...
          </p>
        </div>
      )
    }
  }

  const completedTasks = tasks.filter(
    (t) => t.taskStatus?.toUpperCase() === 'COMPLETED' || t.status?.toUpperCase() === 'COMPLETED'
  ).length
  const totalTasks = tasks.length || Number(assignment.totalItems) || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="relative overflow-hidden min-h-[600px] animate-fade-in pr-2">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-violet-400">assignment</span>
              <span className="text-xs font-mono text-violet-400 tracking-widest uppercase">
                Assignment Detail
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#111] tracking-tight">{assignment.assignmentName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Dropdown
              menu={{
                items: [
                  { key: 'YOLO', label: 'YOLO Format', onClick: () => handleExport('YOLO') },
                  { key: 'COCO', label: 'COCO Format', onClick: () => handleExport('COCO') },
                  { key: 'JSON', label: 'JSON Format', onClick: () => handleExport('JSON') },
                ]
              }}
              trigger={['click']}
              disabled={isExporting}
            >
              <Button
                className="bg-transparent border border-violet-500/30 text-violet-400 hover:text-[#111] hover:border-violet-500 rounded-xl font-medium shadow-[0_0_20px_rgba(139,92,246,0.1)] h-10 px-6 transition-all"
                icon={<DownloadOutlined />}
                loading={isExporting}
              >
                Export
              </Button>
            </Dropdown>
            {onEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                className="bg-violet-600 hover:bg-violet-500 border-none shadow-[0_0_20px_rgba(139,92,246,0.3)] h-10 px-6 rounded-xl transition-all"
                onClick={() => onEdit(assignment)}
              >
                Edit Assignment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-6 relative z-10">

        {/* Top Row: Main Info (2 columns) */}
        <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row items-stretch`}>
          {/* Left: Information */}
          <div className="flex-1 p-7 border-b md:border-b-0 md:border-r border-gray-300 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-violet-500/5 blur-[50px] pointer-events-none" />
            <h3 className="text-lg font-semibold text-[#111] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-violet-400">info</span>
              Assignment Information
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Assignment ID</label>
                <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded border border-violet-500/20">
                  {assignment.assignmentId}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Status</label>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-${getStatusColor(assignment.status) === 'success' ? 'emerald' : getStatusColor(assignment.status) === 'warning' ? 'orange' : getStatusColor(assignment.status) === 'error' ? 'red' : 'violet'}-500/10 border border-${getStatusColor(assignment.status) === 'success' ? 'emerald' : getStatusColor(assignment.status) === 'warning' ? 'orange' : getStatusColor(assignment.status) === 'error' ? 'red' : 'violet'}-500/20 text-[10px] font-bold text-${getStatusColor(assignment.status) === 'success' ? 'emerald' : getStatusColor(assignment.status) === 'warning' ? 'orange' : getStatusColor(assignment.status) === 'error' ? 'red' : 'violet'}-400 uppercase tracking-widest`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-${getStatusColor(assignment.status) === 'success' ? 'emerald' : getStatusColor(assignment.status) === 'warning' ? 'orange' : getStatusColor(assignment.status) === 'error' ? 'red' : 'violet'}-400 animate-pulse`} />
                  {assignment.status || 'UNKNOWN'}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Created At</label>
                <span className="text-sm text-gray-600">{formatDate(assignment.createdAt)}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Progress</label>
                  <span className="text-xs font-mono text-violet-400">{completedTasks}/{totalTasks} tasks ({progress}%)</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Description */}
          <div className="flex-1 p-7 flex flex-col relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-fuchsia-500/5 blur-[50px] pointer-events-none" />
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-fuchsia-400">description</span>
              Description
            </h3>
            <div className="flex-1 bg-black/20 p-5 rounded-2xl border border-gray-200 min-h-[120px]">
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {assignment.description || 'No description provided for this assignment.'}
              </p>
            </div>
          </div>
        </div>

        {/* Middle Row: Project & Dataset (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Associated Project */}
          <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-400">folder_special</span>
              Associated Project
            </h3>
            {assignment.projectId ? (
              <div
                className="bg-black/20 p-5 rounded-xl border border-gray-300 hover:border-blue-500/50 hover:bg-black/30 transition-all cursor-pointer group"
                onClick={() => setViewProjectId(assignment.projectId || null)}
              >
                <h4 className="text-[#111] font-bold group-hover:text-blue-400 transition-colors">
                  {projectName || `Project ID: ${assignment.projectId}`}
                </h4>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">visibility</span>
                  Click to view project details
                </p>
              </div>
            ) : (
              <div className="bg-black/20 p-5 rounded-xl border border-gray-200 text-center italic text-gray-500">
                No associated project
              </div>
            )}
          </div>

          {/* Assigned Dataset */}
          <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-6 shadow-xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-fuchsia-400">database</span>
                Assigned Dataset
              </h3>
              {isManager && (
                <Button
                  type="link"
                  size="small"
                  className="text-fuchsia-400 hover:text-fuchsia-300 p-0 h-auto font-mono text-[10px] uppercase tracking-wider"
                  onClick={() => setIsChangeDatasetModalOpen(true)}
                >
                  Change
                </Button>
              )}
            </div>
            {assignment.datasetId ? (
              <div
                className="bg-black/20 p-5 rounded-xl border border-gray-300 hover:border-fuchsia-500/50 hover:bg-black/30 transition-all cursor-pointer group"
                onClick={() => setViewDatasetId(assignment.datasetId || null)}
              >
                <h4 className="text-[#111] font-bold group-hover:text-fuchsia-400 transition-colors">
                  {datasetName || `Dataset ID: ${assignment.datasetId}`}
                </h4>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">visibility</span>
                  Click to view dataset details
                </p>
              </div>
            ) : (
              <div className="bg-black/20 p-5 rounded-xl border border-gray-200 text-center italic text-gray-500">
                No assigned dataset
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Tasks (Full Width) */}
        <div className={`glass-panel border ${themeClasses.borders.violet10} rounded-2xl p-7 flex flex-col shadow-xl min-h-[400px]`}>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-[#111] flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-emerald-400">task</span>
              </span>
              Assignment Tasks
            </h3>
            <span className="text-xs font-mono bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400 font-medium tracking-tight">
              {tasks.length} tasks total
            </span>
          </div>

          {tasksLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Spin size="large" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-black/10">
              <span className="material-symbols-outlined text-gray-600 text-6xl mb-4 opacity-10">
                assignment_late
              </span>
              <p className="text-gray-500 text-base font-medium">No tasks found</p>
              <p className="text-gray-600 text-xs mt-2">Tasks will appear here once created.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
              {tasks.map((task) => (
                <div
                  key={task.taskId}
                  onClick={() => setViewTaskId(task.taskId)}
                  className="group bg-black/20 p-5 rounded-xl border border-gray-200 hover:border-emerald-500/50 hover:bg-black/30 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-2xl pointer-events-none" />
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-[#111] font-bold text-sm line-clamp-2 group-hover:text-emerald-400 transition-colors">
                        {task.taskName || 'Untitled Task'}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${task.taskStatus?.toUpperCase() === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-gray-500 tracking-wider">ID: {task.taskId}</span>
                      {task.createdAt && (
                        <span className="text-[10px] text-gray-600">
                          {new Date(task.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ChangeDatasetModal
        open={isChangeDatasetModalOpen}
        assignmentId={assignment.assignmentId || ''}
        projectId={assignment.projectId || ''}
        currentDatasetId={assignment.datasetId}
        onCancel={() => setIsChangeDatasetModalOpen(false)}
        onSuccess={() => {
          setIsChangeDatasetModalOpen(false)
          invalidateAssignments(assignment.projectId)
          handleRefresh()
        }}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}

