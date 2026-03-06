import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Select, message, Upload } from 'antd';
import { DeleteOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadChangeParam } from 'antd/es/upload';

const { Dragger } = Upload;
import datasetApi from '@/api/DatasetApi';
import projectApi, { type GetProjectsParams } from '@/api/ProjectApi';
import { useNavigate } from 'react-router-dom';
import { FormFooter } from '@/features/manager/components/common/FormFooter';

interface CreateDatasetFormProps {
    onSuccess?: (datasetId?: string) => void;
    onBack?: () => void;
    submitLabel?: string;
}

export const CreateDatasetForm: React.FC<CreateDatasetFormProps> = ({ onSuccess, onBack, submitLabel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<GetProjectsParams[]>([]);
    const [fileList, setFileList] = useState<(UploadFile & { preview?: string })[]>([]);
    const navigate = useNavigate();

    const fileListRef = useRef(fileList);
    useEffect(() => {
        fileListRef.current = fileList;
    }, [fileList]);

    useEffect(() => {
        return () => {
            fileListRef.current.forEach(file => {
                if (file.preview) URL.revokeObjectURL(file.preview);
            });
        };
    }, []);

    const handleUploadChange = (info: UploadChangeParam<UploadFile & { preview?: string }>) => {
        const { status } = info.file;
        let newFileList = [...info.fileList];

        newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            if (!file.url && !file.thumbUrl && file.originFileObj) {
                file.preview = URL.createObjectURL(file.originFileObj as Blob);
            }
            return file;
        });

        setFileList(newFileList);

        if (status === 'done') {
            message.success(`${info.file.name} uploaded successfully.`);
        } else if (status === 'error') {
            message.success(`${info.file.name} uploaded (Demo mode).`);
        }
    };

    const handleRemoveFile = (uid: string) => {
        setFileList((prev) => {
            const newFile = prev.find(item => item.uid === uid);
            if (newFile?.preview) URL.revokeObjectURL(newFile.preview);
            return prev.filter((item) => item.uid !== uid);
        });
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectApi.getProjects({ projectStatus: 'ACTIVE' }); // Optional: fetch active projects
                const data = response.data?.data || response.data || [];
                if (Array.isArray(data)) {
                    setProjects(data);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                message.error("Failed to load projects list.");
            }
        };
        fetchProjects();
    }, []);

    const handleCancel = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/manager/datasets');
        }
    };

    const onFinish = async (values: { datasetName: string; description: string; projectId: string }) => {
        setLoading(true);
        try {
            const payload = {
                datasetName: values.datasetName,
                description: values.description,
                projectId: values.projectId
            };

            const response = await datasetApi.createDataset(payload);
            message.success('Dataset created successfully!');

            if (onSuccess) {
                const createdDataset = response.data?.data || response.data;
                const newDatasetId = createdDataset?.datasetId || createdDataset?.id;
                onSuccess(newDatasetId);
            }
        } catch (error) {
            console.error('API Error:', error);
            message.error('Failed to create dataset. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            className="!w-full !max-w-none !p-0 !bg-transparent !border-0 !shadow-none"
            onFinish={onFinish}
        >
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Form.Item
                            name="datasetName"
                            label="Dataset Name *"
                            rules={[{ required: true, message: 'Please enter dataset name' }]}
                        >
                            <Input
                                size="large"
                                placeholder="e.g. Image_Training_Set_Alpha"
                                className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 focus:!border-violet-500 hover:!border-violet-500/50"
                            />
                        </Form.Item>

                        <Form.Item
                            name="projectId"
                            label="Select Project *"
                            rules={[{ required: true, message: 'Please select a project' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select a project for this dataset"
                                className="w-full"
                                popupClassName="!bg-[#1a1625] !border !border-white/10 [&_.ant-select-item]:!text-gray-300 [&_.ant-select-item-option-active]:!bg-violet-500/20 [&_.ant-select-item-option-selected]:!bg-violet-500/40 [&_.ant-select-item-option-selected]:!text-white"
                                loading={projects.length === 0}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={projects.map(p => ({
                                    label: p.projectName || 'Unnamed Project',
                                    value: p.projectId
                                }))}
                            />
                        </Form.Item>

                        <Form.Item name="description" label="Description">
                            <Input.TextArea
                                rows={6}
                                placeholder="Briefly describe the purpose of this dataset..."
                                className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 resize-none focus:!border-violet-500 hover:!border-violet-500/50"
                            />
                        </Form.Item>
                    </div>

                    <div className="space-y-6">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20">
                            <h4 className="text-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
                                Manager Tip
                            </h4>
                            <p className="text-gray-400 text-xs leading-relaxed m-0">
                                A dataset must be associated with a <strong>Project</strong>.
                                You can upload data items later in the dataset details page.
                            </p>
                        </div>
                    </div>
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
                            showUploadList={false}
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

                                {/* Nút thêm ảnh giả lập */}
                                <div className="aspect-square rounded-xl border border-dashed border-white/20 flex items-center justify-center text-gray-500 hover:text-violet-500 hover:border-violet-500 hover:bg-violet-500/10 transition-all cursor-pointer">
                                    <PlusOutlined className="text-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <FormFooter
                    currentStep={1}
                    totalSteps={1}
                    hideSteps={true}
                    submitLabel={submitLabel || "CREATE DATASET"}
                    isLoading={loading}
                    onCancel={handleCancel}
                    onBack={onBack}
                />
            </div>
        </Form>
    );
};
