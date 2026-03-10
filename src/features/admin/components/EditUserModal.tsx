import { Form, Input, Select, message } from 'antd'
import { UserOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Button } from '@/shared/components/ui/Button'
import { GlassModal } from '@/shared/components/ui/GlassModal'
import { useEffect } from 'react'
import { useUpdateUser } from '@/features/admin/hooks/useUsers'
import type { AxiosError } from 'axios'
import type { User } from '@/shared/types/api.types'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: User) => void
  userData?: User & { userId?: string; userRole?: string }
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  userData
}: EditUserModalProps) {
  const [form] = Form.useForm()
  const updateUserMutation = useUpdateUser()

  useEffect(() => {
    if (isOpen && userData) {
      const rawRole = userData.userRole || userData.role || 'annotator'
      const normalizedRole = rawRole.toLowerCase()

      form.setFieldsValue({
        username: userData.username,
        email: userData.email,
        role: normalizedRole,
        specialization: userData.specialization || ''
      })
    }
  }, [isOpen, userData, form])

  const handleSubmit = async (values: Record<string, string>) => {
    const roleMapping: Record<string, string> = {
      annotator: 'Annotator',
      reviewer: 'Reviewer',
      manager: 'Manager'
    }

    const payload = {
      ...values,
      role: roleMapping[values.role] || values.role
    }

    const userId = userData?.userId || userData?.id
    if (!userId) return

    updateUserMutation.mutate(
      { userId, data: payload },
      {
        onSuccess: (data) => {
          message.success('User updated successfully')
          form.resetFields()
          onSuccess?.(data as User)
        },
        onError: (error: AxiosError) => {
          const errorData = error.response?.data as { message?: string }
          console.error('Backend Error Details:', errorData)

          const messageStr =
            errorData?.message || JSON.stringify(errorData) || 'Failed to update user'
          message.error(`Error: ${messageStr}`)
        }
      }
    )
  }

  return (
    <GlassModal open={isOpen} onCancel={onClose} width={560}>
      {/* Header */}
      <div className="px-8 pt-10 pb-6 text-center border-b border-white/5">
        <h2 className="text-white text-3xl font-bold tracking-tight mb-2">Edit User</h2>
        <p className="text-white/50 text-sm">Modify account details and access roles.</p>
      </div>

      {/* Form Content */}
      <div className="px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="flex flex-col gap-2"
          requiredMark={false}
        >
          {/* Username Field */}
          <Form.Item
            name="username"
            label={<span className="text-gray-300 font-medium">Username</span>}
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input
              size="large"
              disabled
              prefix={<UserOutlined className="text-gray-500" />}
              placeholder="e.g. jdoe123"
            />
          </Form.Item>

          {/* Email Address Field */}
          <Form.Item
            name="email"
            label={<span className="text-gray-300 font-medium">Email Address</span>}
            rules={[
              { required: true, message: 'Please enter email address' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined className="text-gray-500" />}
              placeholder="name@company.com"
            />
          </Form.Item>

          {/* Specialization */}
          <Form.Item
            name="specialization"
            label={<span className="text-gray-300 font-medium">Specialization</span>}
            // rules={[{ required: true, message: 'Please enter a specialization' }]}
          >
            <Input size="large" placeholder="e.g. NLP" />
          </Form.Item>

          {/* Role Selection Dropdown */}
          <Form.Item
            name="role"
            label={<span className="text-gray-300 font-medium">Access Role</span>}
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              size="large"
              className="custom-select"
              suffixIcon={<SafetyCertificateOutlined className="text-gray-500" />}
              // @ts-expect-error - Ant Design type definition might not be updated but this is the fix for warning
              classNames={{ popup: 'glass-dropdown' }}
              options={[
                { label: 'Annotator', value: 'annotator' },
                { label: 'Reviewer', value: 'reviewer' },
                { label: 'Manager', value: 'manager' }
              ]}
            />
          </Form.Item>

          {/* Action Buttons */}
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
              isLoading={updateUserMutation.isPending}
              className="flex-[2] h-11"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </GlassModal>
  )
}
