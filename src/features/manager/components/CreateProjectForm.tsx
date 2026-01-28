import React from 'react';
import { Form, Input, DatePicker, Radio, Button } from 'antd';
import { LockOutlined, PictureOutlined, VideoCameraOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons';
import GlassCard from '@/shared/components/ui/GlassCard';
import { DataTypeCard } from './DataTypeCard';

export const CreateProjectForm: React.FC = () => {
    const [form] = Form.useForm();

    return (
        <GlassCard className="relative overflow-hidden">
            <div className="absolute -top-32 -right-32 size-96 bg-[#9d27f1]/10 rounded-full blur-[100px] pointer-events-none" />
            <Form form={form} layout="vertical">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Form.Item label="Project Name" name="projectName" rules={[{ required: true }]}>
                            <Input placeholder="e.g. Autonomous Vehicle Perception Phase 2" size="large" />
                        </Form.Item>
                        <Form.Item label="Description" name="description">
                            <Input.TextArea rows={4} placeholder="Briefly describe..." />
                        </Form.Item>
                    </div>
                    <div className="space-y-4">
                        <Form.Item label="Project ID">
                            <Input disabled prefix={<LockOutlined />} value="PROJ-2024-X9Y2" className="font-mono" />
                        </Form.Item>
                        <Form.Item label="Deadline" name="deadline" rules={[{ required: true }]}>
                            <DatePicker className="w-full" size="large" />
                        </Form.Item>
                    </div>
                </div>

                <Form.Item label="Data Type" name="dataType" rules={[{ required: true }]}>
                    <Radio.Group className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DataTypeCard value="image" icon={<PictureOutlined />} title="Image" desc="Bounding boxes" />
                        <DataTypeCard value="video" icon={<VideoCameraOutlined />} title="Video" desc="Object tracking" />
                        <DataTypeCard value="text" icon={<FileTextOutlined />} title="Text" desc="NER analysis" />
                    </Radio.Group>
                </Form.Item>

                <div className="flex justify-between items-center pt-8 border-t border-[#9d27f1]/20">
                    <span className="text-xs text-[#ad9cba]">Step 1 of 4: Project Configuration</span>
                    <Button type="primary" size="large" className="font-bold shadow-lg">
                        CREATE & CONTINUE <ArrowRightOutlined />
                    </Button>
                </div>
            </Form>
        </GlassCard>
    );
};