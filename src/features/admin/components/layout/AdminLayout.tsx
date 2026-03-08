import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/pages/admin/components/Sidebar';
import { Header } from '@/components/common/Header';
import { themeClasses } from '@/styles';

const { Content, Sider } = Layout;

/**
 * AdminLayout structure
 * Uses Ant Design Layout for structure and custom Sidebar/Header components.
 */
export default function AdminLayout() {
    return (
        <Layout className={`min-h-screen ${themeClasses.backgrounds.deepDark}`} style={{ background: '#0f0e17' }}>
            <Header />

            <Layout className="bg-transparent" style={{ background: 'transparent' }}>
                {/* Reusable Sidebar Component */}
                <Sider width={256} className="z-20 border-r border-white/10" theme="dark" style={{ background: 'transparent' }}>
                    <Sidebar className="h-full border-none" />
                </Sider>

                {/* Main Content Area */}
                <Content className="w-full max-w-[1600px] mx-auto p-6 overflow-auto">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
