import React from 'react';
import { Steps } from 'antd';

// Định nghĩa danh sách các bước cố định ở ngoài để không phải khởi tạo lại mỗi lần render
const STEP_ITEMS = [
    { title: 'General Info', description: 'Step 1' },
    { title: 'Dataset', description: 'Step 2' },
    { title: 'Guidelines', description: 'Step 3' },
    { title: 'Team', description: 'Step 4' },
];

interface ProjectStepsProps {
    current: number; // 0, 1, 2, 3
    className?: string; // Cho phép truyền thêm class từ ngoài vào nếu cần chỉnh margin/padding
}

export const ProjectSteps: React.FC<ProjectStepsProps> = ({ current, className = "" }) => {
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
    );
};