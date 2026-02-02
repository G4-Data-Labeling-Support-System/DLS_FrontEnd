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
            <div className="project-glass-card">
                <GuidelinesSetupForm onSuccess={handleNext} onBack={handleBack} />
            </div>

        </div>
    );
};

export default GuidelinesSetupPage;