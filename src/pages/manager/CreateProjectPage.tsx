import React from 'react';
import { Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CreateProjectForm } from '@/features/manager/components/CreateProjectForm';
import { ProjectSteps } from '@/features/manager/components/common/ProjectSteps';

const CreateProjectPage: React.FC = () => {
    const navigate = useNavigate();

    const handleProjectCreated = () => {
        // Chuyển hướng đến Step 2
        navigate('/manager/create-project/dataset-setup');
    };

    return (
        <div className="flex flex-col items-center w-full">

            {/* 1. Breadcrumb & Title */}
            {/* Gom nhóm tiêu đề và giới hạn chiều rộng để thẳng hàng với Form bên dưới */}
            <div className="w-full max-w-[1000px] mb-8">
                <Breadcrumb
                    items={[{ title: 'Dashboard' }, { title: 'New Project' }]}
                    className="mb-2 text-gray-400"
                />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                    Create New Project
                </h1>
            </div>

            {/* 2. Step Progress */}
            <ProjectSteps current={0} />

            {/* 3. Form */}
            {/* Form này đã có class 'project-glass-card' bên trong nên sẽ tự tạo khung kính */}

            <div className="w-[98%] xl:w-[95%] max-w-[1600px] mx-auto p-8 xl:py-12 xl:px-16 !bg-[#1a1625]/70 !backdrop-blur-[20px] !border !border-violet-500/20 !rounded-[1.5rem] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.1)] relative flex flex-col h-auto">
                <CreateProjectForm onSuccess={handleProjectCreated} />
            </div>
        </div>
    );
};

export default CreateProjectPage;