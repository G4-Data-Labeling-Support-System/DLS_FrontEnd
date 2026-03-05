import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CreateProjectForm } from '@/features/manager/components/CreateProjectForm';
import { ProjectSteps } from '@/features/manager/components/common/ProjectSteps';

const CreateProjectPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();

    // Allow state to override id if navigating from somewhere else
    const editId = id || location.state?.projectId;
    const isEditMode = !!editId;

    const handleProjectCreated = (projectId?: string) => {
        // Chuyển hướng đến Step 2 và pass projectId qua state
        if (isEditMode) {
            navigate(`/manager/projects/edit/${projectId || editId}/guidelines`);
        } else {
            navigate('/manager/create-project/guidelines-setup', { state: { projectId } });
        }
    };

    return (
        <div className="flex flex-col items-center w-full">

            {/* 1. Breadcrumb & Title */}
            {/* Gom nhóm tiêu đề và giới hạn chiều rộng để thẳng hàng với Form bên dưới */}
            <div className="w-full max-w-[1000px] mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                    {isEditMode ? 'Edit Project' : 'Create New Project'}
                </h1>
            </div>

            {/* 2. Step Progress */}
            <ProjectSteps current={0} />

            {/* 3. Form */}
            {/* Container now directly implements Tailwind styling avoiding manager.css */}
            <div className="bg-[#1a1625]/70 backdrop-blur-xl border border-violet-500/20 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.1)] w-[95%] max-w-[1600px] mx-auto p-8 lg:p-12 relative flex flex-col h-auto [&_.ant-form-item-label>label]:!text-white/90 [&_.ant-form-item-label>label]:!font-semibold [&_.ant-input]:!bg-[#0f0e17]/60 [&_.ant-select-selector]:!bg-[#0f0e17]/60 [&_.ant-input]:!border-white/10 [&_.ant-select-selector]:!border-white/10 [&_.ant-input]:!text-white [&_.ant-select-selector]:!text-white [&_.ant-input]:!rounded-xl [&_.ant-select-selector]:!rounded-xl [&_.ant-input]:!py-2 [&_.ant-select-selector]:!py-2 focus-within:[&_.ant-input]:!border-violet-500 focus-within:[&_.ant-select-selector]:!border-violet-500 focus-within:[&_.ant-input-affix-wrapper]:!border-violet-500 focus-within:[&_.ant-input]:!shadow-[0_0_0_2px_rgba(139,92,246,0.2)] focus-within:[&_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(139,92,246,0.2)] [&_.ant-input::placeholder]:!text-white/30 [&_.ant-input-disabled]:!bg-gray-800/50 [&_.ant-input-disabled]:!text-gray-400 [&_.ant-input-disabled]:!border-gray-700/50">
                <CreateProjectForm onSuccess={handleProjectCreated} editId={editId} />
            </div>
        </div>
    );
};

export default CreateProjectPage;