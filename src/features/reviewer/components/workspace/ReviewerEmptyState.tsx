import React from 'react'
import { Typography } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

export const ReviewerEmptyState: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-8 bg-gradient-to-br from-[#1A1625] via-[#0D0B14] to-[#1A1625] border-2 border-dashed border-gray-800/60 rounded-2xl shadow-2xl">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center backdrop-blur-sm border border-purple-500/30 shadow-lg shadow-purple-500/10">
          <InboxOutlined className="text-5xl text-purple-400/70" />
        </div>
      </div>

      <div className="text-center space-y-3 px-8">
        <Title level={4} className="!text-gray-300 !mb-2 !font-semibold">
          No Item Selected
        </Title>
        <Text className="text-gray-500 block text-base">
          Select an item from the list to start reviewing
        </Text>
      </div>
    </div>
  )
}
