// Header Component - App Layout
// TODO: Implement navigation và user menu
import { Button } from 'antd';
import { SettingOutlined, UserOutlined } from '@ant-design/icons';


export function Header() {
  return (
    <header className="bg-transparent px-8 h-20 flex items-center justify-between z-10 border-b border-white/5 shrink-0">
      <div className="flex items-center gap-2">
        <div className="text-[#d946ef] text-2xl"><SettingOutlined spin /></div>
        <span className="text-white font-bold text-xl tracking-wider">Data Labeling <span className="text-[#d946ef] font-light">System</span></span>
      </div>
      <div className="flex items-center gap-4">
        <Button shape="circle" icon={<UserOutlined />} className="bg-white/10 border-none text-white" />
      </div>
    </header>
  )
}
