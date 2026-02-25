import React from 'react';
import { Card, Button, Typography, Dropdown, Tag, type MenuProps } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { GetProjectsParams } from '@/api/project'; // Import type từ API của bạn

const { Text, Title, Paragraph } = Typography;

// Mở rộng thêm onEdit và onDelete
interface ProjectCardProps extends GetProjectsParams {
    onEdit?: () => void;
    onDelete?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    projectId,
    projectName,
    description,
    projectStatus,
    createdAt,
    updatedAt,
    onEdit,
    onDelete
}) => {
    const items: MenuProps['items'] = [
        { key: '1', label: 'View Details', icon: <EyeOutlined /> },
        { key: '2', label: 'Edit Project', icon: <EditOutlined />, onClick: onEdit },
        { type: 'divider' },
        { key: '4', label: <span className="text-red-500">Delete Project</span>, icon: <DeleteOutlined className="text-red-500" />, onClick: onDelete },
    ];

    // Hàm chọn màu cho Tag trạng thái
    const getStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return 'processing';
            case 'COMPLETED': return 'success';
            case 'PAUSED': return 'warning';
            default: return 'default';
        }
    };

    // Format ngày tháng hiển thị
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <Card className="bg-[#1A1625] border-gray-800 rounded-xl overflow-hidden hover:border-violet-500/50 transition-colors flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        <Text className="text-gray-400 text-xs">ID: {projectId || 'N/A'}</Text>
                    </div>
                    <Title level={5} className="!text-white !m-0 !text-sm leading-tight line-clamp-2" title={projectName}>
                        {projectName || 'Dự án chưa có tên'}
                    </Title>
                </div>
                <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                    <Button type="text" className="hover:bg-gray-800" icon={<MoreOutlined className="text-gray-400" />} />
                </Dropdown>
            </div>

            <div className="mb-4">
                <Tag color={getStatusColor(projectStatus)} className="m-0 font-medium">
                    {projectStatus || 'UNKNOWN'}
                </Tag>
            </div>

            <div className="flex-1 mb-4">
                <Paragraph className="text-gray-400 text-xs line-clamp-3 min-h-[50px] m-0">
                    {description || 'Chưa có mô tả cho dự án này.'}
                </Paragraph>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#231e31] p-3 rounded-lg mt-auto">
                <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Ngày tạo</div>
                    <div className="text-gray-300 text-xs font-semibold">{formatDate(createdAt)}</div>
                </div>
                <div className="border-l border-gray-700 pl-2">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Cập nhật</div>
                    <div className="text-gray-300 text-xs font-semibold">{formatDate(updatedAt)}</div>
                </div>
            </div>
        </Card>
    );
};