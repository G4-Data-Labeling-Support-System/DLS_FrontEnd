import React from 'react'
import { Card, Button, Typography, Dropdown, type MenuProps } from 'antd'
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { GetDatasetsParams } from '@/api/DatasetApi'

const { Title } = Typography

interface DatasetCardProps extends GetDatasetsParams {
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  datasetName,
  totalItems,
  createdAt,
  onEdit,
  onDelete,
  onClick
}) => {
  const items: MenuProps['items'] = [
    { key: '1', label: 'View Details', icon: <EyeOutlined />, onClick: onClick },
    { key: '2', label: 'Edit Dataset', icon: <EditOutlined />, onClick: onEdit },
    { type: 'divider' },
    {
      key: '4',
      label: <span className="text-red-500">Delete Dataset</span>,
      icon: <DeleteOutlined className="text-red-500" />,
      onClick: onDelete
    }
  ]

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
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
            title={datasetName}
          >
            {datasetName || 'Unnamed Dataset'}
          </Title>
          <div className="text-gray-400 text-xs mt-1">v1</div>
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
        <div className="inline-block px-2 py-1 ml-2 bg-[#2d2640] text-gray-300 text-[10px] font-bold rounded tracking-wide">
          {totalItems || 0} Items
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 bg-[#231e31] p-3 rounded-lg mt-auto">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Created At</div>
          <div className="text-gray-300 text-xs font-semibold">{formatDate(createdAt)}</div>
        </div>
      </div>
    </Card>
  )
}
