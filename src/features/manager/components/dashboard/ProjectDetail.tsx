import React, { useEffect, useState } from 'react';
import { Spin, message, Typography, Card, Button, Descriptions, Tag, Avatar, Empty } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import projectApi, { type GetProjectsParams } from '@/api/project';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface ProjectDetailProps {
    projectId: string;
    onBack: () => void;
}

interface ProjectDetailData extends GetProjectsParams {
    users?: any[];
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
    const [project, setProject] = useState<ProjectDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const response = await projectApi.getProjectById(projectId);
                const data = response.data?.data || response.data;

                if (data) {
                    setProject({
                        projectId: String(data.projectId || data.id),
                        projectName: String(data.projectName || data.name),
                        projectStatus: String(data.projectStatus || data.status),
                        description: data.description ? String(data.description) : undefined,
                        createdAt: data.createdAt ? String(data.createdAt) : undefined,
                        updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
                        users: data.users || data.members || data.assignees || [] // Fallbacks cho dữ liệu mảng users
                    });
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin chi tiết dự án:", error);
                message.error("Không thể tải chi tiết dự án.");
                onBack(); // Fallback to list if error
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchDetail();
        }
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
                Lỗi tải thông tin dự án.
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
                    Chỉnh sửa
                </Button>
            </div>

            <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6">
                <Descriptions
                    title={<span className="text-white text-lg font-display flex items-center gap-2"><span className="material-symbols-outlined text-violet-400">info</span>Thông tin dự án</span>}
                    column={1}
                    className="custom-descriptions"
                    styles={{
                        label: { color: '#9ca3af', fontWeight: 500, width: '150px' },
                        content: { color: '#d1d5db' }
                    }}
                >
                    <Descriptions.Item label="Mô tả">
                        {project.description || <span className="text-gray-600 italic">Không có mô tả</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {formatDate(project.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật gần nhất">
                        {formatDate(project.updatedAt)}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white text-lg font-display flex items-center gap-2">
                        <span className="material-symbols-outlined text-fuchsia-400">group</span>
                        Thành viên dự án
                    </span>
                    <Tag color="#8b5cf6" className="border-0 bg-violet-600/20 text-violet-300 font-bold px-3 rounded-full">
                        {project.users?.length || 0} Members
                    </Tag>
                </div>

                {(!project.users || project.users.length === 0) ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span className="text-gray-500">Chưa có thành viên nào được phân công</span>}
                        className="my-8"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.users.map((user: any, index: number) => (
                            <div key={user.id || index} className="flex items-center gap-3 bg-[#231e31] p-3 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors">
                                <Avatar
                                    src={user.avatar || user.coverImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'U')}&background=random`}
                                    size={40}
                                    icon={<UserOutlined />}
                                    className="border border-white/10 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-white font-bold text-sm truncate">
                                        {user.fullName || user.name || user.username || "Unknown User"}
                                    </h4>
                                    <div className="flex gap-2 items-center mt-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${(user.role || user.userRole || '').toLowerCase().includes('manager')
                                            ? 'bg-red-500/20 text-red-400'
                                            : (user.role || user.userRole || '').toLowerCase().includes('annotator')
                                                ? 'bg-orange-500/20 text-orange-400'
                                                : 'bg-cyan-500/20 text-cyan-400'
                                            }`}>
                                            {user.role || user.userRole || 'Member'}
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
