import React from 'react';
import { Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProjectSteps } from '@/features/manager/components/common/ProjectSteps';
import { GuidelinesSetupForm } from '@/features/manager/components/GuidelinesSetupForm';

const GuidelinesSetupPage: React.FC = () => {
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/manager/create-project/team-assignment');
    };

    const handleBack = () => {
        navigate('/manager/create-project/dataset-setup');
    };

    return (
        <div className="flex flex-col items-center w-full">

            {/* 1. Header Section: Căn giữa, độ rộng khớp với Form */}
            <div className="w-full max-w-[1000px] mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <Breadcrumb
                        items={[{ title: 'Dashboard' }, { title: 'New Project' }, { title: 'Guidelines' }]}
                        className="mb-2 text-gray-400"
                    />
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                        Guidelines Setup
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg font-light">
                        Define labeling rules and manage taxonomy
                    </p>
                </div>
            </div>

            {/* 2. Steps Progress */}
            <ProjectSteps current={2} />

            {/* 3. Main Form Container */}
            {/* Sử dụng class 'project-glass-card' để tạo khung kính chuẩn theme */}
            <div className="bg-[#1a1625]/70 w-[95%] max-w-[1600px] backdrop-blur-xl border border-violet-500/20 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.1)] mx-auto p-8 lg:p-12 relative flex flex-col h-auto [&_.ant-form-item-label>label]:!text-white/90 [&_.ant-form-item-label>label]:!font-semibold [&_.ant-input]:!bg-[#0f0e17]/60 [&_.ant-select-selector]:!bg-[#0f0e17]/60 [&_.ant-input]:!border-white/10 [&_.ant-select-selector]:!border-white/10 [&_.ant-input]:!text-white [&_.ant-select-selector]:!text-white [&_.ant-input]:!rounded-xl [&_.ant-select-selector]:!rounded-xl [&_.ant-input]:!py-2 [&_.ant-select-selector]:!py-2 focus-within:[&_.ant-input]:!border-violet-500 focus-within:[&_.ant-select-selector]:!border-violet-500 focus-within:[&_.ant-input-affix-wrapper]:!border-violet-500 focus-within:[&_.ant-input]:!shadow-[0_0_0_2px_rgba(139,92,246,0.2)] focus-within:[&_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(139,92,246,0.2)] [&_.ant-input::placeholder]:!text-white/30">
                <GuidelinesSetupForm onSuccess={handleNext} onBack={handleBack} />
            </div>

        </div>
    );
};

export default GuidelinesSetupPage;