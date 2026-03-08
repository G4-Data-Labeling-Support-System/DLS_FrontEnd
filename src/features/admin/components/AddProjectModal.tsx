import { Form, Input, Select, message } from 'antd'
import { ProjectOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Button } from '@/shared/components/ui/Button'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { useCreateProject } from '@/features/admin/hooks/useProjects'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (project: any) => void
}

export default function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const [form] = Form.useForm()
  const createProjectMutation = useCreateProject()

  const handleSubmit = async (values: any) => {
    const payload = {
      projectName: values.projectName,
      description: values.description,
      projectStatus: values.status || 'ACTIVE'
    }

    createProjectMutation.mutate(payload, {
      onSuccess: (data) => {
        form.resetFields()
        message.success('Project created successfully!')
        onSuccess?.(data)
      },
      onError: (error: any) => {
        const errorData = error.response?.data
        console.error('Backend Error Details:', errorData)
        const messageStr =
          errorData?.message || JSON.stringify(errorData) || 'Failed to create project'
        message.error(`Error: ${messageStr}`)
      }
    })
  }

  return (
    <GlassModal open={isOpen} onCancel={onClose} width={560}>
      <div className="px-8 pt-10 pb-6 text-center border-b border-white/5">
        <h2 className="text-white text-3xl font-bold tracking-tight mb-2">Create New Project</h2>
        <p className="text-white/50 text-sm">
          Initialize a new labeling project and configure its settings.
        </p>
      </div>

      <div className="px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'ACTIVE' }}
          className="flex flex-col gap-2"
          requiredMark={false}
        >
          <Form.Item
            name="projectName"
            label={<span className="text-gray-300 font-medium">Project Name</span>}
            rules={[{ required: true, message: 'Please enter a project name' }]}
          >
            <Input
              size="large"
              prefix={<ProjectOutlined className="text-gray-500" />}
              placeholder="e.g. Autonomous Vehicle Labeling"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-gray-300 font-medium">Description</span>}
          >
            <Input.TextArea
              rows={4}
              placeholder="Briefly describe the goals and scope of this project..."
              className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 resize-none focus:!border-violet-500 hover:!border-violet-500/50"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-gray-300 font-medium">Initial Status</span>}
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select
              size="large"
              className="custom-select"
              suffixIcon={<SafetyCertificateOutlined className="text-gray-500" />}
              // @ts-expect-error - Ant Design classNames prop type mismatch in some versions
              classNames={{ popup: 'glass-dropdown' }}
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Ongoing', value: 'ONGOING' },
                { label: 'Paused', value: 'PAUSED' }
              ]}
            />
          </Form.Item>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1 h-11 border-white/10 bg-transparent text-gray-300 hover:text-white hover:border-white/30"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={createProjectMutation.isPending}
              className="flex-[2] h-11"
            >
              Create Project
            </Button>
          </div>
        </Form>
      </div>
    </GlassModal>
  )
}
