import React, { useEffect, useState } from 'react'
import { Form, Input, Select, DatePicker, Button, Avatar, App } from 'antd'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { userApi } from '@/api/userApi'
import datasetApi from '@/api/DatasetApi'
import projectApi from '@/api/ProjectApi'
import assignmentApi, { type GetAssignmentsParams } from '@/api/AssignmentApi'
import { useAuthStore } from '@/store/auth.store'
import dayjs from 'dayjs'

interface CreateAssignmentModalProps {
  open: boolean
  projectId?: string
  initialData?: GetAssignmentsParams
  onCancel: () => void
  onSuccess: () => void
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  open,
  projectId,
  initialData,
  onCancel,
  onSuccess
}) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const currentUser = useAuthStore((s) => s.user)

  const [annotators, setAnnotators] = useState<Record<string, unknown>[]>([])
  const [reviewers, setReviewers] = useState<Record<string, unknown>[]>([])
  const [datasets, setDatasets] = useState<Record<string, unknown>[]>([])
  const [projects, setProjects] = useState<Record<string, unknown>[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || '')
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = !!initialData
  const hasExternalProjectId = !!projectId
  const effectiveProjectId = hasExternalProjectId ? projectId : selectedProjectId

  // Fetch projects list when no projectId is provided
  useEffect(() => {
    if (!open || hasExternalProjectId) return
    const fetchProjects = async () => {
      try {
        const res = await projectApi.getProjects()
        const data = res.data?.data || res.data
        setProjects(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        message.error('Failed to load projects.')
      }
    }
    fetchProjects()
  }, [open, hasExternalProjectId, message])

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
            const status = String(u.status || u.userStatus || '').toUpperCase()
            const isInactive =
              status === 'INACTIVE' || u.isActive === false || u.is_active === false
            return role.includes('ANNOTATOR') && !isInactive
          })
        )
        setReviewers(
          allUsers.filter((u) => {
            const role = String(u.role || u.userRole || '').toUpperCase()
            const status = String(u.status || u.userStatus || '').toUpperCase()
            const isInactive =
              status === 'INACTIVE' || u.isActive === false || u.is_active === false
            return role.includes('REVIEWER') && !isInactive
          })
        )

        // Fetch datasets by project (only when we have a project ID)
        const currentPid = initialData?.projectId || effectiveProjectId
        if (currentPid) {
          const datasetRes = await datasetApi.getDatasetsByProjectId(currentPid)
          const datasetsData = datasetRes.data?.data || datasetRes.data
          const dsArray = Array.isArray(datasetsData) ? datasetsData : []
          setDatasets(dsArray)
        } else {
          setDatasets([])
        }
      } catch (error) {
        console.error(error)
        message.error('Failed to load users or datasets.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [open, effectiveProjectId, message, initialData])

  // Set form fields when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        form.setFieldsValue({
          assignmentName: initialData.assignmentName,
          assignedTo: initialData.assignedTo,
          reviewerId: initialData.reviewedBy || initialData.reviewerId,
          description: initialData.description,
          dueDate: initialData.dueDate ? dayjs(initialData.dueDate) : undefined,
          datasetId: initialData.datasetId,
          projectId: initialData.projectId,
          assignedBy: initialData.assignedBy
        })
        if (initialData.projectId) {
          setSelectedProjectId(initialData.projectId)
        }
      } else {
        form.resetFields()
        if (currentUser) {
          const managerId =
            (currentUser as unknown as Record<string, unknown>).userId || currentUser.id
          form.setFieldsValue({
            assignedBy: managerId
          })
        }
        if (projectId) {
          setSelectedProjectId(projectId)
        }
      }
    }
  }, [open, initialData, isEditMode, form, currentUser, projectId])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setIsSubmitting(true)

      const resolvedProjectId = hasExternalProjectId
        ? projectId
        : values.projectId || initialData?.projectId
      if (!resolvedProjectId && !isEditMode) {
        message.destroy()
        message.error('Please select a project')
        setIsSubmitting(false)
        return
      }

      const payload = {
        assignmentName: values.assignmentName,
        assignedTo: values.assignedTo,
        reviewedBy: values.reviewerId,
        description: values.description,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        assignmentStatus: 'ASSIGNED'
      }

      if (isEditMode && initialData?.assignmentId) {
        await assignmentApi.updateAssignment(initialData.assignmentId, payload)
        message.success('Assignment updated successfully!')
      } else {
        const createPayload = {
          ...payload,
          assignedBy: values.assignedBy,
          datasetId: values.datasetId
        }
        await assignmentApi.createAssignmentForProject(resolvedProjectId!, createPayload)
        message.success('Assignment created successfully!')
      }

      form.resetFields()
      onSuccess()
    } catch (error: any) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error(isEditMode ? 'Failed to update assignment' : 'Failed to create assignment', error)

      // Map API errors to form fields
      // const apiErrors = error?.response?.data?.errors
      // if (apiErrors && typeof apiErrors === 'object') {
      //     const fieldErrors = Object.entries(apiErrors).map(([key, messages]) => {
      //         // Map API field names to form field names if they differ
      //         let fieldName = key
      //         if (key === 'reviewedBy') fieldName = 'reviewerId'

      //         return {
      //             name: fieldName,
      //             errors: Array.isArray(messages) ? messages : [String(messages)]
      //         }
      //     })
      //     form.setFields(fieldErrors)
      // }

      const apiError = error?.response?.data?.message || error?.message || (isEditMode ? 'Failed to update assignment' : 'Failed to create assignment')
      message.error(apiError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    if (!hasExternalProjectId) {
      setSelectedProjectId('')
      setDatasets([])
    }
    onCancel()
  }

  const handleProjectChange = async (value: string) => {
    setSelectedProjectId(value)
    form.setFieldsValue({ datasetId: undefined })
    // Fetch datasets for the newly selected project
    try {
      const datasetRes = await datasetApi.getDatasetsByProjectId(value)
      const datasetsData = datasetRes.data?.data || datasetRes.data
      const dsArray = Array.isArray(datasetsData) ? datasetsData : []
      setDatasets(dsArray)
    } catch (error) {
      console.error(error)
      message.error('Failed to load datasets for selected project.')
      setDatasets([])
    }
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

  const currentUserName = currentUser?.fullName || currentUser?.username || 'Current User'

  return (
    <GlassModal open={open} onCancel={handleCancel} destroyOnHidden width={640}>
      <div className="px-8 pt-10 pb-8">
        <div className="text-center border-b border-white/5 pb-6 mb-6">
          <h2 className="text-white text-2xl font-bold tracking-tight mb-2 font-display">
            {isEditMode ? 'Edit Assignment' : 'Create Assignment'}
          </h2>
          <p className="text-white/50 text-sm">
            {isEditMode
              ? 'Update the details of this assignment.'
              : 'Set up a new assignment for this project.'}
          </p>
        </div>
        <Form form={form} layout="vertical">
          {!hasExternalProjectId && !isEditMode && (
            <Form.Item
              label="Project"
              name="projectId"
              rules={[{ required: true, message: 'Please select a project' }]}
            >
              <Select
                placeholder="Select project"
                showSearch
                optionFilterProp="children"
                onChange={handleProjectChange}
              >
                {projects.map((p: Record<string, unknown>) => (
                  <Select.Option
                    key={(p.projectId as string) || (p.id as string)}
                    value={(p.projectId as string) || (p.id as string)}
                  >
                    {(p.projectName as string) || (p.name as string)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

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

            <Form.Item label="Assigned By" name="assignedBy">
              <Select disabled placeholder="Original creator">
                {isEditMode && initialData?.assignedBy ? (
                  <Select.Option value={initialData.assignedBy}>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(initialData.assignedBy)}&background=random`}
                        size="small"
                      />
                      <span>{initialData.assignedBy}</span>
                    </div>
                  </Select.Option>
                ) : currentUser ? (
                  <Select.Option
                    value={
                      ((currentUser as unknown as Record<string, unknown>).userId as string) ||
                      currentUser.id
                    }
                  >
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
                ) : null}
              </Select>
            </Form.Item>
          </div>

          {!isEditMode && (
            <Form.Item
              label="Dataset"
              name="datasetId"
              rules={[{ required: true, message: 'Please select a dataset' }]}
            >
              <Select
                placeholder={!effectiveProjectId ? 'Select a project first' : 'Select dataset'}
                loading={loading}
                showSearch
                optionFilterProp="children"
                disabled={!effectiveProjectId}
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
          )}

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
              {isEditMode ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </div>
        </Form>
      </div>
    </GlassModal>
  )
}
