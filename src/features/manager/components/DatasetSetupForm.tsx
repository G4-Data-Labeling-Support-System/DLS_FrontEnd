import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Form, Input, Upload, message } from 'antd';
import { DeleteOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadChangeParam } from 'antd/es/upload';
import { FormFooter } from '@/features/manager/components/common/FormFooter';

const { Dragger } = Upload;

interface DatasetSetupFormProps {
    onSuccess?: () => void;
    onBack?: () => void;
    submitLabel?: string;
    isStandalone?: boolean;
}

export const DatasetSetupForm: React.FC<DatasetSetupFormProps> = ({ onSuccess, onBack, submitLabel, isStandalone = false }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<(UploadFile & { preview?: string })[]>([]);

    // Store latest fileList in ref to access inside unmount cleanup safely without triggering exhaustive-deps
    const fileListRef = useRef(fileList);
    useEffect(() => {
        fileListRef.current = fileList;
    }, [fileList]);

    // --- LOGIC: Generate Current Date ---
    // Using useMemo to calculate the date only once when the component mounts
    const currentDate = useMemo(() => {
        const date = new Date();
        // Format the date as DD/MM/YYYY (Vietnamese locale is suitable for this)
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }, []);
    // ------------------------------------

    // Cleanup URL object khi component unmount để tránh leak memory
    useEffect(() => {
        return () => {
            fileListRef.current.forEach(file => {
                if (file.preview) URL.revokeObjectURL(file.preview);
            });
        };
    }, []);

    const onFinish = (_values: Record<string, unknown>) => {
        if (onSuccess) onSuccess();
    };

    const handleUploadChange = (info: UploadChangeParam<UploadFile & { preview?: string }>) => {
        const { status } = info.file;
        let newFileList = [...info.fileList];

        // Xử lý Preview: Tạo URL tạm thời nếu chưa có thumbUrl
        newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url; // URL từ server
            }
            if (!file.url && !file.thumbUrl && file.originFileObj) {
                // Tạo preview local ngay lập tức
                file.preview = URL.createObjectURL(file.originFileObj as Blob);
            }
            return file;
        });

        setFileList(newFileList);

        if (status === 'done') {
            message.success(`${info.file.name} uploaded successfully.`);
        } else if (status === 'error') {
            // Demo mode: Vẫn báo success để trải nghiệm UI (vì API mock thường lỗi)
            message.success(`${info.file.name} uploaded (Demo mode).`);
        }
    };

    const handleRemoveFile = (uid: string) => {
        setFileList((prev) => {
            const newFile = prev.find(item => item.uid === uid);
            if (newFile?.preview) URL.revokeObjectURL(newFile.preview); // Cleanup
            return prev.filter((item) => item.uid !== uid);
        });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            // Sử dụng Tailwind override để loại bỏ nền/viền trùng lặp
            className="!w-full !max-w-none !p-0 !bg-transparent !border-0 !shadow-none"
            initialValues={{ version: 1, storageType: 's3' }}
            onFinish={onFinish}
        >
            <div className="flex flex-col gap-8">

                {/* --- Section 1: Thông tin định danh (Readonly) --- */}
                {!isStandalone && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Form.Item label="Project ID (UUID)">
                            <Input className="font-mono text-sm !bg-[#1a1625] !border-white/10" placeholder="Inherited from Project" disabled />
                        </Form.Item>

                        {/* --- UPDATED: Created At Field --- */}
                        <Form.Item label="Created At">
                            <div className="relative">
                                <Input
                                    defaultValue={currentDate} // Set the default value to the generated date
                                    readOnly // Make it read-only
                                    className="font-mono text-sm !text-gray-500 !bg-[#1a1625]/50 !border-white/5 cursor-not-allowed"
                                />
                            </div>
                        </Form.Item>
                        {/* ------------------------------- */}
                    </div>
                )}

                {/* --- Section 2: Cấu hình Dataset --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Form.Item
                            name="datasetName"
                            label="Dataset Name *"
                            rules={[{ required: true, message: 'Please enter dataset name' }]}
                        >
                            <Input placeholder="e.g. Image_Training_Set_Alpha" size="large" />
                        </Form.Item>
                    </div>
                    <Form.Item name="version" label="Version *">
                        <Input type="number" min={1} size="large" />
                    </Form.Item>
                </div>

                {/* --- Section 3: Upload Area --- */}
                <div className="space-y-3">
                    <label className="text-white font-bold flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-violet-500" style={{ fontSize: '18px' }}>photo_library</span>
                        Data Item Source - Image Uploads
                    </label>

                    <div className="rounded-2xl overflow-hidden bg-[#1a1625]/30 border border-dashed border-white/20 hover:border-violet-500/50 hover:bg-[#1a1625]/50 transition-all group">
                        <Dragger
                            multiple
                            name="file"
                            action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                            fileList={fileList}
                            onChange={handleUploadChange}
                            showUploadList={false} // Tắt list mặc định để dùng custom grid bên dưới
                            className="!border-0 !bg-transparent p-8"
                        >
                            <div className="flex flex-col items-center justify-center gap-4 py-6">
                                <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 text-3xl group-hover:scale-110 transition-transform duration-300">
                                    <InboxOutlined />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg mb-1">Click or drag images to upload</p>
                                    <p className="text-gray-400 text-sm">Support for a single or bulk upload.</p>
                                </div>
                            </div>
                        </Dragger>

                        {/* Custom Preview Grid */}
                        <div className="px-6 pb-6 pt-2 border-t border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Preview Items {fileList.length > 0 && `(${fileList.length})`}
                                </span>
                                {fileList.length > 0 && (
                                    <span
                                        className="text-xs text-violet-500 font-bold cursor-pointer hover:text-white transition-colors"
                                        onClick={() => setFileList([])}
                                    >
                                        Clear all
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                {fileList.map((file) => (
                                    <div key={file.uid} className="aspect-square rounded-xl bg-gray-800 border border-white/10 relative group/thumb overflow-hidden shadow-sm hover:border-violet-500 transition-colors">
                                        {/* Nút xóa ảnh */}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer z-10 backdrop-blur-[2px]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile(file.uid);
                                            }}
                                        >
                                            <DeleteOutlined className="text-red-400 text-lg hover:scale-125 transition-transform" />
                                        </div>

                                        {/* Hiển thị ảnh: Ưu tiên preview (blob) -> thumbUrl (base64) -> url -> placeholder */}
                                        <div
                                            className="w-full h-full bg-cover bg-center opacity-70"
                                            style={{
                                                backgroundImage: `url('${file.preview || file.thumbUrl || file.url || 'https://placehold.co/200x200?text=FILE'}')`
                                            }}
                                        />
                                    </div>
                                ))}

                                {/* Nút thêm ảnh giả lập (chỉ để trang trí) */}
                                <div className="aspect-square rounded-xl border border-dashed border-white/20 flex items-center justify-center text-gray-500 hover:text-violet-500 hover:border-violet-500 hover:bg-violet-500/10 transition-all cursor-pointer">
                                    <PlusOutlined className="text-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <FormFooter
                    currentStep={isStandalone ? 1 : 2}
                    totalSteps={4}
                    hideSteps={isStandalone}
                    submitLabel={submitLabel || "SAVE & CONTINUE TO GUIDELINES"}
                    onBack={onBack}
                    onCancel={onBack}
                    isLoading={false}
                />
            </div>
        </Form>
    );
};