import React from 'react'
import { Card, Button, Typography } from 'antd'
import { FolderOpenOutlined, RightOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PATH_ANNOTATOR } from '@/routes/paths'

const { Title } = Typography

export const AnnotatorDatasetQuickActions: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Card className="h-full bg-[#1A1625] border-gray-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-amber-400 transform -rotate-12 bg-none text-xl">⚡</div>
        <Title level={5} className="!text-white !m-0 !font-normal !font-display">
          Quick Actions
        </Title>
      </div>

      <div className="flex flex-col gap-4">
        {/* Placeholder for "Start Annotation" if we have a way to determine the next task */}
        <Button
          type="primary"
          size="large"
          className="w-full h-12 flex items-center justify-center bg-violet-600 hover:bg-violet-500 border-none shadow-[0_0_15px_rgba(139,92,246,0.4)]"
          onClick={() => {
            // Logic to start annotation could go here
            // For now, it's a prominent action
          }}
        >
          <PlayCircleOutlined className="text-lg mr-2" />
          START ANNOTATING
        </Button>

        <Button
          className="w-full h-12 flex items-center justify-between bg-[#231e31] border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-[#2d2640]"
          onClick={() => navigate(PATH_ANNOTATOR.project)}
        >
          <div className="flex items-center">
            <FolderOpenOutlined className="mr-3 text-lg text-amber-400" />
            <span className="text-xs font-semibold">PROJECT & ASSIGNMENT LIST</span>
          </div>
          <RightOutlined className="text-[10px]" />
        </Button>
      </div>
    </Card>
  )
}
