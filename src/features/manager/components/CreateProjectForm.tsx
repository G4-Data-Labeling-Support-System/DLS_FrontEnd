import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import '@/features/manager/components/manager.css'; // Import CSS

const PROJECT_STATUS = [
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Archived', value: 'archived' },
];

export const CreateProjectForm: React.FC = () => {
    const [form] = Form.useForm();

    return (
        <Form
            form={form}
            layout="vertical"
            // Class này tạo khung kính rộng 70% màn hình
            className="project-glass-card"
            initialValues={{ status: 'active' }}
        >
            {/* WRAPPER QUAN TRỌNG: Gom nội dung vào giữa (max-width: 1000px) */}
            <div className="form-content-wrapper">

                <div className="mb-8 border-b border-white/10 pb-4 text-center">
                    <h2 className="text-2xl font-bold text-white tracking-wide">Project Details</h2>
                    <p className="text-white/50 text-sm mt-1">Enter the essential information to start your new project.</p>
                </div>

                {/* Grid layout: Tên/Mô tả bên trái (2 phần), ID/Status bên phải (1 phần) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* --- CỘT TRÁI (Main Info) --- */}
                    <div className="md:col-span-2 space-y-6">
                        <Form.Item
                            name="projectName"
                            label="Project Name *"
                            rules={[{ required: true }]}
                        >
                            <Input size="large" placeholder="e.g. Autonomous Vehicle Perception Phase 2" />
                        </Form.Item>

                        <Form.Item name="description" label="Description">
                            <Input.TextArea
                                rows={8}
                                placeholder="Briefly describe the dataset, labeling goals..."
                                className="resize-none"
                            />
                        </Form.Item>
                    </div>

                    {/* --- CỘT PHẢI (Meta Info) --- */}
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

                        {/* Note nhỏ trang trí */}
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mt-4">
                            <p className="text-purple-200 text-xs m-0 leading-relaxed">
                                <strong>Note:</strong> Active projects will be immediately visible to the workforce.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER BUTTON --- */}
                <div className="mt-12 pt-6 border-t border-white/10 flex justify-center md:justify-end">
                    <Button
                        htmlType="submit"
                        type="primary"
                        size="large"
                        className="h-12 px-10 bg-gradient-to-r from-[#d946ef] to-[#9d27f1] border-none font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                    >
                        CREATE PROJECT
                    </Button>
                </div>

            </div>
        </Form>
    );
};