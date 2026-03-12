import React, { useState, useEffect } from 'react'
import { App, Form, Input, Spin } from 'antd'
import projectApi from '@/api/ProjectApi'
import { useNavigate } from 'react-router-dom'
// Import Styles & Components
import { FormFooter } from '@/features/manager/components/common/FormFooter'

interface CreateProjectFormProps {
  onSuccess?: (
    projectId?: string,
    projectData?: { projectName: string; description: string }
  ) => void
  editId?: string
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onSuccess, editId }) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!editId) return
      try {
        setFetching(true)
        const response = await projectApi.getProjectById(editId)
        const projectData = response.data?.data || response.data
        if (projectData) {
          form.setFieldsValue({
            projectName: projectData.projectName || projectData.name,
            description: projectData.description
          })
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin dự án:', error)
        message.error('Không thể tải dữ liệu dự án.')
      } finally {
        setFetching(false)
      }
    }

    fetchProjectDetail()
  }, [editId, form])

  // Xử lý Cancel: Quay về Dashboard
  const handleCancel = () => {
    navigate('/manager')
  }

  const onFinish = async (values: { projectName: string; description: string }) => {
    setLoading(true)
    try {
      // Add projectId/id into the payload explicitly as requested
      const payload = {
        ...(editId ? { id: editId, projectId: editId } : {}),
        projectName: editId ? form.getFieldValue('projectName') : values.projectName,
        description: values.description
      }

      if (editId) {
        await projectApi.updateProject(editId, payload)
        message.success('Project updated successfully!')
        if (onSuccess) onSuccess(editId, payload)
      } else {
        // DO NOT CREATE project immediately. Wait until step 2.
        if (onSuccess) {
          onSuccess(undefined, payload)
        }
      }
    } catch (error: unknown) {
      console.error('API Error:', error)

      // Default generic error
      let errorMessage = 'System error. Please try again.'

      if (error instanceof Error) {
        // If it's a generic Axios message about status codes, keep our generic message
        if (!error.message.includes('Request failed with status code')) {
          errorMessage = error.message
        }
      }

      // type narrowing for axios/api errors
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const responseError = error as {
          response?: { status?: number; data?: { message?: string } }
        }
        const status = responseError.response?.status

        // If we get an explicit message from the backend, use it
        if (responseError.response?.data?.message) {
          errorMessage = responseError.response.data.message
        } else if (
          status === 401 ||
          status === 403 ||
          status === 500 ||
          status === 502 ||
          status === 503
        ) {
          // Fallback to generic system error for known bad HTTP statuses
          errorMessage = 'System error. Please try again.'
        }
      }

      form.setFields([
        {
          name: 'projectName',
          errors: [errorMessage]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Form
      form={form}
      layout="vertical"
      // Thay đổi quan trọng: Dùng class trong suốt để hòa trộn vào Glass Card của Page cha
      className="!w-full !max-w-none !p-0 !bg-transparent !border-0 !shadow-none"
      onFinish={onFinish}
    >
      <div className="flex flex-col gap-8">
        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CỘT TRÁI (Thông tin chính - Chiếm 2 phần) */}
          <div className="md:col-span-2 space-y-6">
            <Form.Item
              name="projectName"
              label="Project Name *"
              rules={[{ required: true, message: 'Please enter project name' }]}
            >
              <Input
                size="large"
                placeholder="e.g. Autonomous Vehicle Perception Phase 2"
                disabled={!!editId}
                className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 focus:!border-violet-500 hover:!border-violet-500/50 disabled:!opacity-60 disabled:!cursor-not-allowed"
              />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={8}
                placeholder="Briefly describe the goals and scope of this project..."
                className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 resize-none focus:!border-violet-500 hover:!border-violet-500/50"
              />
            </Form.Item>
          </div>

          {/* CỘT PHẢI (Cấu hình phụ - Chiếm 1 phần) */}
          <div className="space-y-6">
            {/* Note Box trang trí */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20">
              <h4 className="text-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
                Manager Tip
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed m-0">
                Active projects are visible immediately to the assigned workforce. Set to{' '}
                <strong>Blocked</strong> if you want to prepare data before launching.
              </p>
            </div>
          </div>
        </div>

        {/* --- Footer Component --- */}
        {/* Sử dụng FormFooter chung để đồng bộ nút bấm */}
        <FormFooter
          currentStep={1}
          totalSteps={2}
          submitLabel="NEXT STEP"
          isLoading={loading}
          onCancel={handleCancel}
        />
      </div>
    </Form>
  )
}
