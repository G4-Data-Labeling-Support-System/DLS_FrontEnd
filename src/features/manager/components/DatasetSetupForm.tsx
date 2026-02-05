import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Select, message } from 'antd';
import { FormFooter } from '@/features/manager/components/common/FormFooter';

// Mock Interface
interface Dataset {
    id: string;
    name: string;
    version: number;
    storageType: string;
    itemCount: number;
}

interface DatasetSetupFormProps {
    onSuccess?: () => void;
    onBack?: () => void;
}

export const DatasetSetupForm: React.FC<DatasetSetupFormProps> = ({ onSuccess, onBack }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [fetching, setFetching] = useState(false);
    const projectId = localStorage.getItem('currentProjectId');

    // --- LOGIC: Generate Current Date ---
    const currentDate = useMemo(() => {
        const date = new Date();
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }, []);

    // --- EFFECT: Fetch Available Datasets ---
    useEffect(() => {
        const fetchDatasets = async () => {
            setFetching(true);
            try {
                // TODO: Replace with real API call: mainClient.get(ENDPOINTS.DATASETS.LIST)
                // Simulating API Fetch
                await new Promise(resolve => setTimeout(resolve, 800));

                const mockDatasets: Dataset[] = [
                ];
                setDatasets(mockDatasets);
            } catch (error) {
                console.error("Failed to fetch datasets", error);
                message.error("Could not load datasets.");
            } finally {
                setFetching(false);
            }
        };

        fetchDatasets();
    }, []);

    const onFinish = async (values: { datasetId: string }) => {
        setLoading(true);
        try {
            if (!projectId) {
                message.error("Project ID not found. Please start from step 1.");
                return;
            }

            const selectedDataset = datasets.find(d => d.id === values.datasetId);
            if (!selectedDataset) {
                message.error("Selected dataset invalid.");
                return; // Should not happen
            }

            // TODO: Call API to LINK dataset to project
            // await mainClient.post(`${ENDPOINTS.PROJECTS.LIST}/${projectId}/datasets`, { datasetId: values.datasetId });

            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 600));

            message.success(`Dataset "${selectedDataset.name}" linked successfully!`);

            // Store selected dataset info if needed for next steps
            localStorage.setItem('currentDatasetId', values.datasetId);

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Linking failed:", error);
            // Fallback for demo
            message.warning("Backend unavailable. Dataset linked (Mock Mode).");
            if (onSuccess) onSuccess();
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

                {/* --- Section 1: Thông tin định danh (Readonly) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Form.Item label="Project ID (UUID)">
                        <Input
                            className="font-mono text-sm !bg-[#1a1625] !border-white/10"
                            placeholder="Inherited from Project"
                            value={projectId || ''}
                            disabled
                        />
                    </Form.Item>

                    <Form.Item label="Created At">
                        <Input
                            defaultValue={currentDate}
                            readOnly
                            className="font-mono text-sm !text-gray-500 !bg-[#1a1625]/50 !border-white/5 cursor-not-allowed"
                        />
                    </Form.Item>
                </div>

                {/* --- Section 2: Chọn Dataset --- */}
                <div className="bg-[#1a1625]/40 border border-white/10 rounded-xl p-6 md:p-8">
                    <div className="mb-6">
                        <h3 className="text-white text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-violet-500">database</span>
                            Existing Datasets
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">Select a pre-configured dataset to associate with this project.</p>
                    </div>

                    <Form.Item
                        name="datasetId"
                        label="Select Dataset Source"
                        rules={[{ required: true, message: 'Please select a dataset' }]}
                    >
                        <Select
                            size="large"
                            placeholder="Searching for available datasets..."
                            loading={fetching}
                            disabled={fetching}
                            className="!w-full"
                            popupClassName="bg-[#1a1625] border border-white/10 text-white"
                            optionFilterProp="label"
                            options={datasets.map(ds => ({
                                label: `${ds.name} (v${ds.version}) - ${ds.itemCount.toLocaleString()} items [${ds.storageType}]`,
                                value: ds.id,
                            }))}
                            // Custom dropdown style helper (optional)
                            listHeight={250}
                        />
                    </Form.Item>

                    {/* Dataset Preview Box (Optional - shows details of selected item) */}
                    <Form.Item shouldUpdate={(prev, curr) => prev.datasetId !== curr.datasetId}>
                        {() => {
                            const selectedId = form.getFieldValue('datasetId');
                            const selectedDs = datasets.find(d => d.id === selectedId);

                            if (!selectedDs) return null;

                            return (
                                <div className="mt-4 p-4 rounded-lg bg-violet-500/10 border border-violet-500/20 flex flex-col md:flex-row gap-4 md:items-center justify-between animate-fade-in">
                                    <div>
                                        <div className="text-violet-300 font-bold text-sm mb-1">SELECTED DATASET SUMMARY</div>
                                        <div className="text-white font-medium">{selectedDs.name}</div>
                                        <div className="text-gray-400 text-xs mt-1">
                                            Storage: <span className="text-gray-300">{selectedDs.storageType}</span> •
                                            Version: <span className="text-gray-300">{selectedDs.version}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">{selectedDs.itemCount.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Data Items</div>
                                    </div>
                                </div>
                            );
                        }}
                    </Form.Item>

                    {/* Tip Box */}
                    <div className="mt-6 flex gap-3 text-xs text-gray-500 bg-black/20 p-3 rounded-lg">
                        <span className="material-symbols-outlined text-base">info</span>
                        <span>
                            Don't see your dataset? Go to the
                            <a href="/manager/datasets" className="text-violet-400 hover:text-violet-300 mx-1 underline">Dataset Manager</a>
                            to create or import a new one.
                        </span>
                    </div>
                </div>

                <FormFooter
                    currentStep={2}
                    totalSteps={4}
                    submitLabel="LINK DATASET & CONTINUE"
                    onBack={onBack}
                    isLoading={loading}
                />
            </div>
        </Form>
    );
};