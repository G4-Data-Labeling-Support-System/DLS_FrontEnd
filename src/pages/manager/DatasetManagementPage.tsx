import React, { useEffect, useState } from 'react';

import { message } from 'antd';
import datasetApi, { type GetDatasetsParams } from '@/api/dataset';
import DatasetHeader from '@/features/manager/components/dataset/DatasetHeader';
import DatasetList from '@/features/manager/components/dataset/DatasetList';
import { DatasetQuickActions } from '@/features/manager/components/dataset/DatasetQuickActions';
import { DatasetTabs, type DatasetTabType } from '@/features/manager/components/dataset/DatasetTabs';


const DatasetManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DatasetTabType>('dataset');
  const [datasets, setDatasets] = useState<GetDatasetsParams[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        const response = await datasetApi.getDatasets();
        const data = response.data?.data || response.data || [];
        setDatasets(data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        message.error('Không thể tải danh sách dataset.');
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  return (
    <div className="p-6">
      <DatasetTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'dataset' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
          <div className="xl:col-span-3 flex flex-col w-full items-center">
            <DatasetHeader />
            <DatasetList datasets={datasets} loading={loading} />
          </div>

          <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
            <DatasetQuickActions />
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="text-gray-400 py-10 text-center font-display border-2 border-dashed border-gray-800 rounded-xl bg-[#1A1625]/50 flex flex-col items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-4xl mb-4 text-violet-500 opacity-50">cloud_upload</span>
          <p>Upload functionality is currently under development.</p>
        </div>
      )}

    </div>
  );
};

export default DatasetManagementPage;
