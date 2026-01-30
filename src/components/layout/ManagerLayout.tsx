import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { managerTheme } from '@/styles/themeConfig';
import '@/features/manager/components/manager.css';

const { Content } = Layout;

const ManagerLayout: React.FC = () => {
    return (
        <ConfigProvider theme={managerTheme}>
            <Layout className="manager-layout-container">

                {/* Background Glow Effects (Chỉ khai báo 1 lần dùng cho cả app) */}
                <div className="fixed inset-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                    {/* Màu nền gốc phủ kín màn hình (để che đi màu trắng nếu có) */}
                    <div className="absolute inset-0 bg-[#0f0e17]" />

                    {/* Các đốm sáng (Glow) */}
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[120px]" />

                </div>

                {/* Header chung */}
                <Header />

                {/* Nội dung thay đổi (Pages) sẽ hiển thị ở đây */}
                <Content className="w-full max-w-[1600px] mx-auto z-10 p-4 md:p-8 flex flex-col gap-8 pb-32">
                    <Outlet />
                </Content>

            </Layout>
        </ConfigProvider>
    );
};

export default ManagerLayout;
