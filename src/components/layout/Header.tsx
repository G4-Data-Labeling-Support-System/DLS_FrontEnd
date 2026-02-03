// src/components/layout/Header.tsx
import { Button } from 'antd'
import { SettingOutlined, UserOutlined, BellOutlined } from '@ant-design/icons'

export function Header() {
  return (
    <header className="bg-transparent px-8 h-20 flex items-center justify-between z-10 border-b border-white/10 shrink-0 backdrop-blur-[2px]">
      {/* --- LOGO SECTION --- */}
      <div className="flex items-center gap-3">
        {/* Icon: Đổi sang màu Violet và thêm hiệu ứng đổ bóng nhẹ */}
        <div className="text-violet-500 text-2xl drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
          <SettingOutlined spin />
        </div>

        {/* Text: "Data Labeling" màu trắng, "System" chạy gradient tím-hồng */}
        <span className="text-white font-bold text-xl tracking-wider font-sans">
          Data Labeling{' '}
          <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            System
          </span>
        </span>
      </div>

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
