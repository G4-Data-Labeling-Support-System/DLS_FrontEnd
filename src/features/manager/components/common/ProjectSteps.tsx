import React from 'react'
import { Steps } from 'antd'

const STEP_ITEMS = [
  { title: 'General Info', subTitle: 'Step 1' },
  { title: 'Guidelines', subTitle: 'Step 2' }
]

interface ProjectStepsProps {
  current: number // 0, 1, 2, 3
  className?: string // Cho phép truyền thêm class từ ngoài vào nếu cần chỉnh margin/padding
}

export const ProjectSteps: React.FC<ProjectStepsProps> = ({ current, className = '' }) => {
  return (
    <div className={`w-full max-w-[1000px] mb-12 ${className}`}>
      <Steps
        current={current}
        size="small"
        items={STEP_ITEMS}
        // Bạn có thể thêm className riêng nếu muốn override style cụ thể
        className="custom-project-steps"
      />
    </div>
  )
}
