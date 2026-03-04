import { Form, Input, Select, message } from 'antd';
import { ProjectOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Button } from '@/shared/components/ui/Button';
import { GlassModal } from '@/shared/components/ui/GlassModal';
import { useEffect } from 'react';
import { useUpdateProject } from '@/features/admin/hooks/useProjects';

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (project: any) => void;
    projectData?: any;
}

export default function EditProjectModal({ isOpen, onClose, onSuccess, projectData }: EditProjectModalProps) {
    const [form] = Form.useForm();
    const updateProjectMutation = useUpdateProject();

    useEffect(() => {
        if (isOpen && projectData) {
            const rawStatus = projectData.projectStatus || projectData.status || 'ACTIVE';
            const normalizedStatus = rawStatus.toUpperCase();

            form.setFieldsValue({
                projectName: projectData.projectName,
                description: projectData.description,
                status: normalizedStatus,
            });
        }
    }, [isOpen, projectData, form]);

    const handleSubmit = async (values: any) => {
        const payload = {
            projectName: values.projectName,
            description: values.description,
            projectStatus: values.status,
        };

        const projectId = projectData?.projectId || projectData?.id;

        updateProjectMutation.mutate({ id: projectId, data: payload }, {
            onSuccess: (data) => {
                message.success('Project updated successfully!');
                form.resetFields();
                onSuccess?.(data);
            },
            onError: (error: any) => {
                const errorData = error.response?.data;
                console.error("Backend Error Details:", errorData);
                const messageStr = errorData?.message || JSON.stringify(errorData) || "Failed to update project";
                message.error(`Error: ${messageStr}`);
            }
        });
    };

    return (
        <GlassModal
            open={isOpen}
            onCancel={onClose}
            width={560}
        >
            <div className="px-8 pt-10 pb-6 text-center border-b border-white/5">
                <h2 className="text-white text-3xl font-bold tracking-tight mb-2">
                    Edit Project
                </h2>
                <p className="text-white/50 text-sm">
                    Modify project details and current deployment status.
                </p>
            </div>

            <div className="px-8 py-8">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="flex flex-col gap-2"
                    requiredMark={false}
                >
                    <Form.Item
                        name="projectName"
                        label={<span className="text-gray-300 font-medium">Project Name</span>}
                        rules={[{ required: true, message: 'Please enter a project name' }]}
                    >
                        <Input
                            size="large"
                            disabled
                            prefix={<ProjectOutlined className="text-gray-500" />}
                            placeholder="e.g. Autonomous Vehicle Labeling"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={<span className="text-gray-300 font-medium">Description</span>}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Briefly describe the goals and scope of this project..."
                            className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 resize-none focus:!border-violet-500 hover:!border-violet-500/50"
                        />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label={<span className="text-gray-300 font-medium">Status</span>}
                        rules={[{ required: true, message: 'Please select a status' }]}
                    >
                        <Select
                            size="large"
                            className="custom-select"
                            suffixIcon={<SafetyCertificateOutlined className="text-gray-500" />}
                            // @ts-ignore
                            classNames={{ popup: "glass-dropdown" }}
                            options={[
                                { label: 'Active', value: 'ACTIVE' },
                                { label: 'Ongoing', value: 'ONGOING' },
                                { label: 'Paused', value: 'PAUSED' },
                            ]}
                        />
                    </Form.Item>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            className="flex-1 h-11 border-white/10 bg-transparent text-gray-300 hover:text-white hover:border-white/30"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            isLoading={updateProjectMutation.isPending}
                            className="flex-[2] h-11"
                        >
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </div>
        </GlassModal>
    );
}
