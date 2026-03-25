import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import assignmentApi from '@/api/AssignmentApi'
import { ReviewerProjectTabs } from '@/features/reviewer/components/ReviewerProjectTabs'
import { AssignmentCard } from '@/features/reviewer/components/AssignmentCard'
import { Spin, Empty, Button } from 'antd'
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons'

export default function ReviewerProjectAssignmentsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user?.id || !projectId) return

        const res = await assignmentApi.getAssignmentsByReviewer(user.id)
        const allAssigns = res.data?.data || res.data || []
        
        // Filter by projectId
        const projectAssigns = allAssigns.filter((a: any) => {
          const pId = a.projectId || a.project?.projectId || a.project?.id
          return String(pId) === String(projectId)
        }).map((a: any) => ({
          ...a,
          id: a.assignmentId || a.id,
          name: a.assignmentName || a.name || a.title,
          status: a.assignmentStatus || a.status,
          description: a.descriptionAssignment || a.description
        }))

        setAssignments(projectAssigns)
      } catch (err) {
        console.error('Failed to fetch assignments for reviewer:', err)
        setError('Failed to load assignments.')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [user?.id, projectId])

  return (
    <div className="p-6">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="text-gray-400 hover:text-white mb-6"
        onClick={() => navigate('/reviewer/projects')}
      >
        Back to Projects
      </Button>

      {projectId && <ReviewerProjectTabs projectId={projectId} activeTab="assignment" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
          <span className="mt-4 text-violet-400 font-mono animate-pulse">Loading assignments...</span>
        </div>
      ) : error ? (
        <div className="text-center text-gray-400 py-20 glass-panel rounded-xl border border-dashed border-gray-700">
          {error}
        </div>
      ) : assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              id={a.id}
              name={a.name}
              status={a.status}
              completedTasks={a.completedTasks || 0}
              totalTasks={a.totalTasks || 0}
              description={a.description}
              onClick={() => navigate(`/reviewer/projects/${projectId}/assignments/${a.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-xl border border-dashed border-gray-700">
          <Empty description={<span className="text-gray-400">No assignments found for this project.</span>} />
        </div>
      )}
    </div>
  )
}
