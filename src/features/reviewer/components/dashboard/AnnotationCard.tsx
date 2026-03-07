import React from 'react';
import { Card, Button, Typography, Dropdown, Tag, type MenuProps } from 'antd';
import { MoreOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { GetAnnotationsParams } from '@/api/annotation';

const { Title, Text } = Typography;

interface AnnotationCardProps extends GetAnnotationsParams {
    onClick?: () => void;
    onEdit?: () => void;
}

export const AnnotationCard: React.FC<AnnotationCardProps> = ({
    id,
    annotationId,
    name,
    status,
    createdAt,
    updatedAt,
    onClick,
    onEdit
}) => {
    const items: MenuProps['items'] = [
        { key: '1', label: 'View Details', icon: <EyeOutlined />, onClick: onClick },
        { key: '2', label: 'Edit', icon: <EditOutlined />, onClick: onEdit },
    ];

    const getStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'NEW': return 'processing';
            case 'REVIEWING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const displayId = annotationId || id || 'Unknown ID';
    const displayName = name || `Annotation - ${displayId}`;

    return (
        <Card
            className="bg-[#1A1625] border border-violet-500/20 rounded-xl overflow-hidden hover:bg-violet-500/10 hover:border-fuchsia-500/50 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-all duration-500 flex flex-col h-full cursor-pointer"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                    <Text className="text-gray-500 text-xs font-mono">{displayId}</Text>
                    <Title level={5} className="!text-white !m-0 !mt-1 !text-sm leading-tight line-clamp-2" title={displayName}>
                        {displayName}
                    </Title>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                        <Button type="text" className="hover:bg-gray-800" icon={<MoreOutlined className="text-gray-400" />} />
                    </Dropdown>
                </div>
            </div>

            <div className="mb-4">
                <Tag color={getStatusColor(status)} className="m-0 font-medium">
                    {status || 'UNKNOWN'}
                </Tag>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#231e31] p-3 rounded-lg mt-auto">
                <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Created</div>
                    <div className="text-gray-300 text-xs font-semibold">{formatDate(createdAt)}</div>
                </div>
                <div className="border-l border-gray-700 pl-2">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Updated</div>
                    <div className="text-gray-300 text-xs font-semibold">{formatDate(updatedAt)}</div>
                </div>
            </div>
        </Card>
    );
};
