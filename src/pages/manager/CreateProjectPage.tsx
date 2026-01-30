import React from 'react';
import { Layout, Breadcrumb, ConfigProvider, theme } from 'antd';
import { CreateProjectForm } from '@/features/manager/components/CreateProjectForm';
import { Header } from '@/components/layout/Header';
import { ProjectSteps } from '@/features/manager/components/common/ProjectSteps';
import '@/features/manager/components/manager.css';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

const CreateProjectPage: React.FC = () => {
    // 2. Khởi tạo hook navigate
    const navigate = useNavigate();

    // 3. Hàm này được gọi khi CreateProjectForm chạy xong API thành công
    const handleProjectCreated = () => {
        // Chuyển hướng đến đường dẫn trang Dataset Setup
        navigate('/manager/project/dataset');
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#8b5cf6',
                    fontFamily: "'Public Sans', sans-serif",
                },
            }}
        >
            <Layout className="manager-page-bg">
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
                </div>

                <Header />

                <Content className="w-full z-10 flex flex-col items-center pt-12 pb-24 px-4 md:px-8">
                    <div className="w-full max-w-[1000px] mb-8">
                        <Breadcrumb items={[{ title: 'Dashboard' }, { title: 'New Project' }]} className="mb-2 text-gray-400" />
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                            Create New Project
                        </h1>
                    </div>

                    {/* Step 0: General Info */}
                    <ProjectSteps current={0} />

                    {/* Truyền hàm navigate xuống Form */}
                    <CreateProjectForm onSuccess={handleProjectCreated} />

                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default CreateProjectPage;