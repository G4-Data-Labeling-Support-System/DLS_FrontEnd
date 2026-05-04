import React from 'react'
import { Card, Progress, Tag, Typography } from 'antd'

const { Title } = Typography

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
      className={`bg-[#1A1625] border border-violet-500/20 rounded-xl overflow-hidden hover:bg-violet-500/10 hover:border-fuchsia-500/50 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-all duration-500 flex flex-col h-full cursor-pointer relative mt-3`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-2">
          <Title
            level={5}
            className="!text-[#111] !m-0 !text-sm leading-tight line-clamp-1"
            title={name}
          >
            {name || 'Unnamed Assignment'}
          </Title>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Tag
            color={getStatusColor(status)}
            className="m-0 text-[10px] px-1.5 py-0 font-medium whitespace-nowrap border-0 rounded"
          >
            {(status || 'UNKNOWN').toUpperCase()}
          </Tag>
        </div>
      </div>

      {description && (
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 mt-2 min-h-[32px]">
          {description}
        </p>
      )}
      {!description && <div className="mb-4 mt-2 min-h-[32px]" />}

      <div className="bg-[#231e31] p-3 rounded-lg mt-auto">
        <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1">
          <span className="text-gray-500">Review Progress</span>
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
          className="m-0"
        />
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold pt-1">
          <span>{completedTasks} REVIEWED</span>
          <span>{totalTasks} TOTAL</span>
        </div>
      </div>
    </Card>
  )
}

