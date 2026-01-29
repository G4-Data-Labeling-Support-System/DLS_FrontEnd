import React from 'react';
import { CreateProjectForm } from '@/features/manager';
import SidebarTips from '@/pages/manager/components/SidebarTips';
import { Layout, Steps, Button, Typography } from 'antd';
import {
    RobotOutlined,
    SettingOutlined,
    SaveOutlined,
    ReadOutlined,
    RightOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const CreateProjectPage: React.FC = () => {
    // Steps data
    const stepsItems = [
        {
            title: 'General Info',
            subTitle: 'Step 1 of 4',
            description: <span className="text-[10px] text-dlss-primary/80 uppercase tracking-tighter font-bold hidden lg:block">Step 1 of 4</span>,
        },
        {
            title: 'Dataset',
            subTitle: 'Source',
            description: <span className="text-[10px] text-[#ad9cba]/60 uppercase tracking-tighter hidden lg:block">Source</span>,
        },
        {
            title: 'Guidelines',
            subTitle: 'Instructions',
            description: <span className="text-[10px] text-[#ad9cba]/60 uppercase tracking-tighter hidden lg:block">Instructions</span>,
        },
        {
            title: 'Team Assignment',
            subTitle: 'Workforce',
            description: <span className="text-[10px] text-[#ad9cba]/60 uppercase tracking-tighter hidden lg:block">Workforce</span>,
        },
    ];

    return (
        <Layout className="relative min-h-screen w-full bg-background-dark text-white font-display overflow-x-hidden selection:bg-dlss-primary selection:text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern bg-grid"></div>
            <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-background-dark/50 to-background-dark"></div>

            {/* Header */}
            <Header className="sticky top-0 z-50 flex items-center justify-between border-b border-dlss-primary/20 bg-header-dark/95 px-6 py-4 w-full backdrop-blur-md h-auto leading-normal">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-dlss-secondary">
                        <div className="flex items-center justify-center text-dlss-secondary drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">
                            <RobotOutlined className="text-2xl" />
                        </div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-wider uppercase m-0">
                            LABEL<span className="text-dlss-secondary fuchsia-text-glow ml-1 lowercase font-medium">Manager v2.4</span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<SettingOutlined className="text-xl" />}
                        className="flex items-center justify-center bg-surface-dark border border-glass-border hover:border-dlss-secondary text-[#ad9cba] hover:text-dlss-secondary w-9 h-9"
                    />
                    <div className="flex items-center">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-dlss-secondary shadow-fuchsia-glow ring-2 ring-transparent hover:ring-dlss-secondary/30 transition-all cursor-pointer" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDXeH-_ZIC38_rJtqxFsICkjEJO9TDC33kCgcOGegw4hhS-JNq4R2XVcbCWhsa-Xdz_DzFWia9ShH-iskdkdvvD4aG3iKiHyKlppeJxD_RhuWwXQORfiWywGWlPcb_hCYAaM8YdVgJJq-y8hE0pkD3Bac7BEZSfsjhYnAFyzcCrhoe7R9B3KrHE-dVaXzmJ3l_Xd-pmlSAXoyEnnHBXDDY9RutqxDZYuE5cR8LJLZuGGSyAfllNxi6Aj8MtDukq3naOeDgVUcP6qCRb")' }}></div>
                    </div>
                </div>
            </Header>

            <div className="relative z-10 flex flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 gap-6 lg:gap-8 flex-col lg:flex-row bg-transparent">
                <Content className="flex-1 flex flex-col gap-8 min-w-0 bg-transparent">
                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-[#ad9cba]">
                                <span className="cursor-pointer hover:text-dlss-primary hover:underline">Dashboard</span>
                                <RightOutlined className="text-[10px]" />
                                <span className="text-white">New Project</span>
                            </div>
                            <Title level={1} className="!text-3xl !font-bold !text-white tracking-wide !mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] !mb-0">Create New Project</Title>
                        </div>
                        <div className="flex gap-3">
                            <Button className="bg-surface-dark border-glass-border text-[#ad9cba] hover:!text-white hover:!border-white/20 h-auto py-2 px-5 rounded-lg font-medium">Cancel</Button>
                            <Button
                                className="bg-surface-dark border-glass-border text-white hover:!border-dlss-primary hover:!text-dlss-primary h-auto py-2 px-5 rounded-lg font-medium flex items-center gap-2"
                                icon={<SaveOutlined />}
                            >
                                Save Draft
                            </Button>
                        </div>
                    </div>

                    {/* Steps Indicator - Wrapped in a custom styled container to match design */}
                    <div className="w-full px-2 custom-steps">
                        <Steps
                            current={0}
                            items={stepsItems}
                            labelPlacement="horizontal"
                            className="w-full"
                        />
                    </div>

                    <CreateProjectForm />
                </Content>

                <Sider width={320} className="!bg-transparent flex flex-col gap-6" theme="dark">
                    <div className="flex flex-col gap-6 w-full">
                        <SidebarTips />

                        {/* Workforce Pulse */}
                        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-base font-bold text-white m-0">Workforce Pulse</h3>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="p-4 rounded-xl bg-surface-dark border border-glass-border">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-[#ad9cba]">Available Annotators</span>
                                        <span className="material-symbols-outlined text-dlss-primary">group</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-bold text-white tracking-tight">24</span>
                                        <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Ready
                                        </span>
                                    </div>
                                    <div className="mt-3 text-xs text-[#ad9cba] border-t border-white/5 pt-2">
                                        Estimated throughput: <span className="text-white font-mono">340/hr</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full glass-card !p-4 !h-auto rounded-xl flex items-center justify-between group hover:!border-dlss-primary/50 transition-all border-glass-border bg-transparent">
                            <div className="flex items-center gap-3">
                                <div className="bg-dlss-primary/20 p-2 rounded-lg text-dlss-primary flex items-center justify-center">
                                    <ReadOutlined className="text-xl" />
                                </div>
                                <div className="text-left flex flex-col">
                                    <span className="block text-sm font-bold text-white">View Guidelines</span>
                                    <span className="block text-xs text-[#ad9cba]">Download PDF template</span>
                                </div>
                            </div>
                            <RightOutlined className="text-[#ad9cba] group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </Sider>
            </div>

            {/* Global override for Steps to match the design roughly without full custom render for now */}
            <style>{`
                .custom-steps .ant-steps-item-process .ant-steps-item-icon {
                    background-color: #d946ef; /* dlss-primary */
                    border-color: #d946ef;
                }
                .custom-steps .ant-steps-item-wait .ant-steps-item-icon {
                    background-color: #0f172a; /* surface-dark */
                    border-color: rgba(255,255,255,0.1);
                }
                .custom-steps .ant-steps-item-title {
                    color: white !important;
                    font-weight: bold;
                    font-size: 0.875rem; 
                }
                .custom-steps .ant-steps-item-description {
                    color: rgba(255,255,255,0.5) !important;
                }
                .custom-steps .ant-steps-item-process .ant-steps-item-title {
                    color: white !important;
                }
                /* Hide tail default color and use glass style for better look if needed */
            `}</style>
        </Layout>
    );
};

export default CreateProjectPage;