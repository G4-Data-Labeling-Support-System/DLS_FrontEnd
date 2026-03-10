import React from 'react'
import { Layout, ConfigProvider } from 'antd'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { themeClasses } from '@/styles'
import { annotatorTheme } from '@/styles/themeConfig'

const { Content } = Layout

const AnnotatorLayout: React.FC = () => {
  return (
    <ConfigProvider theme={annotatorTheme}>
      <Layout
        className={`min-h-screen ${themeClasses.backgrounds.deepDark} relative overflow-hidden`}
        style={{ background: '#0f0e17' }}
      >
        {/* Background Glow Effects */}
        <div className="fixed inset-0 w-full h-screen overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#0f0e17]" />
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
        </div>

        <Header />

        <Layout className="bg-transparent z-10" style={{ background: 'transparent' }}>
          {/* Main Content Area */}
          <Content className="w-full max-w-[1600px] mx-auto p-6 overflow-auto">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default AnnotatorLayout
