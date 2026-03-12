import React, { useState, useEffect } from 'react'
import { App, Form, Input, Spin, Button, Steps } from 'antd'
import projectApi from '@/api/ProjectApi'
import guidelineApi from '@/api/GuidelineApi'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { useAuthStore } from '@/store'
import type { User } from '@/shared/types/api.types'

interface CreateProjectModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: (
    projectId?: string,
    projectData?: { projectName: string; description: string }
  ) => void
  editId?: string
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onCancel,
  onSuccess,
  editId
}) => {
  const { message } = App.useApp()
  const { user } = useAuthStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [projectInfo, setProjectInfo] = useState<{ projectName: string; description: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!open || !editId) return
      try {
        setFetching(true)
        // Fetch project details
        const projectRes = await projectApi.getProjectById(editId)
        const projectData = projectRes.data?.data || projectRes.data

        // Fetch guidelines
        const guidelineRes = await guidelineApi.getGuidelines(editId)
        const guidelines = guidelineRes.data?.data || guidelineRes.data
        const latestGuideline = Array.isArray(guidelines) ? guidelines[0] : guidelines

        if (projectData) {
          form.setFieldsValue({
            projectName: projectData.projectName || projectData.name,
            description: projectData.description,
            guidelineTitle: latestGuideline?.title || '',
            guidelineContent: latestGuideline?.content || ''
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        message.error('Failed to load project details.')
      } finally {
        setFetching(false)
      }
    }

    if (open) {
      if (editId) {
        fetchData()
      } else {
        form.resetFields()
        setCurrentStep(0)
        setProjectInfo(null)
      }
    }
  }, [editId, form, open, message])

  const handleNext = async () => {
    try {
      const values = await form.validateFields(['projectName', 'description'])
      setProjectInfo({ projectName: values.projectName, description: values.description })
      setCurrentStep(1)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      message.error(errorMessage)
    }
  }

  const handlePrev = () => {
    setCurrentStep(0)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      let currentProjectId = editId

      // 1. Create/Update Project
      const payload = {
        ...(editId ? { id: editId, projectId: editId } : {}),
        projectName: projectInfo?.projectName || values.projectName,
        description: projectInfo?.description || values.description
      }

      if (editId) {
        await projectApi.updateProject(editId, payload)
      } else {
        const response = await projectApi.createProject(payload)
        const createdProject = response.data?.data || response.data
        currentProjectId = createdProject?.projectId || createdProject?.id
      }

      if (!currentProjectId) {
        throw new Error('Failed to identify Project ID')
      }

      // 2. Create/Update Guidelines
      const typedUser = user as User | null
      const currentUserId = typedUser?.id || typedUser?.userId || ''

      const guidelinePayload = {
        title: values.guidelineTitle,
        content: values.guidelineContent,
        user_id: currentUserId,
        projectId: currentProjectId
      }

      await guidelineApi.createGuideline(currentProjectId, guidelinePayload)

      message.success(editId ? 'Project updated successfully!' : 'Project created successfully!')
      onSuccess(currentProjectId, payload)
      form.resetFields()
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }

      console.error('API Error:', error)
      let errorMessage = 'System error. Please try again.'

      if (error instanceof Error && !error.message.includes('Request failed with status code')) {
        errorMessage = error.message
      }

      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const steps = [
    { title: 'Project Info' },
    { title: 'Guidelines' }
  ]

  return (
    <GlassModal
      open={open}
      onCancel={handleCancel}
      destroyOnHidden
      width={720}
    >
      <div className="px-8 pt-10 pb-8">
        <div className="text-center border-b border-white/5 pb-6 mb-8">
          <h2 className="text-white text-2xl font-bold tracking-tight mb-4 font-display">
            {editId ? 'Edit Project' : 'Create New Project'}
          </h2>
          <Steps
            current={currentStep}
            items={steps}
            size="small"
            className="!text-white custom-steps"
          />
        </div>

        {fetching ? (
          <div className="w-full h-64 flex justify-center items-center">
            <Spin size="large" />
          </div>
        ) : (
          <Form form={form} layout="vertical" className="mt-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <Form.Item
                  name="projectName"
                  label="Project Name"
                  rules={[{ required: true, message: 'Please enter project name' }]}
                >
                  <Input
                    placeholder="e.g. Autonomous Vehicle Perception Phase 2"
                    disabled={!!editId}
                    className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 focus:!border-violet-500 hover:!border-violet-500/50"
                  />
                </Form.Item>

                <Form.Item name="description" label="Description">
                  <Input.TextArea
                    rows={6}
                    placeholder="Briefly describe the goals and scope of this project..."
                    className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 resize-none focus:!border-violet-500 hover:!border-violet-500/50"
                  />
                </Form.Item>

                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20">
                  <h4 className="text-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
                    Manager Tip
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed m-0">
                    Step 1 defines the basic identity of your project.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <Form.Item
                  name="guidelineTitle"
                  label="Guideline Title"
                  rules={[{ required: true, message: 'Please enter guideline title' }]}
                >
                  <Input
                    placeholder="Enter guideline title..."
                    className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 focus:!border-violet-500 hover:!border-violet-500/50"
                  />
                </Form.Item>

                <Form.Item
                  name="guidelineContent"
                  label="Guideline Content"
                  rules={[{ required: true, message: 'Please enter guideline content' }]}
                >
                  <Input.TextArea
                    rows={8}
                    placeholder="Write your guideline content here..."
                    className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 resize-none focus:!border-violet-500 hover:!border-violet-500/50"
                  />
                </Form.Item>

                <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-violet-500/5 border border-fuchsia-500/20">
                  <h4 className="text-fuchsia-300 font-bold text-xs uppercase tracking-wider mb-2">
                    Requirements Tip
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed m-0">
                    Detailed guidelines significantly improve label quality.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-white/5">
              <Button
                onClick={handleCancel}
                className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
              >
                Cancel
              </Button>

              {currentStep === 1 && (
                <Button
                  onClick={handlePrev}
                  className="border-white/10 text-white/70 hover:text-white hover:border-white/30"
                >
                  Back
                </Button>
              )}

              {currentStep === 0 ? (
                <Button
                  type="primary"
                  onClick={handleNext}
                  className="bg-violet-600 hover:bg-violet-500 border-none px-8"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleSubmit}
                  className="bg-fuchsia-600 hover:bg-fuchsia-500 border-none px-8 shadow-[0_0_15px_rgba(192,38,211,0.3)]"
                >
                  {editId ? 'Update project' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </div>
    </GlassModal>
  )
}
