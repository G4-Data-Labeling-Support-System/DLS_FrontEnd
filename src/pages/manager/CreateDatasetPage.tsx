import React, { useMemo, useState } from 'react';
import { Breadcrumb, Form, Input, Button, Upload, message, Select, Modal } from 'antd';
import { CloudUploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';

const { Option } = Select;

const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const CreateDatasetPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [fileList, setFileList] = useState<UploadFile[]>([]);

    interface DatasetFormValues {
        datasetName: string;
        version: number;
        storageType: 'LOCAL' | 'S3';
        dataType: 'IMAGE' | 'TEXT';
    }

    const onFinish = async (values: DatasetFormValues) => {
        setLoading(true);
        try {
            const dataItems = fileList.map(file => ({
                dataItemId: file.uid,
                dataItemName: file.name,
                dataType: values.dataType
            }));

            console.log('Payload:', { ...values, dataItems });

            await new Promise(resolve => setTimeout(resolve, 1500));
            message.success(`Dataset "${values.datasetName}" created successfully with ${dataItems.length} items!`);
            navigate(-1);
        } catch (error) {
            console.error('Failed:', error);
            message.error('Failed to create dataset');
        } finally {
            setLoading(false);
        }
    };

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const uploadButton = useMemo(() => (
        <div>
            <PlusOutlined />
        </div>
    ), []);

    return (
        <div className="flex flex-col items-center w-full min-h-screen h-auto py-12">
            <div className="w-full max-w-[1000px] mb-8">
                <Breadcrumb
                    items={[{ title: 'Dashboard' }, { title: 'Datasets' }, { title: 'New Dataset' }]}
                    className="mb-2 text-gray-400"
                />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
                    Create New Dataset
                </h1>
                <p className="text-gray-400 mt-2 text-lg font-light">
                    Upload and configure your data source
                </p>
            </div>

            <div className="w-[98%] xl:w-[95%] max-w-[1200px] mx-auto p-8 xl:py-12 xl:px-16 !bg-[#1a1625]/70 !backdrop-blur-[20px] !border !border-white/10 !rounded-[1.5rem] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] relative">
                <Form
                    form={form}
                    layout="vertical"
                    className="!w-full !max-w-none !bg-transparent"
                    initialValues={{ storageType: 'LOCAL', version: 1 }}
                    onFinish={onFinish}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Form.Item
                                name="datasetName"
                                label="Dataset Name *"
                                rules={[{ required: true, message: 'Please enter dataset name' }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="e.g. Traffic_Cam_City_Center"
                                    className="!bg-[#1a1625] !border-white/10 !text-white placeholder:!text-gray-600 focus:!border-violet-500"
                                />
                            </Form.Item>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="version" label="Version *">
                                    <Input
                                        type="number"
                                        min={1}
                                        size="large"
                                        className="!bg-[#1a1625] !border-white/10 !text-white"
                                    />
                                </Form.Item>

                                <Form.Item name="storageType" label="Storage Type *">
                                    <Select
                                        size="large"
                                        popupClassName="bg-[#1a1625] border border-white/10 text-white"
                                        className="w-full"
                                        placeholder="Select storage"
                                    >
                                        <Option value="LOCAL">Local Storage</Option>
                                        <Option value="S3">AWS S3</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item name="dataType" label="Data Type *">
                                    <Select
                                        size="large"
                                        popupClassName="bg-[#1a1625] border border-white/10 text-white"
                                        className="w-full"
                                        placeholder="Select data type"
                                    >
                                        <Option value="IMAGE">Image</Option>
                                        <Option value="TEXT">Text</Option>
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>

                        <div>
                            <label className="text-white font-bold block mb-2">Upload Data</label>
                            <Upload
                                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                                listType="picture-card"
                                multiple
                                fileList={fileList}
                                onPreview={handlePreview}
                                onChange={handleChange}
                                className="dataset-upload-list"
                            >
                                {fileList.length >= 50 ? null : uploadButton}
                            </Upload>
                            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                                <img alt="example" style={{ width: '100%' }} src={previewImage} />
                            </Modal>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                        <Button
                            size="large"
                            className="bg-transparent text-white border-white/20 hover:!text-violet-400 hover:!border-violet-400"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            icon={<CloudUploadOutlined />}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-500 border-0 hover:!opacity-90"
                        >
                            Create Dataset
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default CreateDatasetPage;