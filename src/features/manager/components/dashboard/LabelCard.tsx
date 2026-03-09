import React from 'react'
import { Card, Button, Typography, Dropdown, Tag, type MenuProps } from 'antd'
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { GetLabelsParams } from '@/api/LabelApi'

const { Title } = Typography

interface LabelCardProps extends GetLabelsParams {
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
}

export const LabelCard: React.FC<LabelCardProps> = ({
  labelName,
  labelStatus,
  description,
  createdAt,
  updatedAt,
  onEdit,
  onDelete,
  onClick
}) => {
  const items: MenuProps['items'] = [
    { key: '1', label: 'View Details', icon: <EyeOutlined />, onClick: onClick },
    { key: '2', label: 'Edit Label', icon: <EditOutlined />, onClick: onEdit },
    { type: 'divider' },
    {
      key: '4',
      label: <span className="text-red-500">Delete Label</span>,
      icon: <DeleteOutlined className="text-red-500" />,
      onClick: onDelete
    }
  ]

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'processing'
      case 'COMPLETED':
        return 'success'
      case 'INACTIVE':
        return 'error'
      case 'DRAFT':
        return 'default'
      default:
        return 'default'
    }
  }

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
            title={labelName}
          >
            {labelName || 'Unnamed Label'}
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

      {labelStatus && (
        <div className="mb-2">
          <Tag color={getStatusColor(labelStatus)} className="m-0 font-medium">
            {labelStatus}
          </Tag>
        </div>
      )}

      {description && (
        <p className="text-gray-400 text-xs line-clamp-2 mb-4">{description}</p>
      )}

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
