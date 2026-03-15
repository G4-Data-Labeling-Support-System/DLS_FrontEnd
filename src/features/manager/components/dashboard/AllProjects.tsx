import { useEffect, useState } from 'react'
import { Space, Typography, Spin, Input, Select, Empty, App, Button } from 'antd'
import { SearchOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { ProjectCard } from './ProjectCard'
import { ProjectDetail } from './ProjectDetail'
import projectApi, { type GetProjectsParams } from '@/api/ProjectApi'
import { GlassModal } from '@/shared/components/ui/GlassModal'
const { Title } = Typography

interface AllProjectsProps {
  selectedProjectId?: string | null
  onProjectSelect?: (id: string | null) => void
  refreshTrigger?: number
  onEdit?: (id: string) => void
  onCreate?: () => void
}

export const AllProjects: React.FC<AllProjectsProps> = ({
  selectedProjectId,
  onProjectSelect,
  refreshTrigger,
  onEdit,
  onCreate
}) => {
  const { message: messageApi } = App.useApp()
  // Khai báo state sử dụng mảng của GetProjectsParams
  const [projects, setProjects] = useState<GetProjectsParams[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [internalProjectId, setInternalProjectId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [deletingProjectName, setDeletingProjectName] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [cancelingProjectId, setCancelingProjectId] = useState<string | null>(null)
  const [cancelingProjectName, setCancelingProjectName] = useState('')
  const currentProjectId = selectedProjectId !== undefined ? selectedProjectId : internalProjectId
  const handleProjectSelect = (id: string | null) => {
    if (onProjectSelect) {
      onProjectSelect(id)
    } else {
      setInternalProjectId(id)
    }
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectApi.getProjects()

      const data = response.data?.data || response.data || []

      if (Array.isArray(data)) {
        // Map the data to ensure properties match GetProjectsParams expected by ProjectCard
        const mappedProjects: GetProjectsParams[] = data.map((p: Record<string, unknown>) => {
          const projectInfo = (p.project as Record<string, unknown>) || p
          const mapped: GetProjectsParams = {}

          const pid = projectInfo.projectId || projectInfo.id || projectInfo.project_id || p.projectId || p.id || p.project_id
          if (pid) {
            mapped.projectId = String(pid)
          }

          const pname =
            projectInfo.projectName ||
            projectInfo.name ||
            projectInfo.project_name ||
            p.projectName ||
            p.name ||
            p.project_name
          if (pname) {
            mapped.projectName = String(pname)
          }

          const pstatus =
            projectInfo.projectStatus ||
            projectInfo.status ||
            projectInfo.project_status ||
            p.projectStatus ||
            p.status ||
            p.project_status
          if (pstatus) {
            mapped.projectStatus = String(pstatus)
          }

          if (projectInfo.description || p.description) {
            mapped.description = String(projectInfo.description || p.description)
          }

          const pcreated =
            projectInfo.createdAt ||
            projectInfo.created_at ||
            projectInfo.Created_at ||
            p.createdAt ||
            p.created_at ||
            p.Created_at ||
            projectInfo.createdDate ||
            p.createdDate
          if (pcreated) {
            mapped.createdAt = String(pcreated)
          }

          const pupdated = projectInfo.updated_at || projectInfo.updatedAt || p.updated_at || p.updatedAt
          if (pupdated) {
            mapped.updatedAt = String(pupdated)
          }

          return mapped
        })
        setProjects(mappedProjects)
      } else {
        console.warn('API returned non-array data:', data)
        setProjects([])
      }
    } catch (error) {
      console.error('Failed to load projects.', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [refreshTrigger])

  const handleDelete = (id?: string) => {
    if (!id) return
    const proj = projects.find((p) => p.projectId === id)
    setDeletingProjectId(id)
    setDeletingProjectName(proj?.projectName || 'this project')
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingProjectId) return
    setDeleting(true)
    try {
      await projectApi.deleteProject(deletingProjectId)
      messageApi.success('Project deactivated successfully!')
      setDeleteModalOpen(false)
      setDeletingProjectId(null)
      setDeletingProjectName('')
      fetchProjects()
    } catch (error) {
      console.error('Deactivate project error:', error)
      messageApi.error('An error occurred while deactivating the project.')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (id?: string) => {
    if (!id || !onEdit) return
    onEdit(id)
  }

  // Removed handleCreateProjectSuccess as it is now in the parent

  const handleCancelProject = (id?: string) => {
    if (!id) return
    const proj = projects.find((p) => p.projectId === id)
    setCancelingProjectId(id)
    setCancelingProjectName(proj?.projectName || 'this project')
    setCancelModalOpen(true)
  }

  const confirmCancel = async () => {
    if (!cancelingProjectId) return
    setCanceling(true)
    try {
      await projectApi.updateProjectStatus(cancelingProjectId, 'CANCELLED')
      messageApi.success('Project cancelled successfully!')
      setCancelModalOpen(false)
      setCancelingProjectId(null)
      setCancelingProjectName('')
      fetchProjects()
    } catch (error) {
      console.error('Cancel project error:', error)
      messageApi.error('An error occurred while cancelling the project.')
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <Spin size="large" />
      </div>
    )
  }

  if (currentProjectId) {
    return <ProjectDetail projectId={currentProjectId} onBack={() => handleProjectSelect(null)} />
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!text-white !m-0 !font-display">
          All Projects
        </Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            className="w-36"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'NOT_STARTED', label: 'Not Started' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INPROCESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' }
            ]}
          />
          <Input
            placeholder="Search projects..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 w-64"
          />
        </Space>
      </div>

      {projects.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No projects created yet.</span>}
          className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 items-stretch">
          {projects
            .filter((p) => p.projectStatus?.toUpperCase() !== 'INACTIVE')
            .filter(
              (p) =>
                !searchText ||
                (p.projectName && p.projectName.toLowerCase().includes(searchText.toLowerCase()))
            )
            .filter(
              (p) =>
                statusFilter === 'ALL' ||
                (p.projectStatus && p.projectStatus.toUpperCase() === statusFilter)
            )
            .sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            )
            .map((p) => {
              if (!p.projectId) return null // Bỏ qua nếu data rác không có ID

              return (
                <ProjectCard
                  key={p.projectId}
                  {...p} // Spread toàn bộ thuộc tính chuẩn từ API vào Card
                  onClick={() => handleProjectSelect(p.projectId as string)}
                  onEdit={() => handleEdit(p.projectId)}
                  onDelete={() => handleDelete(p.projectId)}
                  onCancelProject={() => handleCancelProject(p.projectId)}
                />
              )
            })}

          {/* Start New Project Card */}
          <div
            className="block group cursor-pointer"
            onClick={onCreate}
          >
            <div className="h-full min-h-[180px] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-4 bg-[#1A1625]/30 hover:bg-[#1A1625] hover:border-violet-500 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#231e31] group-hover:bg-violet-600 flex items-center justify-center transition-colors">
                <PlusOutlined className="text-gray-400 group-hover:text-white text-xl" />
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium font-display">
                Start New Project
              </span>
            </div>
          </div>
        </div>
      )}

      <GlassModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false)
          setDeletingProjectId(null)
          setDeletingProjectName('')
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
            <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
              Deactivate Project
            </h2>
            <p className="text-white/50 text-sm">
              Are you sure you want to deactivate{' '}
              <span className="text-white/80 font-medium">{deletingProjectName}</span>? This action
              cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              onClick={() => {
                setDeleteModalOpen(false)
                setDeletingProjectId(null)
                setDeletingProjectName('')
              }}
              className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
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
              Deactivate
            </Button>
          </div>
        </div>
      </GlassModal>

      <GlassModal
        open={cancelModalOpen}
        onCancel={() => {
          setCancelModalOpen(false)
          setCancelingProjectId(null)
          setCancelingProjectName('')
        }}
        destroyOnHidden
        width={480}
      >
        <div className="px-8 pt-10 pb-8">
          <div className="text-center pb-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-orange-500 text-2xl" />
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
              Cancel Project
            </h2>
            <p className="text-white/50 text-sm">
              Are you sure you want to cancel{' '}
              <span className="text-white/80 font-medium">{cancelingProjectName}</span>? This action
              will change the project status to CANCELLED.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              onClick={() => {
                setCancelModalOpen(false)
                setCancelingProjectId(null)
                setCancelingProjectName('')
              }}
              className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
            >
              Close
            </Button>
            <Button
              type="primary"
              loading={canceling}
              onClick={confirmCancel}
              className="bg-orange-600 hover:bg-orange-500 border-none"
            >
              Cancel Project
            </Button>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}
