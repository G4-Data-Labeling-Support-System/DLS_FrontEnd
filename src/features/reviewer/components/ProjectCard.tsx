import React from 'react'
import { Card, Tag } from 'antd'
import { CalendarOutlined, FolderOpenOutlined, RightOutlined } from '@ant-design/icons'

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

  return (
    <Card
      hoverable
      className="glass-panel border-white/5 hover:border-violet-500/50 transition-all duration-300 group"
      onClick={onClick}
      bodyStyle={{ padding: '24px' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors">
            <FolderOpenOutlined className="text-violet-400 text-lg" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors m-0">
            {projectName}
          </h3>
        </div>
        <Tag color={getStatusColor(status)} className="rounded-full px-3 m-0 uppercase font-black tracking-tighter text-[10px]">
          {status}
        </Tag>
      </div>

      <p className="text-gray-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
        {description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <CalendarOutlined />
          <span>{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1 text-violet-400 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
          View Details
          <RightOutlined />
        </div>
      </div>
    </Card>
  )
}
