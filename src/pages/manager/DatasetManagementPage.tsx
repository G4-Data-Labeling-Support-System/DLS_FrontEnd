import React, { useEffect, useState } from 'react';

import { message } from 'antd';
import datasetApi, { type GetDatasetsParams } from '@/api/dataset';
import DatasetHeader from '@/features/manager/components/dataset/DatasetHeader';
import DatasetActionBar from '@/features/manager/components/dataset/DatasetActionBar';
import DatasetList from '@/features/manager/components/dataset/DatasetList';


const DatasetManagementPage: React.FC = () => {
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
    <div className="flex flex-col w-full items-center">
      <DatasetHeader />
      <DatasetActionBar />
      <DatasetList datasets={datasets} loading={loading} />
    </div>
  );
};

export default DatasetManagementPage;
