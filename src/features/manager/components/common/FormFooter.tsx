import React from 'react';
import { Button } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';

interface FormFooterProps {
    currentStep?: number;
    totalSteps?: number;
    onBack?: () => void;   // Xử lý nút Back
    onCancel?: () => void; // Xử lý nút Cancel
    submitLabel?: string;
    isLoading?: boolean;
    // --- MỚI THÊM ---
    onSubmit?: () => void; // Xử lý click nút chính (nếu không dùng Form)
    disabled?: boolean;    // Disable nút chính
}

export const FormFooter: React.FC<FormFooterProps> = ({
    currentStep = 1,
    totalSteps = 4,
    onBack,
    onCancel,
    submitLabel = "CONTINUE",
    isLoading = false,
    onSubmit,
    disabled = false,
}) => {
    return (
        <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
            {/* --- KHU VỰC TRÁI (NAV) --- */}
            <div className="flex items-center gap-4">
                {currentStep === 1 ? (
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onCancel}
                        className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors px-0 sm:px-4"
                    >
                        Cancel
                    </Button>
                ) : (
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Back
                    </Button>
                )}

                <span className="text-gray-600 uppercase text-xs tracking-widest hidden md:inline-block border-l border-white/10 pl-4 ml-2">
                    Step {currentStep} of {totalSteps}
                </span>
            </div>

            {/* --- KHU VỰC PHẢI (ACTION) --- */}
            <Button
                // Logic thông minh: Nếu có hàm onSubmit riêng thì là button thường, ngược lại là submit form
                htmlType={onSubmit ? "button" : "submit"}
                onClick={onSubmit}
                type="primary"
                size="large"
                loading={isLoading}
                disabled={disabled}
                // CSS Class có điều kiện để xử lý giao diện Disable đẹp mắt
                className={`h-12 px-10 border-none font-bold rounded-xl flex items-center gap-2 tracking-wider transition-all
                    ${disabled
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed' // Style khi bị khóa
                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:scale-105' // Style chuẩn
                    }
                `}
            >
                {submitLabel} <ArrowRightOutlined />
            </Button>
        </div>
    );
};