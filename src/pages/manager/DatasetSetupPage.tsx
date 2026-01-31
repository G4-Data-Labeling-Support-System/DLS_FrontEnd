import React from 'react';
import { Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProjectSteps } from '@/features/manager/components/common/ProjectSteps';
import { DatasetSetupForm } from '@/features/manager/components/DatasetSetupForm';

const DatasetSetupPage: React.FC = () => {
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/manager/create-project/guidelines-setup');
    };

    const handleBack = () => {
        navigate('/manager/create-project');
    };

    return (
        <div className="flex flex-col items-center w-full">

            {/* 1. Header Section (Breadcrumb + Title) */}
            {/* Giống hệt CreateProjectPage: Căn giữa, width max 1000px */}
            <div className="w-full max-w-[1000px] mb-8">
                <Breadcrumb
                    items={[{ title: 'Dashboard' }, { title: 'New Project' }, { title: 'Dataset' }]}
                    className="mb-2 text-gray-400"
                />

                {/* Sử dụng style chữ lớn và gradient giống trang trước */}
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                    Dataset Setup
                </h1>
                {/* Subtitle nhỏ hơn nếu cần mô tả thêm */}
                <p className="text-gray-400 mt-2 text-lg font-light">
                    Configure data source and schema alignment
                </p>
            </div>

            {/* 2. Steps Progress */}
            <ProjectSteps current={1} />

            {/* 3. Main Form Container */}
            {/* Class 'project-glass-card' sẽ tạo khung kính giống hệt trang trước */}
            <div className="project-glass-card">
                <DatasetSetupForm onSuccess={handleNext} onBack={handleBack} />
            </div>

        </div>
    );
};

export default DatasetSetupPage;