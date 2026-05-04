import React from 'react'
import { Card, Button, Typography } from 'antd'
import { PlusCircleFilled, FolderOpenOutlined, RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PATH_MANAGER } from '@/routes/paths'

const { Title } = Typography

interface DatasetQuickActionsProps {
  onCreateDataset?: () => void
  isGlobalView?: boolean
}

export const DatasetQuickActions: React.FC<DatasetQuickActionsProps> = ({ onCreateDataset, isGlobalView }) => {
  const navigate = useNavigate()

  return (
    <Card className="h-full bg-[#1A1625] border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-violet-400 transform -rotate-12 bg-none text-xl">⚡</div>
        <Title level={5} className="!text-[#111] !m-0 !font-normal !font-display">
          Quick Actions
        </Title>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          type="primary"
          size="large"
          className="w-full h-12 flex items-center justify-center bg-fuchsia-600 hover:bg-fuchsia-500 border-none shadow-[0_0_15px_rgba(192,38,211,0.4)]"
          onClick={onCreateDataset || (() => navigate(PATH_MANAGER.createDataset))}
        >
          <PlusCircleFilled className="text-lg mr-2" />
          CREATE DATASET
        </Button>

        <Button
          className="w-full h-12 flex items-center justify-between bg-[#231e31] border-gray-700 text-gray-600 hover:text-[#111] hover:border-gray-500 hover:bg-[#2d2640]"
          onClick={() =>
            navigate(
              isGlobalView ? PATH_MANAGER.root : PATH_MANAGER.manageProjectThings + '?tab=dataset'
            )
          }
        >
          <div className="flex items-center">
            <FolderOpenOutlined className="mr-3 text-lg text-fuchsia-400" />
            <span>{isGlobalView ? 'VIEW ALL PROJECTS' : 'VIEW ALL DATASETS'}</span>
          </div>
          <RightOutlined className="text-xs" />
        </Button>
      </div>
    </Card>
  )
}

