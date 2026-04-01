import React, { useEffect, useState } from 'react'
import {
  Spin,
  Button,
  Tag,
  Avatar,
  App,
  Form,
  Input,
  Dropdown
} from 'antd'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { EditOutlined, MoreOutlined, DownloadOutlined } from '@ant-design/icons'
import guidelineApi from '@/api/GuidelineApi'
import { CreateProjectModal } from './CreateProjectModal'
import assignmentApi from '@/api/AssignmentApi'
import {
  useProjectById,
  useGuidelinesByProject,
  useProjectMembers,
  useInvalidateProjectDetail,
  useAssignmentsByProject
} from '@/features/manager/hooks/useProjectDetail'

interface ProjectDetailProps {
  projectId: string
  onBack?: () => void
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectId,
  onBack
}) => {
  const { message } = App.useApp()
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError
  } = useProjectById(projectId)
  const { data: guidelines = [], isLoading: guidelinesLoading } = useGuidelinesByProject(projectId)
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId)
  const invalidateProjectDetail = useInvalidateProjectDetail()
  const { data: projectAssignments = [], isLoading: assignmentsLoading } = useAssignmentsByProject(projectId)

  const loading = projectLoading || guidelinesLoading || membersLoading || assignmentsLoading

  const [isEditProjectModalVisible, setIsEditProjectModalVisible] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [guidelineForm] = Form.useForm()

  const [editingGuideline, setEditingGuideline] = useState<Record<string, unknown> | null>(null)
  const [isGuidelineEditModalVisible, setIsGuidelineEditModalVisible] = useState(false)

  useEffect(() => {
    if (projectError) {
      message.error('Cannot load project details.')
      if (onBack) onBack()
    }
  }, [projectError, onBack, message])

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
      case 'COMPLETED':
        return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
      case 'PAUSED':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
      case 'ARCHIVE':
        return 'border-red-500/30 bg-red-500/10 text-red-400'
      default:
        return 'border-gray-500/30 bg-gray-500/10 text-gray-400'
    }
  }

  const handleEditGuideline = (guideline: Record<string, unknown>) => {
    setEditingGuideline(guideline)
    guidelineForm.setFieldsValue({
      title: guideline.title,
      content: guideline.content
    })
    setIsGuidelineEditModalVisible(true)
  }

  const handleGuidelineEditSubmit = async () => {
    try {
      const values = await guidelineForm.validateFields()
      const guideId = String(editingGuideline?.guideId)
      await guidelineApi.updateGuideline(guideId, {
        title: values.title,
        content: values.content
      })
      message.success('Guideline updated successfully!')
      setIsGuidelineEditModalVisible(false)
      setEditingGuideline(null)
      guidelineForm.resetFields()
      invalidateProjectDetail(projectId)
    } catch {
      message.error('Failed to update guideline')
    }
  }

  const handleExport = async (format: string) => {
    if (projectAssignments.length === 0) {
      message.warning('No assignments found to export.')
      return
    }

    const assignmentId = projectAssignments[0].assignmentId
    if (!assignmentId) return

    try {
      setIsExporting(true)
      const res = await assignmentApi.exportAssignment(assignmentId, format.toLowerCase())
      
      // Create a blob URL and trigger download
      const blob = new Blob([res.data], { type: res.headers?.['content-type'] || 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${project?.projectName || 'export'}_${format}_${Date.now()}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      message.success(`Project exported in ${format} format successfully!`)
    } catch (error) {
      const err = error as any
      console.error('Export failed', err)
      let errorMessage = 'Failed to export project. Please try again.'
      
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="w-full text-center py-10 text-gray-400">
        Error loading project information.
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-end mb-4 gap-3">
        {projectAssignments.length > 0 && (
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
              className="bg-transparent border border-violet-500/30 text-violet-400 hover:text-white hover:border-violet-500 rounded-lg font-medium"
              icon={<DownloadOutlined />}
              loading={isExporting}
            >
              Export Labels
            </Button>
          </Dropdown>
        )}
        <Button
          type="primary"
          icon={<EditOutlined />}
          className="bg-violet-600 hover:bg-violet-500 border-none rounded-lg font-medium shadow-none"
          onClick={() => setIsEditProjectModalVisible(true)}
          disabled={project.projectStatus?.toUpperCase() === 'INACTIVE'}
        >
          Edit Project
        </Button>
      </div>

      <div className="rounded-2xl grid lg:grid-cols-2 md:grid-cols-1 gap-6 mb-8 mt-2 items-stretch">

        {/* DESIGN APPLIED FROM ANNOTATOR FOR PROJECT INFO */}
        <div className="glass-panel rounded-2xl p-7 relative overflow-hidden flex flex-col border border-white/5 bg-[#1A1625]/60 backdrop-blur-md shadow-xl">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-[50px] pointer-events-none" />

          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[14px] text-violet-400">
                    folder_special
                  </span>
                  <span className="text-xs font-mono text-violet-400 tracking-widest uppercase font-bold">
                    Project Information
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {project.projectName}
                </h1>
                <p className="text-sm text-gray-400 mt-1 font-mono hover:text-gray-300 transition-colors cursor-default">
                  {project.projectId}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase ${getStatusColor(project.projectStatus as string)}`}
                >
                  <span className="material-symbols-outlined text-[14px]">flag</span>
                  {(project.projectStatus as string) || 'UNKNOWN'}
                </div>
              </div>
            </div>

            <div className="mb-6 flex-1">
              <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
              <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
                {project.description || (
                  <span className="text-gray-500 italic">No description provided for this project.</span>
                )}
              </p>
            </div>

            {/* Members Section Integrated into Glass Design */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-2">Members</h3>
              <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar space-y-2 py-1">
                {members.length > 0 ? (
                  members.map(
                    (
                      member: {
                        user: {
                          coverImage?: string
                          username?: string
                          role?: string
                        }
                      },
                      i: number
                    ) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all cursor-default">
                        <Avatar
                          size="small"
                          className="border border-violet-500/30 ring-2 ring-violet-500/10"
                          src={
                            member.user.coverImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.username || 'U')}&background=random`
                          }
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-200">
                            {member.user.username || 'Unknown User'}
                          </span>
                          {member.user.role && (
                            <span className="text-[10px] text-gray-400 tracking-wider">
                              {member.user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <span className="text-gray-500 italic text-sm">No members yet.</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-auto">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Created At</p>
                <p className="text-sm font-semibold text-gray-300">{formatDate(project.createdAt as string)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-sm font-semibold text-gray-300">{formatDate(project.updatedAt as string)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PROJECT GUIDELINES SIDE */}
        <div className="bg-[#1A1625]/60 backdrop-blur-md border border-violet-500/20 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full min-h-[400px]">
          <div className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#231e31]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">menu_book</span>
              </div>
              <span className="font-semibold text-white text-base font-display">Project Guidelines</span>
            </div>
            <Tag color="#10b981" className="border-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border shadow-inner rounded-full font-bold px-3 py-0.5 m-0 text-xs">
              {guidelines.length} total
            </Tag>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {guidelines.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
                <span className="material-symbols-outlined text-5xl mb-3 text-gray-600">article</span>
                <p className="text-gray-400 text-sm">No guidelines available</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {guidelines.map((guideline: Record<string, unknown>, index: number) => (
                  <div
                    key={(guideline.guideId as string) || index}
                    className="flex flex-col gap-3 bg-white/5 p-5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all shadow-inner group"
                  >
                    <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3 font-display text-white font-semibold">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center justify-center font-bold font-sans">
                          {index + 1}
                        </span>
                        <h4 className="truncate" title={(guideline.title as string) || 'Guideline'}>
                          {(guideline.title as string) || 'Guideline'}
                        </h4>
                      </div>

                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'edit',
                              label: <span className="text-gray-300 hover:text-white font-medium">Edit Guideline</span>,
                              icon: <EditOutlined className="text-gray-400" />,
                              onClick: () => handleEditGuideline(guideline)
                            }
                          ]
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<MoreOutlined className="text-gray-400 group-hover:text-white transition-colors" />}
                          className="hover:bg-white/10 border-none flex-shrink-0 -mr-2 shadow-none"
                        />
                      </Dropdown>
                    </div>

                    <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed mt-1">
                      {(guideline.content as string) || 'No content provided.'}
                    </div>

                    <div className="mt-2 text-[10px] text-gray-500 tracking-wider uppercase font-medium mt-auto w-full text-right">
                      {formatDate(guideline.createdAt as string)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <CreateProjectModal
        open={isEditProjectModalVisible}
        editId={projectId}
        onCancel={() => setIsEditProjectModalVisible(false)}
        onSuccess={() => {
          setIsEditProjectModalVisible(false)
          invalidateProjectDetail(projectId)
        }}
      />

      {/* Guideline Edit Modal */}
      <GlassModal
        open={isGuidelineEditModalVisible}
        onCancel={() => {
          setIsGuidelineEditModalVisible(false)
          setEditingGuideline(null)
          guidelineForm.resetFields()
        }}
        destroyOnHidden
        width={520}
      >
        <div className="px-8 pt-10 pb-8">
          <div className="text-center border-b border-white/5 pb-6 mb-6">
            <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
              Edit Guideline
            </h2>
          </div>
          <Form form={guidelineForm} layout="vertical">
            <Form.Item
              label={<span className="text-gray-300 font-medium tracking-wide">Title</span>}
              name="title"
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input placeholder="Enter guideline title" className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 rounded-lg px-3 py-2" />
            </Form.Item>
            <Form.Item
              label={<span className="text-gray-300 font-medium tracking-wide">Content</span>}
              name="content"
              rules={[{ required: true, message: 'Please enter content' }]}
            >
              <Input.TextArea placeholder="Enter guideline content" rows={5} className="bg-[#1A1625] border-gray-700 text-white hover:border-violet-500 focus:border-violet-500 rounded-lg p-3 custom-scrollbar" />
            </Form.Item>
            <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
              <Button
                onClick={() => {
                  setIsGuidelineEditModalVisible(false)
                  setEditingGuideline(null)
                  guidelineForm.resetFields()
                }}
                className="border-white/10 text-white/70 hover:text-white hover:border-white/30 bg-transparent rounded-lg px-6 shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleGuidelineEditSubmit}
                className="bg-violet-600 hover:bg-violet-500 border-none rounded-lg px-8 shadow-md"
              >
                Save
              </Button>
            </div>
          </Form>
        </div>
      </GlassModal>
    </div>
  )
}

export default ProjectDetail
