import React from 'react';
import { Layout, Steps, Breadcrumb, ConfigProvider, theme } from 'antd';
import { CreateProjectForm } from '@/features/manager/components/CreateProjectForm';
import { Header } from '@/components/layout/Header'; // Giả sử đường dẫn Header của bạn
import '@/features/manager/components/manager.css'; // Import CSS

const { Content } = Layout;

const CreateProjectPage: React.FC = () => {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#9d27f1',
                    fontFamily: "'Public Sans', sans-serif",
                },
            }}
        >
            {/* Sử dụng class manager-page-bg để có nền full và grid */}
            <Layout className="manager-page-bg">

                {/* Glow Effects */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
                </div>

                <Header />

                <Content className="w-full z-10 flex flex-col items-center pt-12 pb-24 px-4 md:px-8">

                    {/* Tiêu đề & Breadcrumb: Giới hạn max-w 1000px để thẳng hàng với nội dung Form */}
                    <div className="w-full max-w-[1000px] mb-8">
                        <Breadcrumb items={[{ title: 'Dashboard' }, { title: 'New Project' }]} className="mb-2 opacity-50" />
                        <h1 className="text-4xl font-extrabold text-white">Create New Project</h1>
                    </div>

                    {/* Steps: Giới hạn max-w 1000px */}
                    <div className="w-full max-w-[1000px] mb-12">
                        <Steps
                            current={0}
                            size="small"
                            items={[
                                { title: 'General Info' },
                                { title: 'Dataset' },
                                { title: 'Guidelines' },
                                { title: 'Team' },
                            ]}
                        />
                    </div>

                    {/* Form Component: Tự nó sẽ rộng 70% màn hình nhờ class .project-glass-card */}
                    <CreateProjectForm />

                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default CreateProjectPage;