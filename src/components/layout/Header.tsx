// src/components/layout/Header.tsx
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  ProfileOutlined
} from '@ant-design/icons'
import { BrandLogo } from '@/components/common/BrandLogo'
import { useAuthStore } from '@/store'

export function Header() {
  const logout = useAuthStore((state) => state.logout)

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
      onClick: () => {
        console.log('Go to profile')
        // navigate('/profile') if using react-router
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Logout',
      onClick: () => {
        logout()
        // navigate('/login')
      }
    }
  ]

  return (
    <header className="bg-transparent px-8 h-20 flex items-center justify-between z-10 border-b border-white/10 shrink-0 backdrop-blur-[2px]">
      <BrandLogo />

      <div className="flex items-center gap-4">
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined />}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        />

        {/* 👇 Dropdown wrapper */}
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
