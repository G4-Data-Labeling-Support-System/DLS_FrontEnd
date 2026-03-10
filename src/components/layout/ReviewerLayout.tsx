import React from 'react'
import { Layout, ConfigProvider } from 'antd'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { reviewerTheme } from '@/styles/themeConfig'

const { Content } = Layout

const ReviewerLayout: React.FC = () => {
  return (
    <ConfigProvider theme={reviewerTheme}>
      <Layout className="min-h-screen relative manager-layout-container">
        {/* Background Effects (Matched with ManagerLayout) */}
        <div className="fixed inset-0 w-full h-screen overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#0f0e17]" />
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
        </div>

        <Header />

        <Content className="w-full max-w-[1600px] mx-auto z-10 p-4 md:p-8 flex flex-col gap-8 pb-32">
          <Outlet />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default ReviewerLayout
