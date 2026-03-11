import React from 'react'
import { Card, Button, Typography, Dropdown, Tag, type MenuProps } from 'antd'
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CloseCircleOutlined } from '@ant-design/icons'
import type { GetProjectsParams } from '@/api/ProjectApi' // Import type từ API của bạn

const { Title } = Typography

// Mở rộng thêm onEdit và onDelete
interface ProjectCardProps extends GetProjectsParams {
  onEdit?: () => void
  onDelete?: () => void
  onCancelProject?: () => void
  onClick?: () => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  projectStatus,
  createdAt,
  updatedAt,
  onEdit,
  onDelete,
  onCancelProject,
  onClick
}) => {
  const items: MenuProps['items'] = [
    { key: '1', label: 'View Details', icon: <EyeOutlined />, onClick: onClick },
    { key: '2', label: 'Edit Project', icon: <EditOutlined />, onClick: onEdit },
    { type: 'divider' },
    {
      key: '5',
      label: <span className="text-orange-500">Cancel Project</span>,
      icon: <CloseCircleOutlined className="text-orange-500" />,
      onClick: onCancelProject
    },
    {
      key: '4',
      label: <span className="text-red-500">Deactivate Project</span>,
      icon: <DeleteOutlined className="text-red-500" />,
      onClick: onDelete
    },
  ]

  // Hàm chọn màu cho Tag trạng thái
  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'processing'
      case 'INPROCESS':
        return 'gold'
      case 'COMPLETED':
        return 'success'
      case 'PAUSED':
        return 'warning'
      case 'ARCHIVE':
        return 'error'
      case 'INACTIVE':
        return 'error'
      case 'CANCELLED':
        return 'error'
      case 'NOT_STARTED':
        return 'default'
      default:
        return 'default'
    }
  }

  // Format ngày tháng hiển thị
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <Card
      className="bg-[#1A1625] border border-violet-500/20 rounded-xl overflow-hidden hover:bg-violet-500/10 hover:border-fuchsia-500/50 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-all duration-500 flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-2">
          <Title
            level={5}
            className="!text-white !m-0 !text-sm leading-tight line-clamp-2"
            title={projectName}
          >
            {projectName || 'Unnamed Project'}
          </Title>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              className="hover:bg-gray-800"
              icon={<MoreOutlined className="text-gray-400" />}
            />
          </Dropdown>
        </div>
      </div>

      <div className="mb-4">
        <Tag color={getStatusColor(projectStatus)} className="m-0 font-medium">
          {projectStatus || 'UNKNOWN'}
        </Tag>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-[#231e31] p-3 rounded-lg mt-auto">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Created At</div>
          <div className="text-gray-300 text-xs font-semibold">{formatDate(createdAt)}</div>
        </div>
        <div className="border-l border-gray-700 pl-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Updated At</div>
          <div className="text-gray-300 text-xs font-semibold">{formatDate(updatedAt)}</div>
        </div>
      </div>
    </Card>
  )
}
