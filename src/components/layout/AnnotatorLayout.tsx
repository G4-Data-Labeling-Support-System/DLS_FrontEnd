import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { themeClasses } from '@/styles';

const { Content } = Layout;

const AnnotatorLayout: React.FC = () => {
    return (
        <Layout className={`min-h-screen ${themeClasses.backgrounds.deepDark}`} style={{ background: '#0f0e17' }}>
            <Header />

            <Layout className="bg-transparent" style={{ background: 'transparent' }}>
                {/* Main Content Area */}
                <Content className="w-full max-w-[1600px] mx-auto p-6 overflow-auto">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AnnotatorLayout;
