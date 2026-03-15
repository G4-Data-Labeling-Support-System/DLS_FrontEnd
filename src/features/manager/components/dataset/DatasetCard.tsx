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
      className="bg-[#1A1625] border border-violet-500/20 rounded-xl overflow-hidden hover:bg-violet-500/10 hover:border-fuchsia-500/50 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-all duration-500 flex flex-col h-full cursor-pointer relative pt-4 mt-3"
      onClick={onClick}
    >
      {datasetName &&
      typeof datasetName === 'object' &&
      ('projectName' in (datasetName as object) || 'project_name' in (datasetName as object)) ? (
        <div className="absolute -top-3 left-4 z-10">
          <div className="bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-1.5 transition-all group-hover:bg-violet-500/30 group-hover:border-violet-500/50">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            {String(
              (datasetName as Record<string, unknown>).projectName ||
                (datasetName as Record<string, unknown>).project_name
            )}
          </div>
        </div>
      ) : null}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-2 flex items-center gap-2">
          <Title
            level={5}
            className="!text-white !m-0 !text-sm leading-tight line-clamp-1"
            title={datasetName}
          >
            {datasetName || 'Unnamed Dataset'}
          </Title>
          <div className="inline-block px-2 py-0.5 bg-[#2d2640] text-gray-300 text-[10px] font-bold rounded tracking-wide whitespace-nowrap">
            {totalItems || 0} Items
          </div>
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


      <div className="grid grid-cols-1 gap-2 bg-[#231e31] p-3 rounded-lg mt-auto">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Created At</div>
          <div className="text-gray-300 text-xs font-semibold">{formatDate(createdAt)}</div>
        </div>
      </div>
    </Card>
  )
}
