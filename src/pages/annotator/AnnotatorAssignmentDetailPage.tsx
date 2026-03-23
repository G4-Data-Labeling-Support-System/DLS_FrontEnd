import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Button } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons'

import assignmentApi from '@/api/AssignmentApi'
import taskApi from '@/api/TaskApi'
import { AssignmentHeader, TasksSection } from '@/features/annotator'
import { themeClasses } from '@/styles'

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
  completedTasks: number
  totalTasks: number
  tasks: AssignmentTask[]
}

export default function AnnotatorAssignmentDetailPage() {
  const { projectId, assignmentId } = useParams<{ projectId: string; assignmentId: string }>()
  const navigate = useNavigate()

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

        const actualTasks = rawTasks.filter((t: any) => {
           const status = String(t.taskStatus || t.status || t.assignmentStatus || '').toUpperCase()
           return status !== 'INACTIVE' && status !== 'DELETED'
        })
        
        const calcCompleted = actualTasks.filter(
           (t: any) =>
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

  if (loading && !assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
        <span className="mt-4 text-violet-400 font-mono">Loading Assignment...</span>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="p-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          className="text-gray-400 hover:text-white mb-6"
          onClick={() => navigate(`/annotator/projects/${projectId}`)}
        >
          Back to Project Detail
        </Button>
        <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
          {error || 'Assignment not found.'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        className="text-gray-400 hover:text-white mb-6"
        onClick={() => navigate(`/annotator/projects/${projectId}`)}
      >
        Back to Project Detail
      </Button>

      {/* Tái sử dụng Layout cũ cho Assignment */}
      <div className="rounded-2xl grid md:grid-cols-2 sm:grid-cols-1 gap-6">
        <AssignmentHeader assignment={assignment} />
        {/* Placeholder for GuidelineSection if needed */}
        <div className="hidden md:block"></div>
        <div className={`${themeClasses.backgrounds.card} border ${themeClasses.borders.violet10} rounded-2xl p-6 md:col-span-2`}>
           <TasksSection 
             tasks={assignment.tasks} 
             assignmentId={assignment.id} 
           />
        </div>
      </div>
    </div>
  )
}
