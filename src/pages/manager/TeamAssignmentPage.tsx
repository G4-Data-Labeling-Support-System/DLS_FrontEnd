import React from 'react';
import { Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProjectSteps } from '@/features/manager/components/common/ProjectSteps';
import { TeamAssignmentContent, type UserUI } from '@/features/manager/components/TeamAssignmentContent';


const TeamAssignmentPage: React.FC = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/manager/create-project/guidelines-setup');
    };



    const handleLaunch = (_selectedTeam: UserUI[]) => {
        // console.log("Launching project with team:", selectedTeam);
        // Logic launch project...
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
            <div className="w-[98%] xl:w-[95%] mx-auto p-8 xl:py-12 xl:px-16 !bg-[#1a1625]/70 !backdrop-blur-[20px] !border !border-violet-500/20 !rounded-[1.5rem] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.1)] relative flex flex-col h-auto !max-w-[1400px]">
                <TeamAssignmentContent onLaunch={handleLaunch} onBack={handleBack} />
            </div>

        </div>
    );
};

export default TeamAssignmentPage;