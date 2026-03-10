import { useState, useEffect } from 'react'
import { Form, Input, notification } from 'antd'
import { MailOutlined, UserOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/auth.store'
import { userApi } from '@/api/userApi'
import { themeClasses } from '@/styles'
import { Button } from '@/shared/components/ui/Button'
import type { UpdateUserRequest, User } from '@/shared/types/api.types'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: (user as User & { phone?: string }).phone || ''
      })
    }
  }, [user, form])

  const onFinish = async (values: { fullName: string; phone?: string }) => {
    if (!user?.id) return
    setLoading(true)
    try {
      const updateData = {
        fullName: values.fullName,
        phone: values.phone
      }

      // The backend update endpoint expects specific fields
      const payload: UpdateUserRequest = {
        username: user.username || '',
        email: user.email || '',
        coverImage: user.coverImage || '',
        specialization: (user as User & { specialization?: string }).specialization || '',
        role: user.role || user.userRole || '',
        userStatus: user.status || 'ACTIVE',
        fullName: values.fullName,
        phone: values.phone || ''
      }

      await userApi.updateUser(user.id, payload)

      // Update local store
      setUser({ ...user, ...updateData })
      notification.success({ message: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Update profile failed:', error)
      notification.error({ message: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 pb-32">
      <h1 className="text-3xl font-bold text-white mb-8">Edit Profile</h1>
      <div
        className={`login-card p-8 rounded-2xl border ${themeClasses.borders.violet20} relative`}
      >
        {/* Background glow for the form card */}
        <div
          className={`absolute inset-0 ${themeClasses.effects.gridMesh} opacity-10 pointer-events-none rounded-2xl`}
        ></div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4 relative z-10"
          requiredMark={false}
        >
          <Form.Item
            label={
              <span
                className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}
              >
                Email Address
              </span>
            }
            name="email"
          >
            <Input
              disabled
              size="large"
              className="glass-input opacity-70 cursor-not-allowed"
              prefix={
                <MailOutlined className="text-white opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
              }
            />
          </Form.Item>

          <Form.Item
            label={
              <span
                className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}
              >
                Full Name
              </span>
            }
            name="fullName"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input
              size="large"
              className="glass-input"
              prefix={
                <UserOutlined className="text-white opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
              }
            />
          </Form.Item>

          <Form.Item
            label={
              <span
                className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}
              >
                Phone Number
              </span>
            }
            name="phone"
          >
            <Input
              size="large"
              className="glass-input"
              prefix={
                <PhoneOutlined className="text-white opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
              }
            />
          </Form.Item>

          <Button type="submit" variant="primary" isLoading={loading} className="w-full mt-2">
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </Button>
        </Form>
      </div>

      <div
        className={`login-card p-8 mt-10 rounded-2xl border ${themeClasses.borders.violet20} relative`}
      >
        <div
          className={`absolute inset-0 ${themeClasses.effects.gridMesh} opacity-10 pointer-events-none rounded-2xl`}
        ></div>
        <h2 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-fuchsia-400">lock</span>
          Security
        </h2>
        <Form layout="vertical" className="space-y-4 relative z-10" requiredMark={false}>
          <Form.Item
            label={
              <span
                className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}
              >
                Current Password
              </span>
            }
            name="currentPassword"
          >
            <Input.Password
              size="large"
              className="glass-input"
              prefix={
                <LockOutlined className="text-white opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
              }
              placeholder="••••••••"
            />
          </Form.Item>

          <Form.Item
            label={
              <span
                className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wider pl-1`}
              >
                New Password
              </span>
            }
            name="newPassword"
          >
            <Input.Password
              size="large"
              className="glass-input"
              prefix={
                <LockOutlined className="text-white opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
              }
              placeholder="••••••••"
            />
          </Form.Item>

          <Button
            variant="secondary"
            className="w-full mt-2"
            onClick={() => notification.info({ message: 'Password update logic to be connected' })}
          >
            CHANGE PASSWORD
          </Button>
        </Form>
      </div>
    </div>
  )
}
