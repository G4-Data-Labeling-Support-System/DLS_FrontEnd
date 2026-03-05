// src/components/layout/Header.tsx
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
  UserOutlined,
  BellOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { NavLink, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/common/BrandLogo'
import { useAuthStore } from '@/store'

export function Header() {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        navigate('/profile')
      }
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Logout',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-2 py-1 text-lg font-medium transition-colors duration-300
     ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`

  const underlineClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'absolute -bottom-1 left-0 w-full h-[2px] bg-white rounded-full'
      : 'hidden'

  return (
    <header className="bg-transparent px-8 h-20 flex items-center justify-between z-10 border-b border-white/10 shrink-0 backdrop-blur-[2px]">
      <BrandLogo />

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined />}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        />

        <Dropdown
          menu={{ items }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            shape="circle"
            icon={<UserOutlined />}
            className="bg-white/5 border border-white/10 text-violet-300 shadow-inner hover:text-white hover:border-violet-500 hover:bg-violet-600/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300"
          />
        </Dropdown>
      </div>
    </header>
  )
}