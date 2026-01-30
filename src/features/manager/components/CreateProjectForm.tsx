import React, { useState } from 'react';
import { Form, Input, Select, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import '@/features/manager/components/manager.css';
import { FormFooter } from './common/FormFooter';


const PROJECT_STATUS = [
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Archived', value: 'archived' },
];

// Props giờ đơn giản hơn, chỉ cần callback khi thành công (để chuyển trang nếu muốn)
interface CreateProjectFormProps {
    onSuccess?: () => void;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onSuccess }) => {
    const [form] = Form.useForm();
    // Quản lý loading ngay tại đây
    const [loading, setLoading] = useState(false);

    // --- LOGIC GỌI API NẰM HOÀN TOÀN Ở ĐÂY ---
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // 1. Chuẩn bị dữ liệu
            const payload = {
                ...values,
                createdAt: new Date().toISOString(),
                projectId: 'PROJ-X9Y2' // Ví dụ ID
            };

            // 2. Gọi API
            const response = await axios.post('https://697774545b9c0aed1e868772.mockapi.io/Cate', payload);
            console.log('API Response:', response.data);

            // 3. Thông báo & Reset form
            message.success('Project created successfully!');
            // form.resetFields(); // Bật dòng này nếu muốn xóa trắng form sau khi tạo

            // 4. Báo cho trang cha biết là xong (để chuyển bước)
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
            className="project-glass-card"
            initialValues={{ status: 'active' }}
            onFinish={onFinish} // Gắn hàm xử lý nội bộ vào đây
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

                        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 mt-4">
                            <p className="text-violet-200 text-xs m-0 text-center leading-relaxed">
                                <strong>Note:</strong> Active projects are visible immediately.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer dùng state loading nội bộ */}
                <FormFooter
                    currentStep={1}
                    totalSteps={4}
                    submitLabel="CREATE PROJECT"
                    hideBack={true}
                    isLoading={loading}
                />
            </div>
        </Form>
    );
};