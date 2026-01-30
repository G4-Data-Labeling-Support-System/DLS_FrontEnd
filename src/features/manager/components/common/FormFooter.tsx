import React from 'react';
import { Button } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';

interface FormFooterProps {
    currentStep?: number;
    totalSteps?: number;
    onBack?: () => void;
    submitLabel?: string;
    isLoading?: boolean;
    hideBack?: boolean;
}

export const FormFooter: React.FC<FormFooterProps> = ({
    currentStep = 1,
    totalSteps = 4,
    onBack,
    submitLabel = "CONTINUE",
    isLoading = false,
    hideBack = false,
}) => {
    return (
        <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {!hideBack && (
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        Back
                    </Button>
                )}

                <span className="text-gray-500 uppercase text-xs tracking-widest hidden md:inline-block">
                    Step {currentStep} of {totalSteps}
                </span>
            </div>

            <Button
                htmlType="submit"
                type="primary"
                size="large"
                loading={isLoading}
                // CẬP NHẬT GRADIENT VÀ SHADOW TẠI ĐÂY
                className="h-12 px-10 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:scale-105 transition-all flex items-center gap-2 tracking-wider"
            >
                {submitLabel} <ArrowRightOutlined />
            </Button>
        </div>
    );
};