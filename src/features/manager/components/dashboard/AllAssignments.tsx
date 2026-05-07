import { useState } from 'react'
import { Space, Typography, Spin, App, Input, Select, Empty, Button } from 'antd'
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { AssignmentCard } from './AssignmentCard'
import { AssignmentDetail } from './AssignmentDetail'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import {
  useAllAssignments,
  useAssignmentsByProject,
  useInvalidateAssignments
} from '@/features/manager/hooks/useProjectDetail'
import assignmentApi, { type GetAssignmentsParams } from '@/services/AssignmentApi'

const { Title } = Typography

interface AllAssignmentsProps {
  selectedAssignmentId?: string | null
  onAssignmentSelect?: (id: string | null) => void
  onEdit?: (assignment: GetAssignmentsParams) => void
  projectId?: string
}

export const AllAssignments: React.FC<AllAssignmentsProps> = ({
  selectedAssignmentId,
  onAssignmentSelect,
  onEdit,
  projectId
}) => {
  const { message } = App.useApp()
  const { data: allAssignments = [], isLoading: loadingAll } = useAllAssignments({ enabled: !projectId })
  const { data: projectAssignments = [], isLoading: loadingProject } = useAssignmentsByProject(projectId || '')

  const assignments = projectId ? projectAssignments : allAssignments
  const loading = projectId ? loadingProject : loadingAll

  const invalidateAssignments = useInvalidateAssignments()

  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [internalAssignmentId, setInternalAssignmentId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null)
  const [deletingAssignmentName, setDeletingAssignmentName] = useState('')

  const currentAssignmentId =
    selectedAssignmentId !== undefined ? selectedAssignmentId : internalAssignmentId

  const handleAssignmentSelect = (id: string | null) => {
    if (onAssignmentSelect) {
      onAssignmentSelect(id)
    } else {
      setInternalAssignmentId(id)
    }
  }

  const handleDelete = (id?: string) => {
    if (!id) return
    const asn = assignments.find((a) => a.assignmentId === id)
    setDeletingAssignmentId(id)
    setDeletingAssignmentName(asn?.assignmentName || 'this assignment')
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingAssignmentId) return
    setDeleting(true)
    try {
      await assignmentApi.deleteAssignment(deletingAssignmentId)
      message.success('Assignment deleted successfully!')
      invalidateAssignments(projectId)
      setDeleteModalOpen(false)
      setDeletingAssignmentId(null)
      setDeletingAssignmentName('')
    } catch (error) {
      console.error('Delete assignment error:', error)
      message.error('An error occurred while deleting the assignment.')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = async (id?: string) => {
    if (!id) return
    try {
      const response = await assignmentApi.getAssignmentById(id)
      const data = response.data?.data || response.data
      if (data && onEdit) {
        // Map data similarly to AssignmentDetail or mapAssignment
        const mappedAsn: GetAssignmentsParams = {
          assignmentId: String(data.assignmentId || data.id || id),
          assignmentName: String(data.assignmentName || data.name || ''),
          status: String(data.assignmentStatus || data.status || ''),
          description: String(data.descriptionAssignment || data.description || ''),
          projectId: String(data.projectId || data.project?.id || data.project?.projectId || ''),
          datasetId: String(data.datasetId || data.dataset?.id || data.dataset?.datasetId || ''),
          assignedTo: String(data.assignedTo || data.user_id || data.annotatorId || ''),
          reviewedBy: String(data.reviewedBy || data.reviewerId || data.reviewer?.id || ''),
          dueDate: data.dueDate,
          assignedBy: String(data.assignedBy || data.creatorId || '')
        }
        onEdit(mappedAsn)
      }
    } catch (error) {
      console.error('Failed to fetch assignment detail for editing:', error)
      message.error('Failed to load assignment details for editing.')
    }
  }

  const filteredAssignments = assignments
    .filter(
      (a) =>
        !searchText || (a.assignmentName && a.assignmentName.toLowerCase().includes(searchText.toLowerCase()))
    )
    .filter((a) => statusFilter === 'ALL' || (a.status && a.status.toUpperCase() === statusFilter))
    .sort((a, b) => {
      const aIsInactive = a.status?.toUpperCase() === 'INACTIVE'
      const bIsInactive = b.status?.toUpperCase() === 'INACTIVE'

      if (aIsInactive && !bIsInactive) return 1
      if (!aIsInactive && bIsInactive) return -1

      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

  if (loading && !currentAssignmentId) {
    return (
      <div className="w-full flex justify-center py-10">
        <Spin size="large" />
      </div>
    )
  }

  if (currentAssignmentId) {
    return (
      <AssignmentDetail
        assignmentId={currentAssignmentId}
        onBack={() => handleAssignmentSelect(null)}
        onEdit={onEdit}
      />
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!text-[#111] !m-0 !font-display">
          All Assignments
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
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'INACTIVE', label: 'Inactive' }
            ]}
          />
          <Input
            placeholder="Search assignments..."
            prefix={<SearchOutlined className="text-gray-500" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#1A1625] border-gray-700 text-[#111] hover:border-violet-500 focus:border-violet-500 w-64"
          />
        </Space>
      </div>

      {filteredAssignments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No assignments created yet.</span>}
          className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 items-stretch">
          {filteredAssignments.map((a, index) => {
            const uniqueId = a.assignmentId || String(index)
            return (
              <AssignmentCard
                key={uniqueId}
                {...a}
                onClick={() => handleAssignmentSelect(uniqueId)}
                onEdit={() => handleEdit(uniqueId)}
                onDelete={() => handleDelete(uniqueId)}
              />
            )
          })}
        </div>
      )}

      <GlassModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false)
          setDeletingAssignmentId(null)
          setDeletingAssignmentName('')
        }}
        destroyOnHidden
        width={480}
      >
        <div className="px-8 pt-10 pb-8">
          <div className="text-center pb-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-red-500 text-2xl" />
              </div>
            </div>
            <h2 className="text-[#111] text-2xl font-bold tracking-tight mb-2 font-display">
              Deactivate Assignment
            </h2>
            <p className="text-[#111]/50 text-sm">
              Are you sure you want to deactivate{' '}
              <span className="text-[#111]/80 font-medium">{deletingAssignmentName}</span>? This
              action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => {
                setDeleteModalOpen(false)
                setDeletingAssignmentId(null)
                setDeletingAssignmentName('')
              }}
              className="border-gray-300 text-[#111]/70 hover:text-[#111] hover:border-white/30"
            >
              Cancel
            </Button>
            <Button
              danger
              type="primary"
              loading={deleting}
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 border-none"
            >
              Deactivate Assignment
            </Button>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}

