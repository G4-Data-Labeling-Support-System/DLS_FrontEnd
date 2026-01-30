import React from 'react';
import { Form, Input, Select } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import '@/features/manager/components/manager.css';
import { FormFooter } from '@/features/manager/components/common/formfooter';

const PROJECT_STATUS = [
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Archived', value: 'archived' },
];

export const CreateProjectForm: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Success:', values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            className="project-glass-card"
            initialValues={{ status: 'active' }}
            onFinish={onFinish}
        >
            <div className="form-content-wrapper">
                <div className="mb-8 border-b border-white/10 pb-4 text-center">
                    <h2 className="text-2xl font-bold text-white tracking-wide">Project Details</h2>
                    <p className="text-gray-400 text-sm mt-1">Enter the essential information to start your new project.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* CỘT TRÁI */}
                    <div className="md:col-span-2 space-y-6">
                        <Form.Item name="projectName" label="Project Name *" rules={[{ required: true }]}>
                            <Input size="large" placeholder="e.g. Autonomous Vehicle Perception Phase 2" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={8} placeholder="Briefly describe..." className="resize-none" />
                        </Form.Item>
                    </div>

                    {/* CỘT PHẢI */}
                    <div className="space-y-6">
                        <Form.Item label="Project ID">
                            <div className="bg-[#1a1625] border border-white/10 py-3 px-4 rounded-xl flex justify-between items-center text-gray-400 font-mono shadow-inner">
                                <span className="tracking-widest text-sm">PROJ-X9Y2</span>
                                <LockOutlined className="text-white/20" />
                            </div>
                        </Form.Item>
                        <Form.Item name="status" label="Status *" rules={[{ required: true }]}>
                            <Select size="large" options={PROJECT_STATUS} />
                        </Form.Item>

                        {/* Cập nhật màu hộp Note sang tông Violet */}
                        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 mt-4">
                            <p className="text-violet-200 text-xs m-0 text-center leading-relaxed">
                                <strong>Note:</strong> Active projects are visible immediately to the workforce.
                            </p>
                        </div>
                    </div>
                </div>

                <FormFooter
                    currentStep={1}
                    totalSteps={4}
                    submitLabel="CREATE PROJECT"
                    hideBack={true}
                />

            </div>
        </Form>
    );
};