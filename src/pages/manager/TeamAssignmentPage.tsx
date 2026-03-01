import React from 'react';
import { Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProjectSteps } from '@/features/manager/components/common/ProjectSteps';
import { TeamAssignmentContent } from '@/features/manager/components/TeamAssignmentContent';


const TeamAssignmentPage: React.FC = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/manager/create-project/guidelines-setup');
    };

    const handleLaunch = (_selectedTeam: unknown[]) => {
        navigate('/manager');
    };

    return (
        <div className="flex flex-col items-center w-full">

            {/* 1. Header Section - Đồng bộ style với Guidelines Page */}
            {/* max-w-[1400px] để khớp độ rộng với card bên dưới */}
            <div className="w-full max-w-[1000px] mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <Breadcrumb
                        items={[{ title: 'Dashboard' }, { title: 'New Project' }, { title: 'Team' }]}
                        className="mb-2 text-gray-400"
                    />
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                        Team Assignment
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg font-light">
                        Select your workforce and launch the project
                    </p>
                </div>

            </div>

            {/* 2. Steps Progress */}
            <ProjectSteps current={3} />

            {/* 3. Main Content Container */}
            {/* QUAN TRỌNG: Bọc toàn bộ vào .project-glass-card để giống trang Guidelines */}
            <div className="bg-[#1a1625]/70 w-[95%] max-w-[1400px] backdrop-blur-xl border border-violet-500/20 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.1)] mx-auto p-8 lg:p-12 relative flex flex-col h-auto [&_.ant-form-item-label>label]:!text-white/90 [&_.ant-form-item-label>label]:!font-semibold [&_.ant-input]:!bg-[#0f0e17]/60 [&_.ant-select-selector]:!bg-[#0f0e17]/60 [&_.ant-input]:!border-white/10 [&_.ant-select-selector]:!border-white/10 [&_.ant-input]:!text-white [&_.ant-select-selector]:!text-white [&_.ant-input]:!rounded-xl [&_.ant-select-selector]:!rounded-xl [&_.ant-input]:!py-2 [&_.ant-select-selector]:!py-2 focus-within:[&_.ant-input]:!border-violet-500 focus-within:[&_.ant-select-selector]:!border-violet-500 focus-within:[&_.ant-input-affix-wrapper]:!border-violet-500 focus-within:[&_.ant-input]:!shadow-[0_0_0_2px_rgba(139,92,246,0.2)] focus-within:[&_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(139,92,246,0.2)] [&_.ant-input::placeholder]:!text-white/30">
                <TeamAssignmentContent onLaunch={handleLaunch} onBack={handleBack} />
            </div>

        </div>
    );
};

export default TeamAssignmentPage;