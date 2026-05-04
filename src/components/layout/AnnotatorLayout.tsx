import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { themeClasses } from '@/styles'

const AnnotatorLayout: React.FC = () => {
  return (
    <div
      className="min-h-screen relative overflow-hidden bg-transparent flex flex-col"
      style={{ background: 'transparent' }}
    >
      {/* Background handled globally in index.css */}

      <Header />

      <div className="bg-transparent z-10 flex-1 flex flex-col" style={{ background: 'transparent' }}>
        {/* Main Content Area */}
        <main className="w-full max-w-[1600px] mx-auto p-6 overflow-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AnnotatorLayout
