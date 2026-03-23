import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Button } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons'

import { useAuthStore } from '@/store/auth.store'
import assignmentApi, { type GetAssignmentsParams } from '@/api/AssignmentApi'
import { AssignmentCard } from '@/features/manager/components/dashboard/AssignmentCard'
import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'

export default function AnnotatorProjectAssignmentsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [assignments, setAssignments] = useState<GetAssignmentsParams[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!projectId || !user?.id) return

      try {
        setLoading(true)
        setError(null)

        const assignRes = await assignmentApi.getAssignmentsByAnnotator(user.id)
        const rawList = assignRes.data?.data || assignRes.data || []
        
        const projectAssigns = rawList
          .filter((a: any) => (a.projectId || a.project?.projectId || a.project?.id) === projectId)
          .map((a: any) => ({
             ...a,
             id: a.assignmentId || a.id,
             assignmentName: a.assignmentName || a.name || `Assignment ${a.assignmentId?.split('-').pop() || ''}`,
             status: a.assignmentStatus || a.status || 'PENDING'
          }))

        setAssignments(projectAssigns)
      } catch (err) {
        console.error('Failed to fetch assignments:', err)
        setError('Failed to load assignments.')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [projectId, user?.id])

  if (loading && assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
        <span className="mt-4 text-violet-400 font-mono">Loading Assignments...</span>
      </div>
    )
  }

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

      {/* Tabs Menu */}
      {projectId && <AnnotatorProjectTabs projectId={projectId} activeTab="assignment" />}

      {/* Tab Content */}
      <div className="mt-6">
        {error ? (
          <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
            {error}
          </div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments
              .filter((a) => {
                 const status = (a.assignmentStatus || a.status || '').toUpperCase()
                 return status !== 'CANCELLED' && status !== 'INACTIVE'
              })
              .map((a, idx) => (
                <AssignmentCard
                  key={a.assignmentId || idx}
                  {...a}
                  onClick={() => navigate(`/annotator/projects/${projectId}/assignments/${a.assignmentId || a.id}`)}
                />
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
            No assignments found for this project.
          </div>
        )}
      </div>
    </div>
  )
}
