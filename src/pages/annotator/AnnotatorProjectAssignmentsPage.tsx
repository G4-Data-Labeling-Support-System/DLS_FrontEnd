import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, Button, Typography, Space, Select, Input, Empty } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons'

import { useAuthStore } from '@/store/auth.store'
import assignmentApi, { type GetAssignmentsParams } from '@/api/AssignmentApi'
import { AssignmentCard } from '@/features/manager/components/dashboard/AssignmentCard'
import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'
import AnnotatorAssignmentDetailPage from './AnnotatorAssignmentDetailPage'

const { Title } = Typography

interface RawAssignment extends GetAssignmentsParams {
  project?: {
    projectId?: string
    id?: string
  }
}

export default function AnnotatorProjectAssignmentsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedAssignmentId = searchParams.get('assignmentId')

  const [assignments, setAssignments] = useState<GetAssignmentsParams[]>([])
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

        const assignRes = await assignmentApi.getAssignmentsByAnnotator(user.id)
        const rawList = assignRes.data?.data || assignRes.data || []

        const projectAssigns = (rawList as RawAssignment[])
          .filter((a) => (a.projectId || a.project?.projectId || a.project?.id) === projectId)
          .map((a) => ({
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

  const filteredAssignments = assignments
    .filter((a) => {
      const status = (a.status || '').toUpperCase()
      return status !== 'CANCELLED' && status !== 'INACTIVE'
    })
    .filter((a) =>
      !searchText || (a.assignmentName && a.assignmentName.toLowerCase().includes(searchText.toLowerCase()))
    )
    .filter((a) => statusFilter === 'ALL' || (a.status && a.status.toUpperCase() === statusFilter))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

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
        className="text-gray-400 hover:text-white mb-6"
        onClick={() => navigate(`/annotator/projects/${projectId}`)}
      >
        Back to Projects
      </Button>

      {/* Tabs Menu */}
      {projectId && <AnnotatorProjectTabs projectId={projectId} activeTab="assignment" />}

      {selectedAssignmentId ? (
        <div className="mt-0">
          <AnnotatorAssignmentDetailPage />
        </div>
      ) : (
        <>
          {/* Header with Filters */}
          <div className="flex justify-between items-center mb-6 mt-0">
            <Title level={4} className="!text-white !m-0 !font-display">
              Project Assignments
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
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64"
              />
            </Space>
          </div>

          {/* Tab Content */}
          <div className="mt-0">
            {loading && assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
                <span className="mt-4 text-violet-400 font-mono">Loading Assignments...</span>
              </div>
            ) : error ? (
              <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
                {error}
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredAssignments.map((a, idx) => (
                  <AssignmentCard
                    key={a.assignmentId || idx}
                    {...a}
                    onClick={() => handleAssignmentClick(a.assignmentId || a.id || '')}
                  />
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-gray-500">No assignments found matching your filters.</span>}
                className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
