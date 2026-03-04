import React from 'react';
import { Button } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { themeClasses } from '@/styles';

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
        <div className={`mt-12 pt-6 border-t ${themeClasses.borders.white10} flex items-center justify-between`}>
            <div className="flex items-center gap-4">
                {!hideBack && (
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        className={`${themeClasses.text.secondary} hover:${themeClasses.text.primary} hover:bg-white/10 flex items-center`}
                    >
                        Back
                    </Button>
                )}

                <span className={`${themeClasses.text.tertiary} uppercase text-xs tracking-widest hidden md:inline-block`}>
                    Step {currentStep} of {totalSteps}
                </span>
            </div>

            <Button
                htmlType="submit"
                type="primary"
                size="large"
                loading={isLoading}
                className={`h-12 px-10 ${themeClasses.buttons.primary} border-none font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 tracking-wider`}
            >
                {submitLabel} <ArrowRightOutlined />
            </Button>
        </div>
    );
};

export default FormFooter;
