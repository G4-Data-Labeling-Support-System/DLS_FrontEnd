
import React from 'react';
import { Form, Input, DatePicker, Button } from 'antd';
import {
    CalendarOutlined,
    LockOutlined,
    ArrowRightOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
    FileTextOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

export const CreateProjectForm: React.FC = () => {
    const [form] = Form.useForm();

    return (
        <Form form={form} layout="vertical" className="glass-card rounded-2xl p-6 lg:p-8 flex flex-col gap-8 relative overflow-hidden flex-1">
            <div className="absolute -top-32 -right-32 size-96 bg-dlss-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white ml-1 flex items-center gap-1">Project Name <span className="text-dlss-secondary">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-dlss-primary to-dlss-secondary rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity blur-md"></div>
                                <Form.Item name="projectName" rules={[{ required: true, message: 'Please enter project name' }]} noStyle>
                                    <Input
                                        className="relative w-full bg-surface-dark border border-glass-border rounded-xl px-4 py-3 text-white placeholder:text-[#ad9cba]/50 focus:border-dlss-primary focus:ring-0 transition-all outline-none hover:border-dlss-primary hover:bg-surface-dark focus:bg-surface-dark"
                                        placeholder="e.g. Autonomous Vehicle Perception Phase 2"
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white ml-1">Description</label>
                            <Form.Item name="description" noStyle>
                                <Input.TextArea
                                    className="w-full bg-surface-dark border border-glass-border rounded-xl px-4 py-3 text-white placeholder:text-[#ad9cba]/50 focus:border-dlss-primary focus:ring-0 transition-all outline-none resize-none hover:border-dlss-primary hover:bg-surface-dark focus:bg-surface-dark"
                                    placeholder="Briefly describe the dataset and labeling goals..."
                                    rows={4}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white ml-1">Project ID</label>
                            <div className="w-full bg-surface-dark/40 border border-glass-border/30 rounded-xl px-4 py-3 text-[#ad9cba] font-mono text-sm cursor-not-allowed select-none flex items-center justify-between">
                                <span>PROJ-2024-X9Y2</span>
                                <LockOutlined className="text-sm opacity-50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white ml-1 flex items-center gap-1">Deadline <span className="text-dlss-secondary">*</span></label>
                            <div className="relative group">
                                <Form.Item name="deadline" rules={[{ required: true, message: 'Please select a deadline' }]} noStyle>
                                    <DatePicker
                                        className="w-full bg-surface-dark border border-glass-border rounded-xl px-4 py-3 text-white placeholder:text-[#ad9cba]/50 focus:border-dlss-primary focus:ring-0 transition-all outline-none hover:border-dlss-primary hover:bg-surface-dark focus:bg-surface-dark"
                                        suffixIcon={<CalendarOutlined className="text-[#ad9cba] group-focus-within:text-dlss-primary transition-colors" />}
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-glass-border w-full"></div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-white ml-1 flex items-center gap-1">Data Type <span className="text-dlss-secondary">*</span></label>

                    {/* Custom Radio Group Wrapper */}
                    <Form.Item name="dataType" rules={[{ required: true, message: 'Please select data type' }]} noStyle>
                        <DataTypeRadioGroup />
                    </Form.Item>
                </div>
            </div>

            <div className="flex justify-between items-center pt-8 mt-auto border-t border-glass-border/50">
                <div className="flex flex-col">
                    <div className="text-xs text-[#ad9cba]">
                        <span className="text-dlss-secondary">*</span> Required fields
                    </div>
                    <div className="text-[10px] text-[#ad9cba]/60 mt-1 uppercase tracking-wider font-semibold">
                        Step 1 of 4: Project Configuration
                    </div>
                </div>
                <Button
                    className="group relative px-10 py-6 h-auto rounded-xl overflow-hidden font-bold text-white shadow-neon transition-all hover:shadow-[0_0_20px_rgba(157,39,241,0.6)] hover:-translate-y-0.5 active:translate-y-0 border-none bg-transparent"
                    type="primary"
                    htmlType="button"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-dlss-primary to-dlss-secondary"></div>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors"></div>
                    <span className="relative flex items-center gap-2 tracking-wide uppercase text-sm">
                        Create Project & Continue to Dataset
                        <ArrowRightOutlined className="text-xl group-hover:translate-x-1 transition-transform" />
                    </span>
                </Button>
            </div>
        </Form>
    );
};

// Custom component to handle the radio group logic with custom UI
const DataTypeRadioGroup: React.FC<{ value?: string; onChange?: (value: string) => void }> = ({ value, onChange }) => {
    const options = [
        { val: 'image', icon: <FileImageOutlined className="text-3xl" />, label: 'Image', desc: 'Bounding boxes, segmentation' },
        { val: 'video', icon: <VideoCameraOutlined className="text-3xl" />, label: 'Video', desc: 'Object tracking, interpolation' },
        { val: 'text', icon: <FileTextOutlined className="text-3xl" />, label: 'Text', desc: 'NER, sentiment analysis' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt) => (
                <label key={opt.val} className="relative cursor-pointer group">
                    <input
                        type="radio"
                        name="datatype"
                        className="peer sr-only"
                        checked={value === opt.val}
                        onChange={() => onChange?.(opt.val)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-dlss-primary to-dlss-secondary opacity-0 peer-checked:opacity-20 rounded-xl blur-md transition-opacity"></div>
                    <div className="relative h-full glass-card border-glass-border peer-checked:border-dlss-primary peer-checked:bg-dlss-primary/10 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:border-dlss-primary/50 hover:bg-white/5">
                        <div className="size-14 rounded-full bg-surface-dark border border-glass-border flex items-center justify-center text-[#ad9cba] peer-checked:text-white peer-checked:bg-dlss-primary peer-checked:border-dlss-primary peer-checked:shadow-neon-sm transition-all group-hover:scale-110">
                            {opt.icon}
                        </div>
                        <div className="text-center">
                            <span className="block text-white font-bold peer-checked:text-dlss-primary text-lg">{opt.label}</span>
                            <span className="text-xs text-[#ad9cba] mt-1 block">{opt.desc}</span>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 transition-opacity scale-0 peer-checked:scale-100 duration-300">
                            <CheckCircleOutlined className="text-dlss-primary drop-shadow-[0_0_8px_rgba(157,39,241,0.8)]" />
                        </div>
                    </div>
                </label>
            ))}
        </div>
    );
};
