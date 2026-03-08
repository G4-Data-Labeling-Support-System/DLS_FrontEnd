import React, { useState, useEffect } from 'react'
import { Form, Input, Button, notification } from 'antd'
import { CloseOutlined, MailOutlined, CameraOutlined, EditOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store'
import { userApi } from '@/api/userApi'
import { API_BASE_URL } from '@/lib/axios'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user, setUser } = useAuthStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        email: user.email,
        username: user.username,
        specialization: user.specialization || ''
      })
    }
  }, [user, open, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload = {
        ...user,
        email: values.email,
        username: values.username,
        specialization: values.specialization
      }

      await userApi.updateUser(user!.id, payload as any)
      setUser({
        ...user!,
        email: values.email,
        username: values.username,
        specialization: values.specialization
      })

      notification.success({ message: 'Profile updated successfully' })
      onClose()
    } catch (error) {
      console.error('Update failed:', error)
      notification.error({ message: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      notification.error({ message: 'Please select an image file' })
      return
    }

    try {
      setUploadingAvatar(true)
      const response = await userApi.updateAvatar(user!.id, file)

      // Assuming the backend returns the new avatar URL or we just need to refresh the user data
      const newAvatarUrl = (response as any).avatarUrl || (response as any).data?.avatarUrl

      if (newAvatarUrl) {
        setUser({ ...user!, coverImage: newAvatarUrl })
      } else {
        // If it doesn't return the URL, we might need to refetch profile or just assume it worked
        // and maybe the avatar path is predictable or returned in the whole user object
        notification.warning({
          message: 'Avatar updated, please refresh to see changes if not updated.'
        })
      }

      notification.success({ message: 'Avatar updated successfully' })
    } catch (error) {
      console.error('Avatar update failed:', error)
      notification.error({ message: 'Failed to update avatar' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const getAvatarUrl = (avatarPath: string | undefined | null) => {
    if (!avatarPath) return 'https://cdn-icons-png.flaticon.com/512/9408/9408175.png'
    if (avatarPath.startsWith('http')) return avatarPath
    const cleanPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath
    return `${API_BASE_URL}/${cleanPath}`
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-[650px] bg-[#0D0D0D] border border-[#333] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[100] w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-black/30 text-white/50 hover:text-white hover:bg-black/50 transition-all border border-white/10"
        >
          <CloseOutlined />
        </button>

        {/* Banner Section */}
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={
              getAvatarUrl(user?.coverImage) ||
              'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=1000'
            }
            alt="Banner"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D0D0D]" />
        </div>

        {/* Content Container */}
        <div className="px-8 pb-8 -mt-12 relative z-10">
          {/* Profile Header */}
          <div className="flex justify-between items-end mb-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div
                className={`w-28 h-28 rounded-full border-4 border-[#0D0D0D] overflow-hidden shadow-2xl bg-[#1A1A1A] transition-all ${uploadingAvatar ? 'opacity-50' : 'group-hover:brightness-75'}`}
              >
                <img
                  src={getAvatarUrl(user?.coverImage)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-white shadow-lg">
                <CameraOutlined className="text-sm" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* User Info Bar */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white mb-0">
                {user?.username || 'User Name'}
              </h2>
              {user?.specialization && (
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded uppercase tracking-wider border border-blue-500/20">
                  {user.specialization}
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>

          {/* Form Section */}
          <Form form={form} layout="vertical" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">
                    Email address
                  </span>
                }
                name="email"
              >
                <Input
                  prefix={<MailOutlined className="text-gray-500 mr-2" />}
                  className="dark-form-input h-11"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">
                    Username
                  </span>
                }
                name="username"
              >
                <Input className="dark-form-input h-11" />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">
                  Specialization
                </span>
              }
              name="specialization"
            >
              <Input
                prefix={<EditOutlined className="text-gray-500 mr-2" />}
                className="dark-form-input h-11"
                placeholder="e.g. Image Labeling, NLP, Audio Analysis"
              />
            </Form.Item>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-800/50 mt-10">
              <Button
                onClick={onClose}
                className="bg-transparent border-gray-700 text-white hover:bg-white/5 h-11 px-8 rounded-lg font-bold"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={loading}
                onClick={handleSave}
                className="bg-[#2D2D2D] border-none text-white hover:bg-[#3D3D3D] h-11 px-8 rounded-lg font-bold"
              >
                Save changes
              </Button>
            </div>
          </Form>
        </div>
      </div>

      <style>{`
                .dark-form-input {
                    background: #1A1A1A !important;
                    border: 1px solid #333 !important;
                    color: white !important;
                    border-radius: 8px !important;
                    transition: all 0.3s;
                }
                .dark-form-input:focus, .dark-form-input:hover {
                    border-color: #555 !important;
                    background: #222 !important;
                }
                .ant-form-item-label label {
                    color: #9CA3AF !important;
                    padding-bottom: 8px;
                }
            `}</style>
    </div>
  )
}
