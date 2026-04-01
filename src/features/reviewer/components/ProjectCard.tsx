import React from 'react'
import { Card, Typography, Tag } from 'antd'

const { Title } = Typography

interface ProjectCardProps {
  id: string
  projectName: string
  status: string
  description?: string
  createdAt?: string
  updatedAt?: string
  onClick: () => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  status,
  description,
  createdAt,
  onClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'processing'
      case 'COMPLETED':
        return 'success'
      case 'ARCHIVE':
        return 'default'
      default:
        return 'warning'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <Card
      className={`bg-[#1A1625] border border-violet-500/20 rounded-xl overflow-hidden hover:bg-violet-500/10 hover:border-fuchsia-500/50 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-all duration-500 flex flex-col h-full cursor-pointer relative mt-3 ${
        status?.toUpperCase() === 'ARCHIVE' ? 'opacity-60 grayscale-[0.5]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-2">
          <Title
            level={5}
            className="!text-white !m-0 !text-sm leading-tight line-clamp-1"
            title={projectName}
          >
            {projectName || 'Unnamed Project'}
          </Title>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Tag
            color={getStatusColor(status)}
            className={`m-0 text-[10px] px-1.5 py-0 font-medium whitespace-nowrap border-0 rounded ${
              status?.toUpperCase() === 'ARCHIVE' ? 'text-gray-500' : ''
            }`}
          >
            {(status || 'UNKNOWN').toUpperCase()}
          </Tag>
        </div>
      </div>

      {description && (
        <p className="text-gray-400 text-xs line-clamp-2 mb-4 mt-2 min-h-[32px]">
          {description}
        </p>
      )}
      {!description && <div className="mb-4 mt-2 min-h-[32px]" />}

      <div className="grid grid-cols-1 gap-2 bg-[#231e31] p-3 rounded-lg mt-auto">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Created At</div>
          <div className="text-gray-300 text-xs font-semibold">{formatDate(createdAt)}</div>
        </div>
      </div>
    </Card>
  )
}
