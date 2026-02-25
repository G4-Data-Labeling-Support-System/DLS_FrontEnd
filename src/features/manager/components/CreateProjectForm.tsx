import React, { useState } from 'react';
import { Form, Input, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import projectApi from '@/api/project';
import { FormFooter } from '@/features/manager/components/common/FormFooter';
import type { AxiosError } from 'axios';

const PROJECT_STATUS = [
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Archived', value: 'archived' },
];

interface CreateProjectFormProps {
    onSuccess?: () => void;
}

interface CreateProjectFormValues {
    projectName: string;
    description?: string;
    status: string;
    id: string;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/manager');
    };

    const onFinish = async (values: CreateProjectFormValues) => {
        setLoading(true);
        try {
            // 1. Chuẩn bị dữ liệu
            const payload = {
                projectName: values.projectName,
                description: values.description,
                projectStatus: values.status,
            };

            // 2. Gọi API
            const response = await projectApi.createProject(payload);
            const data = response.data;

            // Save Project ID for next steps
            if (data?.id) {
                localStorage.setItem('currentProjectId', data.id);
            }

            // 3. Thông báo
            message.success('Project created successfully!');

            // 4. Chuyển bước
            if (onSuccess) {
                onSuccess();
            }

        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            const errorMessage = err.response?.data?.message || 'Failed to create project. Please try again.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            className="!w-full !max-w-none !p-0 !bg-transparent !border-0 !shadow-none"
            initialValues={{ status: 'active' }}
            onFinish={onFinish}
        >
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Form.Item
                            name="projectName"
                            label="Project Name *"
                            rules={[{ required: true, message: 'Please enter project name' }]}
                        >
                            <Input
                                size="large"
                                placeholder="e.g. Autonomous Vehicle Perception Phase 2"
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

                    <div className="space-y-6">
                        <Form.Item
                            name="status"
                            label="Status *"
                            rules={[{ required: true }]}
                        >
                            <Select
                                size="large"
                                options={PROJECT_STATUS}
                                className=""
                                classNames={{ popup: { root: "bg-[#1A1625] border border-white/10 text-white" } }}
                            />
                        </Form.Item>

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