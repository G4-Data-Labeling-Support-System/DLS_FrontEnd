// src/components/layout/Header.tsx
import { Button } from 'antd'
import { UserOutlined, BellOutlined } from '@ant-design/icons'
import { BrandLogo } from '@/components/common/BrandLogo'

export function Header() {
  return (
    <header className="bg-transparent px-8 h-20 flex items-center justify-between z-10 border-b border-white/10 shrink-0 backdrop-blur-[2px]">
      {/* --- LOGO SECTION --- */}
      <BrandLogo />

      {/* --- ACTIONS SECTION --- */}
      <div className="flex items-center gap-4">
        {/* (Optional) Thêm nút thông báo cho đỡ trống */}
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined />}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        />

        {/* User Button: Style lại viền và hiệu ứng hover */}
        <Button
          shape="circle"
          icon={<UserOutlined />}
          className="bg-white/5 border border-white/10 text-violet-300 shadow-inner hover:text-white hover:border-violet-500 hover:bg-violet-600/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-300"
        />
      </div>
    </header>
  )
}
