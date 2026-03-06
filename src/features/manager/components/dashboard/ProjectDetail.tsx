import React, { useEffect, useState } from 'react';
import { Spin, Typography, Card, Button, Descriptions, Tag, Avatar, Empty, message, Modal, Form, Input, Select, DatePicker } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import assignmentApi from '@/api/assignment';
import datasetApi from '@/api/dataset';
import { userApi } from '@/api/userApi';
import { useNavigate } from 'react-router-dom';
import { useProjectById, useAssignmentsByProject, useGuidelinesByProject, useInvalidateProjectDetail } from '@/features/manager/hooks/useProjectDetail';

const { Title } = Typography;

interface ProjectDetailProps {
    projectId: string;
    onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
    const { data: project, isLoading: projectLoading, isError: projectError } = useProjectById(projectId);
    const { data: assignments = [], isLoading: assignmentsLoading, isError: assignmentsError } = useAssignmentsByProject(projectId);
    const { data: guidelines = [], isLoading: guidelinesLoading } = useGuidelinesByProject(projectId);
    const invalidateProjectDetail = useInvalidateProjectDetail();

    const loading = projectLoading || assignmentsLoading || guidelinesLoading;

    const [isFirstAssignmentModalVisible, setIsFirstAssignmentModalVisible] = useState(false);
    const [firstAssignmentStep, setFirstAssignmentStep] = useState<'prompt' | 'form'>('prompt');
    const [users, setUsers] = useState<Record<string, unknown>[]>([]);
    const [datasets, setDatasets] = useState<Record<string, unknown>[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        if (projectError) {
            message.error("Cannot load project details.");
            onBack();
        }
    }, [projectError, onBack]);

    useEffect(() => {
        if (!assignmentsLoading && (assignments.length === 0 || assignmentsError)) {
            setIsFirstAssignmentModalVisible(true);
            setFirstAssignmentStep('prompt');
        }
    }, [assignments, assignmentsLoading, assignmentsError]);

    const handleFirstAssignmentOk = async () => {
        setFirstAssignmentStep('form');
        try {
            const userRes = await userApi.getUsers();
            const userData = userRes as unknown as { data?: Record<string, unknown>[] };
            setUsers((Array.isArray(userRes) ? userRes : userData?.data || []) as Record<string, unknown>[]);

            const datasetRes = await datasetApi.getDatasetsByProjectId(projectId);
            const datasetsData = datasetRes.data?.data || datasetRes.data;
            setDatasets(Array.isArray(datasetsData) ? datasetsData : []);
        } catch (error) {
            console.error(error);
            message.error("Failed to load users or datasets.");
        }
    };

    const handleFirstAssignmentSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            const payload = {
                assignmentName: values.assignmentName,
                assignedTo: values.assignedTo,
                assignedBy: values.assignedBy,
                reviewerId: values.reviewerId,
                description: values.description,
                dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
                datasetId: values.datasetId,
                projectId: projectId,
            };

            await assignmentApi.createAssignmentForProject(projectId, payload);
            message.success("First assignment created successfully!");
            setIsFirstAssignmentModalVisible(false);
            form.resetFields();

            // Refresh assignments list via React Query cache invalidation
            invalidateProjectDetail(projectId);
        } catch (error) {
            console.error("Failed to create first assignment", error);
            if (error && typeof error === 'object' && 'errorFields' in error) {
                // validation error, do nothing
            } else {
                message.error("Failed to create assignment");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return 'processing';
            case 'COMPLETED': return 'success';
            case 'PAUSED': return 'warning';
            case 'ARCHIVE': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="w-full h-64 flex justify-center items-center">
                <Spin size="large" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="w-full text-center py-10 text-gray-400">
                Error loading project information.
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <Title level={3} className="!text-white !m-0 !font-display">{project.projectName}</Title>
                    <div className="mt-2">
                        <Tag color={getStatusColor(project.projectStatus)} className="m-0 font-medium text-sm px-3 py-1">
                            {project.projectStatus || 'UNKNOWN'}
                        </Tag>
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    className="bg-violet-600 hover:bg-violet-500 border-none"
                    onClick={() => navigate(`/manager/projects/edit/${project.projectId}`)}
                >
                    Edit
                </Button>
            </div>

            <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6 p-0 overflow-hidden">
                <div className="flex flex-col lg:flex-row h-full w-full">
                    <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-800">
                        <Descriptions
                            title={<span className="text-white text-lg font-display flex items-center gap-2"><span className="material-symbols-outlined text-violet-400">info</span>Project Information</span>}
                            column={1}
                            className="custom-descriptions"
                            styles={{
                                label: { color: '#9ca3af', fontWeight: 500, width: '150px' },
                                content: { color: '#d1d5db' }
                            }}
                        >
                            <Descriptions.Item label="Project ID">
                                <span className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                                    {project.projectId}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Description">
                                {project.description || <span className="text-gray-600 italic">No description</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Created At">
                                {formatDate(project.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Updated">
                                {formatDate(project.updatedAt)}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    <div className="flex-1 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-white text-lg font-display flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-400">menu_book</span>
                                Project Guidelines
                            </span>
                        </div>

                        {guidelines.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[150px]">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<span className="text-gray-500">No guidelines created yet</span>}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1" style={{ maxHeight: '300px' }}>
                                {guidelines.map((guideline: Record<string, unknown>, index: number) => (
                                    <div key={(guideline.guide_id as string) || (guideline.id as string) || index} className="flex flex-col gap-2 bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-white font-bold text-sm truncate pr-2" title={(guideline.title as string) || "Unnamed Guideline"}>
                                                {(guideline.title as string) || "Unnamed Guideline"}
                                            </h4>
                                        </div>
                                        <div className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">
                                            {(guideline.content as string) || "No content provided."}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                            <span className="text-gray-500 text-xs">{formatDate((guideline.createdAt as string))}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-1 mb-6 mt-1">
                <Card className="bg-[#1A1625] border-gray-800 rounded-xl h-full">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-white text-lg font-display flex items-center gap-2">
                            <span className="material-symbols-outlined text-fuchsia-400">group</span>
                            Project Members
                        </span>
                        <Tag color="#8b5cf6" className="border-0 bg-violet-600/20 text-violet-300 font-bold px-3 rounded-full">
                            {project.users?.length || 0} Members
                        </Tag>
                    </div>

                    {(!project.users || project.users.length === 0) ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span className="text-gray-500">No members assigned yet</span>}
                            className="my-8"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.users.map((user: Record<string, unknown>, index: number) => (
                                <div key={user.id as string || index} className="flex items-center gap-3 bg-[#231e31] p-3 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors">
                                    <Avatar
                                        src={user.avatar as string || user.coverImage as string || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.fullName as string) || (user.username as string) || 'U')}&background=random`}
                                        size={40}
                                        icon={<UserOutlined />}
                                        className="border border-white/10 flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-white font-bold text-sm truncate">
                                            {(user.fullName as string) || (user.name as string) || (user.username as string) || "Unknown User"}
                                        </h4>
                                        <div className="flex gap-2 items-center mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${String(user.role || user.userRole || '').toLowerCase().includes('manager')
                                                ? 'bg-red-500/20 text-red-400'
                                                : String(user.role || user.userRole || '').toLowerCase().includes('annotator')
                                                    ? 'bg-orange-500/20 text-orange-400'
                                                    : 'bg-cyan-500/20 text-cyan-400'
                                                }`}>
                                                {((user.role as string) || (user.userRole as string)) || 'Member'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="bg-[#1A1625] border-gray-800 rounded-xl h-full">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-white text-lg font-display flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">assignment</span>
                            Project Assignments
                        </span>
                        <Tag color="#3b82f6" className="border-0 bg-blue-600/20 text-blue-300 font-bold px-3 rounded-full">
                            {assignments.length} Assignments
                        </Tag>
                    </div>

                    {assignments.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span className="text-gray-500">No assignments created yet</span>}
                            className="my-8"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assignments.map((assignment: Record<string, unknown>, index: number) => (
                                <div key={(assignment.id as string) || index} className="flex flex-col gap-2 bg-[#231e31] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-bold text-sm truncate pr-2" title={(assignment.assignmentName as string) || (assignment.name as string)}>
                                            {(assignment.assignmentName as string) || (assignment.name as string) || "Unnamed Assignment"}
                                        </h4>
                                        <Tag color={getStatusColor((assignment.status as string) || (assignment.assignmentStatus as string))} className="m-0 text-[10px] px-1.5 py-0 flex-shrink-0">
                                            {(assignment.status as string) || (assignment.assignmentStatus as string) || 'UNKNOWN'}
                                        </Tag>
                                    </div>
                                    <div className="text-gray-400 text-xs line-clamp-2 mt-1 min-h-[32px]">
                                        {(assignment.description as string) || (assignment.descriptionAssignment as string) || "No description provided."}
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                        <span className="text-gray-500 text-xs">{formatDate((assignment.createdAt as string))}</span>
                                        <Button type="link" size="small" className="text-blue-400 p-0 h-auto" onClick={() => navigate(`/manager/assignments/${assignment.id || assignment.assignmentId}`)}>
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <Modal
                title={<span className="font-display text-lg">{firstAssignmentStep === 'prompt' ? "No Assignments Found" : "Create First Assignment"}</span>}
                open={isFirstAssignmentModalVisible}
                onCancel={() => setIsFirstAssignmentModalVisible(false)}
                destroyOnHidden
                footer={
                    firstAssignmentStep === 'prompt' ? [
                        <Button key="cancel" onClick={() => setIsFirstAssignmentModalVisible(false)}>
                            Cancel
                        </Button>,
                        <Button key="ok" type="primary" onClick={handleFirstAssignmentOk} className="bg-violet-600 hover:bg-violet-500 border-none">
                            OK
                        </Button>
                    ] : [
                        <Button key="back" onClick={() => setFirstAssignmentStep('prompt')}>
                            Back
                        </Button>,
                        <Button key="submit" type="primary" loading={isSubmitting} onClick={handleFirstAssignmentSubmit} className="bg-violet-600 hover:bg-violet-500 border-none">
                            Create Assignment
                        </Button>
                    ]
                }
            >
                {firstAssignmentStep === 'prompt' ? (
                    <div className="py-4 text-gray-600 dark:text-gray-300">
                        <p>This project currently has no assignments. Would you like to create the first assignment?</p>
                    </div>
                ) : (
                    <Form form={form} layout="vertical" className="mt-4">
                        <Form.Item label="Assignment Name" name="assignmentName" rules={[{ required: true, message: 'Please enter assignment name' }]}>
                            <Input placeholder="Enter assignment name" />
                        </Form.Item>
                        <div className="grid grid-cols-3 gap-4">
                            <Form.Item label="Assign To" name="assignedTo" rules={[{ required: true, message: 'Please select annotator' }]}>
                                <Select placeholder="Select annotator">
                                    {users.filter(u => {
                                        const role = String((u.role as string) || (u.userRole as string) || '').toUpperCase();
                                        return role.includes('ANNOTATOR') || role === 'ANNOTATOR';
                                    }).map((u: Record<string, unknown>) => {
                                        const userId = String(u.id || u.userId || u.account_id || u.username || '');
                                        const name = (u.fullName as string) || (u.username as string) || (u.name as string);
                                        const avatarSrc = u.avatar as string || u.coverImage as string || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                                        return (
                                            <Select.Option key={userId} value={userId}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar src={avatarSrc} size="small" />
                                                    <span>{name}</span>
                                                </div>
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Reviewer" name="reviewerId" rules={[{ required: true, message: 'Please select reviewer' }]}>
                                <Select placeholder="Select reviewer">
                                    {users.filter(u => {
                                        const role = String((u.role as string) || (u.userRole as string) || '').toUpperCase();
                                        return role.includes('REVIEWER') || role === 'REVIEWER';
                                    }).map((u: Record<string, unknown>) => {
                                        const userId = String(u.id || u.userId || u.account_id || u.username || '');
                                        const name = (u.fullName as string) || (u.username as string) || (u.name as string);
                                        const avatarSrc = u.avatar as string || u.coverImage as string || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                                        return (
                                            <Select.Option key={userId} value={userId}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar src={avatarSrc} size="small" />
                                                    <span>{name}</span>
                                                </div>
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Assigned By" name="assignedBy" rules={[{ required: true, message: 'Please select manager' }]}>
                                <Select placeholder="Select manager">
                                    {users.filter(u => {
                                        const role = String((u.role as string) || (u.userRole as string) || '').toUpperCase();
                                        return role.includes('MANAGER') || role === 'MANAGER';
                                    }).map((u: Record<string, unknown>) => {
                                        const userId = String(u.id || u.userId || u.account_id || u.username || '');
                                        const name = (u.fullName as string) || (u.username as string) || (u.name as string);
                                        const avatarSrc = u.avatar as string || u.coverImage as string || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                                        return (
                                            <Select.Option key={userId} value={userId}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar src={avatarSrc} size="small" />
                                                    <span>{name}</span>
                                                </div>
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </div>
                        <Form.Item label="Dataset" name="datasetId" rules={[{ required: true, message: 'Please select a dataset' }]}>
                            <Select placeholder="Select dataset">
                                {datasets.map((d: Record<string, unknown>) => (
                                    <Select.Option key={(d.id as string) || (d.datasetId as string)} value={(d.id as string) || (d.datasetId as string)}>
                                        {(d.datasetName as string) || (d.name as string)}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Due Date" name="dueDate" rules={[{ required: true, message: 'Please select due date' }]}>
                            <DatePicker className="w-full" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Description" name="description">
                            <Input.TextArea placeholder="Enter description" rows={4} />
                        </Form.Item>
                    </Form>
                )}
            </Modal>



            <style>{`
                .custom-descriptions .ant-descriptions-title {
                    margin-bottom: 20px;
                }
                .custom-descriptions .ant-descriptions-item-container {
                    border-bottom: 1px solid #2d263b;
                    padding-bottom: 12px;
                    margin-bottom: 12px;
                }
                .custom-descriptions .ant-descriptions-item-container:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
            `}</style>
        </div>
    );
};
