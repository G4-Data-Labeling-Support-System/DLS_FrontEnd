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
  const [projectInfo, setProjectInfo] = useState<{
    projectName: string
    description: string
  } | null>(null)
  const [guidelineId, setGuidelineId] = useState<string | null>(null)

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
          const name = projectData.projectName || projectData.name
          const description = projectData.description
          form.setFieldsValue({
            projectName: name,
            description: description,
            guidelineTitle: latestGuideline?.title || '',
            guidelineContent: latestGuideline?.content || ''
          })
          setProjectInfo({ projectName: name, description: description })
          if (latestGuideline) {
            setGuidelineId(
              latestGuideline.guideId || latestGuideline.guide_id || latestGuideline.id
            )
          }
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
        setGuidelineId(null)
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

      const projectPayload = {
        projectName: values.projectName || projectInfo?.projectName,
        description: values.description || projectInfo?.description
      }

      const typedUser = user as User | null
      const currentUserId = typedUser?.id || typedUser?.userId || ''

      const guidelinePayload = {
        guide_id: guidelineId || undefined,
        title: values.guidelineTitle,
        content: values.guidelineContent,
        user_id: currentUserId,
        projectId: '' // Will be set below
      }

      if (editId) {
        // For updates, we can run both in parallel to ensure atomic-like success
        await Promise.all([
          projectApi.updateProject(editId, projectPayload),
          guidelineId
            ? guidelineApi.updateGuideline(guidelineId, { ...guidelinePayload, projectId: editId })
            : guidelineApi.createGuideline(editId, { ...guidelinePayload, projectId: editId })
        ])
      } else {
        // For creation, we must run sequentially to get currentProjectId
        const response = await projectApi.createProject(projectPayload)
        const createdProject = response.data?.data || response.data
        currentProjectId = createdProject?.projectId || createdProject?.id

        if (!currentProjectId) {
          throw new Error('Failed to identify Project ID')
        }

        await guidelineApi.createGuideline(currentProjectId, {
          ...guidelinePayload,
          projectId: currentProjectId
        })
      }

      message.success(editId ? 'Project updated successfully!' : 'Project created successfully!')
      onSuccess(currentProjectId || '', projectPayload)
      form.resetFields()
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }

      console.error('API Error:', error)
      const apiError =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as Error)?.message ||
        (editId ? 'Failed to update project' : 'Failed to create project')
      message.error(apiError)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const steps = [{ title: 'Project Info' }, { title: 'Guidelines' }]

  return (
    <GlassModal open={open} onCancel={handleCancel} destroyOnHidden width={720}>
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
          <Form form={form} layout="vertical" className="mt-6" preserve={true}>
            {currentStep === 0 && (
              <div className="space-y-6">
                <Form.Item
                  name="projectName"
                  label="Project Name"
                  rules={[{ required: true, message: 'Please enter project name' }]}
                >
                  <Input
                    placeholder="e.g. Autonomous Vehicle Perception Phase 2"
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
