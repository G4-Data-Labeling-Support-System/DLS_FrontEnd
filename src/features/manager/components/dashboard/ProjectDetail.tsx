import React, { useEffect, useState } from 'react';
import { Spin, message, Typography, Card, Button, Descriptions, Tag, Avatar, Empty, Modal } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import projectApi, { type GetProjectsParams } from '@/api/project';
import { mainClient } from '@/api/apiClients';
import { ENDPOINTS } from '@/api/endpoints';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface ProjectDetailProps {
    projectId: string;
    onBack: () => void;
}

interface ProjectDetailData extends GetProjectsParams {
    users?: Record<string, unknown>[];
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
    const [project, setProject] = useState<ProjectDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                const response = await projectApi.getProjectById(projectId);
                const data = response.data?.data || response.data;

                if (data && isMounted) {
                    setProject({
                        projectId: String(data.projectId || data.id),
                        projectName: String(data.projectName || data.name),
                        projectStatus: String(data.projectStatus || data.status),
                        description: data.description ? String(data.description) : undefined,
                        createdAt: data.createdAt ? String(data.createdAt) : undefined,
                        updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
                        users: data.users || data.members || data.assignees || [] // Fallbacks cho dữ liệu mảng users
                    });

                    // Check for assignments based on projectId globally
                    try {
                        const assignRes = await mainClient.get(ENDPOINTS.ASSIGNMENTS.LIST);
                        const assignments = assignRes.data?.data || assignRes.data || [];

                        let hasAssignment = false;
                        if (Array.isArray(assignments)) {
                            // Find any assignment that belongs to this project
                            hasAssignment = assignments.some((a: Record<string, unknown>) =>
                                String(a.projectId) === String(projectId) ||
                                String(a.project_id) === String(projectId)
                            );
                        }

                        if (!hasAssignment && isMounted) {
                            Modal.warning({
                                title: 'No Assignments Found',
                                content: 'This project currently has no assignments created. Please create an assignment to proceed.',
                                okText: 'Close',
                                centered: true,
                            });
                        }
                    } catch (error) {
                        const assignError = error as any;
                        const isNotFoundError = assignError?.response?.data?.code === 404 || assignError?.response?.data?.message === 'Assignment not found';

                        if (isNotFoundError && isMounted) {
                            // Backend confirms 0 assignments system-wide
                            Modal.warning({
                                title: 'No Assignments Found',
                                content: 'This project currently has no assignments created. Please create an assignment to proceed.',
                                okText: 'Close',
                                centered: true,
                            });
                        } else if (isMounted) {
                            // Only warn if the API actually crashed or threw a 500
                            console.warn("Global Assignment check failed:", assignError);
                            Modal.warning({
                                title: 'Error Checking Assignments',
                                content: `Could not verify assignments status: ${assignError?.response?.data?.message || assignError.message}`,
                                okText: 'Close',
                                centered: true,
                            });
                        }
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error fetching project details:", error);
                    message.error("Cannot load project details.");
                    onBack(); // Fallback to list if error
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (projectId) {
            fetchDetail();
        }

        return () => {
            isMounted = false;
        };
    }, [projectId, onBack]);

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

            <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6">
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
            </Card>

            <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
