import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, Button, Typography, Space, Select, Input, Empty } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons'

import { useAuthStore } from '@/store/auth.store'
import assignmentApi from '@/services/AssignmentApi'
import { AssignmentCard } from '@/features/reviewer/components/AssignmentCard'
import { ReviewerProjectTabs } from '@/features/reviewer/components/ReviewerProjectTabs'
import ReviewerAssignmentDetailPage from './ReviewerAssignmentDetailPage'

const { Title } = Typography

interface Assignment {
  id: string
  assignmentId?: string
  name: string
  status: string
  assignmentStatus?: string
  projectId?: string
  project?: { projectId?: string; id?: string }
  createdAt?: string
  completedTasks: number
  totalTasks: number
  description?: string
  [key: string]: unknown
}

export default function ReviewerProjectAssignmentsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedAssignmentId = searchParams.get('assignmentId')

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!projectId || !user?.id) return

      try {
        setLoading(true)
        setError(null)

        const assignRes = await assignmentApi.getAssignmentsByReviewer(user.id)
        const rawList = assignRes.data?.data || assignRes.data || []

        const projectAssigns = rawList
          .filter((a: Record<string, any>) => (a.projectId || a.project?.projectId || a.project?.id) === projectId)
          .map((a: Record<string, any>) => ({
            ...a,
            id: String(a.assignmentId || a.id),
            name: String(a.assignmentName || a.name || `Review Assignment ${String(a.assignmentId || '').split('-').pop() || ''}`),
            status: String(a.assignmentStatus || a.status || 'PENDING'),
            completedTasks: Number(a.completedTasks ?? 0),
            totalTasks: Number(a.totalTasks ?? 0)
          })) as Assignment[]

        setAssignments(projectAssigns)
      } catch (err) {
        console.error('Failed to fetch assignments for reviewer:', err)
        setError('Failed to load assignments.')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [projectId, user?.id])

  const filteredAssignments = assignments
    .filter((a) => {
      const status = (a.status || '').toUpperCase()
      return status !== 'CANCELLED' && status !== 'INACTIVE'
    })
    .filter((a) =>
      !searchText || (a.name && a.name.toLowerCase().includes(searchText.toLowerCase()))
    )
    .filter((a) => statusFilter === 'ALL' || (a.status && a.status.toUpperCase() === statusFilter))
    .sort((a, b) => new Date((b.createdAt as string) || 0).getTime() - new Date((a.createdAt as string) || 0).getTime())

  const handleAssignmentClick = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('assignmentId', id)
      return next
    })
  }

  return (
    <div className="p-6">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="text-gray-500 hover:text-[#111] mb-6"
        onClick={() => navigate(`/reviewer/projects`)}
      >
        Back to Projects
      </Button>

      {projectId && <ReviewerProjectTabs projectId={projectId} activeTab="assignment" />}

      {selectedAssignmentId ? (
        <div className="mt-0">
          <ReviewerAssignmentDetailPage />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 mt-0">
            <Title level={4} className="!text-[#111] !m-0 !font-display">
              Project Assignments for Review
            </Title>
            <Space>
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                className="w-40"
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ASSIGNED', label: 'Assigned' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                   { value: 'REVIEWING', label: 'Reviewing' },
                  { value: 'COMPLETED', label: 'Completed' }
                ]}
              />
              <Input
                placeholder="Search assignments..."
                prefix={<SearchOutlined className="text-gray-500" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-[#1A1625] border-gray-700 text-[#111] w-64"
              />
            </Space>
          </div>

          <div className="mt-0">
            {loading && assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
                <span className="mt-4 text-violet-400 font-mono">Loading Assignments...</span>
              </div>
            ) : error ? (
              <div className="text-center text-gray-500 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
                {error}
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredAssignments.map((a) => (
                  <AssignmentCard
                    key={a.id}
                    id={a.id}
                    name={a.name}
                    status={a.status}
                    completedTasks={a.completedTasks}
                    totalTasks={a.totalTasks}
                    description={String(a.descriptionAssignment || a.description || '')}
                    onClick={() => handleAssignmentClick(a.id)}
                  />
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-gray-500">No review assignments found.</span>}
                className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

