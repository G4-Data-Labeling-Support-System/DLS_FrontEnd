import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'

const ReviewerLayout: React.FC = () => {
  return (
    <div className="min-h-screen relative manager-layout-container bg-transparent flex flex-col">
      {/* Background handled globally in index.css */}

      <Header />

      <main className="flex-1 w-full max-w-[1600px] mx-auto z-10 p-4 md:p-8 flex flex-col gap-8 pb-32">
        <Outlet />
      </main>
    </div>
  )
}

export default ReviewerLayout
