import React, { useState, useEffect } from 'react'
import { X, Mail, Camera, Edit2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { userApi } from '@/services/userApi'
import { API_BASE_URL } from '@/lib/axios'
import type { UpdateUserRequest } from '@/shared/types/api.types'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1, { message: "Username is required" }),
  specialization: z.string().optional(),
})

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      specialization: "",
    },
  })

  useEffect(() => {
    if (user && open) {
      form.reset({
        email: user.email,
        username: user.username,
        specialization: user.specialization || ''
      })
    }
  }, [user, open, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      const payload = {
        ...user,
        email: values.email,
        username: values.username,
        specialization: values.specialization
      }

      await userApi.updateUser(user!.id, payload as UpdateUserRequest)
      setUser({
        ...user!,
        email: values.email,
        username: values.username,
        specialization: values.specialization
      })

      toast.success('Profile updated successfully')
      onClose()
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update profile')
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

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    try {
      setUploadingAvatar(true)
      const response = await userApi.updateAvatar(user!.id, file)

      const newAvatarUrl =
        (response as { avatarUrl?: string; data?: { avatarUrl?: string } }).avatarUrl ||
        (response as { avatarUrl?: string; data?: { avatarUrl?: string } }).data?.avatarUrl

      if (newAvatarUrl) {
        const updatedUser = { ...user!, avatar: newAvatarUrl }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        toast.warning('Avatar updated, please refresh to see changes if not updated.')
      }

      toast.success('Avatar updated successfully')
    } catch (error) {
      console.error('Avatar update failed:', error)
      toast.error('Failed to update avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const getAvatarUrl = (avatarPath: string | undefined | null) => {
    const finalPath = avatarPath || user?.coverImage
    if (!finalPath) return 'https://cdn-icons-png.flaticon.com/512/9408/9408175.png'
    if (finalPath.startsWith('http')) return finalPath
    const cleanPath = finalPath.startsWith('/') ? finalPath.substring(1) : finalPath
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
        className="relative w-full max-w-[650px] bg-[#f1f1f1] border border-gray-200 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[100] w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-white/80 text-[#111] hover:bg-white transition-all shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Banner Section */}
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={
              getAvatarUrl(user?.coverImage) ||
              'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=1000'
            }
            alt="Banner"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f1f1f1]/80" />
        </div>

        {/* Content Container */}
        <div className="px-8 pb-8 -mt-12 relative z-10">
          {/* Profile Header */}
          <div className="flex justify-between items-end mb-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div
                className={`w-28 h-28 rounded-full border-4 border-[#f1f1f1] overflow-hidden shadow-lg bg-white transition-all ${uploadingAvatar ? 'opacity-50' : 'group-hover:brightness-90'}`}
              >
                <img
                  src={getAvatarUrl(user?.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">
                <Camera className="w-4 h-4" />
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
              <h2 className="text-2xl font-bold text-[#111] mb-0">
                {user?.username || 'User Name'}
              </h2>
              {user?.specialization && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded uppercase tracking-wider border border-blue-200">
                  {user.specialization}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>

          {/* Form Section */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500 font-bold text-xs uppercase tracking-wider">Email address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <Input className="pl-10 h-11 bg-white border-gray-200 text-[#111]" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500 font-bold text-xs uppercase tracking-wider">Username</FormLabel>
                      <FormControl>
                        <Input className="h-11 bg-white border-gray-200 text-[#111]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 font-bold text-xs uppercase tracking-wider">Specialization</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Edit2 className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input className="pl-10 h-11 bg-white border-gray-200 text-[#111]" placeholder="e.g. Image Labeling, NLP, Audio Analysis" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-10">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="h-11 px-8 rounded-lg font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#111] text-white hover:bg-black h-11 px-8 rounded-lg font-bold"
                >
                  Save changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

