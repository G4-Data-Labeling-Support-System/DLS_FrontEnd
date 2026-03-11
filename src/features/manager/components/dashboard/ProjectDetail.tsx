import React, { useEffect, useRef, useState } from 'react'
import {
    Spin,
    Typography,
    Card,
    Button,
    Descriptions,
    Tag,
    Avatar,
    Empty,
    App,
    Form,
    Input,
    Dropdown,
    Select,
    DatePicker
} from 'antd'
import dayjs from 'dayjs'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { EditOutlined, MoreOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import assignmentApi from '@/api/AssignmentApi'
import guidelineApi from '@/api/GuidelineApi'
import { userApi } from '@/api/userApi'
import { AssignmentDetail } from './AssignmentDetail'
import { CreateAssignmentModal } from './CreateAssignmentModal'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    useProjectById,
    useAssignmentsByProject,
    useGuidelinesByProject,
    useDatasetsByProject,
    useInvalidateProjectDetail
} from '@/features/manager/hooks/useProjectDetail'
import { DatasetCard } from '../dataset/DatasetCard'
import { CreateDatasetModal } from '../dataset/CreateDatasetModal'

const { Title } = Typography

interface ProjectDetailProps {
    projectId: string
    onBack: () => void
    isInline?: boolean
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack, isInline = false }) => {
    const { message } = App.useApp()
    const {
        data: project,
        isLoading: projectLoading,
        isError: projectError
    } = useProjectById(projectId)
    const {
        data: assignments = [],
        isLoading: assignmentsLoading
    } = useAssignmentsByProject(projectId)
    const { data: guidelines = [], isLoading: guidelinesLoading } = useGuidelinesByProject(projectId)
    const { data: datasets = [], isLoading: datasetsLoading } = useDatasetsByProject(projectId)
    const invalidateProjectDetail = useInvalidateProjectDetail()

    const loading = projectLoading || assignmentsLoading || guidelinesLoading || datasetsLoading

    const [isCreateAssignmentModalVisible, setIsCreateAssignmentModalVisible] = useState(false)
    const [isCreateDatasetModalVisible, setIsCreateDatasetModalVisible] = useState(false)
    const hasShownFirstAssignmentModal = useRef(false)
    const [guidelineForm] = Form.useForm()
    const [assignmentEditForm] = Form.useForm()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // Edit/Delete state for guidelines
    const [editingGuideline, setEditingGuideline] = useState<Record<string, unknown> | null>(null)
    const [isGuidelineEditModalVisible, setIsGuidelineEditModalVisible] = useState(false)

    // Edit/Delete state for assignments
    const [editingAssignment, setEditingAssignment] = useState<Record<string, unknown> | null>(null)
    const [isAssignmentEditModalVisible, setIsAssignmentEditModalVisible] = useState(false)
    const [deleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState(false)
    const [deletingAssignment, setDeletingAssignment] = useState(false)
    const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null)
    const [deletingAssignmentName, setDeletingAssignmentName] = useState('')

    // User lists for assignment edit
    const [editAnnotators, setEditAnnotators] = useState<Record<string, unknown>[]>([])
    const [editReviewers, setEditReviewers] = useState<Record<string, unknown>[]>([])
    const [editUsersLoading, setEditUsersLoading] = useState(false)

    // Assignment detail view via URL search params or local state for inline usage
    const [localAssignmentId, setLocalAssignmentId] = useState<string | null>(null)
    const urlAssignmentId = searchParams.get('assignmentId')
    const selectedAssignmentId = isInline ? localAssignmentId : urlAssignmentId

    const setSelectedAssignmentId = (id: string | null) => {
        if (isInline) {
            setLocalAssignmentId(id)
        } else {
            const params = new URLSearchParams(searchParams)
            if (id) {
                params.set('assignmentId', id)
            } else {
                params.delete('assignmentId')
            }
            setSearchParams(params)
        }
    }

    useEffect(() => {
        if (projectError) {
            message.error('Cannot load project details.')
            onBack()
        }
    }, [projectError, onBack, message])

    useEffect(() => {
        if (!assignmentsLoading && assignments.length === 0 && !hasShownFirstAssignmentModal.current) {
            hasShownFirstAssignmentModal.current = true
            queueMicrotask(() => setIsCreateAssignmentModalVisible(true))
        }
    }, [assignments, assignmentsLoading])

    const getStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return 'processing'
            case 'COMPLETED':
                return 'success'
            case 'PAUSED':
                return 'warning'
            case 'ARCHIVE':
                return 'error'
            default:
                return 'default'
        }
    }

    // --- Guideline Edit/Delete ---
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

    // --- Assignment Edit/Delete ---
    const fetchUsersForEdit = async () => {
        setEditUsersLoading(true)
        try {
            const userRes = await userApi.getUsers()
            const allUsers = (
                Array.isArray(userRes)
                    ? userRes
                    : (userRes as unknown as { data?: Record<string, unknown>[] })?.data || []
            ) as Record<string, unknown>[]

            setEditAnnotators(
                allUsers.filter((u) => {
                    const role = String(u.role || u.userRole || '').toUpperCase()
                    return role.includes('ANNOTATOR')
                })
            )
            setEditReviewers(
                allUsers.filter((u) => {
                    const role = String(u.role || u.userRole || '').toUpperCase()
                    return role.includes('REVIEWER')
                })
            )
        } catch (error) {
            console.error('Failed to fetch users for edit', error)
        } finally {
            setEditUsersLoading(false)
        }
    }

    const renderEditUserOption = (u: Record<string, unknown>) => {
        const userId = String(u.userId || u.id || '')
        const name = (u.fullName as string) || (u.username as string) || (u.name as string) || 'Unknown'
        const avatarSrc =
            (u.avatar as string) ||
            (u.coverImage as string) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        return (
            <Select.Option key={userId} value={userId}>
                <div className="flex items-center gap-2">
                    <Avatar src={avatarSrc} size="small" />
                    <span>{name}</span>
                </div>
            </Select.Option>
        )
    }

    const handleEditAssignment = (assignment: Record<string, unknown>) => {
        setEditingAssignment(assignment)
        assignmentEditForm.setFieldsValue({
            assignmentName: assignment.assignmentName || assignment.name,
            assignedTo: assignment.assignedTo,
            reviewedBy: assignment.reviewedBy || assignment.reviewerId,
            description: assignment.description || assignment.descriptionAssignment,
            dueDate: assignment.dueDate ? dayjs(assignment.dueDate as string) : null,
            assignmentStatus: assignment.assignmentStatus || assignment.status
        })
        setIsAssignmentEditModalVisible(true)
        fetchUsersForEdit()
    }

    const handleAssignmentEditSubmit = async () => {
        try {
            const values = await assignmentEditForm.validateFields()
            const assignmentId = String(editingAssignment?.assignmentId)
            await assignmentApi.updateAssignment(assignmentId, {
                assignmentName: values.assignmentName,
                assignedTo: values.assignedTo,
                reviewedBy: values.reviewedBy,
                description: values.description,
                dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
                assignmentStatus: values.assignmentStatus
            })
            message.success('Assignment updated successfully!')
            setIsAssignmentEditModalVisible(false)
            setEditingAssignment(null)
            assignmentEditForm.resetFields()
            invalidateProjectDetail(projectId)
        } catch {
            message.error('Failed to update assignment')
        }
    }

    const handleDeleteAssignment = (assignment: Record<string, unknown>) => {
        const assignmentId = String(assignment.assignmentId)
        const name = String(assignment.assignmentName || assignment.name || 'this assignment')
        setDeletingAssignmentId(assignmentId)
        setDeletingAssignmentName(name)
        setDeleteAssignmentModalOpen(true)
    }

    const confirmDeleteAssignment = async () => {
        if (!deletingAssignmentId) return
        setDeletingAssignment(true)
        try {
            await assignmentApi.deleteAssignment(deletingAssignmentId)
            message.success('Assignment deleted successfully!')
            setDeleteAssignmentModalOpen(false)
            setDeletingAssignmentId(null)
            setDeletingAssignmentName('')
            invalidateProjectDetail(projectId)
        } catch {
            message.error('Failed to delete assignment')
        } finally {
            setDeletingAssignment(false)
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

    if (selectedAssignmentId) {
        return (
            <AssignmentDetail
                assignmentId={selectedAssignmentId}
                onBack={() => setSelectedAssignmentId(null)}
            />
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
            <div className="flex justify-between items-start mb-6">
                <div>
                    <Title level={3} className="!text-white !m-0 !font-display">
                        {project.projectName}
                    </Title>
                    <div className="mt-2">
                        <Tag
                            color={getStatusColor(project.projectStatus as string)}
                            className="m-0 font-medium text-sm px-3 py-1"
                        >
                            {(project.projectStatus as string) || 'UNKNOWN'}
                        </Tag>
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    className="bg-violet-600 hover:bg-violet-500 border-none"
                    onClick={() => navigate(`/manager/projects/edit/${project.projectId}`)}
                >
                    Edit
                </Button>
            </div>

            <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6 p-0 overflow-hidden">
                <div className="flex flex-col lg:flex-row h-full w-full">
                    <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-800">
                        <Descriptions
                            title={
                                <span className="text-white text-lg font-display flex items-center gap-2">
                                    <span className="material-symbols-outlined text-violet-400">info</span>Project
                                    Information
                                </span>
                            }
                            column={1}
                            className="custom-descriptions"
                            styles={{
                                label: { color: '#9ca3af', fontWeight: 500, width: '150px' },
                                content: { color: '#d1d5db' }
                            }}
                        >
                            <Descriptions.Item label="Project ID">
                                <span className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                                    {project.projectId}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Description">
                                {project.description || (
                                    <span className="text-gray-600 italic">No description</span>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Created At">
                                {formatDate(project.createdAt as string)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Updated">
                                {formatDate(project.updatedAt as string)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Members">
                                <div className="flex -space-x-2 overflow-hidden py-1">
                                    {(project.users || []).slice(0, 5).map((user: { avatar?: string; fullName?: string; username?: string }, i: number) => (
                                        <Avatar
                                            key={i}
                                            size="small"
                                            className="border-2 border-[#1A1625]"
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'U')}&background=random`}
                                        />
                                    ))}
                                    {(project.users?.length || 0) > 5 && (
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-[10px] font-bold text-white border-2 border-[#1A1625]">
                                            +{(project.users?.length || 0) - 5}
                                        </div>
                                    )}
                                    {(project.users?.length || 0) === 0 && (
                                        <span className="text-gray-600 italic text-sm">No members yet</span>
                                    )}
                                </div>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    <div className="flex-1 p-6">
                        <h3 className="text-white text-lg font-display flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-green-400">menu_book</span>
                            Project Guidelines
                        </h3>
                        {guidelines.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[150px]">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<span className="text-gray-500">No guidelines created yet</span>}
                                />
                            </div>
                        ) : (
                            <div
                                className="grid grid-cols-1 gap-4 overflow-y-auto pr-1"
                                style={{ maxHeight: '300px' }}
                            >
                                {guidelines.map((guideline: Record<string, unknown>, index: number) => (
                                    <div
                                        key={(guideline.guideId as string) || index}
                                        className="flex flex-col gap-2 bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4
                                                className="text-white font-bold text-sm truncate pr-2"
                                                title={(guideline.title as string) || 'Unnamed Guideline'}
                                            >
                                                {(guideline.title as string) || 'Unnamed Guideline'}
                                            </h4>
                                            <Dropdown
                                                menu={{
                                                    items: [
                                                        {
                                                            key: 'edit',
                                                            label: 'Edit',
                                                            icon: <EditOutlined />,
                                                            onClick: () => handleEditGuideline(guideline)
                                                        },
                                                    ]
                                                }}
                                                trigger={['click']}
                                                placement="bottomRight"
                                            >
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<MoreOutlined />}
                                                    className="text-gray-400 hover:text-white flex-shrink-0"
                                                />
                                            </Dropdown>
                                        </div>
                                        <div className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">
                                            {(guideline.content as string) || 'No content provided.'}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                            <span className="text-gray-500 text-xs">
                                                {formatDate(guideline.createdAt as string)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 mb-6 mt-1">
                <Card className="bg-[#1A1625] border-gray-800 rounded-xl h-full">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-white text-lg font-display flex items-center gap-2">
                            <span className="material-symbols-outlined text-fuchsia-400">database</span>
                            Project Datasets
                        </span>
                        <div className="flex items-center gap-2">
                            <Tag
                                color="#8b5cf6"
                                className="border-0 bg-violet-600/20 text-violet-300 font-bold px-3 rounded-full"
                            >
                                {datasets.length} Datasets
                            </Tag>
                            <Button
                                type="primary"
                                size="small"
                                className="bg-violet-600 hover:bg-violet-500 border-none"
                                onClick={() => setIsCreateDatasetModalVisible(true)}
                            >
                                + New
                            </Button>
                        </div>
                    </div>

                    {datasets.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span className="text-gray-500">No datasets associated yet</span>}
                            className="my-8"
                        />
                    ) : (
                        <div
                            className="overflow-y-auto pr-1"
                            style={{ maxHeight: '500px' }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {datasets.map((dataset: { datasetId: string; datasetName?: string; totalItems?: number; createdAt?: string }) => (
                                    <DatasetCard
                                        key={dataset.datasetId}
                                        {...dataset}
                                        onClick={() => navigate(`/manager/datasets/${dataset.datasetId}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                <Card className="bg-[#1A1625] border-gray-800 rounded-xl h-full">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-white text-lg font-display flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">assignment</span>
                            Project Assignments
                        </span>
                        <div className="flex items-center gap-2">
                            <Tag
                                color="#3b82f6"
                                className="border-0 bg-blue-600/20 text-blue-300 font-bold px-3 rounded-full"
                            >
                                {assignments.length} Assignments
                            </Tag>
                            <Button
                                type="primary"
                                size="small"
                                className="bg-violet-600 hover:bg-violet-500 border-none"
                                onClick={() => setIsCreateAssignmentModalVisible(true)}
                            >
                                + New
                            </Button>
                        </div>
                    </div>

                    {assignments.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span className="text-gray-500">No assignments created yet</span>}
                            className="my-8"
                        />
                    ) : (
                        <div
                            className="overflow-y-auto pr-1"
                            style={{ maxHeight: '500px' }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignments.map((assignment: Record<string, unknown>, index: number) => (
                                    <div
                                        key={(assignment.assignmentId as string) || index}
                                        className="flex flex-col gap-2 bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer"
                                        onClick={() => setSelectedAssignmentId(String(assignment.assignmentId))}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4
                                                className="text-white font-bold text-sm truncate pr-2"
                                                title={(assignment.assignmentName as string) || (assignment.name as string)}
                                            >
                                                {(assignment.assignmentName as string) ||
                                                    (assignment.name as string) ||
                                                    'Unnamed Assignment'}
                                            </h4>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Tag
                                                    color={getStatusColor(
                                                        (assignment.status as string) || (assignment.assignmentStatus as string)
                                                    )}
                                                    className="m-0 text-[10px] px-1.5 py-0"
                                                >
                                                    {(assignment.status as string) ||
                                                        (assignment.assignmentStatus as string) ||
                                                        'UNKNOWN'}
                                                </Tag>
                                                <Dropdown
                                                    menu={{
                                                        items: [
                                                            {
                                                                key: 'edit',
                                                                label: 'Edit',
                                                                icon: <EditOutlined />,
                                                                onClick: (info) => {
                                                                    info.domEvent.stopPropagation()
                                                                    handleEditAssignment(assignment)
                                                                }
                                                            },
                                                            {
                                                                key: 'delete',
                                                                label: 'Delete',
                                                                icon: <DeleteOutlined />,
                                                                danger: true,
                                                                onClick: (info) => {
                                                                    info.domEvent.stopPropagation()
                                                                    handleDeleteAssignment(assignment)
                                                                }
                                                            }
                                                        ]
                                                    }}
                                                    trigger={['click']}
                                                    placement="bottomRight"
                                                >
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<MoreOutlined />}
                                                        className="text-gray-400 hover:text-white"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </Dropdown>
                                            </div>
                                        </div>
                                        <div className="text-gray-400 text-xs line-clamp-2 mt-1 min-h-[32px]">
                                            {(assignment.description as string) ||
                                                (assignment.descriptionAssignment as string) ||
                                                'No description provided.'}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                            <span className="text-gray-500 text-xs">
                                                {formatDate(assignment.createdAt as string)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <CreateAssignmentModal
                open={isCreateAssignmentModalVisible}
                projectId={projectId}
                onCancel={() => setIsCreateAssignmentModalVisible(false)}
                onSuccess={() => {
                    setIsCreateAssignmentModalVisible(false)
                    invalidateProjectDetail(projectId)
                }}
            />

            <CreateDatasetModal
                open={isCreateDatasetModalVisible}
                projectId={projectId}
                onCancel={() => setIsCreateDatasetModalVisible(false)}
                onSuccess={() => {
                    setIsCreateDatasetModalVisible(false)
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
                        <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">Edit Guideline</h2>
                    </div>
                    <Form form={guidelineForm} layout="vertical">
                        <Form.Item
                            label="Title"
                            name="title"
                            rules={[{ required: true, message: 'Please enter title' }]}
                        >
                            <Input placeholder="Enter guideline title" />
                        </Form.Item>
                        <Form.Item
                            label="Content"
                            name="content"
                            rules={[{ required: true, message: 'Please enter content' }]}
                        >
                            <Input.TextArea placeholder="Enter guideline content" rows={5} />
                        </Form.Item>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button
                                onClick={() => {
                                    setIsGuidelineEditModalVisible(false)
                                    setEditingGuideline(null)
                                    guidelineForm.resetFields()
                                }}
                                className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleGuidelineEditSubmit}
                                className="bg-violet-600 hover:bg-violet-500 border-none"
                            >
                                Save
                            </Button>
                        </div>
                    </Form>
                </div>
            </GlassModal>

            {/* Assignment Edit Modal */}
            <GlassModal
                open={isAssignmentEditModalVisible}
                onCancel={() => {
                    setIsAssignmentEditModalVisible(false)
                    setEditingAssignment(null)
                    assignmentEditForm.resetFields()
                }}
                destroyOnHidden
                width={600}
            >
                <div className="px-8 pt-10 pb-8">
                    <div className="text-center border-b border-white/5 pb-6 mb-6">
                        <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">Edit Assignment</h2>
                    </div>
                    <Form form={assignmentEditForm} layout="vertical">
                        <Form.Item
                            label="Assignment Name"
                            name="assignmentName"
                            rules={[{ required: true, message: 'Please enter assignment name' }]}
                        >
                            <Input placeholder="Enter assignment name" />
                        </Form.Item>
                        <Form.Item label="Assigned To" name="assignedTo">
                            <Select
                                placeholder="Select annotator"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                loading={editUsersLoading}
                            >
                                {editAnnotators.map(renderEditUserOption)}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Reviewed By" name="reviewedBy">
                            <Select
                                placeholder="Select reviewer"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                loading={editUsersLoading}
                            >
                                {editReviewers.map(renderEditUserOption)}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Description" name="description">
                            <Input.TextArea placeholder="Enter description" rows={3} />
                        </Form.Item>
                        <Form.Item label="Due Date" name="dueDate">
                            <DatePicker
                                className="w-full"
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Select due date"
                            />
                        </Form.Item>
                        <Form.Item label="Status" name="assignmentStatus">
                            <Select
                                placeholder="Select status"
                                options={[
                                    { value: 'ASSIGNED', label: 'Assigned' },
                                    { value: 'ACTIVE', label: 'Active' },
                                    { value: 'COMPLETED', label: 'Completed' },
                                    { value: 'PAUSED', label: 'Paused' }
                                ]}
                            />
                        </Form.Item>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button
                                onClick={() => {
                                    setIsAssignmentEditModalVisible(false)
                                    setEditingAssignment(null)
                                    assignmentEditForm.resetFields()
                                }}
                                className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleAssignmentEditSubmit}
                                className="bg-violet-600 hover:bg-violet-500 border-none"
                            >
                                Save
                            </Button>
                        </div>
                    </Form>
                </div>
            </GlassModal>

            <GlassModal
                open={deleteAssignmentModalOpen}
                onCancel={() => { setDeleteAssignmentModalOpen(false); setDeletingAssignmentId(null); setDeletingAssignmentName('') }}
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
                            Delete Assignment
                        </h2>
                        <p className="text-white/50 text-sm">
                            Are you sure you want to delete <span className="text-white/80 font-medium">{deletingAssignmentName}</span>? This action cannot be undone.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <Button
                            onClick={() => { setDeleteAssignmentModalOpen(false); setDeletingAssignmentId(null); setDeletingAssignmentName('') }}
                            className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
                        >
                            Cancel
                        </Button>
                        <Button
                            danger
                            type="primary"
                            loading={deletingAssignment}
                            onClick={confirmDeleteAssignment}
                            className="bg-red-600 hover:bg-red-500 border-none"
                        >
                            Delete Assignment
                        </Button>
                    </div>
                </div>
            </GlassModal>

            <style>{`
                .custom-descriptions .ant-descriptions-title {
                    margin-bottom: 20px;
                }
                .custom-descriptions .ant-descriptions-item-container {
                    border-bottom: 1px solid #2d263b;
                    padding-bottom: 12px;
                    margin-bottom: 12px;
                }
                .custom-descriptions .ant-descriptions-item-container:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
            `}</style>
        </div>
    )
}