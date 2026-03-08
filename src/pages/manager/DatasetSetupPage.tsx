import React from 'react'
import { useNavigate } from 'react-router-dom'

import { DatasetSetupForm } from '@/features/manager/components/DatasetSetupForm'

const DatasetSetupPage: React.FC = () => {
  const navigate = useNavigate()

  const handleNext = () => {
    navigate('/manager/datasets')
  }

  const handleBack = () => {
    navigate('/manager/datasets')
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* 1. Header Section (Breadcrumb + Title) */}
      {/* Giống hệt CreateProjectPage: Căn giữa, width max 1000px */}
      <div className="w-full max-w-[1000px] mb-8">
        {/* Sử dụng style chữ lớn và gradient giống trang trước */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
          Dataset Setup
        </h1>
        {/* Subtitle nhỏ hơn nếu cần mô tả thêm */}
        <p className="text-gray-400 mt-2 text-lg font-light">
          Configure data source and schema alignment
        </p>
      </div>

      {/* 3. Main Form Container */}
      {/* Class 'project-glass-card' sẽ tạo khung kính giống hệt trang trước */}
      <div className="bg-[#1a1625]/70 w-[95%] max-w-[1600px] backdrop-blur-xl border border-violet-500/20 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.1)] mx-auto p-8 lg:p-12 relative flex flex-col h-auto [&_.ant-form-item-label>label]:!text-white/90 [&_.ant-form-item-label>label]:!font-semibold [&_.ant-input]:!bg-[#0f0e17]/60 [&_.ant-select-selector]:!bg-[#0f0e17]/60 [&_.ant-input]:!border-white/10 [&_.ant-select-selector]:!border-white/10 [&_.ant-input]:!text-white [&_.ant-select-selector]:!text-white [&_.ant-input]:!rounded-xl [&_.ant-select-selector]:!rounded-xl [&_.ant-input]:!py-2 [&_.ant-select-selector]:!py-2 focus-within:[&_.ant-input]:!border-violet-500 focus-within:[&_.ant-select-selector]:!border-violet-500 focus-within:[&_.ant-input-affix-wrapper]:!border-violet-500 focus-within:[&_.ant-input]:!shadow-[0_0_0_2px_rgba(139,92,246,0.2)] focus-within:[&_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(139,92,246,0.2)] [&_.ant-input::placeholder]:!text-white/30">
        <DatasetSetupForm onSuccess={handleNext} onBack={handleBack} />
      </div>
    </div>
  )
}

export default DatasetSetupPage
