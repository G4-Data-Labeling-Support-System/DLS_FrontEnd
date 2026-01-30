import React from 'react';
import { Button } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';

interface FormFooterProps {
    currentStep?: number;
    totalSteps?: number;
    onBack?: () => void;   // Hàm xử lý khi bấm Back (Step > 1)
    onCancel?: () => void; // Hàm xử lý khi bấm Cancel (Step 1)
    submitLabel?: string;
    isLoading?: boolean;
}

export const FormFooter: React.FC<FormFooterProps> = ({
    currentStep = 1,
    totalSteps = 4,
    onBack,
    onCancel,
    submitLabel = "CONTINUE",
    isLoading = false,
}) => {
    return (
        <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
            {/* --- KHU VỰC NÚT TRÁI (CANCEL HOẶC BACK) --- */}
            <div className="flex items-center gap-4">
                {currentStep === 1 ? (
                    // STEP 1: Hiển thị nút CANCEL
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onCancel}
                        className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors px-0 sm:px-4"
                    >
                        Cancel
                    </Button>
                ) : (
                    // STEP > 1: Hiển thị nút BACK
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

            {/* --- NÚT PHẢI (SUBMIT/NEXT) --- */}
            <Button
                htmlType="submit"
                type="primary"
                size="large"
                loading={isLoading}
                className="h-12 px-10 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:scale-105 transition-all flex items-center gap-2 tracking-wider"
            >
                {submitLabel} <ArrowRightOutlined />
            </Button>
        </div>
    );
};