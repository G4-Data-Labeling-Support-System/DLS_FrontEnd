import React, { useState } from 'react';
import { Form, Input, Select, Button, ColorPicker, message } from 'antd';
import { PlusOutlined, CloseOutlined, BoldOutlined, ItalicOutlined, UnorderedListOutlined, LinkOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';
// Import CSS global chứa class override
import '@/features/manager/components/manager.css';
import { FormFooter } from '@/features/manager/components/common/FormFooter';

interface GuidelinesSetupFormProps {
    onSuccess?: () => void;
    onBack?: () => void;
}

const PARENT_LABELS = [
    { label: 'None (Root)', value: 'root' },
    // Bạn có thể fetch danh sách này từ API thực tế sau này
];

export const GuidelinesSetupForm: React.FC<GuidelinesSetupFormProps> = ({ onSuccess, onBack }) => {
    const [form] = Form.useForm();

    // 1. State labels rỗng thay vì dữ liệu giả
    const [labels, setLabels] = useState<any[]>([]);

    const onFinish = (values: any) => {
        // Gửi dữ liệu labels kèm theo values của form
        console.log('Guidelines Values:', { ...values, labels });
        if (onSuccess) onSuccess();
    };

    const handleAddLabel = () => {
        const name = form.getFieldValue('newLabelName');
        const color = form.getFieldValue('newLabelColor');
        const version = form.getFieldValue('newLabelVersion');

        if (!name) return message.warning('Please enter label name');

        const newLabel = {
            id: Date.now(),
            name: name,
            // Xử lý màu sắc từ ColorPicker của Antd
            color: typeof color === 'string' ? color : color?.toHexString() || '#1677ff',
            version: version || 'v1.0'
        };

        setLabels([...labels, newLabel]);

        // Reset các trường nhập liệu sau khi thêm
        form.setFieldsValue({
            newLabelName: '',
            newLabelVersion: '',
            newLabelDescription: '',
            newLabelColor: null
        });
        message.success(`Label "${name}" added!`);
    };

    const handleRemoveLabel = (id: number) => {
        setLabels(labels.filter(l => l.id !== id));
    };

    return (
        <Form
            form={form}
            layout="vertical"
            // Dùng class này để form trong suốt, không đè nền Card (được định nghĩa trong manager.css)
            className="form-transparent-override"
            // 2. InitialValues sạch, chỉ giữ lại cấu hình mặc định cần thiết
            initialValues={{
                parentLabel: 'root',
            }}
            onFinish={onFinish}
        >
            <div className="flex flex-col gap-8">

                {/* --- BLOCK 1: LABELS MANAGEMENT --- */}
                <div className="bg-[#1a1625]/40 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-violet-400">label</span>
                        Labels Management
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                        <div className="md:col-span-4">
                            <Form.Item label="Select Existing Label" className="mb-0">
                                <Select placeholder="Search or select..." size="large" allowClear />
                            </Form.Item>
                        </div>
                        <div className="md:col-span-4">
                            <Form.Item name="newLabelName" label="Label Name" className="mb-0">
                                <Input placeholder="New Label Concept" size="large" />
                            </Form.Item>
                        </div>
                        <div className="md:col-span-2">
                            <Form.Item name="newLabelVersion" label="Version" className="mb-0">
                                <Input placeholder="e.g v1.0" size="large" />
                            </Form.Item>
                        </div>
                        <div className="md:col-span-2">
                            <Form.Item name="newLabelColor" label="Color" className="mb-0">
                                <ColorPicker size="large" showText className="w-full" />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                        <div className="md:col-span-4">
                            <Form.Item name="parentLabel" label="Parent Label" className="mb-0">
                                <Select options={PARENT_LABELS} size="large" />
                            </Form.Item>
                        </div>
                        <div className="md:col-span-6">
                            <Form.Item name="newLabelDescription" label="Description" className="mb-0">
                                <Input placeholder="Provide a brief description..." size="large" />
                            </Form.Item>
                        </div>
                        <div className="md:col-span-2 flex items-end">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                className="w-full bg-violet-600 hover:bg-violet-500 border-none h-10"
                                onClick={handleAddLabel}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Khu vực hiển thị Tags - Sẽ trống ban đầu */}
                    {labels.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                            {labels.map(label => (
                                <div key={label.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f0e17] border border-white/10 group hover:border-violet-500/50 transition-colors">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white leading-none">{label.name}</span>
                                        <span className="text-[10px] text-gray-500 leading-none mt-1">{label.version}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLabel(label.id)}
                                        className="ml-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <CloseOutlined className="text-xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- BLOCK 2: LABELING INSTRUCTIONS --- */}
                <div className="bg-[#1a1625]/40 border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-fuchsia-400">description</span>
                            Labeling Instructions
                        </h3>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0f0e17]/50 focus-within:border-violet-500/50 transition-colors">
                        <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-[#1a1625]/50">
                            <Button type="text" size="small" icon={<BoldOutlined />} className="text-gray-400 hover:text-white hover:bg-white/10" />
                            <Button type="text" size="small" icon={<ItalicOutlined />} className="text-gray-400 hover:text-white hover:bg-white/10" />
                            <Button type="text" size="small" icon={<UnorderedListOutlined />} className="text-gray-400 hover:text-white hover:bg-white/10" />
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <Button type="text" size="small" icon={<LinkOutlined />} className="text-gray-400 hover:text-white hover:bg-white/10" />
                            <Button type="text" size="small" icon={<UndoOutlined />} className="text-gray-400 hover:text-white hover:bg-white/10" />
                            <Button type="text" size="small" icon={<RedoOutlined />} className="text-gray-400 hover:text-white hover:bg-white/10" />
                        </div>

                        <Form.Item name="instructions" className="mb-0">
                            <Input.TextArea
                                rows={10}
                                placeholder="Write your instructions here..."
                                className="!bg-transparent !border-none !text-gray-300 !text-sm focus:!shadow-none !px-4 !py-3 !resize-none"
                                style={{ lineHeight: '1.6' }}
                            />
                        </Form.Item>
                    </div>
                </div>

                {/* Footer Component */}
                <FormFooter
                    currentStep={3}
                    totalSteps={4}
                    submitLabel="Next: Team Assignment"
                    onBack={onBack}
                    isLoading={false}
                />
            </div>
        </Form>
    );
};