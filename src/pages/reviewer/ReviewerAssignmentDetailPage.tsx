import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, Button } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons'

import assignmentApi from '@/api/AssignmentApi'
import taskApi from '@/api/TaskApi'
import ReviewerDatasetDetailPage from '@/pages/reviewer/ReviewerDatasetDetailPage'
import ReviewerTasksSection, { type Task } from '@/features/reviewer/components/ReviewerTasksSection'

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
  tasks: Task[]
}

export default function ReviewerAssignmentDetailPage() {
  const { projectId, assignmentId: paramAssignmentId } = useParams<{ projectId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const assignmentId = paramAssignmentId || searchParams.get('assignmentId')

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [datasetName, setDatasetName] = useState<string>('')
  const [datasetIdState, setDatasetIdState] = useState<string | null>(null)

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

        const assignRes = await assignmentApi.getAssignmentById(assignmentId)
        const assignmentData = assignRes.data?.data || assignRes.data

        let rawTasks = Array.isArray(assignmentData.tasks) ? assignmentData.tasks : []
        if (rawTasks.length === 0) {
          try {
            const apiId = assignmentData.assignmentId || assignmentData.id || assignmentId
            const tRes = await taskApi.getTasksByAssignmentId(apiId)
            rawTasks = tRes.data?.data || tRes.data || []
          } catch (e) {
            console.warn('Failed to fetch tasks for reviewer assignment detail', e)
          }
        }

        const actualTasks = rawTasks.filter((t: Task) => {
          const status = String(t.taskStatus || t.status || t.reviewStatus || '').toUpperCase()
          return status !== 'INACTIVE' && status !== 'DELETED'
        })

        const calcCompleted = actualTasks.filter(
          (t: Task) =>
            ['COMPLETED', 'APPROVED'].includes(String(t.taskStatus || t.status || t.reviewStatus || '').toUpperCase()) ||
            ['submitted', 'approved'].includes(String(t.annotationStatus || '').toLowerCase())
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
        console.error('Failed to fetch assignment details for reviewer:', err)
        setError('Failed to load assignment details.')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignmentData()
  }, [assignmentId])

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

  const handleBack = () => {
    if (searchParams.get('assignmentId')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('assignmentId')
        return next
      })
    } else {
      navigate(`/reviewer/projects/${projectId}/assignments`)
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
          className="text-gray-400 hover:text-white mb-6 bg-white/5"
          onClick={handleBack}
        >
          Back to Assignments
        </Button>
        <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-2xl border-2 border-dashed border-white/5">
          <p className="font-medium">{error || 'Assignment not found.'}</p>
        </div>
      </div>
    )
  }

  const viewDatasetId = searchParams.get('datasetId')
  if (viewDatasetId) {
    return <ReviewerDatasetDetailPage />
  }

  const progress = assignment.totalTasks > 0 ? Math.round((assignment.completedTasks / assignment.totalTasks) * 100) : 0

  return (
    <div className="relative overflow-hidden min-h-screen animate-fade-in pr-2">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[18px] text-fuchsia-400">assignment</span>
              <span className="text-xs font-mono text-fuchsia-400 tracking-widest uppercase">
                Review Assignment Detail
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{assignment.name}</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 relative z-10">
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row items-stretch border border-white/5 bg-[#1A1625]/60 backdrop-blur-md">
          <div className="flex-1 p-7 border-b md:border-b-0 md:border-r border-white/10">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-violet-400">info</span>
              Review Information
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Assignment ID</label>
                <span className="text-xs font-mono text-violet-300">
                  {assignment.id}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Status</label>
                <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  {assignment.status}
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

          <div className="flex-1 p-7 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-fuchsia-400">description</span>
              Review Description
            </h3>
            <div className="flex-1 bg-white/5 p-5 rounded-2xl border border-white/10 min-h-[120px]">
              <p className="text-sm text-gray-300 leading-relaxed italic">
                {assignment.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel border border-white/5 bg-[#1A1625]/60 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-400">folder_special</span>
              Associated Project
            </h3>
            <div
              className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => navigate(`/reviewer/projects/${assignment.projectId}`)}
            >
              <h4 className="text-white font-bold">{assignment.projectId}</h4>
              <p className="text-xs text-gray-500 mt-2">View project guidelines & details</p>
            </div>
          </div>

          <div className="glass-panel border border-white/5 bg-[#1A1625]/60 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-fuchsia-400">database</span>
              Assigned Dataset
            </h3>
            {datasetName ? (
              <div
                className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-fuchsia-500/50 hover:bg-white/10 transition-all cursor-pointer group"
                onClick={() => {
                  setSearchParams(prev => {
                    const next = new URLSearchParams(prev)
                    next.set('datasetId', datasetIdState || assignment.datasetId || '')
                    return next
                  })
                }}
              >
                <h4 className="text-white font-bold group-hover:text-fuchsia-400 transition-colors">
                  {datasetName}
                </h4>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">visibility</span>
                  Click to view dataset details
                </p>
              </div>
            ) : (
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 text-center italic text-gray-500">
                {datasetIdState || assignment.datasetId || 'No assigned dataset'}
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel border border-white/5 bg-[#1A1625]/60 rounded-2xl p-7 shadow-xl">
          <ReviewerTasksSection
            tasks={assignment.tasks}
            assignmentId={assignment.id}
          />
        </div>
      </div>
    </div>
  )
}
