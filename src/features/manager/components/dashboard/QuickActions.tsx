import { Card, Button, Typography } from 'antd'
import {
  PlusCircleFilled,
} from '@ant-design/icons'

const { Title } = Typography

interface QuickActionsProps {
  onCreateProject?: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onCreateProject }) => {
  return (
    <Card className="h-full bg-[#1A1625] border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-violet-400 transform -rotate-12 bg-none text-xl">⚡</div>
        <Title level={5} className="!text-white !m-0 !font-normal !font-display">
          Quick Actions
        </Title>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          type="primary"
          size="large"
          className="w-full h-12 flex items-center justify-center bg-fuchsia-600 hover:bg-fuchsia-500 border-none shadow-[0_0_15px_rgba(192,38,211,0.4)]"
          onClick={onCreateProject}
        >
          <PlusCircleFilled className="text-lg mr-2" />
          CREATE PROJECT
        </Button>
      </div>
    </Card>
  )
}
