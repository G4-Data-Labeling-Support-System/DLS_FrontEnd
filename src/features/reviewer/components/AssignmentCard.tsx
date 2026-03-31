import React from 'react'
import { Card, Progress, Tag } from 'antd'
import { FileTextOutlined, RightOutlined } from '@ant-design/icons'

interface AssignmentCardProps {
  id: string
  name: string
  status: string
  completedTasks: number
  totalTasks: number
  description?: string
  onClick: () => void
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  name,
  status,
  completedTasks,
  totalTasks,
  description,
  onClick
}) => {
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'success'
      case 'IN_PROGRESS':
        return 'processing'
      default:
        return 'default'
    }
  }

  return (
    <Card
      hoverable
      className="glass-panel border-white/5 hover:border-fuchsia-500/50 transition-all duration-300 group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20 group-hover:bg-fuchsia-500/20 transition-colors">
            <FileTextOutlined className="text-fuchsia-400 text-lg" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors m-0">
            {name}
          </h3>
        </div>
        <Tag color={getStatusColor(status)} className="rounded-full px-3 m-0 uppercase font-black tracking-tighter text-[10px]">
          {status}
        </Tag>
      </div>

      <p className="text-gray-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
        {description || 'No description provided.'}
      </p>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500 font-mono uppercase tracking-wider">Review Progress</span>
          <span className="text-fuchsia-400 font-bold">{percent}%</span>
        </div>
        <Progress
          percent={percent}
          showInfo={false}
          strokeColor={{
            '0%': '#c084fc',
            '100%': '#e879f9'
          }}
          railColor="rgba(255,255,255,0.05)"
          size={{ height: 4 }}
        />
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-1">
          <span>{completedTasks} REVIEWED</span>
          <span>{totalTasks} TOTAL</span>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-white/5 pt-4">
        <div className="flex items-center gap-1 text-fuchsia-400 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
          Start Reviewing
          <RightOutlined />
        </div>
      </div>
    </Card>
  )
}
