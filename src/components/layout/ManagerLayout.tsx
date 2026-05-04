import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'

const ManagerLayout: React.FC = () => {
  return (
    <div className="manager-layout-container bg-transparent flex flex-col min-h-screen">
      {/* Background handled globally in index.css */}

      {/* Header chung */}
      <Header />

      {/* Nội dung thay đổi (Pages) sẽ hiển thị ở đây */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto z-10 p-4 md:p-8 flex flex-col gap-8 pb-32">
        <Outlet />
      </main>
    </div>
  )
}

export default ManagerLayout
