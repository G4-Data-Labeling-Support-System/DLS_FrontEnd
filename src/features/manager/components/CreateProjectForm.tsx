import React, { useState } from 'react';
import { Form, Input, Select, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import Styles & Components
import '@/features/manager/components/manager.css';
import { FormFooter } from '@/features/manager/components/common/FormFooter';

const PROJECT_STATUS = [
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Archived', value: 'archived' },
];

interface CreateProjectFormProps {
    onSuccess?: () => void;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Xử lý Cancel: Quay về Dashboard
    const handleCancel = () => {
        navigate('/manager');
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // 1. Chuẩn bị dữ liệu
            const payload = {
                ...values,
                createdAt: new Date().toISOString(),
                projectId: 'PROJ-X9Y2' // ID giả lập
            };

            // 2. Gọi API
            const response = await axios.post('https://697774545b9c0aed1e868772.mockapi.io/Cate', payload);
            console.log('API Response:', response.data);

            // 3. Thông báo & Reset
            message.success('Project created successfully!');

            // 4. Chuyển bước
            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            console.error('API Error:', error);
            message.error('Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            // QUAN TRỌNG: Form này tự tạo khung kính cho chính nó
            className="project-glass-card"
            initialValues={{ status: 'active' }}
            onFinish={onFinish}
        >
            {/* Wrapper để gom nội dung vào giữa (max-width: 1100px) */}
            <div className="form-content-wrapper">

                {/* Header bên trong Form */}
                <div className="mb-8 border-b border-white/10 pb-4 text-center">
                    <h2 className="text-2xl font-bold text-white tracking-wide">Project Details</h2>
                    <p className="text-gray-400 text-sm mt-1">Enter the essential information to start your new project.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* CỘT TRÁI (Chiếm 2 phần) */}
                    <div className="md:col-span-2 space-y-6">
                        <Form.Item name="projectName" label="Project Name *" rules={[{ required: true }]}>
                            <Input size="large" placeholder="e.g. Autonomous Vehicle Perception Phase 2" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={8} placeholder="Briefly describe..." className="resize-none" />
                        </Form.Item>
                    </div>

                    {/* CỘT PHẢI (Chiếm 1 phần) */}
                    <div className="space-y-6">
                        <Form.Item name="status" label="Status *" rules={[{ required: true }]}>
                            <Select size="large" options={PROJECT_STATUS} />
                        </Form.Item>

                        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 mt-4">
                            <p className="text-violet-200 text-xs m-0 text-center leading-relaxed">
                                <strong>Note:</strong> Active projects are visible immediately.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Component */}
                <FormFooter
                    currentStep={1}
                    totalSteps={4}
                    submitLabel="CREATE PROJECT"
                    isLoading={loading}
                    onCancel={handleCancel}
                />
            </div>
        </Form>
    );
};