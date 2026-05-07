import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, Button } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons'

import assignmentApi from '@/services/AssignmentApi'
import taskApi from '@/services/TaskApi'
import { TasksSection } from '@/features/tasks'
import AnnotatorDatasetDetailPage from '@/pages/annotator/AnnotatorDatasetDetailPage'


interface AssignmentTask {
  id: string
  name: string
  taskStatus: string
  annotationStatus: string
  batchLabel: string
  timeTaken: string
  [key: string]: string | number | boolean | undefined | object | null
}

interface Assignment {
  id: string
  name: string
  status: string
  description: string
  projectId: string
  datasetId?: string
  dueDate?: string
  deadline?: string
  completedTasks: number
  totalTasks: number
  tasks: AssignmentTask[]
  updatedAt?: string
}

export default function AnnotatorAssignmentDetailPage() {
  const { projectId, assignmentId: paramAssignmentId } = useParams<{ projectId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Support both param and search param for flexibility
  const assignmentId = paramAssignmentId || searchParams.get('assignmentId')

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!assignmentId || assignmentId.startsWith('ASGN-MOCK')) {
        setError('Invalid assignment ID.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 1. Lấy thông tin Assignment
        const assignRes = await assignmentApi.getAssignmentById(assignmentId)
        const assignmentData = assignRes.data?.data || assignRes.data

        // 2. Lấy thông tin Tasks
        let rawTasks = Array.isArray(assignmentData.tasks) ? assignmentData.tasks : []
        if (rawTasks.length === 0) {
          try {
            const apiId = assignmentData.assignmentId || assignmentData.id || assignmentId
            const tRes = await taskApi.getTasksByAssignmentId(apiId)
            rawTasks = tRes.data?.data || tRes.data || []
          } catch (e) {
            console.warn('Failed to fetch tasks for assignment detail', e)
          }
        }

        const actualTasks = rawTasks.filter((t: Record<string, unknown>) => {
          const status = String(t.taskStatus || t.status || t.assignmentStatus || '').toUpperCase()
          return status !== 'INACTIVE' && status !== 'DELETED'
        })

        const calcCompleted = actualTasks.filter(
          (t: Record<string, unknown>) =>
            t.taskStatus === 'COMPLETED' ||
            ['submitted', 'approved'].includes(String(t.annotationStatus).toLowerCase())
        ).length

        const normAssignment: Assignment = {
          ...assignmentData,
          id: assignmentData.assignmentId || assignmentData.id,
          name: assignmentData.assignmentName || assignmentData.name || assignmentData.title,
          status: assignmentData.assignmentStatus || assignmentData.status || 'PENDING',
          description: assignmentData.descriptionAssignment || assignmentData.description,
          projectId: assignmentData.projectId || assignmentData.project?.projectId || assignmentData.project?.id,
          tasks: actualTasks,
          completedTasks: actualTasks.length > 0 ? calcCompleted : (assignmentData.completedTasks ?? 0),
          totalTasks: actualTasks.length > 0 ? actualTasks.length : assignmentData.totalTasks || 0
        }

        setAssignment(normAssignment)
      } catch (err) {
        console.error('Failed to fetch assignment details:', err)
        setError('Failed to load assignment details.')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignmentData()
  }, [assignmentId])

  const [datasetName, setDatasetName] = useState<string>('')
  const [datasetIdState, setDatasetIdState] = useState<string | null>(null)

  useEffect(() => {
    const fetchDatasetInfo = async () => {
      if (assignment?.id) {
        try {
          const res = await assignmentApi.getDatasetByAssignmentId(assignment.id)
          const ds = res.data?.data || res.data
          if (ds) {
            setDatasetName(ds.datasetName || ds.name || '')
            setDatasetIdState(ds.datasetId || ds.id || null)
          }
        } catch (e) {
          console.warn('Failed to fetch dataset info by assignment id', e)
        }
      }
    }
    fetchDatasetInfo()
  }, [assignment?.id])

  const deadlineStr =
    assignment?.dueDate || assignment?.deadline || assignment?.updatedAt || new Date().toISOString()

  const daysLeft = useMemo(() => {
    const diff = new Date(deadlineStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [deadlineStr])

  const handleBack = () => {
    if (searchParams.get('assignmentId')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('assignmentId')
        return next
      })
    } else {
      navigate(`/annotator/projects/${projectId}/assignments`)
    }
  }

  if (loading && !assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
        <span className="mt-4 text-violet-400 font-mono tracking-widest text-xs uppercase animate-pulse">
          Loading Assignment Details...
        </span>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="p-8">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="text-gray-500 hover:text-[#111] mb-6 bg-white/5"
          onClick={handleBack}
        >
          Back to Assignments
        </Button>
        <div className="text-center text-gray-500 py-20 bg-[#1A1625]/40 rounded-2xl border-2 border-dashed border-gray-200">
          <span className="material-symbols-outlined text-5xl mb-4 opacity-20">assignment_late</span>
          <p className="font-medium">{error || 'Assignment not found.'}</p>
        </div>
      </div>
    )
  }

  const viewDatasetId = searchParams.get('datasetId')
  if (viewDatasetId) {
    return <AnnotatorDatasetDetailPage />
  }

  const progress = assignment.totalTasks > 0 ? Math.round((assignment.completedTasks / assignment.totalTasks) * 100) : 0

  return (
    <div className="relative overflow-hidden min-h-screen animate-fade-in pr-2">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[18px] text-violet-400">assignment</span>
                <span className="text-xs font-mono text-violet-400 tracking-widest uppercase">
                  Assignment Detail
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#111] tracking-tight">{assignment.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-6 relative z-10">

        {/* Top Row: Main Info (2 columns) */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row items-stretch border border-gray-200 bg-[#1A1625]/60 backdrop-blur-md">
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
                  {assignment.id}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Status</label>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-widest`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse`} />
                  {assignment.status || 'ACTIVE'}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Deadline</label>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border text-[10px] font-bold uppercase tracking-wider ${daysLeft <= 2 ? 'border-red-500/30 text-red-400' : daysLeft <= 5 ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'}`}
                >
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Deadline passed'}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Progress</label>
                  <span className="text-xs font-mono text-violet-400">{assignment.completedTasks}/{assignment.totalTasks} tasks ({progress}%)</span>
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
            <div className="flex-1 bg-white/5 p-5 rounded-2xl border border-gray-300 min-h-[120px]">
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {assignment.description || 'No description provided for this assignment.'}
              </p>
            </div>
          </div>
        </div>

        {/* Middle Row: Project & Dataset (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Associated Project */}
          <div className="glass-panel border border-gray-200 bg-[#1A1625]/60 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-400">folder_special</span>
              Associated Project
            </h3>
            {assignment.projectId ? (
              <div
                className="bg-white/5 p-5 rounded-xl border border-gray-300 hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer group"
                onClick={() => navigate(`/annotator/projects/${assignment.projectId}`)}
              >
                <h4 className="text-[#111] font-bold group-hover:text-blue-400 transition-colors">
                  {assignment.projectId}
                </h4>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">visibility</span>
                  Click to view project details
                </p>
              </div>
            ) : (
              <div className="bg-white/5 p-5 rounded-xl border border-gray-200 text-center italic text-gray-500">
                No associated project
              </div>
            )}
          </div>

          {/* Assigned Dataset */}
          <div className="glass-panel border border-gray-200 bg-[#1A1625]/60 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-fuchsia-400">database</span>
                Assigned Dataset
              </h3>
            </div>
            {datasetName ? (
              <div
                className="bg-white/5 p-5 rounded-xl border border-gray-300 hover:border-fuchsia-500/50 hover:bg-white/10 transition-all cursor-pointer group"
                onClick={() => {
                  setSearchParams(prev => {
                    const next = new URLSearchParams(prev)
                    next.set('datasetId', datasetIdState || assignment.datasetId || '')
                    return next
                  })
                }}
              >
                <h4 className="text-[#111] font-bold group-hover:text-fuchsia-400 transition-colors">
                  {datasetName}
                </h4>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">visibility</span>
                  Click to view dataset details
                </p>
              </div>
            ) : (
              <div className="bg-white/5 p-5 rounded-xl border border-gray-200 text-center italic text-gray-500">
                {datasetIdState || assignment.datasetId || 'No assigned dataset'}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Tasks (Full Width) */}
        <div className="glass-panel border border-gray-200 bg-[#1A1625]/60 backdrop-blur-md rounded-2xl p-7 flex flex-col shadow-xl">
          <TasksSection
            tasks={assignment.tasks}
            assignmentId={assignment.id}
            role="annotator"
          />

        </div>
      </div>
    </div>
  )
}

