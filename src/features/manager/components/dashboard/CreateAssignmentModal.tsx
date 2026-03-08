import React, { useEffect, useState } from 'react'
import { Form, Input, Select, DatePicker, Button, Avatar, App } from 'antd'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { userApi } from '@/api/userApi'
import datasetApi from '@/api/DatasetApi'
import assignmentApi from '@/api/AssignmentApi'
import { useAuthStore } from '@/store/auth.store'

interface CreateAssignmentModalProps {
    open: boolean
    projectId: string
    onCancel: () => void
    onSuccess: () => void
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
    open,
    projectId,
    onCancel,
    onSuccess
}) => {
    const { message } = App.useApp()
    const [form] = Form.useForm()
    const currentUser = useAuthStore((s) => s.user)

    const [annotators, setAnnotators] = useState<Record<string, unknown>[]>([])
    const [reviewers, setReviewers] = useState<Record<string, unknown>[]>([])
    const [datasets, setDatasets] = useState<Record<string, unknown>[]>([])
    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!open) return
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch all users
                const userRes = await userApi.getUsers()
                const allUsers = (
                    Array.isArray(userRes)
                        ? userRes
                        : (userRes as unknown as { data?: Record<string, unknown>[] })?.data || []
                ) as Record<string, unknown>[]

                setAnnotators(
                    allUsers.filter((u) => {
                        const role = String(u.role || u.userRole || '').toUpperCase()
                        return role.includes('ANNOTATOR')
                    })
                )
                setReviewers(
                    allUsers.filter((u) => {
                        const role = String(u.role || u.userRole || '').toUpperCase()
                        return role.includes('REVIEWER')
                    })
                )

                // Fetch datasets by project
                const datasetRes = await datasetApi.getDatasetsByProjectId(projectId)
                const datasetsData = datasetRes.data?.data || datasetRes.data
                setDatasets(Array.isArray(datasetsData) ? datasetsData : [])
            } catch (error) {
                console.error(error)
                message.error('Failed to load users or datasets.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [open, projectId, message])

    // Set assignedBy to current user when modal opens
    useEffect(() => {
        if (open && currentUser) {
            const managerId = (currentUser as unknown as Record<string, unknown>).userId || currentUser.id
            form.setFieldsValue({
                assignedBy: managerId
            })
        }
    }, [open, currentUser, form])

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setIsSubmitting(true)

            const payload = {
                assignmentName: values.assignmentName,
                annotatorId: values.assignedTo,
                managerId: values.assignedBy,
                reviewerId: values.reviewerId,
                descriptionAssignment: values.description,
                dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
                datasetId: values.datasetId,
                projectId: projectId
            }

            await assignmentApi.createAssignmentForProject(projectId, payload)
            message.success('Assignment created successfully!')
            form.resetFields()
            onSuccess()
        } catch (error) {
            if (error && typeof error === 'object' && 'errorFields' in error) {
                // validation error, do nothing
            } else {
                console.error('Failed to create assignment', error)
                message.error('Failed to create assignment')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    const renderUserOption = (u: Record<string, unknown>) => {
        const userId = String(u.userId || u.id || '')
        const name = (u.fullName as string) || (u.username as string) || (u.name as string)
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

    const currentUserName =
        currentUser?.fullName || currentUser?.username || 'Current User'

    return (
        <GlassModal
            open={open}
            onCancel={handleCancel}
            destroyOnHidden
            width={640}
        >
            <div className="px-8 pt-10 pb-8">
                <div className="text-center border-b border-white/5 pb-6 mb-6">
                    <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
                        Create Assignment
                    </h2>
                    <p className="text-white/50 text-sm">
                        Set up a new assignment for this project.
                    </p>
                </div>
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Assignment Name"
                        name="assignmentName"
                        rules={[{ required: true, message: 'Please enter assignment name' }]}
                    >
                        <Input placeholder="Enter assignment name" />
                    </Form.Item>

                    <div className="grid grid-cols-3 gap-4">
                        <Form.Item
                            label="Assign To"
                            name="assignedTo"
                            rules={[{ required: true, message: 'Please select annotator' }]}
                        >
                            <Select
                                placeholder="Select annotator"
                                loading={loading}
                                showSearch
                                optionFilterProp="children"
                            >
                                {annotators.map(renderUserOption)}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Reviewer"
                            name="reviewerId"
                            rules={[{ required: true, message: 'Please select reviewer' }]}
                        >
                            <Select
                                placeholder="Select reviewer"
                                loading={loading}
                                showSearch
                                optionFilterProp="children"
                            >
                                {reviewers.map(renderUserOption)}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Assigned By"
                            name="assignedBy"
                            rules={[{ required: true }]}
                        >
                            <Select disabled>
                                {currentUser && (
                                    <Select.Option value={(currentUser as unknown as Record<string, unknown>).userId as string || currentUser.id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                src={
                                                    currentUser.avatar ||
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=random`
                                                }
                                                size="small"
                                            />
                                            <span>{currentUserName}</span>
                                        </div>
                                    </Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Dataset"
                        name="datasetId"
                        rules={[{ required: true, message: 'Please select a dataset' }]}
                    >
                        <Select
                            placeholder="Select dataset"
                            loading={loading}
                            showSearch
                            optionFilterProp="children"
                        >
                            {datasets.map((d: Record<string, unknown>) => (
                                <Select.Option
                                    key={(d.datasetId as string) || (d.id as string)}
                                    value={(d.datasetId as string) || (d.id as string)}
                                >
                                    {(d.datasetName as string) || (d.name as string)}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Due Date"
                        name="dueDate"
                        rules={[{ required: true, message: 'Please select due date' }]}
                    >
                        <DatePicker className="w-full" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea placeholder="Enter description" rows={4} />
                    </Form.Item>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <Button
                            onClick={handleCancel}
                            className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            loading={isSubmitting}
                            onClick={handleSubmit}
                            className="bg-violet-600 hover:bg-violet-500 border-none"
                        >
                            Create Assignment
                        </Button>
                    </div>
                </Form>
            </div>
        </GlassModal>
    )
}
