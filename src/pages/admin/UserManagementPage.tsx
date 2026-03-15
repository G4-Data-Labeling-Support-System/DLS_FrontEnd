import { useState } from 'react'
import AddUserModal from '../../features/admin/components/AddUserModal'
import EditUserModal from '../../features/admin/components/EditUserModal'
import AddUserSuccessModal from '../../features/admin/components/AddUserSuccessModal'
import { themeClasses } from '@/styles'
import type { User } from '@/shared/types/api.types'
import { Button } from '@/shared/components/ui/Button'
import {
  UserAddOutlined,
  PlusOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { App, Dropdown, type MenuProps } from 'antd'
import { useUsers, useDeleteUser, useActivateUser, useDeactivateUser } from '@/features/admin/hooks/useUsers'

export default function UserManagement() {
  const { message } = App.useApp()
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [editModal, setEditModal] = useState<{ isOpen: boolean; data?: User }>({ isOpen: false })
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; data?: User }>({
    isOpen: false
  })
  const { data: rawUsers, isLoading } = useUsers()
  const deleteUserMutation = useDeleteUser()
  const deactivateUserMutation = useDeactivateUser()
  const activateUserMutation = useActivateUser()

  // [Logic: Safety Check] Kiểm tra cấu trúc trả về từ API
  // React Query có thể trả về array trực tiếp hoặc object chứa data (VD: response.data)
  const users = Array.isArray(rawUsers)
    ? (rawUsers as User[])
    : (rawUsers as unknown as { data: User[] })?.data || []
  // console.log("Users API Response:", rawUsers, "Parsed Users:", users);

  const activeUsersCount = users.filter(
    (u: User) =>
      (u.userRole || u.role || '').toUpperCase() === 'ACTIVE' ||
      u.userStatus?.toUpperCase() === 'ACTIVE' ||
      (u.status || '').toUpperCase() === 'ACTIVE'
  ).length
  const inactiveUsersCount = users.length - activeUsersCount

  const handleUserCreateSuccess = (data: User) => {
    setIsAddUserModalOpen(false)
    setSuccessModal({ isOpen: true, data })
  }

  const getActionItems = (user: User): MenuProps['items'] => {
    const rawStatus = user.userStatus || user.status || 'Active'
    const isUserActive = rawStatus.toUpperCase() === 'ACTIVE'

    return [
      {
        key: 'edit',
        label: 'Edit User',
        icon: <EditOutlined />,
        onClick: () => {
          setEditModal({ isOpen: true, data: user })
        }
      },
      isUserActive
        ? {
          key: 'deactivate',
          label: 'Inactive User',
          icon: <CloseCircleOutlined style={{ color: '#f59e0b' }} />,
          danger: false,
          onClick: () => {
            const userId = user.userId || user.id
            if (window.confirm(`Are you sure you want to deactivate ${user.username || user.fullName}?`)) {
              deactivateUserMutation.mutate(userId, {
                onSuccess: () => {
                  message.success(`User ${user.username || user.fullName} has been deactivated.`)
                },
                onError: (error) => {
                  message.error(`Failed to deactivate user: ${error.message || 'Unknown error'}`)
                }
              })
            }
          }
        }
        : {
          key: 'activate',
          label: 'Activate User',
          icon: <CheckCircleOutlined style={{ color: '#10b981' }} />,
          onClick: () => {
            const userId = user.userId || user.id
            if (window.confirm(`Are you sure you want to activate ${user.username || user.fullName}?`)) {
              activateUserMutation.mutate(userId, {
                onSuccess: () => {
                  message.success(`User ${user.username || user.fullName} has been activated.`)
                },
                onError: (error) => {
                  message.error(`Failed to activate user: ${error.message || 'Unknown error'}`)
                }
              })
            }
          }
        },
      {
        key: 'delete',
        label: 'Remove User',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          const userId = user.userId || user.id
          if (window.confirm(`Are you sure you want to permanently delete ${user.username || user.fullName}? This cannot be undone.`)) {
            deleteUserMutation.mutate(userId, {
              onSuccess: () => {
                message.success(`User ${user.username || user.fullName} has been permanently removed.`)
              },
              onError: (error) => {
                message.error(`Failed to remove user: ${error.message || 'Unknown error'}`)
              }
            })
          }
        }
      }
    ]
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h2
            className={`text-2xl font-bold tracking-tight ${themeClasses.text.violet} md:text-3xl`}
          >
            User Management
          </h2>
          <p className={`font-body text-sm ${themeClasses.text.secondary}`}>
            Manage users, permissions, and monitor backend performance.
          </p>
        </div>
        <Button
          onClick={() => setIsAddUserModalOpen(true)}
          variant="primary"
          className="group relative flex items-center gap-2 overflow-hidden px-5 py-2.5 font-body"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
          <UserAddOutlined className="text-lg" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Total Users */}
        <div
          className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                Total Users
              </p>
              <p className="text-3xl font-bold tracking-tight text-white">
                {isLoading ? '-' : users?.length || 0}
              </p>
            </div>
            <div
              className={`h-10 w-10 rounded-lg ${themeClasses.backgrounds.violetAlpha10} flex items-center justify-center ${themeClasses.text.violet}`}
            >
              <TeamOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
              +0%
            </span>
            <span className={`text-xs ${themeClasses.text.tertiary}`}>vs last week</span>
          </div>
        </div>

        {/* Active Users */}
        <div
          className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                Active Users
              </p>
              <p className="text-3xl font-bold tracking-tight text-white">
                {isLoading ? '-' : activeUsersCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircleOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-xs font-medium ${themeClasses.text.secondary}`}>
              Users currently active
            </p>
            <div
              className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${themeClasses.backgrounds.whiteAlpha5}`}
            >
              <div
                className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                style={{
                  width: users.length > 0 ? `${(activeUsersCount / users.length) * 100}%` : '0%'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Inactive Users */}
        <div
          className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                Inactive Users
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold tracking-tight text-white">
                  {isLoading ? '-' : inactiveUsersCount}
                </p>
              </div>
            </div>
            <div
              className={`h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-400`}
            >
              <DeleteOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-xs font-medium ${themeClasses.text.secondary}`}>
              Deactivated or pending
            </p>
            <div
              className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${themeClasses.backgrounds.whiteAlpha5}`}
            >
              <div
                className="h-full rounded-full bg-gray-400"
                style={{
                  width: users.length > 0 ? `${(inactiveUsersCount / users.length) * 100}%` : '0%'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className={`glass-card flex flex-col overflow-hidden rounded-xl`}>
        <div
          className={`border-b ${themeClasses.borders.white5} px-6 py-5 flex justify-between items-center ${themeClasses.backgrounds.card}`}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white">User Management</h3>
            <p className={`text-sm ${themeClasses.text.secondary} font-body`}>
              List of users in the system ({users?.length || 0})
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsAddUserModalOpen(true)}
              variant="primary"
              className="group relative flex items-center gap-2 overflow-hidden px-4 py-2 font-body text-sm font-semibold"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <PlusOutlined className="text-lg" />
              <span>Add User</span>
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead
              className={`text-[11px] uppercase ${themeClasses.text.tertiary} font-bold tracking-wider border-b ${themeClasses.borders.white5}`}
            >
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tasks</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeClasses.borders.white5} font-body text-sm`}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users?.map((user: User) => {
                  // Handle backend field difference and normalize
                  const rawRole = user.userRole || user.role || 'Unknown'
                  const roleLower = rawRole.toLowerCase()
                  const displayRole =
                    rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()

                  const rawStatus = user.userStatus || user.status || 'Active'
                  const isUserActive = rawStatus.toUpperCase() === 'ACTIVE'
                  const displayStatus =
                    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()

                  const userId = user.userId || user.id

                  return (
                    <tr
                      key={userId}
                      className={`group transition-colors hover:${themeClasses.backgrounds.whiteAlpha5}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 overflow-hidden rounded-full ${themeClasses.backgrounds.card} ring-1 ring-white/10 transition-all group-hover:ring-violet-500/50 flex items-center justify-center`}
                          >
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className={`text-sm font-bold ${themeClasses.text.violet}`}>
                                {user.username?.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-[15px]">
                              {user.fullName || user.username}
                            </span>
                            <span className={`text-sm ${themeClasses.text.tertiary}`}>
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold
                                                ${roleLower === 'annotator'
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              : roleLower === 'reviewer'
                                ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                                : roleLower === 'manager'
                                  ? 'border-purple-500/20 bg-purple-500/10 text-purple-400'
                                  : 'border-red-500/20 bg-red-500/10 text-red-400'
                            }`}
                        >
                          {displayRole}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${isUserActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-gray-500'}`}
                          ></span>
                          <span
                            className={`${isUserActive ? 'text-emerald-500' : 'text-gray-400'} text-sm font-medium`}
                          >
                            {displayStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-white text-[15px]">0</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Dropdown
                          menu={{ items: getActionItems(user) }}
                          trigger={['click']}
                          placement="bottomRight"
                          overlayClassName="dark-dropdown" // Optional: custom class for styling if needed
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${themeClasses.text.tertiary} hover:text-white transition-colors`}
                          >
                            <MoreOutlined className="text-lg" />
                          </Button>
                        </Dropdown>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={handleUserCreateSuccess}
      />

      {/* Success Modal */}
      <AddUserSuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        onAddAnother={() => {
          setSuccessModal({ ...successModal, isOpen: false })
          setIsAddUserModalOpen(true)
        }}
        userData={
          successModal.data
            ? {
              name: successModal.data.fullName,
              email: successModal.data.email,
              role: successModal.data.role
            }
            : undefined
        }
      />
      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false })}
        userData={editModal.data}
        onSuccess={() => {
          setEditModal({ isOpen: false })
        }}
      />
    </div>
  )
}
