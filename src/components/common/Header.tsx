import { useState } from 'react'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/common/BrandLogo'
import { useAuthStore } from '@/store'
import { API_BASE_URL } from '@/lib/axios'
import { ProfileModal } from './ProfileModal'

export function Header() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)


  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      className: 'hover:bg-gray-100 rounded-lg',
      onClick: () => setIsProfileModalOpen(true)
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      className: 'hover:bg-gray-100 rounded-lg',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Logout',
      className: 'rounded-lg',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  const getAvatarUrl = (avatarPath: string | undefined | null) => {
    if (!avatarPath) return "https://cdn-icons-png.flaticon.com/512/9408/9408175.png";
    if (avatarPath.startsWith('http')) return avatarPath;
    const cleanPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  return (
    <>
      <header className="bg-transparent px-8 h-20 flex items-center justify-between z-10 border-b border-white/10 shrink-0 backdrop-blur-[2px]">
        <BrandLogo />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification */}
          <Button
            type="text"
            shape="circle"
            icon={<span className="material-symbols-outlined text-[24px]">notifications</span>}
            className="text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center h-11 w-11"
          />

          {/* User Info & Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-right mr-1 hidden sm:flex">
              <span className="text-white text-sm font-bold leading-tight truncate max-w-[150px]">
                {user?.fullName || user?.username || 'Guest'}
              </span>
              <span className="text-gray-400 text-[10px] leading-tight truncate max-w-[180px]">
                {user?.email || ''}
              </span>
            </div>

            <Dropdown
              menu={{
                items,
                className: 'p-2 rounded-2xl shadow-2xl border border-gray-100 bg-white/95 backdrop-blur-md min-w-[200px]'
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div className="relative group cursor-pointer p-[2px] rounded-full transition-transform active:scale-95 duration-200">
                <div className="relative z-[2] w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src={getAvatarUrl(user?.coverImage || user?.avatar)}
                    alt="Avatar"
                    className="w-full h-full object-cover border border-gray-600 rounded-full"
                  />
                </div>
              </div>
            </Dropdown>
          </div>
        </div>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}</style>
      </header>

      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  )
}