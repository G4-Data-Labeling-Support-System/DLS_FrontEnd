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
                projectId: `PROJ-${Math.floor(Math.random() * 10000)}` // Mock ID ngẫu nhiên
            };

            // 2. Gọi API (Sử dụng API Mock của bạn)
            const response = await axios.post('https://697774545b9c0aed1e868772.mockapi.io/Cate', payload);
            console.log('API Response:', response.data);

            // 3. Thông báo
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
            // Thay đổi quan trọng: Dùng class trong suốt để hòa trộn vào Glass Card của Page cha
            className="form-transparent-override"
            initialValues={{ status: 'active' }}
            onFinish={onFinish}
        >
            <div className="flex flex-col gap-8">

                {/* --- Main Content Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* CỘT TRÁI (Thông tin chính - Chiếm 2 phần) */}
                    <div className="md:col-span-2 space-y-6">
                        <Form.Item
                            name="projectName"
                            label="Project Name *"
                            rules={[{ required: true, message: 'Please enter project name' }]}
                        >
                            <Input
                                size="large"
                                placeholder="e.g. Autonomous Vehicle Perception Phase 2"
                                // Style input chuẩn theme tối
                                className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 focus:!border-violet-500 hover:!border-violet-500/50"
                            />
                        </Form.Item>

                        <Form.Item name="description" label="Description">
                            <Input.TextArea
                                rows={8}
                                placeholder="Briefly describe the goals and scope of this project..."
                                className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 resize-none focus:!border-violet-500 hover:!border-violet-500/50"
                            />
                        </Form.Item>
                    </div>

                    {/* CỘT PHẢI (Cấu hình phụ - Chiếm 1 phần) */}
                    <div className="space-y-6">
                        <Form.Item
                            name="status"
                            label="Status *"
                            rules={[{ required: true }]}
                        >
                            <Select
                                size="large"
                                options={PROJECT_STATUS}
                                className="custom-select-override" // Cần đảm bảo manager.css có style cho select dropdown
                                popupClassName="bg-[#1a1625] border border-white/10 text-white"
                            />
                        </Form.Item>

                        {/* Note Box trang trí */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20 mt-4">
                            <h4 className="text-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
                                Manager Tip
                            </h4>
                            <p className="text-gray-400 text-xs leading-relaxed m-0">
                                Active projects are visible immediately to the assigned workforce.
                                Set to <strong>Blocked</strong> if you want to prepare data before launching.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Footer Component --- */}
                {/* Sử dụng FormFooter chung để đồng bộ nút bấm */}
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