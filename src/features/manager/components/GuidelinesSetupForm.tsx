import React from 'react';
import { Form, Input } from 'antd';
import { FormFooter } from '@/features/manager/components/common/FormFooter';

interface GuidelinesSetupFormProps {
    onSuccess?: (values: Record<string, string>) => void;
    onBack?: () => void;
    editId?: string;
    isSubmitting?: boolean;
}

export const GuidelinesSetupForm: React.FC<GuidelinesSetupFormProps> = ({ onSuccess, onBack, editId, isSubmitting = false }) => {
    const [form] = Form.useForm();

    const onFinish = (values: Record<string, string>) => {
        // Here values will only contain { title, content }
        if (onSuccess) onSuccess(values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            className="!w-full !max-w-none !p-0 !bg-transparent !border-0 !shadow-none"
            initialValues={{
                title: '',
                content: ''
            }}
            onFinish={onFinish}
        >
            <div className="flex flex-col gap-8">
                {/* --- BLOCK 1: Title --- */}
                <div className="bg-[#1a1625]/40 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-violet-400">title</span>
                        Guideline Title
                        <span className="text-red-500">*</span>
                    </h3>
                    <Form.Item
                        name="title"
                        className="mb-0"
                        rules={[{ required: true, message: 'Please enter a title for the guideline.' }]}
                    >
                        <Input
                            placeholder="Enter guideline title... (Required)"
                            size="large"
                            className="!bg-[#0f0e17]/50 !border-white/10 !text-gray-300 focus:!border-violet-500/50"
                        />
                    </Form.Item>
                </div>

                {/* --- BLOCK 2: Content (BẮT BUỘC) --- */}
                <div className="bg-[#1a1625]/40 border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-fuchsia-400">description</span>
                            Guideline Content
                            <span className="text-red-500">*</span>
                        </h3>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0f0e17]/50 focus-within:border-violet-500/50 transition-colors">
                        <Form.Item
                            name="content"
                            className="mb-0"
                            rules={[{ required: true, message: 'Please enter the guideline content.' }]}
                        >
                            <Input.TextArea
                                rows={10}
                                placeholder="Write your guideline content here... (Required)"
                                className="!bg-transparent !border-none !text-gray-300 !text-sm focus:!shadow-none !px-4 !py-3 !resize-none"
                                style={{ lineHeight: '1.6' }}
                            />
                        </Form.Item>
                    </div>
                </div>

                {/* Footer Component */}
                <FormFooter
                    currentStep={2}
                    totalSteps={2}
                    submitLabel={editId ? "UPDATE GUIDELINES" : "COMPLETE PROJECT SETUP"}
                    onBack={onBack}
                    isLoading={isSubmitting}
                />
            </div>
        </Form>
    );
};