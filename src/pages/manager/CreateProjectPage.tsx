import React from 'react';
import { Layout, Breadcrumb, Button, Steps } from 'antd';
import { SaveOutlined, RightOutlined } from '@ant-design/icons';
import { CreateProjectForm } from '@/features/manager';
import SidebarTips from '@/pages/manager/components/SidebarTips';

const { Content } = Layout;

const CreateProjectPage: React.FC = () => {
    return (
        <Content className="relative z-10 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <Breadcrumb
                                separator={<RightOutlined style={{ fontSize: 10 }} />}
                                items={[{ title: 'Dashboard' }, { title: 'New Project' }]}
                            />
                            <h1 className="text-3xl font-bold text-white mt-2">Create New Project</h1>
                        </div>
                        <div className="flex gap-3">
                            <Button>Cancel</Button>
                            <Button icon={<SaveOutlined />}>Save Draft</Button>
                        </div>
                    </div>

                    <Steps
                        className="mb-10"
                        current={0}
                        items={[
                            { title: 'General Info' },
                            { title: 'Dataset' },
                            { title: 'Guidelines' },
                            { title: 'Team' },
                        ]}
                    />

                    <CreateProjectForm />
                </div>

                <aside className="w-full lg:w-80 flex flex-col gap-6">
                    <SidebarTips />
                </aside>
            </div>
        </Content>
    );
};

export default CreateProjectPage;